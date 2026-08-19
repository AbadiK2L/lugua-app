create table linguistic.form_attestations (
  id uuid default gen_random_uuid(),
  source_id uuid not null,
  source_location_id uuid not null,
  form_id uuid not null,
  form_revision_id uuid not null,
  attestation_note text,
  created_at timestamptz not null default now(),
  constraint form_attestations_pkey primary key (id),
  constraint form_attestations_note_check check (
    attestation_note is null
    or (
      char_length(attestation_note) between 1 and 1000
      and attestation_note !~ '^[[:space:]]'
      and attestation_note !~ '[[:space:]]$'
    )
  ),
  constraint form_attestations_source_fkey foreign key (source_id)
    references linguistic.sources (id)
    on update restrict
    on delete restrict,
  constraint form_attestations_location_source_fkey foreign key (
    source_location_id,
    source_id
  ) references linguistic.source_locations (id, source_id)
    match simple
    on update restrict
    on delete restrict,
  constraint form_attestations_form_revision_fkey foreign key (
    form_id,
    form_revision_id
  ) references linguistic.form_revisions (entity_id, revision_id)
    on update restrict
    on delete restrict
);

create index form_attestations_revision_idx
  on linguistic.form_attestations (form_revision_id);

create index form_attestations_source_idx
  on linguistic.form_attestations (source_id);

create index form_attestations_location_source_idx
  on linguistic.form_attestations (
    source_location_id,
    source_id
  );

create function linguistic.guard_form_attestation_update()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception using
    errcode = '55000',
    message = 'form attestations are immutable; delete and recreate the attestation instead';
end;
$$;

create trigger guard_form_attestations_update
before update on linguistic.form_attestations
for each row
execute function linguistic.guard_form_attestation_update();

alter table linguistic.form_attestations
  enable row level security;

revoke all on table linguistic.form_attestations
from public, anon, authenticated, service_role;

revoke execute on function linguistic.guard_form_attestation_update()
from public, anon, authenticated, service_role;

comment on table linguistic.form_attestations is
  'Each FormAttestation represents one occurrence-token of an exact historical FormRevision observed at a precise SourceLocation. It is not DocumentaryProvenance, Validation, or FormAnalysis and grants no permission to reuse Source content.';

comment on column linguistic.form_attestations.id is
  'Technical identity of this exact documentary occurrence and a possible future validation, review, retraction, or discussion target.';

comment on column linguistic.form_attestations.source_id is
  'Documentary Source containing the observed occurrence.';

comment on column linguistic.form_attestations.source_location_id is
  'Mandatory precise SourceLocation of the observed occurrence.';

comment on column linguistic.form_attestations.form_id is
  'Stable Form identity half of the exact historical FormRevision pin.';

comment on column linguistic.form_attestations.form_revision_id is
  'Exact historical FormRevision whose surface is observed; it never follows the Form current revision automatically.';

comment on column linguistic.form_attestations.attestation_note is
  'Optional editorial note about the occurrence; it is not confidence, validation, review, context, or copied Source content.';

comment on column linguistic.form_attestations.created_at is
  'Catalog insertion timestamp, not the Source publication or real-world utterance date.';

comment on constraint form_attestations_form_revision_fkey
on linguistic.form_attestations is
  'Ensures that the exact historical FormRevision belongs to the declared stable Form.';

comment on function linguistic.guard_form_attestation_update() is
  'Rejects updates while leaving inserts and internal corrective deletes structurally possible.';
