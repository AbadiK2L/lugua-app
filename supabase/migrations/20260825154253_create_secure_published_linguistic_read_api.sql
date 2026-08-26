create function linguistic.resolve_visible_revision(
  p_entity_id uuid,
  p_entity_type_code text
)
returns uuid
language sql
stable
strict
security invoker
set search_path = ''
as $$
  select case
    when current_revision.editorial_status_code = 'published' then
      current_revision.id
    when current_revision.editorial_status_code = 'draft' then (
      select prior_revision.id
      from linguistic.revisions as prior_revision
      where prior_revision.entity_id = entity.id
        and prior_revision.entity_type_code = entity.entity_type_code
        and prior_revision.editorial_status_code = 'published'
        and prior_revision.revision < current_revision.revision
      order by prior_revision.revision desc
      limit 1
    )
    else null
  end
  from linguistic.entities as entity
  join linguistic.revisions as current_revision
    on current_revision.id = entity.current_revision_id
   and current_revision.entity_id = entity.id
   and current_revision.entity_type_code = entity.entity_type_code
  where entity.id = p_entity_id
    and entity.entity_type_code = p_entity_type_code;
$$;

alter function linguistic.resolve_visible_revision(uuid, text)
  owner to postgres;

revoke execute on function linguistic.resolve_visible_revision(uuid, text)
  from public, anon, authenticated, service_role;

comment on function linguistic.resolve_visible_revision(uuid, text) is
  'Resolves the visible revision for an Entity: a published current revision is visible, a draft falls back to the latest prior published revision, a deprecated current revision is invisible, and Review never implies publication.';

create function public.search_published_linguistic_entries(
  p_query text,
  p_locale_code text,
  p_language_code text default null,
  p_variety_id uuid default null,
  p_limit integer default 20,
  p_offset integer default 0
)
returns table (
  lexeme_id uuid,
  lexeme_revision_id uuid,
  language_id uuid,
  language_code text,
  form_id uuid,
  form_revision_id uuid,
  form_modality_code text,
  surface_text text,
  variety_id uuid,
  variety_code text,
  gloss_type_code text,
  gloss_text text,
  gloss_locale_code text,
  matched_field text,
  exact_match boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_query text;
begin
  if auth.uid() is null
     or (auth.jwt() -> 'is_anonymous')
          is distinct from 'false'::pg_catalog.jsonb
  then
    raise exception using
      errcode = '42501',
      message = 'authenticated non-anonymous user required';
  end if;

  if p_query is null then
    raise exception using
      errcode = '22004',
      message = 'p_query must not be null';
  end if;

  v_query := pg_catalog.btrim(p_query);

  if pg_catalog.char_length(v_query) not between 1 and 200 then
    raise exception using
      errcode = '22023',
      message = 'p_query must contain 1 to 200 characters after trimming';
  end if;

  if p_locale_code is null then
    raise exception using
      errcode = '22004',
      message = 'p_locale_code must not be null';
  end if;

  if pg_catalog.char_length(p_locale_code) not between 1 and 63
     or p_locale_code <> pg_catalog.btrim(p_locale_code)
  then
    raise exception using
      errcode = '22023',
      message = 'p_locale_code must contain 1 to 63 characters without outer whitespace';
  end if;

  if p_language_code is not null
     and p_language_code !~ '^[a-z][a-z0-9_-]{0,31}$'
  then
    raise exception using
      errcode = '22023',
      message = 'p_language_code must match ^[a-z][a-z0-9_-]{0,31}$';
  end if;

  if p_limit is null then
    raise exception using
      errcode = '22004',
      message = 'p_limit must not be null';
  end if;

  if p_limit not between 1 and 50 then
    raise exception using
      errcode = '22023',
      message = 'p_limit must be between 1 and 50';
  end if;

  if p_offset is null then
    raise exception using
      errcode = '22004',
      message = 'p_offset must not be null';
  end if;

  if p_offset < 0 then
    raise exception using
      errcode = '22023',
      message = 'p_offset must be greater than or equal to 0';
  end if;

  return query
  with visible_lexemes as (
    select
      lexeme.id as lexeme_id,
      lexeme_revision.revision_id as lexeme_revision_id,
      lexeme.language_id,
      language.code as language_code
    from linguistic.lexemes as lexeme
    join linguistic.languages as language
      on language.id = lexeme.language_id
     and language.editorial_status_code = 'published'
    join linguistic.lexeme_revisions as lexeme_revision
      on lexeme_revision.entity_id = lexeme.id
     and lexeme_revision.revision_id =
       linguistic.resolve_visible_revision(lexeme.id, 'lexeme')
    where (p_language_code is null or language.code = p_language_code)
  ),
  visible_analyses as (
    select
      visible_lexeme.lexeme_id,
      visible_lexeme.lexeme_revision_id,
      visible_lexeme.language_id,
      visible_lexeme.language_code,
      form.id as form_id,
      form_revision.revision_id as form_revision_id,
      form.modality_code as form_modality_code,
      form_revision.surface_text,
      form_analysis.id as form_analysis_id,
      analysis_revision.revision_id as form_analysis_revision_id,
      lexeme_assertion.id as lexeme_assertion_id,
      sense_assertion.id as sense_assertion_id,
      sense_assertion.sense_id,
      asserted_sense_revision.revision_id as sense_revision_id
    from visible_lexemes as visible_lexeme
    join linguistic.form_analysis_revision_lexemes as lexeme_assertion
      on lexeme_assertion.lexeme_id = visible_lexeme.lexeme_id
     and lexeme_assertion.language_id = visible_lexeme.language_id
    join linguistic.form_analysis_revisions as analysis_revision
      on analysis_revision.revision_id = lexeme_assertion.revision_id
     and analysis_revision.language_id = visible_lexeme.language_id
     and analysis_revision.revision_id =
       linguistic.resolve_visible_revision(
         analysis_revision.entity_id,
         'form_analysis'
       )
    join linguistic.form_analyses as form_analysis
      on form_analysis.id = analysis_revision.entity_id
     and form_analysis.form_id = analysis_revision.form_id
     and form_analysis.language_id = analysis_revision.language_id
    join linguistic.forms as form
      on form.id = form_analysis.form_id
     and form.language_id = visible_lexeme.language_id
    join linguistic.form_revisions as form_revision
      on form_revision.entity_id = form.id
     and form_revision.revision_id = analysis_revision.form_revision_id
     and form_revision.revision_id =
       linguistic.resolve_visible_revision(form.id, 'form')
    left join linguistic.form_analysis_revision_senses as sense_assertion
      on sense_assertion.revision_id = analysis_revision.revision_id
     and sense_assertion.lexeme_id = visible_lexeme.lexeme_id
    left join linguistic.senses as asserted_sense
      on asserted_sense.id = sense_assertion.sense_id
     and asserted_sense.lexeme_id = visible_lexeme.lexeme_id
    left join linguistic.sense_revisions as asserted_sense_revision
      on asserted_sense_revision.entity_id = asserted_sense.id
     and asserted_sense_revision.revision_id =
       linguistic.resolve_visible_revision(asserted_sense.id, 'sense')
     and asserted_sense_revision.lexeme_id = visible_lexeme.lexeme_id
     and asserted_sense_revision.lexeme_revision_id =
       visible_lexeme.lexeme_revision_id
    where sense_assertion.id is null
       or asserted_sense_revision.revision_id is not null
  ),
  analysis_set_presence as (
    select
      visible_analysis.*,
      exists (
        select 1
        from linguistic.lexeme_revision_varieties as lexeme_variety
        where lexeme_variety.revision_id =
          visible_analysis.lexeme_revision_id
          and lexeme_variety.lexeme_id = visible_analysis.lexeme_id
      ) as has_lexeme_varieties,
      exists (
        select 1
        from linguistic.form_revision_varieties as form_variety
        where form_variety.revision_id = visible_analysis.form_revision_id
          and form_variety.form_id = visible_analysis.form_id
      ) as has_form_varieties,
      exists (
        select 1
        from linguistic.form_analysis_revision_varieties as analysis_variety
        where analysis_variety.revision_id =
          visible_analysis.form_analysis_revision_id
          and analysis_variety.form_revision_id =
            visible_analysis.form_revision_id
      ) as has_analysis_varieties
    from visible_analyses as visible_analysis
  ),
  concrete_analysis_varieties as (
    select
      analysis_set.*,
      variety.id as variety_id,
      variety.code as variety_code
    from analysis_set_presence as analysis_set
    join linguistic.varieties as variety
      on variety.language_id = analysis_set.language_id
     and variety.editorial_status_code = 'published'
    where (
      not analysis_set.has_lexeme_varieties
      or exists (
        select 1
        from linguistic.lexeme_revision_varieties as lexeme_variety
        where lexeme_variety.revision_id = analysis_set.lexeme_revision_id
          and lexeme_variety.lexeme_id = analysis_set.lexeme_id
          and lexeme_variety.language_id = analysis_set.language_id
          and lexeme_variety.variety_id = variety.id
      )
    )
      and (
        not analysis_set.has_form_varieties
        or exists (
          select 1
          from linguistic.form_revision_varieties as form_variety
          where form_variety.revision_id = analysis_set.form_revision_id
            and form_variety.form_id = analysis_set.form_id
            and form_variety.language_id = analysis_set.language_id
            and form_variety.variety_id = variety.id
        )
      )
      and (
        not analysis_set.has_analysis_varieties
        or exists (
          select 1
          from linguistic.form_analysis_revision_varieties as analysis_variety
          where analysis_variety.revision_id =
            analysis_set.form_analysis_revision_id
            and analysis_variety.form_revision_id =
              analysis_set.form_revision_id
            and analysis_variety.variety_id = variety.id
        )
      )
      and (
        analysis_set.has_lexeme_varieties
        or analysis_set.has_form_varieties
        or analysis_set.has_analysis_varieties
      )
  ),
  analysis_varieties as (
    select
      concrete_analysis_variety.lexeme_id,
      concrete_analysis_variety.lexeme_revision_id,
      concrete_analysis_variety.language_id,
      concrete_analysis_variety.language_code,
      concrete_analysis_variety.form_id,
      concrete_analysis_variety.form_revision_id,
      concrete_analysis_variety.form_modality_code,
      concrete_analysis_variety.surface_text,
      concrete_analysis_variety.form_analysis_revision_id,
      concrete_analysis_variety.variety_id,
      concrete_analysis_variety.variety_code
    from concrete_analysis_varieties as concrete_analysis_variety
    union all
    select
      analysis_set.lexeme_id,
      analysis_set.lexeme_revision_id,
      analysis_set.language_id,
      analysis_set.language_code,
      analysis_set.form_id,
      analysis_set.form_revision_id,
      analysis_set.form_modality_code,
      analysis_set.surface_text,
      analysis_set.form_analysis_revision_id,
      null::uuid as variety_id,
      null::text as variety_code
    from analysis_set_presence as analysis_set
    where not analysis_set.has_lexeme_varieties
      and not analysis_set.has_form_varieties
      and not analysis_set.has_analysis_varieties
  ),
  visible_senses as (
    select
      visible_lexeme.lexeme_id,
      visible_lexeme.lexeme_revision_id,
      sense.id as sense_id,
      sense_revision.revision_id as sense_revision_id
    from visible_lexemes as visible_lexeme
    join linguistic.senses as sense
      on sense.lexeme_id = visible_lexeme.lexeme_id
    join linguistic.sense_revisions as sense_revision
      on sense_revision.entity_id = sense.id
     and sense_revision.lexeme_id = visible_lexeme.lexeme_id
     and sense_revision.lexeme_revision_id =
       visible_lexeme.lexeme_revision_id
     and sense_revision.revision_id =
       linguistic.resolve_visible_revision(sense.id, 'sense')
  ),
  visible_glosses as (
    select
      visible_sense.lexeme_id,
      visible_sense.lexeme_revision_id,
      gloss.id as gloss_id,
      gloss.gloss_type_code,
      gloss.gloss as gloss_text,
      gloss.locale_code as gloss_locale_code,
      gloss.is_preferred
    from visible_senses as visible_sense
    join linguistic.sense_revision_glosses as gloss
      on gloss.revision_id = visible_sense.sense_revision_id
     and pg_catalog.lower(gloss.locale_code) =
       pg_catalog.lower(p_locale_code)
  ),
  ranked_display_glosses as (
    select
      visible_gloss.*,
      pg_catalog.row_number() over (
        partition by
          visible_gloss.lexeme_id,
          visible_gloss.lexeme_revision_id
        order by
          case visible_gloss.gloss_type_code
            when 'gloss' then 0
            else 1
          end,
          visible_gloss.is_preferred desc,
          visible_gloss.gloss_text collate pg_catalog."C",
          visible_gloss.gloss_id
      ) as display_rank
    from visible_glosses as visible_gloss
  ),
  surface_candidates as (
    select
      analysis_variety.lexeme_id,
      analysis_variety.lexeme_revision_id,
      analysis_variety.language_id,
      analysis_variety.language_code,
      analysis_variety.form_id,
      analysis_variety.form_revision_id,
      analysis_variety.form_modality_code,
      analysis_variety.surface_text,
      analysis_variety.variety_id,
      analysis_variety.variety_code,
      display_gloss.gloss_type_code,
      display_gloss.gloss_text,
      display_gloss.gloss_locale_code,
      display_gloss.gloss_id,
      coalesce(display_gloss.is_preferred, false) as is_preferred,
      'surface'::text as matched_field,
      analysis_variety.surface_text = v_query as exact_match,
      analysis_variety.form_analysis_revision_id as candidate_tiebreak_id
    from analysis_varieties as analysis_variety
    left join ranked_display_glosses as display_gloss
      on display_gloss.lexeme_id = analysis_variety.lexeme_id
     and display_gloss.lexeme_revision_id =
       analysis_variety.lexeme_revision_id
     and display_gloss.display_rank = 1
    where pg_catalog.strpos(analysis_variety.surface_text, v_query) > 0
      and (
        p_variety_id is null
        or analysis_variety.variety_id = p_variety_id
      )
  ),
  gloss_candidates as (
    select
      analysis_variety.lexeme_id,
      analysis_variety.lexeme_revision_id,
      analysis_variety.language_id,
      analysis_variety.language_code,
      analysis_variety.form_id,
      analysis_variety.form_revision_id,
      analysis_variety.form_modality_code,
      analysis_variety.surface_text,
      analysis_variety.variety_id,
      analysis_variety.variety_code,
      visible_gloss.gloss_type_code,
      visible_gloss.gloss_text,
      visible_gloss.gloss_locale_code,
      visible_gloss.gloss_id,
      visible_gloss.is_preferred,
      'gloss'::text as matched_field,
      visible_gloss.gloss_text = v_query as exact_match,
      analysis_variety.form_analysis_revision_id as candidate_tiebreak_id
    from analysis_varieties as analysis_variety
    join visible_glosses as visible_gloss
      on visible_gloss.lexeme_id = analysis_variety.lexeme_id
     and visible_gloss.lexeme_revision_id =
       analysis_variety.lexeme_revision_id
    where pg_catalog.strpos(visible_gloss.gloss_text, v_query) > 0
      and (
        p_variety_id is null
        or analysis_variety.variety_id = p_variety_id
      )
  ),
  candidates as (
    select surface_candidate.*
    from surface_candidates as surface_candidate
    union all
    select gloss_candidate.*
    from gloss_candidates as gloss_candidate
  ),
  ranked_candidates as (
    select
      candidate.*,
      pg_catalog.row_number() over (
        partition by
          candidate.lexeme_id,
          candidate.lexeme_revision_id,
          candidate.form_id,
          candidate.form_revision_id,
          candidate.variety_id
        order by
          candidate.exact_match desc,
          case candidate.matched_field
            when 'surface' then 0
            else 1
          end,
          case candidate.gloss_type_code
            when 'gloss' then 0
            when 'definition' then 1
            else 2
          end,
          candidate.is_preferred desc,
          candidate.gloss_text collate pg_catalog."C" nulls last,
          candidate.gloss_id nulls last,
          candidate.candidate_tiebreak_id
      ) as candidate_rank
    from candidates as candidate
  )
  select
    ranked_candidate.lexeme_id,
    ranked_candidate.lexeme_revision_id,
    ranked_candidate.language_id,
    ranked_candidate.language_code,
    ranked_candidate.form_id,
    ranked_candidate.form_revision_id,
    ranked_candidate.form_modality_code,
    ranked_candidate.surface_text,
    ranked_candidate.variety_id,
    ranked_candidate.variety_code,
    ranked_candidate.gloss_type_code,
    ranked_candidate.gloss_text,
    ranked_candidate.gloss_locale_code,
    ranked_candidate.matched_field,
    ranked_candidate.exact_match
  from ranked_candidates as ranked_candidate
  where ranked_candidate.candidate_rank = 1
  order by
    ranked_candidate.exact_match desc,
    case ranked_candidate.matched_field
      when 'surface' then 0
      else 1
    end,
    ranked_candidate.surface_text collate pg_catalog."C",
    ranked_candidate.lexeme_id,
    ranked_candidate.form_id,
    ranked_candidate.form_revision_id,
    ranked_candidate.variety_id nulls first,
    ranked_candidate.lexeme_revision_id,
    ranked_candidate.gloss_id nulls first,
    ranked_candidate.candidate_tiebreak_id
  offset p_offset
  limit p_limit;
end;
$$;

alter function public.search_published_linguistic_entries(
  text,
  text,
  text,
  uuid,
  integer,
  integer
)
  owner to postgres;

revoke execute on function public.search_published_linguistic_entries(
  text,
  text,
  text,
  uuid,
  integer,
  integer
)
  from public, anon, authenticated, service_role;

grant execute on function public.search_published_linguistic_entries(
  text,
  text,
  text,
  uuid,
  integer,
  integer
)
  to authenticated;

comment on function public.search_published_linguistic_entries(
  text,
  text,
  text,
  uuid,
  integer,
  integer
) is
  'Provides permanent authenticated users with bounded published-only lexical search across concurrent analyses, without choosing a preferred linguistic truth.';

create function public.get_published_lexeme_entry(
  p_lexeme_id uuid,
  p_locale_code text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_lexeme_revision_id uuid;
  v_language_id uuid;
  v_language_code text;
  v_language_name text;
  v_language_native_name text;
begin
  if auth.uid() is null
     or (auth.jwt() -> 'is_anonymous')
          is distinct from 'false'::pg_catalog.jsonb
  then
    raise exception using
      errcode = '42501',
      message = 'authenticated non-anonymous user required';
  end if;

  if p_lexeme_id is null then
    raise exception using
      errcode = '22004',
      message = 'p_lexeme_id must not be null';
  end if;

  if p_locale_code is null then
    raise exception using
      errcode = '22004',
      message = 'p_locale_code must not be null';
  end if;

  if pg_catalog.char_length(p_locale_code) not between 1 and 63
     or p_locale_code <> pg_catalog.btrim(p_locale_code)
  then
    raise exception using
      errcode = '22023',
      message = 'p_locale_code must contain 1 to 63 characters without outer whitespace';
  end if;

  select
    lexeme_revision.revision_id,
    language.id,
    language.code,
    language.name,
    language.native_name
  into
    v_lexeme_revision_id,
    v_language_id,
    v_language_code,
    v_language_name,
    v_language_native_name
  from linguistic.lexemes as lexeme
  join linguistic.languages as language
    on language.id = lexeme.language_id
   and language.editorial_status_code = 'published'
  join linguistic.lexeme_revisions as lexeme_revision
    on lexeme_revision.entity_id = lexeme.id
   and lexeme_revision.revision_id =
     linguistic.resolve_visible_revision(lexeme.id, 'lexeme')
  where lexeme.id = p_lexeme_id;

  if not found then
    return null;
  end if;

  return (
    with root_lexeme_varieties_raw as (
      select
        lexeme_variety.id as lexeme_revision_variety_id,
        lexeme_variety.variety_id,
        variety.code,
        variety.name,
        variety.region
      from linguistic.lexeme_revision_varieties as lexeme_variety
      join linguistic.varieties as variety
        on variety.id = lexeme_variety.variety_id
       and variety.language_id = v_language_id
       and variety.editorial_status_code = 'published'
      where lexeme_variety.revision_id = v_lexeme_revision_id
        and lexeme_variety.lexeme_id = p_lexeme_id
        and lexeme_variety.language_id = v_language_id
    ),
    root_lexeme_varieties as (
      select distinct on (
        root_lexeme_variety.lexeme_revision_variety_id
      )
        root_lexeme_variety.*
      from root_lexeme_varieties_raw as root_lexeme_variety
      order by
        root_lexeme_variety.lexeme_revision_variety_id,
        root_lexeme_variety.variety_id
    ),
    visible_senses_raw as (
      select
        sense.id as sense_id,
        sense_revision.revision_id as sense_revision_id
      from linguistic.senses as sense
      join linguistic.sense_revisions as sense_revision
        on sense_revision.entity_id = sense.id
       and sense_revision.lexeme_id = p_lexeme_id
       and sense_revision.lexeme_revision_id = v_lexeme_revision_id
       and sense_revision.revision_id =
         linguistic.resolve_visible_revision(sense.id, 'sense')
      where sense.lexeme_id = p_lexeme_id
    ),
    visible_senses as (
      select distinct on (visible_sense.sense_id)
        visible_sense.*
      from visible_senses_raw as visible_sense
      order by visible_sense.sense_id, visible_sense.sense_revision_id
    ),
    visible_sense_varieties_raw as (
      select
        visible_sense.sense_id,
        visible_sense.sense_revision_id,
        sense_variety.id as sense_variety_id,
        variety.id as variety_id,
        variety.code,
        variety.name,
        variety.region
      from visible_senses as visible_sense
      join linguistic.sense_revision_varieties as sense_variety
        on sense_variety.revision_id = visible_sense.sense_revision_id
       and sense_variety.lexeme_revision_id = v_lexeme_revision_id
      join root_lexeme_varieties as lexeme_variety
        on lexeme_variety.variety_id = sense_variety.variety_id
      join linguistic.varieties as variety
        on variety.id = sense_variety.variety_id
       and variety.language_id = v_language_id
       and variety.editorial_status_code = 'published'
    ),
    visible_sense_varieties as (
      select distinct on (sense_variety.sense_variety_id)
        sense_variety.*
      from visible_sense_varieties_raw as sense_variety
      order by sense_variety.sense_variety_id, sense_variety.variety_id
    ),
    visible_sense_glosses_raw as (
      select
        visible_sense.sense_id,
        visible_sense.sense_revision_id,
        gloss.id as gloss_id,
        gloss.gloss_type_code,
        gloss.locale_code,
        gloss.gloss as gloss_text
      from visible_senses as visible_sense
      join linguistic.sense_revision_glosses as gloss
        on gloss.revision_id = visible_sense.sense_revision_id
       and pg_catalog.lower(gloss.locale_code) =
         pg_catalog.lower(p_locale_code)
    ),
    visible_sense_glosses as (
      select distinct on (sense_gloss.gloss_id)
        sense_gloss.*
      from visible_sense_glosses_raw as sense_gloss
      order by sense_gloss.gloss_id, sense_gloss.sense_revision_id
    ),
    visible_analysis_candidates_raw as (
      select
        form.id as form_id,
        form_revision.revision_id as form_revision_id,
        form.modality_code,
        form_revision.surface_text,
        form_analysis.id as form_analysis_id,
        analysis_revision.revision_id as form_analysis_revision_id,
        lexeme_assertion.id as lexeme_assertion_id,
        sense_assertion.id as sense_assertion_id,
        sense_assertion.sense_id,
        asserted_sense_revision.revision_id as sense_revision_id
      from linguistic.form_analysis_revision_lexemes as lexeme_assertion
      join linguistic.form_analysis_revisions as analysis_revision
        on analysis_revision.revision_id = lexeme_assertion.revision_id
       and analysis_revision.language_id = v_language_id
       and analysis_revision.revision_id =
         linguistic.resolve_visible_revision(
           analysis_revision.entity_id,
           'form_analysis'
         )
      join linguistic.form_analyses as form_analysis
        on form_analysis.id = analysis_revision.entity_id
       and form_analysis.form_id = analysis_revision.form_id
       and form_analysis.language_id = analysis_revision.language_id
      join linguistic.forms as form
        on form.id = analysis_revision.form_id
       and form.language_id = v_language_id
      join linguistic.form_revisions as form_revision
        on form_revision.entity_id = form.id
       and form_revision.revision_id = analysis_revision.form_revision_id
       and form_revision.revision_id =
         linguistic.resolve_visible_revision(form.id, 'form')
      left join linguistic.form_analysis_revision_senses as sense_assertion
        on sense_assertion.revision_id = analysis_revision.revision_id
       and sense_assertion.lexeme_id = p_lexeme_id
      left join linguistic.senses as asserted_sense
        on asserted_sense.id = sense_assertion.sense_id
       and asserted_sense.lexeme_id = p_lexeme_id
      left join linguistic.sense_revisions as asserted_sense_revision
        on asserted_sense_revision.entity_id = asserted_sense.id
       and asserted_sense_revision.revision_id =
         linguistic.resolve_visible_revision(asserted_sense.id, 'sense')
       and asserted_sense_revision.lexeme_id = p_lexeme_id
       and asserted_sense_revision.lexeme_revision_id =
         v_lexeme_revision_id
      where lexeme_assertion.lexeme_id = p_lexeme_id
        and lexeme_assertion.language_id = v_language_id
        and (
          sense_assertion.id is null
          or asserted_sense_revision.revision_id is not null
        )
    ),
    visible_analysis_candidates as (
      select distinct on (
        analysis_candidate.form_analysis_revision_id
      )
        analysis_candidate.*
      from visible_analysis_candidates_raw as analysis_candidate
      order by
        analysis_candidate.form_analysis_revision_id,
        analysis_candidate.form_id,
        analysis_candidate.lexeme_assertion_id
    ),
    detail_analysis_set_presence as (
      select
        analysis_candidate.*,
        exists (
          select 1
          from linguistic.lexeme_revision_varieties as lexeme_variety
          where lexeme_variety.revision_id = v_lexeme_revision_id
            and lexeme_variety.lexeme_id = p_lexeme_id
        ) as has_lexeme_varieties,
        exists (
          select 1
          from linguistic.form_revision_varieties as form_variety
          where form_variety.revision_id =
            analysis_candidate.form_revision_id
            and form_variety.form_id = analysis_candidate.form_id
        ) as has_form_varieties,
        exists (
          select 1
          from linguistic.form_analysis_revision_varieties as analysis_variety
          where analysis_variety.revision_id =
            analysis_candidate.form_analysis_revision_id
            and analysis_variety.form_revision_id =
              analysis_candidate.form_revision_id
        ) as has_analysis_varieties
      from visible_analysis_candidates as analysis_candidate
    ),
    detail_analysis_common_varieties_raw as (
      select
        analysis_set.form_analysis_revision_id,
        analysis_variety.id as analysis_variety_assertion_id,
        variety.id as variety_id,
        variety.code,
        variety.name,
        variety.region
      from detail_analysis_set_presence as analysis_set
      join linguistic.varieties as variety
        on variety.language_id = v_language_id
       and variety.editorial_status_code = 'published'
      left join linguistic.form_analysis_revision_varieties as analysis_variety
        on analysis_variety.revision_id =
          analysis_set.form_analysis_revision_id
       and analysis_variety.form_revision_id =
         analysis_set.form_revision_id
       and analysis_variety.variety_id = variety.id
      where (
        analysis_set.has_lexeme_varieties
        or analysis_set.has_form_varieties
        or analysis_set.has_analysis_varieties
      )
        and (
          not analysis_set.has_lexeme_varieties
          or exists (
            select 1
            from linguistic.lexeme_revision_varieties as lexeme_variety
            where lexeme_variety.revision_id = v_lexeme_revision_id
              and lexeme_variety.lexeme_id = p_lexeme_id
              and lexeme_variety.language_id = v_language_id
              and lexeme_variety.variety_id = variety.id
          )
        )
        and (
          not analysis_set.has_form_varieties
          or exists (
            select 1
            from linguistic.form_revision_varieties as form_variety
            where form_variety.revision_id =
              analysis_set.form_revision_id
              and form_variety.form_id = analysis_set.form_id
              and form_variety.language_id = v_language_id
              and form_variety.variety_id = variety.id
          )
        )
        and (
          not analysis_set.has_analysis_varieties
          or analysis_variety.id is not null
        )
    ),
    detail_analysis_common_varieties as (
      select distinct on (
        analysis_variety.form_analysis_revision_id,
        analysis_variety.variety_id
      )
        analysis_variety.*
      from detail_analysis_common_varieties_raw as analysis_variety
      order by
        analysis_variety.form_analysis_revision_id,
        analysis_variety.variety_id,
        analysis_variety.analysis_variety_assertion_id nulls first
    ),
    valid_analyses as (
      select
        analysis_set.form_id,
        analysis_set.form_revision_id,
        analysis_set.modality_code,
        analysis_set.surface_text,
        analysis_set.form_analysis_id,
        analysis_set.form_analysis_revision_id,
        analysis_set.lexeme_assertion_id,
        analysis_set.sense_assertion_id,
        analysis_set.sense_id,
        analysis_set.sense_revision_id
      from detail_analysis_set_presence as analysis_set
      where (
        not analysis_set.has_lexeme_varieties
        and not analysis_set.has_form_varieties
        and not analysis_set.has_analysis_varieties
      )
      or exists (
        select 1
        from detail_analysis_common_varieties as common_variety
        where common_variety.form_analysis_revision_id =
          analysis_set.form_analysis_revision_id
      )
    ),
    visible_forms_raw as (
      select
        valid_analysis.form_id,
        valid_analysis.form_revision_id,
        valid_analysis.modality_code,
        valid_analysis.surface_text
      from valid_analyses as valid_analysis
    ),
    visible_forms as (
      select distinct on (visible_form.form_id)
        visible_form.*
      from visible_forms_raw as visible_form
      order by
        visible_form.form_id,
        visible_form.form_revision_id
    ),
    visible_form_varieties_raw as (
      select
        visible_form.form_id,
        visible_form.form_revision_id,
        form_variety.id as form_variety_id,
        variety.id as variety_id,
        variety.code,
        variety.name,
        variety.region
      from visible_forms as visible_form
      join linguistic.form_revision_varieties as form_variety
        on form_variety.revision_id = visible_form.form_revision_id
       and form_variety.form_id = visible_form.form_id
       and form_variety.language_id = v_language_id
      join linguistic.varieties as variety
        on variety.id = form_variety.variety_id
       and variety.language_id = v_language_id
       and variety.editorial_status_code = 'published'
    ),
    visible_form_varieties as (
      select distinct on (form_variety.form_variety_id)
        form_variety.*
      from visible_form_varieties_raw as form_variety
      order by form_variety.form_variety_id, form_variety.variety_id
    ),
    visible_form_orthographies_raw as (
      select
        visible_form.form_id,
        visible_form.form_revision_id,
        form_orthography.id as form_orthography_id,
        orthography.id as orthography_id,
        orthography.code,
        orthography.name,
        orthography.script_code
      from visible_forms as visible_form
      join linguistic.form_revision_orthographies as form_orthography
        on form_orthography.revision_id = visible_form.form_revision_id
       and form_orthography.form_id = visible_form.form_id
       and form_orthography.language_id = v_language_id
      join linguistic.orthographies as orthography
        on orthography.id = form_orthography.orthography_id
       and orthography.language_id = v_language_id
       and orthography.editorial_status_code = 'published'
    ),
    visible_form_orthographies as (
      select distinct on (form_orthography.form_orthography_id)
        form_orthography.*
      from visible_form_orthographies_raw as form_orthography
      order by
        form_orthography.form_orthography_id,
        form_orthography.orthography_id
    ),
    noun_assignments_raw as (
      select
        assignment.id as assignment_id,
        assignment.lexeme_revision_variety_id,
        assignment.variety_id,
        lexeme_variety.code as variety_code,
        noun_system.id as system_id,
        system_revision.revision_id as system_revision_id,
        noun_system.code as system_code,
        case
          when pg_catalog.lower(
            system_revision.presentation_locale_code
          ) = pg_catalog.lower(p_locale_code)
          then system_revision.presentation_locale_code
          else null
        end as system_label_locale_code,
        case
          when pg_catalog.lower(
            system_revision.presentation_locale_code
          ) = pg_catalog.lower(p_locale_code)
          then system_revision.label
          else null
        end as system_label,
        noun_class.id as class_id,
        class_revision.revision_id as class_revision_id,
        noun_class.code as class_code,
        case
          when pg_catalog.lower(
            class_revision.presentation_locale_code
          ) = pg_catalog.lower(p_locale_code)
          then class_revision.presentation_locale_code
          else null
        end as class_label_locale_code,
        case
          when pg_catalog.lower(
            class_revision.presentation_locale_code
          ) = pg_catalog.lower(p_locale_code)
          then class_revision.label
          else null
        end as class_label
      from linguistic.lexeme_revision_noun_classes as assignment
      join root_lexeme_varieties as lexeme_variety
        on lexeme_variety.lexeme_revision_variety_id =
          assignment.lexeme_revision_variety_id
       and lexeme_variety.variety_id = assignment.variety_id
      join linguistic.noun_class_systems as noun_system
        on noun_system.id = assignment.noun_class_system_id
       and noun_system.variety_id = assignment.variety_id
       and noun_system.language_id = v_language_id
      join linguistic.noun_class_system_revisions as system_revision
        on system_revision.entity_id = noun_system.id
       and system_revision.revision_id =
         assignment.noun_class_system_revision_id
       and system_revision.variety_id = assignment.variety_id
       and system_revision.language_id = v_language_id
       and system_revision.revision_id =
         linguistic.resolve_visible_revision(
           noun_system.id,
           'noun_class_system'
         )
      join linguistic.noun_classes as noun_class
        on noun_class.id = assignment.noun_class_id
       and noun_class.noun_class_system_id = noun_system.id
       and noun_class.variety_id = assignment.variety_id
       and noun_class.language_id = v_language_id
      join linguistic.noun_class_revisions as class_revision
        on class_revision.entity_id = noun_class.id
       and class_revision.revision_id = assignment.noun_class_revision_id
       and class_revision.noun_class_system_id = noun_system.id
       and class_revision.noun_class_system_revision_id =
         system_revision.revision_id
       and class_revision.variety_id = assignment.variety_id
       and class_revision.language_id = v_language_id
       and class_revision.revision_id =
         linguistic.resolve_visible_revision(noun_class.id, 'noun_class')
      where assignment.revision_id = v_lexeme_revision_id
        and assignment.lexeme_id = p_lexeme_id
        and assignment.language_id = v_language_id
    ),
    noun_assignments as (
      select distinct on (noun_assignment.assignment_id)
        noun_assignment.*
      from noun_assignments_raw as noun_assignment
      order by
        noun_assignment.assignment_id,
        noun_assignment.class_revision_id
    ),
    noun_pairings_raw as (
      select
        pairing.id as pairing_id,
        pairing.variety_id,
        lexeme_variety.code as variety_code,
        noun_system.id as system_id,
        system_revision.revision_id as system_revision_id,
        noun_system.code as system_code,
        case
          when pg_catalog.lower(
            system_revision.presentation_locale_code
          ) = pg_catalog.lower(p_locale_code)
          then system_revision.presentation_locale_code
          else null
        end as system_label_locale_code,
        case
          when pg_catalog.lower(
            system_revision.presentation_locale_code
          ) = pg_catalog.lower(p_locale_code)
          then system_revision.label
          else null
        end as system_label,
        class_a.id as class_a_id,
        class_a_revision.revision_id as class_a_revision_id,
        class_a.code as class_a_code,
        case
          when pg_catalog.lower(
            class_a_revision.presentation_locale_code
          ) = pg_catalog.lower(p_locale_code)
          then class_a_revision.presentation_locale_code
          else null
        end as class_a_label_locale_code,
        case
          when pg_catalog.lower(
            class_a_revision.presentation_locale_code
          ) = pg_catalog.lower(p_locale_code)
          then class_a_revision.label
          else null
        end as class_a_label,
        class_b.id as class_b_id,
        class_b_revision.revision_id as class_b_revision_id,
        class_b.code as class_b_code,
        case
          when pg_catalog.lower(
            class_b_revision.presentation_locale_code
          ) = pg_catalog.lower(p_locale_code)
          then class_b_revision.presentation_locale_code
          else null
        end as class_b_label_locale_code,
        case
          when pg_catalog.lower(
            class_b_revision.presentation_locale_code
          ) = pg_catalog.lower(p_locale_code)
          then class_b_revision.label
          else null
        end as class_b_label
      from linguistic.noun_class_pairings as pairing
      join root_lexeme_varieties as lexeme_variety
        on lexeme_variety.variety_id = pairing.variety_id
      join linguistic.noun_class_systems as noun_system
        on noun_system.id = pairing.noun_class_system_id
       and noun_system.variety_id = pairing.variety_id
       and noun_system.language_id = v_language_id
      join linguistic.noun_class_system_revisions as system_revision
        on system_revision.entity_id = noun_system.id
       and system_revision.revision_id = pairing.revision_id
       and system_revision.variety_id = pairing.variety_id
       and system_revision.language_id = v_language_id
       and system_revision.revision_id =
         linguistic.resolve_visible_revision(
           noun_system.id,
           'noun_class_system'
         )
      join linguistic.noun_classes as class_a
        on class_a.id = pairing.noun_class_a_id
       and class_a.noun_class_system_id = noun_system.id
       and class_a.variety_id = pairing.variety_id
       and class_a.language_id = v_language_id
      join linguistic.noun_class_revisions as class_a_revision
        on class_a_revision.entity_id = class_a.id
       and class_a_revision.revision_id = pairing.noun_class_a_revision_id
       and class_a_revision.noun_class_system_id = noun_system.id
       and class_a_revision.noun_class_system_revision_id =
         system_revision.revision_id
       and class_a_revision.variety_id = pairing.variety_id
       and class_a_revision.language_id = v_language_id
       and class_a_revision.revision_id =
         linguistic.resolve_visible_revision(class_a.id, 'noun_class')
      join linguistic.noun_classes as class_b
        on class_b.id = pairing.noun_class_b_id
       and class_b.noun_class_system_id = noun_system.id
       and class_b.variety_id = pairing.variety_id
       and class_b.language_id = v_language_id
      join linguistic.noun_class_revisions as class_b_revision
        on class_b_revision.entity_id = class_b.id
       and class_b_revision.revision_id = pairing.noun_class_b_revision_id
       and class_b_revision.noun_class_system_id = noun_system.id
       and class_b_revision.noun_class_system_revision_id =
         system_revision.revision_id
       and class_b_revision.variety_id = pairing.variety_id
       and class_b_revision.language_id = v_language_id
       and class_b_revision.revision_id =
         linguistic.resolve_visible_revision(class_b.id, 'noun_class')
      where pairing.language_id = v_language_id
        and exists (
          select 1
          from noun_assignments as noun_assignment
          where noun_assignment.variety_id = pairing.variety_id
            and noun_assignment.system_id = noun_system.id
            and noun_assignment.system_revision_id =
              system_revision.revision_id
            and (
              (
                noun_assignment.class_id = class_a.id
                and noun_assignment.class_revision_id =
                  class_a_revision.revision_id
              )
              or (
                noun_assignment.class_id = class_b.id
                and noun_assignment.class_revision_id =
                  class_b_revision.revision_id
              )
            )
        )
    ),
    noun_pairings as (
      select distinct on (noun_pairing.pairing_id)
        noun_pairing.*
      from noun_pairings_raw as noun_pairing
      order by noun_pairing.pairing_id, noun_pairing.system_revision_id
    ),
    verb_assignments_raw as (
      select
        assignment.id as assignment_id,
        assignment.lexeme_revision_variety_id,
        assignment.variety_id,
        lexeme_variety.code as variety_code,
        verb_system.id as system_id,
        system_revision.revision_id as system_revision_id,
        verb_system.code as system_code,
        case
          when pg_catalog.lower(
            system_revision.presentation_locale_code
          ) = pg_catalog.lower(p_locale_code)
          then system_revision.presentation_locale_code
          else null
        end as system_label_locale_code,
        case
          when pg_catalog.lower(
            system_revision.presentation_locale_code
          ) = pg_catalog.lower(p_locale_code)
          then system_revision.label
          else null
        end as system_label,
        verb_class.id as class_id,
        class_revision.revision_id as class_revision_id,
        verb_class.code as class_code,
        case
          when pg_catalog.lower(
            class_revision.presentation_locale_code
          ) = pg_catalog.lower(p_locale_code)
          then class_revision.presentation_locale_code
          else null
        end as class_label_locale_code,
        case
          when pg_catalog.lower(
            class_revision.presentation_locale_code
          ) = pg_catalog.lower(p_locale_code)
          then class_revision.label
          else null
        end as class_label
      from linguistic.lexeme_revision_verb_classes as assignment
      join root_lexeme_varieties as lexeme_variety
        on lexeme_variety.lexeme_revision_variety_id =
          assignment.lexeme_revision_variety_id
       and lexeme_variety.variety_id = assignment.variety_id
      join linguistic.verb_class_systems as verb_system
        on verb_system.id = assignment.verb_class_system_id
       and verb_system.variety_id = assignment.variety_id
       and verb_system.language_id = v_language_id
      join linguistic.verb_class_system_revisions as system_revision
        on system_revision.entity_id = verb_system.id
       and system_revision.revision_id =
         assignment.verb_class_system_revision_id
       and system_revision.variety_id = assignment.variety_id
       and system_revision.language_id = v_language_id
       and system_revision.revision_id =
         linguistic.resolve_visible_revision(
           verb_system.id,
           'verb_class_system'
         )
      join linguistic.verb_classes as verb_class
        on verb_class.id = assignment.verb_class_id
       and verb_class.verb_class_system_id = verb_system.id
       and verb_class.variety_id = assignment.variety_id
       and verb_class.language_id = v_language_id
      join linguistic.verb_class_revisions as class_revision
        on class_revision.entity_id = verb_class.id
       and class_revision.revision_id = assignment.verb_class_revision_id
       and class_revision.verb_class_system_id = verb_system.id
       and class_revision.verb_class_system_revision_id =
         system_revision.revision_id
       and class_revision.variety_id = assignment.variety_id
       and class_revision.language_id = v_language_id
       and class_revision.revision_id =
         linguistic.resolve_visible_revision(verb_class.id, 'verb_class')
      where assignment.revision_id = v_lexeme_revision_id
        and assignment.lexeme_id = p_lexeme_id
        and assignment.language_id = v_language_id
    ),
    verb_assignments as (
      select distinct on (verb_assignment.assignment_id)
        verb_assignment.*
      from verb_assignments_raw as verb_assignment
      order by
        verb_assignment.assignment_id,
        verb_assignment.class_revision_id
    ),
    paradigm_memberships_raw as (
      select
        paradigm_membership.id as membership_id,
        paradigm.id as paradigm_id,
        paradigm_revision.revision_id as paradigm_revision_id,
        paradigm_membership.variety_id,
        lexeme_variety.code as variety_code,
        case
          when pg_catalog.lower(
            paradigm_revision.presentation_locale_code
          ) = pg_catalog.lower(p_locale_code)
          then paradigm_revision.presentation_locale_code
          else null
        end as label_locale_code,
        case
          when pg_catalog.lower(
            paradigm_revision.presentation_locale_code
          ) = pg_catalog.lower(p_locale_code)
          then paradigm_revision.label
          else null
        end as label,
        case
          when pg_catalog.lower(
            paradigm_revision.presentation_locale_code
          ) = pg_catalog.lower(p_locale_code)
          then paradigm_revision.description
          else null
        end as description
      from linguistic.paradigm_revision_lexemes as paradigm_membership
      join root_lexeme_varieties as lexeme_variety
        on lexeme_variety.lexeme_revision_variety_id =
          paradigm_membership.lexeme_revision_variety_id
       and lexeme_variety.variety_id = paradigm_membership.variety_id
      join linguistic.paradigm_revisions as paradigm_revision
        on paradigm_revision.revision_id = paradigm_membership.revision_id
       and paradigm_revision.variety_id = paradigm_membership.variety_id
       and paradigm_revision.language_id = v_language_id
      join linguistic.paradigms as paradigm
        on paradigm.id = paradigm_revision.entity_id
       and paradigm.variety_id = paradigm_membership.variety_id
       and paradigm.language_id = v_language_id
       and paradigm_revision.revision_id =
         linguistic.resolve_visible_revision(paradigm.id, 'paradigm')
      where paradigm_membership.lexeme_id = p_lexeme_id
        and paradigm_membership.lexeme_revision_id =
          v_lexeme_revision_id
        and paradigm_membership.language_id = v_language_id
    ),
    paradigm_memberships as (
      select distinct on (paradigm_membership.membership_id)
        paradigm_membership.*
      from paradigm_memberships_raw as paradigm_membership
      order by
        paradigm_membership.membership_id,
        paradigm_membership.paradigm_revision_id
    ),
    paradigm_verb_classes_raw as (
      select
        paradigm_membership.membership_id as paradigm_lexeme_membership_id,
        verb_membership.id as membership_id,
        verb_system.id as system_id,
        system_revision.revision_id as system_revision_id,
        verb_system.code as system_code,
        case
          when pg_catalog.lower(
            system_revision.presentation_locale_code
          ) = pg_catalog.lower(p_locale_code)
          then system_revision.presentation_locale_code
          else null
        end as system_label_locale_code,
        case
          when pg_catalog.lower(
            system_revision.presentation_locale_code
          ) = pg_catalog.lower(p_locale_code)
          then system_revision.label
          else null
        end as system_label,
        verb_class.id as class_id,
        class_revision.revision_id as class_revision_id,
        verb_class.code as class_code,
        case
          when pg_catalog.lower(
            class_revision.presentation_locale_code
          ) = pg_catalog.lower(p_locale_code)
          then class_revision.presentation_locale_code
          else null
        end as class_label_locale_code,
        case
          when pg_catalog.lower(
            class_revision.presentation_locale_code
          ) = pg_catalog.lower(p_locale_code)
          then class_revision.label
          else null
        end as class_label
      from paradigm_memberships as paradigm_membership
      join linguistic.paradigm_revision_verb_classes as verb_membership
        on verb_membership.revision_id =
          paradigm_membership.paradigm_revision_id
       and verb_membership.variety_id = paradigm_membership.variety_id
       and verb_membership.language_id = v_language_id
      join linguistic.verb_class_systems as verb_system
        on verb_system.id = verb_membership.verb_class_system_id
       and verb_system.variety_id = paradigm_membership.variety_id
       and verb_system.language_id = v_language_id
      join linguistic.verb_class_system_revisions as system_revision
        on system_revision.entity_id = verb_system.id
       and system_revision.revision_id =
         verb_membership.verb_class_system_revision_id
       and system_revision.variety_id = paradigm_membership.variety_id
       and system_revision.language_id = v_language_id
       and system_revision.revision_id =
         linguistic.resolve_visible_revision(
           verb_system.id,
           'verb_class_system'
         )
      join linguistic.verb_classes as verb_class
        on verb_class.id = verb_membership.verb_class_id
       and verb_class.verb_class_system_id = verb_system.id
       and verb_class.variety_id = paradigm_membership.variety_id
       and verb_class.language_id = v_language_id
      join linguistic.verb_class_revisions as class_revision
        on class_revision.entity_id = verb_class.id
       and class_revision.revision_id =
         verb_membership.verb_class_revision_id
       and class_revision.verb_class_system_id = verb_system.id
       and class_revision.verb_class_system_revision_id =
         system_revision.revision_id
       and class_revision.variety_id = paradigm_membership.variety_id
       and class_revision.language_id = v_language_id
       and class_revision.revision_id =
         linguistic.resolve_visible_revision(verb_class.id, 'verb_class')
    ),
    paradigm_verb_classes as (
      select distinct on (paradigm_verb_class.membership_id)
        paradigm_verb_class.*
      from paradigm_verb_classes_raw as paradigm_verb_class
      order by
        paradigm_verb_class.membership_id,
        paradigm_verb_class.class_revision_id
    ),
    returned_targets as (
      select
        'revision'::text as target_kind,
        v_lexeme_revision_id as target_id
      union
      select
        'lexeme_revision_variety'::text,
        lexeme_variety.lexeme_revision_variety_id
      from root_lexeme_varieties as lexeme_variety
      union
      select
        'revision'::text,
        visible_sense.sense_revision_id
      from visible_senses as visible_sense
      union
      select
        'sense_revision_variety'::text,
        sense_variety.sense_variety_id
      from visible_sense_varieties as sense_variety
      union
      select
        'sense_revision_gloss'::text,
        sense_gloss.gloss_id
      from visible_sense_glosses as sense_gloss
      union
      select
        'revision'::text,
        visible_form.form_revision_id
      from visible_forms as visible_form
      union
      select
        'form_revision_variety'::text,
        form_variety.form_variety_id
      from visible_form_varieties as form_variety
      union
      select
        'form_revision_orthography'::text,
        form_orthography.form_orthography_id
      from visible_form_orthographies as form_orthography
      union
      select
        'revision'::text,
        valid_analysis.form_analysis_revision_id
      from valid_analyses as valid_analysis
      union
      select
        'form_analysis_revision_lexeme'::text,
        valid_analysis.lexeme_assertion_id
      from valid_analyses as valid_analysis
      union
      select
        'form_analysis_revision_sense'::text,
        valid_analysis.sense_assertion_id
      from valid_analyses as valid_analysis
      where valid_analysis.sense_assertion_id is not null
      union
      select
        'form_analysis_revision_variety'::text,
        common_variety.analysis_variety_assertion_id
      from detail_analysis_common_varieties as common_variety
      where common_variety.analysis_variety_assertion_id is not null
      union
      select
        'lexeme_revision_noun_class'::text,
        noun_assignment.assignment_id
      from noun_assignments as noun_assignment
      union
      select
        'noun_class_pairing'::text,
        noun_pairing.pairing_id
      from noun_pairings as noun_pairing
      union
      select
        'lexeme_revision_verb_class'::text,
        verb_assignment.assignment_id
      from verb_assignments as verb_assignment
      union
      select
        'revision'::text,
        paradigm_membership.paradigm_revision_id
      from paradigm_memberships as paradigm_membership
      union
      select
        'paradigm_revision_lexeme'::text,
        paradigm_membership.membership_id
      from paradigm_memberships as paradigm_membership
      union
      select
        'paradigm_revision_verb_class'::text,
        paradigm_verb_class.membership_id
      from paradigm_verb_classes as paradigm_verb_class
    ),
    active_provenance_raw as (
      select
        provenance_link.id as provenance_link_id,
        typed_target.target_kind,
        typed_target.target_id,
        source.id as source_id,
        source.display_label as source_label,
        source.citation_text,
        source.canonical_uri,
        source.publication_year,
        source_location.id as source_location_id,
        source_location.locator_text,
        source_location.location_uri
      from linguistic.documentary_provenance_links as provenance_link
      join lateral (
        values
          ('revision'::text, provenance_link.target_revision_id),
          (
            'lexeme_revision_variety'::text,
            provenance_link.target_lexeme_revision_variety_id
          ),
          (
            'sense_revision_gloss'::text,
            provenance_link.target_sense_revision_gloss_id
          ),
          (
            'sense_revision_variety'::text,
            provenance_link.target_sense_revision_variety_id
          ),
          (
            'form_revision_variety'::text,
            provenance_link.target_form_revision_variety_id
          ),
          (
            'form_revision_orthography'::text,
            provenance_link.target_form_revision_orthography_id
          ),
          (
            'form_analysis_revision_lexeme'::text,
            provenance_link.target_form_analysis_revision_lexeme_id
          ),
          (
            'form_analysis_revision_sense'::text,
            provenance_link.target_form_analysis_revision_sense_id
          ),
          (
            'form_analysis_revision_variety'::text,
            provenance_link.target_form_analysis_revision_variety_id
          ),
          (
            'noun_class_pairing'::text,
            provenance_link.target_noun_class_pairing_id
          ),
          (
            'lexeme_revision_noun_class'::text,
            provenance_link.target_lexeme_revision_noun_class_id
          ),
          (
            'lexeme_revision_verb_class'::text,
            provenance_link.target_lexeme_revision_verb_class_id
          ),
          (
            'paradigm_revision_lexeme'::text,
            provenance_link.target_paradigm_revision_lexeme_id
          ),
          (
            'paradigm_revision_verb_class'::text,
            provenance_link.target_paradigm_revision_verb_class_id
          )
      ) as typed_target(target_kind, target_id)
        on typed_target.target_id is not null
      join returned_targets as returned_target
        on returned_target.target_kind = typed_target.target_kind
       and returned_target.target_id = typed_target.target_id
      join linguistic.sources as source
        on source.id = provenance_link.source_id
      left join linguistic.source_locations as source_location
        on source_location.id = provenance_link.source_location_id
       and source_location.source_id = provenance_link.source_id
      left join lateral (
        select lifecycle_event.action_code
        from linguistic.evidence_lifecycle_events as lifecycle_event
        where lifecycle_event.target_documentary_provenance_link_id =
          provenance_link.id
        order by lifecycle_event.event_sequence desc
        limit 1
      ) as latest_lifecycle_event
        on true
      where latest_lifecycle_event.action_code is null
         or latest_lifecycle_event.action_code = 'reinstated'
    ),
    active_provenance as (
      select distinct on (provenance.provenance_link_id)
        provenance.*
      from active_provenance_raw as provenance
      order by
        provenance.provenance_link_id,
        provenance.target_kind collate pg_catalog."C",
        provenance.target_id
    )
    select pg_catalog.jsonb_build_object(
      'locale_code',
      p_locale_code,
      'lexeme_id',
      p_lexeme_id,
      'lexeme_revision_id',
      v_lexeme_revision_id,
      'language',
      pg_catalog.jsonb_build_object(
        'id', v_language_id,
        'code', v_language_code,
        'name', v_language_name,
        'native_name', v_language_native_name
      ),
      'varieties',
      coalesce(
        (
          select pg_catalog.jsonb_agg(
            pg_catalog.jsonb_build_object(
              'id', lexeme_variety.variety_id,
              'code', lexeme_variety.code,
              'name', lexeme_variety.name,
              'region', lexeme_variety.region
            )
            order by
              lexeme_variety.code collate pg_catalog."C",
              lexeme_variety.variety_id
          )
          from root_lexeme_varieties as lexeme_variety
        ),
        '[]'::pg_catalog.jsonb
      ),
      'senses',
      coalesce(
        (
          select pg_catalog.jsonb_agg(
            pg_catalog.jsonb_build_object(
              'sense_id', visible_sense.sense_id,
              'sense_revision_id', visible_sense.sense_revision_id,
              'varieties',
              coalesce(
                (
                  select pg_catalog.jsonb_agg(
                    pg_catalog.jsonb_build_object(
                      'sense_variety_id', sense_variety.sense_variety_id,
                      'variety',
                      pg_catalog.jsonb_build_object(
                        'id', sense_variety.variety_id,
                        'code', sense_variety.code,
                        'name', sense_variety.name,
                        'region', sense_variety.region
                      )
                    )
                    order by
                      sense_variety.code collate pg_catalog."C",
                      sense_variety.sense_variety_id
                  )
                  from visible_sense_varieties as sense_variety
                  where sense_variety.sense_revision_id =
                    visible_sense.sense_revision_id
                ),
                '[]'::pg_catalog.jsonb
              ),
              'glosses',
              coalesce(
                (
                  select pg_catalog.jsonb_agg(
                    pg_catalog.jsonb_build_object(
                      'gloss_id', sense_gloss.gloss_id,
                      'gloss_type_code', sense_gloss.gloss_type_code,
                      'locale_code', sense_gloss.locale_code,
                      'gloss_text', sense_gloss.gloss_text
                    )
                    order by
                      sense_gloss.gloss_type_code collate pg_catalog."C",
                      sense_gloss.gloss_text collate pg_catalog."C",
                      sense_gloss.gloss_id
                  )
                  from visible_sense_glosses as sense_gloss
                  where sense_gloss.sense_revision_id =
                    visible_sense.sense_revision_id
                ),
                '[]'::pg_catalog.jsonb
              )
            )
            order by
              visible_sense.sense_id,
              visible_sense.sense_revision_id
          )
          from visible_senses as visible_sense
        ),
        '[]'::pg_catalog.jsonb
      ),
      'forms',
      coalesce(
        (
          select pg_catalog.jsonb_agg(
            pg_catalog.jsonb_build_object(
              'form_id', visible_form.form_id,
              'form_revision_id', visible_form.form_revision_id,
              'modality_code', visible_form.modality_code,
              'surface_text', visible_form.surface_text,
              'varieties',
              coalesce(
                (
                  select pg_catalog.jsonb_agg(
                    pg_catalog.jsonb_build_object(
                      'id', form_variety.variety_id,
                      'code', form_variety.code,
                      'name', form_variety.name,
                      'region', form_variety.region
                    )
                    order by
                      form_variety.code collate pg_catalog."C",
                      form_variety.form_variety_id
                  )
                  from visible_form_varieties as form_variety
                  where form_variety.form_revision_id =
                    visible_form.form_revision_id
                ),
                '[]'::pg_catalog.jsonb
              ),
              'orthographies',
              coalesce(
                (
                  select pg_catalog.jsonb_agg(
                    pg_catalog.jsonb_build_object(
                      'form_orthography_id',
                      form_orthography.form_orthography_id,
                      'orthography_id', form_orthography.orthography_id,
                      'code', form_orthography.code,
                      'name', form_orthography.name,
                      'script_code', form_orthography.script_code
                    )
                    order by
                      form_orthography.code collate pg_catalog."C",
                      form_orthography.form_orthography_id
                  )
                  from visible_form_orthographies as form_orthography
                  where form_orthography.form_revision_id =
                    visible_form.form_revision_id
                ),
                '[]'::pg_catalog.jsonb
              ),
              'analyses',
              coalesce(
                (
                  select pg_catalog.jsonb_agg(
                    pg_catalog.jsonb_build_object(
                      'form_analysis_id', valid_analysis.form_analysis_id,
                      'form_analysis_revision_id',
                      valid_analysis.form_analysis_revision_id,
                      'lexeme_assertion_id',
                      valid_analysis.lexeme_assertion_id,
                      'sense_assertion_id',
                      valid_analysis.sense_assertion_id,
                      'sense_id', valid_analysis.sense_id,
                      'sense_revision_id',
                      valid_analysis.sense_revision_id,
                      'varieties',
                      coalesce(
                        (
                          select pg_catalog.jsonb_agg(
                            pg_catalog.jsonb_build_object(
                              'id', common_variety.variety_id,
                              'code', common_variety.code,
                              'name', common_variety.name,
                              'region', common_variety.region
                            )
                            order by
                              common_variety.code collate pg_catalog."C",
                              common_variety.variety_id
                          )
                          from detail_analysis_common_varieties
                            as common_variety
                          where common_variety.form_analysis_revision_id =
                            valid_analysis.form_analysis_revision_id
                        ),
                        '[]'::pg_catalog.jsonb
                      )
                    )
                    order by
                      valid_analysis.form_analysis_id,
                      valid_analysis.form_analysis_revision_id,
                      valid_analysis.lexeme_assertion_id
                  )
                  from valid_analyses as valid_analysis
                  where valid_analysis.form_revision_id =
                    visible_form.form_revision_id
                ),
                '[]'::pg_catalog.jsonb
              )
            )
            order by
              visible_form.surface_text collate pg_catalog."C",
              visible_form.form_id,
              visible_form.form_revision_id
          )
          from visible_forms as visible_form
        ),
        '[]'::pg_catalog.jsonb
      ),
      'noun_classes',
      coalesce(
        (
          select pg_catalog.jsonb_agg(
            pg_catalog.jsonb_build_object(
              'assignment_id', noun_assignment.assignment_id,
              'lexeme_revision_variety_id',
              noun_assignment.lexeme_revision_variety_id,
              'variety_id', noun_assignment.variety_id,
              'system',
              pg_catalog.jsonb_build_object(
                'id', noun_assignment.system_id,
                'revision_id', noun_assignment.system_revision_id,
                'code', noun_assignment.system_code,
                'label_locale_code',
                noun_assignment.system_label_locale_code,
                'label', noun_assignment.system_label
              ),
              'class',
              pg_catalog.jsonb_build_object(
                'id', noun_assignment.class_id,
                'revision_id', noun_assignment.class_revision_id,
                'code', noun_assignment.class_code,
                'label_locale_code',
                noun_assignment.class_label_locale_code,
                'label', noun_assignment.class_label
              )
            )
            order by
              noun_assignment.variety_code collate pg_catalog."C",
              noun_assignment.system_code collate pg_catalog."C",
              noun_assignment.class_code collate pg_catalog."C",
              noun_assignment.assignment_id
          )
          from noun_assignments as noun_assignment
        ),
        '[]'::pg_catalog.jsonb
      ),
      'noun_class_pairings',
      coalesce(
        (
          select pg_catalog.jsonb_agg(
            pg_catalog.jsonb_build_object(
              'pairing_id', noun_pairing.pairing_id,
              'variety_id', noun_pairing.variety_id,
              'system',
              pg_catalog.jsonb_build_object(
                'id', noun_pairing.system_id,
                'revision_id', noun_pairing.system_revision_id,
                'code', noun_pairing.system_code,
                'label_locale_code',
                noun_pairing.system_label_locale_code,
                'label', noun_pairing.system_label
              ),
              'class_a',
              pg_catalog.jsonb_build_object(
                'id', noun_pairing.class_a_id,
                'revision_id', noun_pairing.class_a_revision_id,
                'code', noun_pairing.class_a_code,
                'label_locale_code',
                noun_pairing.class_a_label_locale_code,
                'label', noun_pairing.class_a_label
              ),
              'class_b',
              pg_catalog.jsonb_build_object(
                'id', noun_pairing.class_b_id,
                'revision_id', noun_pairing.class_b_revision_id,
                'code', noun_pairing.class_b_code,
                'label_locale_code',
                noun_pairing.class_b_label_locale_code,
                'label', noun_pairing.class_b_label
              )
            )
            order by
              noun_pairing.variety_code collate pg_catalog."C",
              noun_pairing.system_code collate pg_catalog."C",
              noun_pairing.class_a_code collate pg_catalog."C",
              noun_pairing.class_b_code collate pg_catalog."C",
              noun_pairing.pairing_id
          )
          from noun_pairings as noun_pairing
        ),
        '[]'::pg_catalog.jsonb
      ),
      'verb_classes',
      coalesce(
        (
          select pg_catalog.jsonb_agg(
            pg_catalog.jsonb_build_object(
              'assignment_id', verb_assignment.assignment_id,
              'lexeme_revision_variety_id',
              verb_assignment.lexeme_revision_variety_id,
              'variety_id', verb_assignment.variety_id,
              'system',
              pg_catalog.jsonb_build_object(
                'id', verb_assignment.system_id,
                'revision_id', verb_assignment.system_revision_id,
                'code', verb_assignment.system_code,
                'label_locale_code',
                verb_assignment.system_label_locale_code,
                'label', verb_assignment.system_label
              ),
              'class',
              pg_catalog.jsonb_build_object(
                'id', verb_assignment.class_id,
                'revision_id', verb_assignment.class_revision_id,
                'code', verb_assignment.class_code,
                'label_locale_code',
                verb_assignment.class_label_locale_code,
                'label', verb_assignment.class_label
              )
            )
            order by
              verb_assignment.variety_code collate pg_catalog."C",
              verb_assignment.system_code collate pg_catalog."C",
              verb_assignment.class_code collate pg_catalog."C",
              verb_assignment.assignment_id
          )
          from verb_assignments as verb_assignment
        ),
        '[]'::pg_catalog.jsonb
      ),
      'paradigms',
      coalesce(
        (
          select pg_catalog.jsonb_agg(
            pg_catalog.jsonb_build_object(
              'membership_id', paradigm_membership.membership_id,
              'paradigm_id', paradigm_membership.paradigm_id,
              'paradigm_revision_id',
              paradigm_membership.paradigm_revision_id,
              'variety_id', paradigm_membership.variety_id,
              'label_locale_code',
              paradigm_membership.label_locale_code,
              'label', paradigm_membership.label,
              'description', paradigm_membership.description,
              'verb_classes',
              coalesce(
                (
                  select pg_catalog.jsonb_agg(
                    pg_catalog.jsonb_build_object(
                      'membership_id', paradigm_verb_class.membership_id,
                      'system',
                      pg_catalog.jsonb_build_object(
                        'id', paradigm_verb_class.system_id,
                        'revision_id',
                        paradigm_verb_class.system_revision_id,
                        'code', paradigm_verb_class.system_code,
                        'label_locale_code',
                        paradigm_verb_class.system_label_locale_code,
                        'label', paradigm_verb_class.system_label
                      ),
                      'class',
                      pg_catalog.jsonb_build_object(
                        'id', paradigm_verb_class.class_id,
                        'revision_id',
                        paradigm_verb_class.class_revision_id,
                        'code', paradigm_verb_class.class_code,
                        'label_locale_code',
                        paradigm_verb_class.class_label_locale_code,
                        'label', paradigm_verb_class.class_label
                      )
                    )
                    order by
                      paradigm_verb_class.system_code
                        collate pg_catalog."C",
                      paradigm_verb_class.class_code
                        collate pg_catalog."C",
                      paradigm_verb_class.membership_id
                  )
                  from paradigm_verb_classes as paradigm_verb_class
                  where paradigm_verb_class.paradigm_lexeme_membership_id =
                    paradigm_membership.membership_id
                ),
                '[]'::pg_catalog.jsonb
              )
            )
            order by
              paradigm_membership.paradigm_id,
              paradigm_membership.paradigm_revision_id,
              paradigm_membership.membership_id
          )
          from paradigm_memberships as paradigm_membership
        ),
        '[]'::pg_catalog.jsonb
      ),
      'provenance',
      coalesce(
        (
          select pg_catalog.jsonb_agg(
            pg_catalog.jsonb_build_object(
              'provenance_link_id', provenance.provenance_link_id,
              'target_kind', provenance.target_kind,
              'target_id', provenance.target_id,
              'source_id', provenance.source_id,
              'source_label', provenance.source_label,
              'citation_text', provenance.citation_text,
              'canonical_uri', provenance.canonical_uri,
              'publication_year', provenance.publication_year,
              'source_location_id', provenance.source_location_id,
              'locator_text', provenance.locator_text,
              'location_uri', provenance.location_uri
            )
            order by
              provenance.target_kind collate pg_catalog."C",
              provenance.target_id,
              provenance.source_id,
              provenance.provenance_link_id
          )
          from active_provenance as provenance
        ),
        '[]'::pg_catalog.jsonb
      )
    )
  );
end;
$$;

alter function public.get_published_lexeme_entry(uuid, text)
  owner to postgres;

revoke execute on function public.get_published_lexeme_entry(uuid, text)
  from public, anon, authenticated, service_role;

grant execute on function public.get_published_lexeme_entry(uuid, text)
  to authenticated;

comment on function public.get_published_lexeme_entry(uuid, text) is
  'Builds a published lexical document for one exact locale, retaining concurrent classifications and active documentary provenance, excluding Review and lifecycle internals, and summarizing paradigms without slots.';
