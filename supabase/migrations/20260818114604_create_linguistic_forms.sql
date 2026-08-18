create table linguistic.form_modalities (
  code text primary key,
  description text not null,
  is_active boolean not null default true,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint form_modalities_code_format_check check (
    code = lower(btrim(code))
    and code ~ '^[a-z][a-z0-9_]{0,63}$'
  ),
  constraint form_modalities_description_length_check check (
    char_length(btrim(description)) >= 1
    and char_length(description) <= 500
  ),
  constraint form_modalities_sort_order_check check (sort_order >= 0)
);

insert into linguistic.form_modalities (
  code,
  description,
  sort_order
)
values
  (
    'written',
    'A catalogued textual representation of a written linguistic surface.',
    10
  ),
  (
    'spoken',
    'A catalogued textual transcription of a spoken linguistic surface.',
    20
  );

create trigger set_form_modalities_updated_at
before update on linguistic.form_modalities
for each row
execute function linguistic.set_updated_at();

create table linguistic.forms (
  id uuid primary key,
  entity_type_code text generated always as ('form'::text) stored,
  language_id uuid not null,
  modality_code text not null,
  constraint forms_id_entity_type_key unique (id, entity_type_code),
  constraint forms_id_language_key unique (id, language_id),
  constraint forms_id_modality_key unique (id, modality_code),
  constraint forms_entity_fkey foreign key (
    id,
    entity_type_code
  ) references linguistic.entities (id, entity_type_code)
    on update restrict
    on delete restrict,
  constraint forms_language_id_fkey foreign key (language_id)
    references linguistic.languages (id)
    on update restrict
    on delete restrict,
  constraint forms_modality_code_fkey foreign key (modality_code)
    references linguistic.form_modalities (code)
    on update restrict
    on delete restrict
);

create table linguistic.form_revisions (
  revision_id uuid primary key,
  entity_id uuid not null,
  entity_type_code text generated always as ('form'::text) stored,
  surface_text text not null,
  constraint form_revisions_entity_revision_key unique (
    entity_id,
    revision_id
  ),
  constraint form_revisions_typed_revision_key unique (
    entity_id,
    revision_id,
    entity_type_code
  ),
  constraint form_revisions_surface_text_check check (
    char_length(surface_text) between 1 and 4000
    and surface_text !~ '^[[:space:]]'
    and surface_text !~ '[[:space:]]$'
  ),
  constraint form_revisions_revision_fkey foreign key (
    entity_id,
    revision_id,
    entity_type_code
  ) references linguistic.revisions (entity_id, id, entity_type_code)
    on update restrict
    on delete restrict,
  constraint form_revisions_form_fkey foreign key (
    entity_id,
    entity_type_code
  ) references linguistic.forms (id, entity_type_code)
    on update restrict
    on delete restrict
);

create table linguistic.form_revision_varieties (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null,
  form_id uuid not null,
  language_id uuid not null,
  variety_id uuid not null,
  constraint form_revision_varieties_revision_variety_key unique (
    revision_id,
    variety_id
  ),
  constraint form_revision_varieties_revision_fkey foreign key (
    form_id,
    revision_id
  ) references linguistic.form_revisions (entity_id, revision_id)
    on update restrict
    on delete restrict,
  constraint form_revision_varieties_form_language_fkey foreign key (
    form_id,
    language_id
  ) references linguistic.forms (id, language_id)
    on update restrict
    on delete restrict,
  constraint form_revision_varieties_variety_language_fkey foreign key (
    variety_id,
    language_id
  ) references linguistic.varieties (id, language_id)
    on update restrict
    on delete restrict
);

create table linguistic.form_revision_orthographies (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null,
  form_id uuid not null,
  language_id uuid not null,
  orthography_id uuid not null,
  form_modality_code text generated always as ('written'::text) stored,
  constraint form_revision_orthographies_revision_orthography_key unique (
    revision_id,
    orthography_id
  ),
  constraint form_revision_orthographies_revision_fkey foreign key (
    form_id,
    revision_id
  ) references linguistic.form_revisions (entity_id, revision_id)
    on update restrict
    on delete restrict,
  constraint form_revision_orthographies_form_language_fkey foreign key (
    form_id,
    language_id
  ) references linguistic.forms (id, language_id)
    on update restrict
    on delete restrict,
  constraint form_revision_orthographies_orthography_language_fkey foreign key (
    orthography_id,
    language_id
  ) references linguistic.orthographies (id, language_id)
    on update restrict
    on delete restrict,
  constraint form_revision_orthographies_written_form_fkey foreign key (
    form_id,
    form_modality_code
  ) references linguistic.forms (id, modality_code)
    on update restrict
    on delete restrict
);

do $$
begin
  if exists (
    select 1
    from linguistic.entities as entity
    where entity.entity_type_code = 'form'
      and not exists (
        select 1
        from linguistic.forms as form_subtype
        where form_subtype.id = entity.id
      )
  ) then
    raise exception using
      errcode = '55000',
      message = 'pre-existing form entity has no stable form subtype',
      hint = 'Resolve the incompatible data explicitly before applying Migration 4.';
  end if;

  if exists (
    select 1
    from linguistic.revisions as revision
    where revision.entity_type_code = 'form'
      and not exists (
        select 1
        from linguistic.form_revisions as form_revision
        where form_revision.revision_id = revision.id
          and form_revision.entity_id = revision.entity_id
      )
  ) then
    raise exception using
      errcode = '55000',
      message = 'pre-existing form revision has no typed form revision subtype',
      hint = 'Resolve the incompatible data explicitly before applying Migration 4.';
  end if;
end;
$$;

create index forms_language_modality_idx
  on linguistic.forms (language_id, modality_code);

create index form_revision_varieties_variety_revision_idx
  on linguistic.form_revision_varieties (variety_id, revision_id);

create index form_revision_orthographies_orthography_revision_idx
  on linguistic.form_revision_orthographies (orthography_id, revision_id);

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
  end if;

  return null;
end;
$$;

create trigger guard_forms_mutation
before update or delete on linguistic.forms
for each row
execute function linguistic.guard_stable_subtype_mutation();

create trigger guard_form_revisions_mutation
before update or delete on linguistic.form_revisions
for each row
execute function linguistic.guard_revision_subtype_mutation();

create trigger guard_form_revision_varieties_snapshot
before insert or update or delete on linguistic.form_revision_varieties
for each row
execute function linguistic.guard_snapshot_child_mutation();

create trigger guard_form_revision_orthographies_snapshot
before insert or update or delete on linguistic.form_revision_orthographies
for each row
execute function linguistic.guard_snapshot_child_mutation();

alter table linguistic.form_modalities enable row level security;
alter table linguistic.forms enable row level security;
alter table linguistic.form_revisions enable row level security;
alter table linguistic.form_revision_varieties enable row level security;
alter table linguistic.form_revision_orthographies enable row level security;

revoke all on table
  linguistic.form_modalities,
  linguistic.forms,
  linguistic.form_revisions,
  linguistic.form_revision_varieties,
  linguistic.form_revision_orthographies
from public, anon, authenticated, service_role;

revoke execute on function linguistic.assert_entity_subtype_exists()
  from public, anon, authenticated, service_role;

revoke execute on function linguistic.assert_revision_subtype_exists()
  from public, anon, authenticated, service_role;

comment on table linguistic.form_modalities is
  'Technical V1 registry for written and spoken catalogued textual representations; additional modalities may require schema evolution.';

comment on table linguistic.forms is
  'Stable language-and-modality Form identities. A Form is a linguistic surface, not a Lexeme or an analysis.';

comment on column linguistic.forms.language_id is
  'Stable language identity; correcting it requires a new Form entity.';

comment on column linguistic.forms.modality_code is
  'Stable catalogue modality; V1 seeds written and spoken, and correcting it requires a new Form entity.';

comment on table linguistic.form_revisions is
  'Immutable Form surface snapshots. Whether a surface change is a correction or a distinct Form is an editorial decision.';

comment on column linguistic.form_revisions.surface_text is
  'Exact catalogued textual representation preserved without automatic case, diacritic, or Unicode normalization; for spoken Forms it is one catalogued transcription, not audio or a universal transcription model.';

comment on table linguistic.form_revision_varieties is
  'Complete per-revision snapshot of independently asserted Form varieties; it does not imply variety-by-orthography pairs.';

comment on column linguistic.form_revision_varieties.id is
  'Snapshot-scoped variety assertion UUID reserved as a precise future provenance target.';

comment on table linguistic.form_revision_orthographies is
  'Complete written-only per-revision snapshot of independently asserted Form orthographies; no variety-by-orthography product is implied, and general compatibility remains in linguistic.orthography_varieties.';

comment on column linguistic.form_revision_orthographies.id is
  'Snapshot-scoped orthography assertion UUID reserved as a precise future provenance target.';

comment on column linguistic.form_revision_orthographies.form_modality_code is
  'Generated written discriminator enforcing that spoken Forms cannot receive orthography assertions.';

comment on function linguistic.assert_entity_subtype_exists() is
  'At commit, requires each Concept, Lexeme, Sense, or Form entity to have its generated stable subtype row.';

comment on function linguistic.assert_revision_subtype_exists() is
  'At commit, requires each Concept, Lexeme, Sense, or Form core revision to have its typed revision subtype.';
