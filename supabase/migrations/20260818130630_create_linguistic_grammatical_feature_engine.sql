create table linguistic.grammatical_feature_definitions (
  id uuid primary key default gen_random_uuid(),
  language_id uuid not null,
  code text not null,
  label text not null,
  description text,
  created_at timestamptz not null default now(),
  constraint grammatical_feature_definitions_id_language_key unique (
    id,
    language_id
  ),
  constraint grammatical_feature_definitions_code_format_check check (
    code = lower(btrim(code))
    and code ~ '^[a-z][a-z0-9_]{0,63}$'
  ),
  constraint grammatical_feature_definitions_label_check check (
    char_length(label) between 1 and 240
    and label !~ '^[[:space:]]'
    and label !~ '[[:space:]]$'
  ),
  constraint grammatical_feature_definitions_description_check check (
    description is null
    or (
      char_length(description) between 1 and 2000
      and description !~ '^[[:space:]]'
      and description !~ '[[:space:]]$'
    )
  ),
  constraint grammatical_feature_definitions_language_id_fkey foreign key (
    language_id
  ) references linguistic.languages (id)
    on update restrict
    on delete restrict
);

create table linguistic.grammatical_feature_values (
  id uuid primary key default gen_random_uuid(),
  feature_definition_id uuid not null,
  code text not null,
  label text not null,
  description text,
  created_at timestamptz not null default now(),
  constraint grammatical_feature_values_definition_code_key unique (
    feature_definition_id,
    code
  ),
  constraint grammatical_feature_values_id_definition_key unique (
    id,
    feature_definition_id
  ),
  constraint grammatical_feature_values_code_format_check check (
    code = lower(btrim(code))
    and code ~ '^[a-z][a-z0-9_]{0,63}$'
  ),
  constraint grammatical_feature_values_label_check check (
    char_length(label) between 1 and 240
    and label !~ '^[[:space:]]'
    and label !~ '[[:space:]]$'
  ),
  constraint grammatical_feature_values_description_check check (
    description is null
    or (
      char_length(description) between 1 and 2000
      and description !~ '^[[:space:]]'
      and description !~ '[[:space:]]$'
    )
  ),
  constraint grammatical_feature_values_definition_id_fkey foreign key (
    feature_definition_id
  ) references linguistic.grammatical_feature_definitions (id)
    on update restrict
    on delete restrict
);

create table linguistic.form_analysis_revision_features (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null,
  language_id uuid not null,
  feature_definition_id uuid not null,
  controlled_value_id uuid,
  raw_value_text text,
  constraint form_analysis_revision_features_revision_id_key unique (
    revision_id,
    id
  ),
  constraint form_analysis_revision_features_value_xor_check check (
    (controlled_value_id is not null) <> (raw_value_text is not null)
  ),
  constraint form_analysis_revision_features_raw_value_check check (
    raw_value_text is null
    or (
      char_length(raw_value_text) between 1 and 500
      and raw_value_text !~ '^[[:space:]]'
      and raw_value_text !~ '[[:space:]]$'
    )
  ),
  constraint form_analysis_revision_features_revision_language_fkey foreign key (
    revision_id,
    language_id
  ) references linguistic.form_analysis_revisions (
    revision_id,
    language_id
  )
    on update restrict
    on delete restrict,
  constraint form_analysis_revision_features_definition_language_fkey foreign key (
    feature_definition_id,
    language_id
  ) references linguistic.grammatical_feature_definitions (
    id,
    language_id
  )
    on update restrict
    on delete restrict,
  constraint form_analysis_revision_features_controlled_value_fkey foreign key (
    controlled_value_id,
    feature_definition_id
  ) references linguistic.grammatical_feature_values (
    id,
    feature_definition_id
  )
    on update restrict
    on delete restrict
);

create index grammatical_feature_definitions_language_code_idx
  on linguistic.grammatical_feature_definitions (language_id, code);

create index form_analysis_revision_features_revision_definition_idx
  on linguistic.form_analysis_revision_features (
    revision_id,
    feature_definition_id
  );

create index form_analysis_revision_features_definition_language_idx
  on linguistic.form_analysis_revision_features (
    feature_definition_id,
    language_id
  );

create index form_analysis_revision_features_definition_controlled_value_idx
  on linguistic.form_analysis_revision_features (
    feature_definition_id,
    controlled_value_id
  )
  where controlled_value_id is not null;

create unique index form_analysis_revision_features_controlled_value_uidx
  on linguistic.form_analysis_revision_features (
    revision_id,
    feature_definition_id,
    controlled_value_id
  )
  where controlled_value_id is not null;

create unique index form_analysis_revision_features_raw_value_uidx
  on linguistic.form_analysis_revision_features (
    revision_id,
    feature_definition_id,
    raw_value_text
  )
  where raw_value_text is not null;

create or replace function linguistic.guard_immutable_grammatical_catalog_row()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception using
    errcode = '55000',
    message = 'grammatical feature catalog rows are immutable and append-only';
end;
$$;

create trigger guard_grammatical_feature_definitions_mutation
before update or delete on linguistic.grammatical_feature_definitions
for each row
execute function linguistic.guard_immutable_grammatical_catalog_row();

create trigger guard_grammatical_feature_values_mutation
before update or delete on linguistic.grammatical_feature_values
for each row
execute function linguistic.guard_immutable_grammatical_catalog_row();

create trigger guard_form_analysis_revision_features_snapshot
before insert or update or delete
on linguistic.form_analysis_revision_features
for each row
execute function linguistic.guard_snapshot_child_mutation();

alter table linguistic.grammatical_feature_definitions
  enable row level security;

alter table linguistic.grammatical_feature_values
  enable row level security;

alter table linguistic.form_analysis_revision_features
  enable row level security;

revoke all on table
  linguistic.grammatical_feature_definitions,
  linguistic.grammatical_feature_values,
  linguistic.form_analysis_revision_features
from public, anon, authenticated, service_role;

revoke execute on function
  linguistic.guard_immutable_grammatical_catalog_row()
from public, anon, authenticated, service_role;

comment on table linguistic.grammatical_feature_definitions is
  'Immutable language-scoped analytical grammatical categories; code is a handle and not a universal semantic identity.';

comment on column linguistic.grammatical_feature_definitions.id is
  'Stable UUID for the exact immutable feature definition and a future provenance target.';

comment on column linguistic.grammatical_feature_definitions.code is
  'Lowercase internal handle that is deliberately not unique within a language.';

comment on table linguistic.grammatical_feature_values is
  'Immutable controlled grammatical values, each belonging to exactly one feature definition.';

comment on column linguistic.grammatical_feature_values.id is
  'Stable UUID for the exact immutable controlled value and a future provenance target.';

comment on table linguistic.form_analysis_revision_features is
  'Atomic feature assertions in a complete immutable FormAnalysis revision snapshot; M6 stores no segment, span, or realization information.';

comment on column linguistic.form_analysis_revision_features.id is
  'Snapshot-scoped feature assertion UUID reserved as a precise future provenance and validation target.';

comment on column linguistic.form_analysis_revision_features.controlled_value_id is
  'Optional normalized value constrained to belong to the assertion feature definition.';

comment on column linguistic.form_analysis_revision_features.raw_value_text is
  'Provisional unnormalized analytical value preserved without case, diacritic, or Unicode normalization; it is not verbatim source evidence.';

comment on function linguistic.guard_immutable_grammatical_catalog_row() is
  'Rejects updates and deletes of immutable grammatical feature definitions and values.';
