create table linguistic.noun_class_systems (
  id uuid primary key,
  entity_type_code text generated always as (
    'noun_class_system'::text
  ) stored,
  variety_id uuid not null,
  language_id uuid not null,
  code text not null,
  constraint ncs_id_entity_type_key unique (
    id,
    entity_type_code
  ),
  constraint ncs_id_variety_language_key unique (
    id,
    variety_id,
    language_id
  ),
  constraint ncs_variety_code_key unique (
    variety_id,
    code
  ),
  constraint ncs_code_check check (
    char_length(code) between 1 and 120
    and code !~ '^[[:space:]]'
    and code !~ '[[:space:]]$'
  ),
  constraint ncs_entity_fkey foreign key (
    id,
    entity_type_code
  ) references linguistic.entities (id, entity_type_code)
    on update restrict
    on delete restrict,
  constraint ncs_variety_language_fkey foreign key (
    variety_id,
    language_id
  ) references linguistic.varieties (id, language_id)
    on update restrict
    on delete restrict
);

create table linguistic.noun_class_system_revisions (
  revision_id uuid primary key,
  entity_id uuid not null,
  entity_type_code text generated always as (
    'noun_class_system'::text
  ) stored,
  variety_id uuid not null,
  language_id uuid not null,
  presentation_locale_code text not null,
  label text not null,
  description text,
  constraint ncsr_entity_revision_key unique (
    entity_id,
    revision_id
  ),
  constraint ncsr_typed_revision_key unique (
    entity_id,
    revision_id,
    entity_type_code
  ),
  constraint ncsr_revision_context_key unique (
    entity_id,
    revision_id,
    variety_id,
    language_id
  ),
  constraint ncsr_presentation_locale_check check (
    char_length(presentation_locale_code) between 1 and 63
    and presentation_locale_code !~ '^[[:space:]]'
    and presentation_locale_code !~ '[[:space:]]$'
  ),
  constraint ncsr_label_check check (
    char_length(label) between 1 and 240
    and label !~ '^[[:space:]]'
    and label !~ '[[:space:]]$'
  ),
  constraint ncsr_description_check check (
    description is null
    or (
      char_length(description) between 1 and 4000
      and description !~ '^[[:space:]]'
      and description !~ '[[:space:]]$'
    )
  ),
  constraint ncsr_revision_fkey foreign key (
    entity_id,
    revision_id,
    entity_type_code
  ) references linguistic.revisions (entity_id, id, entity_type_code)
    on update restrict
    on delete restrict,
  constraint ncsr_system_fkey foreign key (
    entity_id,
    entity_type_code
  ) references linguistic.noun_class_systems (id, entity_type_code)
    on update restrict
    on delete restrict,
  constraint ncsr_stable_context_fkey foreign key (
    entity_id,
    variety_id,
    language_id
  ) references linguistic.noun_class_systems (
    id,
    variety_id,
    language_id
  )
    on update restrict
    on delete restrict
);

create table linguistic.noun_classes (
  id uuid primary key,
  entity_type_code text generated always as ('noun_class'::text) stored,
  noun_class_system_id uuid not null,
  variety_id uuid not null,
  language_id uuid not null,
  code text not null,
  constraint nc_id_entity_type_key unique (
    id,
    entity_type_code
  ),
  constraint nc_id_system_context_key unique (
    id,
    noun_class_system_id,
    variety_id,
    language_id
  ),
  constraint nc_system_code_key unique (
    noun_class_system_id,
    code
  ),
  constraint nc_code_check check (
    char_length(code) between 1 and 120
    and code !~ '^[[:space:]]'
    and code !~ '[[:space:]]$'
  ),
  constraint nc_entity_fkey foreign key (
    id,
    entity_type_code
  ) references linguistic.entities (id, entity_type_code)
    on update restrict
    on delete restrict,
  constraint nc_system_context_fkey foreign key (
    noun_class_system_id,
    variety_id,
    language_id
  ) references linguistic.noun_class_systems (
    id,
    variety_id,
    language_id
  )
    on update restrict
    on delete restrict
);

create table linguistic.noun_class_revisions (
  revision_id uuid primary key,
  entity_id uuid not null,
  entity_type_code text generated always as ('noun_class'::text) stored,
  noun_class_system_id uuid not null,
  noun_class_system_revision_id uuid not null,
  variety_id uuid not null,
  language_id uuid not null,
  presentation_locale_code text not null,
  label text not null,
  description text,
  constraint ncr_entity_revision_key unique (
    entity_id,
    revision_id
  ),
  constraint ncr_typed_revision_key unique (
    entity_id,
    revision_id,
    entity_type_code
  ),
  constraint ncr_revision_context_key unique (
    entity_id,
    revision_id,
    noun_class_system_id,
    noun_class_system_revision_id,
    variety_id,
    language_id
  ),
  constraint ncr_presentation_locale_check check (
    char_length(presentation_locale_code) between 1 and 63
    and presentation_locale_code !~ '^[[:space:]]'
    and presentation_locale_code !~ '[[:space:]]$'
  ),
  constraint ncr_label_check check (
    char_length(label) between 1 and 240
    and label !~ '^[[:space:]]'
    and label !~ '[[:space:]]$'
  ),
  constraint ncr_description_check check (
    description is null
    or (
      char_length(description) between 1 and 4000
      and description !~ '^[[:space:]]'
      and description !~ '[[:space:]]$'
    )
  ),
  constraint ncr_revision_fkey foreign key (
    entity_id,
    revision_id,
    entity_type_code
  ) references linguistic.revisions (entity_id, id, entity_type_code)
    on update restrict
    on delete restrict,
  constraint ncr_class_fkey foreign key (
    entity_id,
    entity_type_code
  ) references linguistic.noun_classes (id, entity_type_code)
    on update restrict
    on delete restrict,
  constraint ncr_stable_context_fkey foreign key (
    entity_id,
    noun_class_system_id,
    variety_id,
    language_id
  ) references linguistic.noun_classes (
    id,
    noun_class_system_id,
    variety_id,
    language_id
  )
    on update restrict
    on delete restrict,
  constraint ncr_system_revision_context_fkey foreign key (
    noun_class_system_id,
    noun_class_system_revision_id,
    variety_id,
    language_id
  ) references linguistic.noun_class_system_revisions (
    entity_id,
    revision_id,
    variety_id,
    language_id
  )
    on update restrict
    on delete restrict
);

create table linguistic.noun_class_pairings (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null,
  noun_class_system_id uuid not null,
  variety_id uuid not null,
  language_id uuid not null,
  noun_class_a_id uuid not null,
  noun_class_a_revision_id uuid not null,
  noun_class_b_id uuid not null,
  noun_class_b_revision_id uuid not null,
  constraint ncp_exact_pair_key unique (
    revision_id,
    noun_class_a_id,
    noun_class_a_revision_id,
    noun_class_b_id,
    noun_class_b_revision_id
  ),
  constraint ncp_canonical_endpoints_check check (
    noun_class_a_id < noun_class_b_id
  ),
  constraint ncp_system_revision_fkey foreign key (
    noun_class_system_id,
    revision_id,
    variety_id,
    language_id
  ) references linguistic.noun_class_system_revisions (
    entity_id,
    revision_id,
    variety_id,
    language_id
  )
    on update restrict
    on delete restrict,
  constraint ncp_class_a_revision_fkey foreign key (
    noun_class_a_id,
    noun_class_a_revision_id,
    noun_class_system_id,
    revision_id,
    variety_id,
    language_id
  ) references linguistic.noun_class_revisions (
    entity_id,
    revision_id,
    noun_class_system_id,
    noun_class_system_revision_id,
    variety_id,
    language_id
  )
    on update restrict
    on delete restrict,
  constraint ncp_class_b_revision_fkey foreign key (
    noun_class_b_id,
    noun_class_b_revision_id,
    noun_class_system_id,
    revision_id,
    variety_id,
    language_id
  ) references linguistic.noun_class_revisions (
    entity_id,
    revision_id,
    noun_class_system_id,
    noun_class_system_revision_id,
    variety_id,
    language_id
  )
    on update restrict
    on delete restrict
);

alter table linguistic.lexeme_revision_varieties
  add constraint lexeme_revision_varieties_id_context_key unique (
    id,
    revision_id,
    lexeme_id,
    language_id,
    variety_id
  );

create table linguistic.lexeme_revision_noun_classes (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null,
  lexeme_id uuid not null,
  lexeme_revision_variety_id uuid not null,
  language_id uuid not null,
  variety_id uuid not null,
  noun_class_system_id uuid not null,
  noun_class_system_revision_id uuid not null,
  noun_class_id uuid not null,
  noun_class_revision_id uuid not null,
  constraint lrnc_exact_assignment_key unique (
    revision_id,
    variety_id,
    lexeme_revision_variety_id,
    noun_class_system_revision_id,
    noun_class_revision_id
  ),
  constraint lrnc_lexeme_variety_context_fkey foreign key (
    lexeme_revision_variety_id,
    revision_id,
    lexeme_id,
    language_id,
    variety_id
  ) references linguistic.lexeme_revision_varieties (
    id,
    revision_id,
    lexeme_id,
    language_id,
    variety_id
  )
    on update restrict
    on delete restrict,
  constraint lrnc_system_revision_context_fkey foreign key (
    noun_class_system_id,
    noun_class_system_revision_id,
    variety_id,
    language_id
  ) references linguistic.noun_class_system_revisions (
    entity_id,
    revision_id,
    variety_id,
    language_id
  )
    on update restrict
    on delete restrict,
  constraint lrnc_class_revision_context_fkey foreign key (
    noun_class_id,
    noun_class_revision_id,
    noun_class_system_id,
    noun_class_system_revision_id,
    variety_id,
    language_id
  ) references linguistic.noun_class_revisions (
    entity_id,
    revision_id,
    noun_class_system_id,
    noun_class_system_revision_id,
    variety_id,
    language_id
  )
    on update restrict
    on delete restrict
);

create index ncr_system_revision_context_idx
  on linguistic.noun_class_revisions (
    noun_class_system_id,
    noun_class_system_revision_id,
    variety_id,
    language_id,
    revision_id
  );

create index ncp_system_revision_context_idx
  on linguistic.noun_class_pairings (
    noun_class_system_id,
    revision_id,
    variety_id,
    language_id
  );

create index ncp_class_a_revision_context_idx
  on linguistic.noun_class_pairings (
    noun_class_a_id,
    noun_class_a_revision_id,
    noun_class_system_id,
    revision_id,
    variety_id,
    language_id
  );

create index ncp_class_b_revision_context_idx
  on linguistic.noun_class_pairings (
    noun_class_b_id,
    noun_class_b_revision_id,
    noun_class_system_id,
    revision_id,
    variety_id,
    language_id
  );

create index lrnc_lexeme_variety_context_idx
  on linguistic.lexeme_revision_noun_classes (
    lexeme_revision_variety_id,
    revision_id,
    lexeme_id,
    language_id,
    variety_id
  );

create index lrnc_system_revision_context_idx
  on linguistic.lexeme_revision_noun_classes (
    noun_class_system_id,
    noun_class_system_revision_id,
    variety_id,
    language_id,
    revision_id
  );

create index lrnc_class_revision_context_idx
  on linguistic.lexeme_revision_noun_classes (
    noun_class_id,
    noun_class_revision_id,
    noun_class_system_id,
    noun_class_system_revision_id,
    variety_id,
    language_id,
    revision_id
  );

alter table linguistic.documentary_provenance_links
  add column target_noun_class_pairing_id uuid,
  add column target_lexeme_revision_noun_class_id uuid,
  drop constraint dpl_one_target_check,
  add constraint dpl_one_target_check check (
    num_nonnulls(
      target_revision_id,
      target_concept_revision_label_id,
      target_lexeme_revision_variety_id,
      target_sense_revision_gloss_id,
      target_sense_revision_concept_id,
      target_sense_revision_variety_id,
      target_form_revision_variety_id,
      target_form_revision_orthography_id,
      target_form_analysis_revision_lexeme_id,
      target_form_analysis_revision_sense_id,
      target_form_analysis_revision_variety_id,
      target_grammatical_feature_definition_id,
      target_grammatical_feature_value_id,
      target_form_analysis_revision_feature_id,
      target_form_analysis_revision_segment_id,
      target_form_analysis_revision_segment_span_id,
      target_form_analysis_revision_feature_segment_target_id,
      target_form_analysis_revision_feature_segment_realization_id,
      target_grammar_rule_revision_variety_id,
      target_form_analysis_revision_operation_id,
      target_form_analysis_revision_operation_segment_target_id,
      target_form_analysis_revision_operation_segment_realization_id,
      target_noun_class_pairing_id,
      target_lexeme_revision_noun_class_id
    ) = 1
  ),
  add constraint dpl_target_noun_class_pairing_fkey foreign key (
    target_noun_class_pairing_id
  ) references linguistic.noun_class_pairings (id)
    on update restrict
    on delete restrict,
  add constraint dpl_target_lexeme_noun_class_fkey foreign key (
    target_lexeme_revision_noun_class_id
  ) references linguistic.lexeme_revision_noun_classes (id)
    on update restrict
    on delete restrict;

create unique index dpl_noun_class_pairing_source_uq
  on linguistic.documentary_provenance_links (
    target_noun_class_pairing_id,
    source_id,
    source_location_id
  ) nulls not distinct
  where target_noun_class_pairing_id is not null;

create unique index dpl_lexeme_noun_class_source_uq
  on linguistic.documentary_provenance_links (
    target_lexeme_revision_noun_class_id,
    source_id,
    source_location_id
  ) nulls not distinct
  where target_lexeme_revision_noun_class_id is not null;

alter table linguistic.review_subjects
  add column target_noun_class_pairing_id uuid,
  add column target_lexeme_revision_noun_class_id uuid,
  drop constraint review_subjects_one_target_check,
  add constraint review_subjects_one_target_check check (
    num_nonnulls(
      target_revision_id,
      target_concept_revision_label_id,
      target_lexeme_revision_variety_id,
      target_sense_revision_gloss_id,
      target_sense_revision_concept_id,
      target_sense_revision_variety_id,
      target_form_revision_variety_id,
      target_form_revision_orthography_id,
      target_form_analysis_revision_lexeme_id,
      target_form_analysis_revision_sense_id,
      target_form_analysis_revision_variety_id,
      target_grammatical_feature_definition_id,
      target_grammatical_feature_value_id,
      target_form_analysis_revision_feature_id,
      target_form_analysis_revision_segment_id,
      target_form_analysis_revision_segment_span_id,
      target_form_analysis_revision_feature_segment_target_id,
      target_form_analysis_revision_feature_segment_realization_id,
      target_grammar_rule_revision_variety_id,
      target_form_analysis_revision_operation_id,
      target_form_analysis_revision_operation_segment_target_id,
      target_form_analysis_revision_operation_segment_realization_id,
      target_documentary_provenance_link_id,
      target_form_attestation_id,
      target_noun_class_pairing_id,
      target_lexeme_revision_noun_class_id
    ) = 1
  ),
  add constraint rs_noun_class_pairing_fkey foreign key (
    target_noun_class_pairing_id
  ) references linguistic.noun_class_pairings (id)
    on update restrict
    on delete restrict,
  add constraint rs_lexeme_noun_class_fkey foreign key (
    target_lexeme_revision_noun_class_id
  ) references linguistic.lexeme_revision_noun_classes (id)
    on update restrict
    on delete restrict;

create unique index rs_noun_class_pairing_uidx
  on linguistic.review_subjects (target_noun_class_pairing_id)
  where target_noun_class_pairing_id is not null;

create unique index rs_lexeme_noun_class_uidx
  on linguistic.review_subjects (target_lexeme_revision_noun_class_id)
  where target_lexeme_revision_noun_class_id is not null;

do $$
begin
  if not exists (
    select 1
    from linguistic.entity_types as entity_type
    where entity_type.code = 'noun_class_system'
  ) then
    raise exception using
      errcode = '55000',
      message = 'noun_class_system entity type is not registered';
  end if;

  if not exists (
    select 1
    from linguistic.entity_types as entity_type
    where entity_type.code = 'noun_class'
  ) then
    raise exception using
      errcode = '55000',
      message = 'noun_class entity type is not registered';
  end if;

  if exists (
    select 1
    from linguistic.entities as entity
    where entity.entity_type_code = 'noun_class_system'
      and not exists (
        select 1
        from linguistic.noun_class_systems as noun_class_system
        where noun_class_system.id = entity.id
      )
  ) then
    raise exception using
      errcode = '55000',
      message = 'pre-existing noun class system entity has no stable subtype',
      hint = 'Resolve the incompatible data explicitly before applying Migration 15.';
  end if;

  if exists (
    select 1
    from linguistic.entities as entity
    where entity.entity_type_code = 'noun_class'
      and not exists (
        select 1
        from linguistic.noun_classes as noun_class
        where noun_class.id = entity.id
      )
  ) then
    raise exception using
      errcode = '55000',
      message = 'pre-existing noun class entity has no stable subtype',
      hint = 'Resolve the incompatible data explicitly before applying Migration 15.';
  end if;

  if exists (
    select 1
    from linguistic.revisions as revision
    where revision.entity_type_code = 'noun_class_system'
      and not exists (
        select 1
        from linguistic.noun_class_system_revisions as system_revision
        where system_revision.revision_id = revision.id
          and system_revision.entity_id = revision.entity_id
      )
  ) then
    raise exception using
      errcode = '55000',
      message = 'pre-existing noun class system revision has no typed subtype',
      hint = 'Resolve the incompatible data explicitly before applying Migration 15.';
  end if;

  if exists (
    select 1
    from linguistic.revisions as revision
    where revision.entity_type_code = 'noun_class'
      and not exists (
        select 1
        from linguistic.noun_class_revisions as noun_class_revision
        where noun_class_revision.revision_id = revision.id
          and noun_class_revision.entity_id = revision.entity_id
      )
  ) then
    raise exception using
      errcode = '55000',
      message = 'pre-existing noun class revision has no typed subtype',
      hint = 'Resolve the incompatible data explicitly before applying Migration 15.';
  end if;
end;
$$;

create or replace function linguistic.assert_entity_subtype_exists()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_entity_id uuid;
  target_entity_type_code text;
begin
  target_entity_id = new.id;

  select entity.entity_type_code
  into target_entity_type_code
  from linguistic.entities as entity
  where entity.id = target_entity_id;

  if not found then
    raise exception using
      errcode = '23514',
      message = 'cannot validate subtype for a missing linguistic entity';
  end if;

  if target_entity_type_code = 'concept' then
    if not exists (
      select 1
      from linguistic.concepts as concept
      where concept.id = target_entity_id
    ) then
      raise exception using
        errcode = '23514',
        message = 'concept entity is missing its stable concept subtype';
    end if;
  elsif target_entity_type_code = 'lexeme' then
    if not exists (
      select 1
      from linguistic.lexemes as lexeme
      where lexeme.id = target_entity_id
    ) then
      raise exception using
        errcode = '23514',
        message = 'lexeme entity is missing its stable lexeme subtype';
    end if;
  elsif target_entity_type_code = 'sense' then
    if not exists (
      select 1
      from linguistic.senses as sense
      where sense.id = target_entity_id
    ) then
      raise exception using
        errcode = '23514',
        message = 'sense entity is missing its stable sense subtype';
    end if;
  elsif target_entity_type_code = 'form' then
    if not exists (
      select 1
      from linguistic.forms as form_subtype
      where form_subtype.id = target_entity_id
    ) then
      raise exception using
        errcode = '23514',
        message = 'form entity is missing its stable form subtype';
    end if;
  elsif target_entity_type_code = 'form_analysis' then
    if not exists (
      select 1
      from linguistic.form_analyses as form_analysis_subtype
      where form_analysis_subtype.id = target_entity_id
    ) then
      raise exception using
        errcode = '23514',
        message = 'form analysis entity is missing its stable subtype';
    end if;
  elsif target_entity_type_code = 'grammar_rule' then
    if not exists (
      select 1
      from linguistic.grammar_rules as grammar_rule
      where grammar_rule.id = target_entity_id
    ) then
      raise exception using
        errcode = '23514',
        message = 'grammar rule entity is missing its stable subtype';
    end if;
  elsif target_entity_type_code = 'noun_class_system' then
    if not exists (
      select 1
      from linguistic.noun_class_systems as noun_class_system
      where noun_class_system.id = target_entity_id
    ) then
      raise exception using
        errcode = '23514',
        message = 'noun class system entity is missing its stable subtype';
    end if;
  elsif target_entity_type_code = 'noun_class' then
    if not exists (
      select 1
      from linguistic.noun_classes as noun_class
      where noun_class.id = target_entity_id
    ) then
      raise exception using
        errcode = '23514',
        message = 'noun class entity is missing its stable subtype';
    end if;
  end if;

  return null;
end;
$$;

create or replace function linguistic.assert_revision_subtype_exists()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_revision_id uuid;
  target_entity_id uuid;
  target_entity_type_code text;
begin
  target_revision_id = new.id;

  select
    revision.entity_id,
    revision.entity_type_code
  into
    target_entity_id,
    target_entity_type_code
  from linguistic.revisions as revision
  where revision.id = target_revision_id;

  if not found then
    raise exception using
      errcode = '23514',
      message = 'cannot validate subtype for a missing linguistic revision';
  end if;

  if target_entity_type_code = 'concept' then
    if not exists (
      select 1
      from linguistic.concept_revisions as concept_revision
      where concept_revision.revision_id = target_revision_id
        and concept_revision.entity_id = target_entity_id
    ) then
      raise exception using
        errcode = '23514',
        message = 'concept revision is missing its typed revision subtype';
    end if;
  elsif target_entity_type_code = 'lexeme' then
    if not exists (
      select 1
      from linguistic.lexeme_revisions as lexeme_revision
      where lexeme_revision.revision_id = target_revision_id
        and lexeme_revision.entity_id = target_entity_id
    ) then
      raise exception using
        errcode = '23514',
        message = 'lexeme revision is missing its typed revision subtype';
    end if;
  elsif target_entity_type_code = 'sense' then
    if not exists (
      select 1
      from linguistic.sense_revisions as sense_revision
      where sense_revision.revision_id = target_revision_id
        and sense_revision.entity_id = target_entity_id
    ) then
      raise exception using
        errcode = '23514',
        message = 'sense revision is missing its typed revision subtype';
    end if;
  elsif target_entity_type_code = 'form' then
    if not exists (
      select 1
      from linguistic.form_revisions as form_revision
      where form_revision.revision_id = target_revision_id
        and form_revision.entity_id = target_entity_id
    ) then
      raise exception using
        errcode = '23514',
        message = 'form revision is missing its typed revision subtype';
    end if;
  elsif target_entity_type_code = 'form_analysis' then
    if not exists (
      select 1
      from linguistic.form_analysis_revisions as form_analysis_revision
      where form_analysis_revision.revision_id = target_revision_id
        and form_analysis_revision.entity_id = target_entity_id
    ) then
      raise exception using
        errcode = '23514',
        message = 'form analysis revision is missing its typed subtype';
    end if;
  elsif target_entity_type_code = 'grammar_rule' then
    if not exists (
      select 1
      from linguistic.grammar_rule_revisions as grammar_rule_revision
      where grammar_rule_revision.revision_id = target_revision_id
        and grammar_rule_revision.entity_id = target_entity_id
    ) then
      raise exception using
        errcode = '23514',
        message = 'grammar rule revision is missing its typed subtype';
    end if;
  elsif target_entity_type_code = 'noun_class_system' then
    if not exists (
      select 1
      from linguistic.noun_class_system_revisions as system_revision
      where system_revision.revision_id = target_revision_id
        and system_revision.entity_id = target_entity_id
    ) then
      raise exception using
        errcode = '23514',
        message = 'noun class system revision is missing its typed subtype';
    end if;
  elsif target_entity_type_code = 'noun_class' then
    if not exists (
      select 1
      from linguistic.noun_class_revisions as noun_class_revision
      where noun_class_revision.revision_id = target_revision_id
        and noun_class_revision.entity_id = target_entity_id
    ) then
      raise exception using
        errcode = '23514',
        message = 'noun class revision is missing its typed subtype';
    end if;
  end if;

  return null;
end;
$$;

create trigger guard_noun_class_systems_mutation
before update or delete on linguistic.noun_class_systems
for each row
execute function linguistic.guard_stable_subtype_mutation();

create trigger guard_noun_class_system_revisions_mutation
before update or delete on linguistic.noun_class_system_revisions
for each row
execute function linguistic.guard_revision_subtype_mutation();

create trigger guard_noun_classes_mutation
before update or delete on linguistic.noun_classes
for each row
execute function linguistic.guard_stable_subtype_mutation();

create trigger guard_noun_class_revisions_mutation
before update or delete on linguistic.noun_class_revisions
for each row
execute function linguistic.guard_revision_subtype_mutation();

create trigger guard_noun_class_pairings_snapshot
before insert or update or delete on linguistic.noun_class_pairings
for each row
execute function linguistic.guard_snapshot_child_mutation();

create trigger guard_lexeme_revision_noun_classes_snapshot
before insert or update or delete
on linguistic.lexeme_revision_noun_classes
for each row
execute function linguistic.guard_snapshot_child_mutation();

alter table linguistic.noun_class_systems enable row level security;
alter table linguistic.noun_class_system_revisions enable row level security;
alter table linguistic.noun_classes enable row level security;
alter table linguistic.noun_class_revisions enable row level security;
alter table linguistic.noun_class_pairings enable row level security;
alter table linguistic.lexeme_revision_noun_classes
  enable row level security;

revoke all on table
  linguistic.noun_class_systems,
  linguistic.noun_class_system_revisions,
  linguistic.noun_classes,
  linguistic.noun_class_revisions,
  linguistic.noun_class_pairings,
  linguistic.lexeme_revision_noun_classes
from public, anon, authenticated, service_role;

revoke execute on function linguistic.assert_entity_subtype_exists()
  from public, anon, authenticated, service_role;

revoke execute on function linguistic.assert_revision_subtype_exists()
  from public, anon, authenticated, service_role;

comment on table linguistic.noun_class_systems is
  'Stable noun class system identities scoped to exactly one Variety. Multiple systems may coexist in a Variety, and this identity stores no morphological realization data.';

comment on column linguistic.noun_class_systems.id is
  'Stable UUID shared with the core Entity row.';

comment on column linguistic.noun_class_systems.entity_type_code is
  'Generated noun_class_system discriminator for the typed Entity foreign key.';

comment on column linguistic.noun_class_systems.variety_id is
  'Single stable Variety to which this noun class system belongs.';

comment on column linguistic.noun_class_systems.language_id is
  'Integrity copy of the owning Variety language for declarative context pins.';

comment on column linguistic.noun_class_systems.code is
  'Stable case-sensitive system code preserved without automatic whitespace, case, or Unicode normalization.';

comment on constraint ncs_variety_code_key
on linguistic.noun_class_systems is
  'Makes each case-sensitive system code unique within its Variety.';

comment on constraint ncs_code_check
on linguistic.noun_class_systems is
  'Requires a system code of 1 to 120 characters without outer whitespace.';

comment on constraint ncs_variety_language_fkey
on linguistic.noun_class_systems is
  'Proves that the system Variety belongs to the copied language.';

comment on table linguistic.noun_class_system_revisions is
  'Immutable editorial snapshots of stable noun class systems, governed by the generic core Revision lifecycle.';

comment on column linguistic.noun_class_system_revisions.revision_id is
  'Exact core Revision UUID represented by this typed snapshot.';

comment on column linguistic.noun_class_system_revisions.entity_id is
  'Stable noun class system identity revised by this snapshot.';

comment on column linguistic.noun_class_system_revisions.entity_type_code is
  'Generated noun_class_system discriminator for typed core Revision integrity.';

comment on column linguistic.noun_class_system_revisions.variety_id is
  'Integrity copy of the stable system Variety.';

comment on column linguistic.noun_class_system_revisions.language_id is
  'Integrity copy of the stable system language.';

comment on column linguistic.noun_class_system_revisions.presentation_locale_code is
  'Locale of this snapshot label and description, preserved without automatic normalization.';

comment on column linguistic.noun_class_system_revisions.label is
  'Human-readable snapshot label; it is editorial metadata rather than stable identity.';

comment on column linguistic.noun_class_system_revisions.description is
  'Optional editorial description of this exact system snapshot.';

comment on constraint ncsr_revision_context_key
on linguistic.noun_class_system_revisions is
  'Supports exact descendant pins to one stable system Revision, Variety, and language context.';

comment on constraint ncsr_stable_context_fkey
on linguistic.noun_class_system_revisions is
  'Keeps the revision context equal to its stable noun class system context.';

comment on table linguistic.noun_classes is
  'Stable noun class identities scoped to exactly one noun class system. The stable identity contains no morphological realization data.';

comment on column linguistic.noun_classes.id is
  'Stable UUID shared with the core Entity row.';

comment on column linguistic.noun_classes.entity_type_code is
  'Generated noun_class discriminator for the typed Entity foreign key.';

comment on column linguistic.noun_classes.noun_class_system_id is
  'Single stable noun class system containing this class.';

comment on column linguistic.noun_classes.variety_id is
  'Integrity copy of the containing system Variety.';

comment on column linguistic.noun_classes.language_id is
  'Integrity copy of the containing system language.';

comment on column linguistic.noun_classes.code is
  'Stable case-sensitive class code preserved without automatic whitespace, case, or Unicode normalization.';

comment on constraint nc_system_code_key
on linguistic.noun_classes is
  'Makes each case-sensitive class code unique within its noun class system.';

comment on constraint nc_code_check
on linguistic.noun_classes is
  'Requires a class code of 1 to 120 characters without outer whitespace.';

comment on constraint nc_system_context_fkey
on linguistic.noun_classes is
  'Proves that the parent system, Variety, and language form one stable context.';

comment on table linguistic.noun_class_revisions is
  'Immutable editorial snapshots of stable noun classes, pinned to an exact snapshot of their parent system.';

comment on column linguistic.noun_class_revisions.revision_id is
  'Exact core Revision UUID represented by this typed class snapshot.';

comment on column linguistic.noun_class_revisions.entity_id is
  'Stable noun class identity revised by this snapshot.';

comment on column linguistic.noun_class_revisions.entity_type_code is
  'Generated noun_class discriminator for typed core Revision integrity.';

comment on column linguistic.noun_class_revisions.noun_class_system_id is
  'Stable parent system identity copied from the stable noun class.';

comment on column linguistic.noun_class_revisions.noun_class_system_revision_id is
  'Exact parent system Revision governing this class snapshot.';

comment on column linguistic.noun_class_revisions.variety_id is
  'Integrity copy of the shared parent system Variety.';

comment on column linguistic.noun_class_revisions.language_id is
  'Integrity copy of the shared parent system language.';

comment on column linguistic.noun_class_revisions.presentation_locale_code is
  'Locale of this snapshot label and description, preserved without automatic normalization.';

comment on column linguistic.noun_class_revisions.label is
  'Human-readable snapshot label; it is editorial metadata rather than stable identity.';

comment on column linguistic.noun_class_revisions.description is
  'Optional editorial description of this exact class snapshot.';

comment on constraint ncr_revision_context_key
on linguistic.noun_class_revisions is
  'Supports exact descendant pins to one class Revision and its complete parent system context.';

comment on constraint ncr_stable_context_fkey
on linguistic.noun_class_revisions is
  'Keeps the class, parent system, Variety, and language equal to the stable class context.';

comment on constraint ncr_system_revision_context_fkey
on linguistic.noun_class_revisions is
  'Pins the class snapshot to an exact Revision of the same system, Variety, and language.';

comment on table linguistic.noun_class_pairings is
  'Neutral undirected many-to-many pairings between two exact class Revisions in one exact system snapshot. Evidence lifecycle remains attached to evidence records and never mutates a pairing.';

comment on column linguistic.noun_class_pairings.id is
  'Snapshot-scoped pairing UUID and precise documentary provenance and Review target.';

comment on column linguistic.noun_class_pairings.revision_id is
  'Exact noun class system Revision owning this snapshot child.';

comment on column linguistic.noun_class_pairings.noun_class_system_id is
  'Stable owner system identity paired with revision_id.';

comment on column linguistic.noun_class_pairings.variety_id is
  'Integrity copy proving that the owner and both endpoints share one Variety.';

comment on column linguistic.noun_class_pairings.language_id is
  'Integrity copy proving that the owner and both endpoints share one language.';

comment on column linguistic.noun_class_pairings.noun_class_a_id is
  'Stable identity of the canonically lower UUID endpoint.';

comment on column linguistic.noun_class_pairings.noun_class_a_revision_id is
  'Exact class Revision pinned for endpoint A.';

comment on column linguistic.noun_class_pairings.noun_class_b_id is
  'Stable identity of the canonically higher UUID endpoint.';

comment on column linguistic.noun_class_pairings.noun_class_b_revision_id is
  'Exact class Revision pinned for endpoint B.';

comment on constraint ncp_canonical_endpoints_check
on linguistic.noun_class_pairings is
  'Requires distinct endpoints in deterministic ascending UUID order, eliminating reversed representations.';

comment on constraint ncp_exact_pair_key
on linguistic.noun_class_pairings is
  'Forbids repetition of the same exact endpoint Revision pins within one system snapshot.';

comment on constraint ncp_system_revision_fkey
on linguistic.noun_class_pairings is
  'Pins the pairing to one exact system Revision, Variety, and language.';

comment on constraint ncp_class_a_revision_fkey
on linguistic.noun_class_pairings is
  'Proves that endpoint A is an exact class Revision in the owner system snapshot context.';

comment on constraint ncp_class_b_revision_fkey
on linguistic.noun_class_pairings is
  'Proves that endpoint B is an exact class Revision in the owner system snapshot context.';

comment on table linguistic.lexeme_revision_noun_classes is
  'Snapshot assertions connecting an exact LexemeRevision Variety assertion to exact noun class system and class Revisions. Documentary provenance, Review, and evidence lifecycle remain independent from assertion truth.';

comment on column linguistic.lexeme_revision_noun_classes.id is
  'Snapshot-scoped assignment UUID and precise documentary provenance and Review target.';

comment on column linguistic.lexeme_revision_noun_classes.revision_id is
  'Exact LexemeRevision owning this snapshot assertion.';

comment on column linguistic.lexeme_revision_noun_classes.lexeme_id is
  'Stable Lexeme identity proved by the exact Variety assertion pin.';

comment on column linguistic.lexeme_revision_noun_classes.lexeme_revision_variety_id is
  'Exact LexemeRevision Variety assertion that establishes the lexical snapshot and Variety.';

comment on column linguistic.lexeme_revision_noun_classes.language_id is
  'Integrity copy shared by the Lexeme, Variety, system, and class pins.';

comment on column linguistic.lexeme_revision_noun_classes.variety_id is
  'Integrity copy shared by the exact lexical Variety assertion, system, and class pins.';

comment on column linguistic.lexeme_revision_noun_classes.noun_class_system_id is
  'Stable noun class system identity belonging to the same Variety and language.';

comment on column linguistic.lexeme_revision_noun_classes.noun_class_system_revision_id is
  'Exact noun class system Revision selected by this lexical assertion.';

comment on column linguistic.lexeme_revision_noun_classes.noun_class_id is
  'Stable noun class identity selected within the exact system context.';

comment on column linguistic.lexeme_revision_noun_classes.noun_class_revision_id is
  'Exact noun class Revision selected by this lexical assertion.';

comment on constraint lexeme_revision_varieties_id_context_key
on linguistic.lexeme_revision_varieties is
  'Supports an exact composite assignment pin to one LexemeRevision Variety row and its full lexical context.';

comment on constraint lrnc_exact_assignment_key
on linguistic.lexeme_revision_noun_classes is
  'Forbids only repetition of the same exact lexical Variety, system Revision, and class Revision pins.';

comment on constraint lrnc_lexeme_variety_context_fkey
on linguistic.lexeme_revision_noun_classes is
  'Proves the exact LexemeRevision, stable Lexeme, Variety, and language through one existing Variety assertion row.';

comment on constraint lrnc_system_revision_context_fkey
on linguistic.lexeme_revision_noun_classes is
  'Proves that the selected exact system Revision belongs to the lexical Variety and language.';

comment on constraint lrnc_class_revision_context_fkey
on linguistic.lexeme_revision_noun_classes is
  'Proves that the selected exact class Revision belongs to the selected system Revision, Variety, and language.';

comment on column linguistic.documentary_provenance_links.target_noun_class_pairing_id is
  'Exact noun class pairing target; documentary support does not establish truth or alter the assertion lifecycle.';

comment on column linguistic.documentary_provenance_links.target_lexeme_revision_noun_class_id is
  'Exact lexical noun class assignment target; documentary support does not establish truth or alter the assertion lifecycle.';

comment on constraint dpl_one_target_check
on linguistic.documentary_provenance_links is
  'Exactly one of the 24 declaratively typed documentary provenance target families must be selected.';

comment on column linguistic.review_subjects.target_noun_class_pairing_id is
  'Unique ReviewSubject target for one exact noun class pairing; Review does not establish truth.';

comment on column linguistic.review_subjects.target_lexeme_revision_noun_class_id is
  'Unique ReviewSubject target for one exact lexical noun class assignment; Review does not establish truth.';

comment on constraint review_subjects_one_target_check
on linguistic.review_subjects is
  'Each ReviewSubject selects exactly one of the 26 declaratively typed target families.';

comment on function linguistic.assert_entity_subtype_exists() is
  'At commit, requires each Concept, Lexeme, Sense, Form, FormAnalysis, GrammarRule, NounClassSystem, or NounClass entity to have its generated stable subtype row.';

comment on function linguistic.assert_revision_subtype_exists() is
  'At commit, requires each Concept, Lexeme, Sense, Form, FormAnalysis, GrammarRule, NounClassSystem, or NounClass core revision to have its typed revision subtype.';
