create table linguistic.form_analyses (
  id uuid primary key,
  entity_type_code text generated always as ('form_analysis'::text) stored,
  form_id uuid not null,
  language_id uuid not null,
  constraint form_analyses_id_entity_type_key unique (
    id,
    entity_type_code
  ),
  constraint form_analyses_id_form_language_key unique (
    id,
    form_id,
    language_id
  ),
  constraint form_analyses_entity_fkey foreign key (
    id,
    entity_type_code
  ) references linguistic.entities (id, entity_type_code)
    on update restrict
    on delete restrict,
  constraint form_analyses_form_language_fkey foreign key (
    form_id,
    language_id
  ) references linguistic.forms (id, language_id)
    on update restrict
    on delete restrict
);

create table linguistic.form_analysis_revisions (
  revision_id uuid primary key,
  entity_id uuid not null,
  entity_type_code text generated always as ('form_analysis'::text) stored,
  form_id uuid not null,
  language_id uuid not null,
  form_revision_id uuid not null,
  constraint form_analysis_revisions_entity_revision_key unique (
    entity_id,
    revision_id
  ),
  constraint form_analysis_revisions_typed_revision_key unique (
    entity_id,
    revision_id,
    entity_type_code
  ),
  constraint form_analysis_revisions_revision_language_key unique (
    revision_id,
    language_id
  ),
  constraint form_analysis_revisions_revision_form_revision_key unique (
    revision_id,
    form_revision_id
  ),
  constraint form_analysis_revisions_revision_fkey foreign key (
    entity_id,
    revision_id,
    entity_type_code
  ) references linguistic.revisions (entity_id, id, entity_type_code)
    on update restrict
    on delete restrict,
  constraint form_analysis_revisions_analysis_fkey foreign key (
    entity_id,
    entity_type_code
  ) references linguistic.form_analyses (id, entity_type_code)
    on update restrict
    on delete restrict,
  constraint form_analysis_revisions_stable_form_language_fkey foreign key (
    entity_id,
    form_id,
    language_id
  ) references linguistic.form_analyses (id, form_id, language_id)
    on update restrict
    on delete restrict,
  constraint form_analysis_revisions_form_revision_fkey foreign key (
    form_id,
    form_revision_id
  ) references linguistic.form_revisions (entity_id, revision_id)
    on update restrict
    on delete restrict
);

create table linguistic.form_analysis_revision_lexemes (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null,
  language_id uuid not null,
  lexeme_id uuid not null,
  constraint form_analysis_revision_lexemes_revision_key unique (
    revision_id
  ),
  constraint form_analysis_revision_lexemes_revision_lexeme_key unique (
    revision_id,
    lexeme_id
  ),
  constraint form_analysis_revision_lexemes_revision_language_fkey foreign key (
    revision_id,
    language_id
  ) references linguistic.form_analysis_revisions (
    revision_id,
    language_id
  )
    on update restrict
    on delete restrict,
  constraint form_analysis_revision_lexemes_lexeme_language_fkey foreign key (
    lexeme_id,
    language_id
  ) references linguistic.lexemes (id, language_id)
    on update restrict
    on delete restrict
);

create table linguistic.form_analysis_revision_senses (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null,
  lexeme_id uuid not null,
  sense_id uuid not null,
  constraint form_analysis_revision_senses_revision_key unique (
    revision_id
  ),
  constraint form_analysis_revision_senses_lexeme_assertion_fkey foreign key (
    revision_id,
    lexeme_id
  ) references linguistic.form_analysis_revision_lexemes (
    revision_id,
    lexeme_id
  )
    on update restrict
    on delete restrict,
  constraint form_analysis_revision_senses_sense_lexeme_fkey foreign key (
    sense_id,
    lexeme_id
  ) references linguistic.senses (id, lexeme_id)
    on update restrict
    on delete restrict
);

create table linguistic.form_analysis_revision_varieties (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null,
  form_revision_id uuid not null,
  variety_id uuid not null,
  constraint form_analysis_revision_varieties_revision_variety_key unique (
    revision_id,
    variety_id
  ),
  constraint form_analysis_revision_varieties_analysis_revision_fkey foreign key (
    revision_id,
    form_revision_id
  ) references linguistic.form_analysis_revisions (
    revision_id,
    form_revision_id
  )
    on update restrict
    on delete restrict,
  constraint form_analysis_revision_varieties_form_variety_fkey foreign key (
    form_revision_id,
    variety_id
  ) references linguistic.form_revision_varieties (
    revision_id,
    variety_id
  )
    on update restrict
    on delete restrict
);

do $$
begin
  if exists (
    select 1
    from linguistic.entities as entity
    where entity.entity_type_code = 'form_analysis'
      and not exists (
        select 1
        from linguistic.form_analyses as form_analysis_subtype
        where form_analysis_subtype.id = entity.id
      )
  ) then
    raise exception using
      errcode = '55000',
      message = 'pre-existing form analysis entity has no stable subtype',
      hint = 'Resolve the incompatible data explicitly before applying Migration 5.';
  end if;

  if exists (
    select 1
    from linguistic.revisions as revision
    where revision.entity_type_code = 'form_analysis'
      and not exists (
        select 1
        from linguistic.form_analysis_revisions as form_analysis_revision
        where form_analysis_revision.revision_id = revision.id
          and form_analysis_revision.entity_id = revision.entity_id
      )
  ) then
    raise exception using
      errcode = '55000',
      message = 'pre-existing form analysis revision has no typed subtype',
      hint = 'Resolve the incompatible data explicitly before applying Migration 5.';
  end if;
end;
$$;

create index form_analyses_form_id_idx
  on linguistic.form_analyses (form_id);

create index form_analysis_revisions_form_revision_id_idx
  on linguistic.form_analysis_revisions (form_revision_id);

create index form_analysis_revision_lexemes_lexeme_revision_idx
  on linguistic.form_analysis_revision_lexemes (lexeme_id, revision_id);

create index form_analysis_revision_senses_sense_revision_idx
  on linguistic.form_analysis_revision_senses (sense_id, revision_id);

create index form_analysis_revision_varieties_variety_revision_idx
  on linguistic.form_analysis_revision_varieties (variety_id, revision_id);

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
  end if;

  return null;
end;
$$;

create trigger guard_form_analyses_mutation
before update or delete on linguistic.form_analyses
for each row
execute function linguistic.guard_stable_subtype_mutation();

create trigger guard_form_analysis_revisions_mutation
before update or delete on linguistic.form_analysis_revisions
for each row
execute function linguistic.guard_revision_subtype_mutation();

create trigger guard_form_analysis_revision_lexemes_snapshot
before insert or update or delete on linguistic.form_analysis_revision_lexemes
for each row
execute function linguistic.guard_snapshot_child_mutation();

create trigger guard_form_analysis_revision_senses_snapshot
before insert or update or delete on linguistic.form_analysis_revision_senses
for each row
execute function linguistic.guard_snapshot_child_mutation();

create trigger guard_form_analysis_revision_varieties_snapshot
before insert or update or delete on linguistic.form_analysis_revision_varieties
for each row
execute function linguistic.guard_snapshot_child_mutation();

alter table linguistic.form_analyses enable row level security;
alter table linguistic.form_analysis_revisions enable row level security;
alter table linguistic.form_analysis_revision_lexemes enable row level security;
alter table linguistic.form_analysis_revision_senses enable row level security;
alter table linguistic.form_analysis_revision_varieties enable row level security;

revoke all on table
  linguistic.form_analyses,
  linguistic.form_analysis_revisions,
  linguistic.form_analysis_revision_lexemes,
  linguistic.form_analysis_revision_senses,
  linguistic.form_analysis_revision_varieties
from public, anon, authenticated, service_role;

revoke execute on function linguistic.assert_entity_subtype_exists()
  from public, anon, authenticated, service_role;

revoke execute on function linguistic.assert_revision_subtype_exists()
  from public, anon, authenticated, service_role;

comment on table linguistic.form_analyses is
  'Stable interpretation identities bound immutably to one Form and its derived language; multiple competing analyses may target the same Form.';

comment on column linguistic.form_analyses.language_id is
  'Integrity copy of the stable Form language, not an independent linguistic assertion.';

comment on table linguistic.form_analysis_revisions is
  'Immutable analysis snapshots pinned to an exact Form revision; editorial publication does not establish exclusive scientific truth.';

comment on column linguistic.form_analysis_revisions.form_revision_id is
  'Exact Form revision interpreted by this analysis snapshot.';

comment on table linguistic.form_analysis_revision_lexemes is
  'Optional stable Lexeme target snapshot, limited to one principal Lexeme per analysis revision in V1.';

comment on column linguistic.form_analysis_revision_lexemes.id is
  'Snapshot-scoped Lexeme assertion UUID reserved as a precise future provenance target.';

comment on table linguistic.form_analysis_revision_senses is
  'Optional stable Sense target snapshot requiring the matching explicit Lexeme assertion.';

comment on column linguistic.form_analysis_revision_senses.id is
  'Snapshot-scoped Sense assertion UUID reserved as a precise future provenance target.';

comment on table linguistic.form_analysis_revision_varieties is
  'Explicit variety coverage subset of the pinned Form revision snapshot; zero rows means unspecified coverage and never implicit inheritance.';

comment on column linguistic.form_analysis_revision_varieties.id is
  'Snapshot-scoped variety assertion UUID reserved as a precise future provenance target.';

comment on function linguistic.assert_entity_subtype_exists() is
  'At commit, requires each Concept, Lexeme, Sense, Form, or FormAnalysis entity to have its generated stable subtype row.';

comment on function linguistic.assert_revision_subtype_exists() is
  'At commit, requires each Concept, Lexeme, Sense, Form, or FormAnalysis core revision to have its typed revision subtype.';
