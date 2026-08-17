create table linguistic.concepts (
  id uuid primary key,
  entity_type_code text generated always as ('concept'::text) stored,
  constraint concepts_id_entity_type_key unique (id, entity_type_code),
  constraint concepts_entity_fkey foreign key (
    id,
    entity_type_code
  ) references linguistic.entities (id, entity_type_code)
    on update restrict
    on delete restrict
);

create table linguistic.concept_revisions (
  revision_id uuid primary key,
  entity_id uuid not null,
  entity_type_code text generated always as ('concept'::text) stored,
  constraint concept_revisions_entity_revision_key unique (
    entity_id,
    revision_id
  ),
  constraint concept_revisions_typed_revision_key unique (
    entity_id,
    revision_id,
    entity_type_code
  ),
  constraint concept_revisions_revision_fkey foreign key (
    entity_id,
    revision_id,
    entity_type_code
  ) references linguistic.revisions (entity_id, id, entity_type_code)
    on update restrict
    on delete restrict,
  constraint concept_revisions_concept_fkey foreign key (
    entity_id,
    entity_type_code
  ) references linguistic.concepts (id, entity_type_code)
    on update restrict
    on delete restrict
);

create table linguistic.concept_revision_labels (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null,
  locale_code text not null,
  label text not null,
  is_preferred boolean not null default false,
  constraint concept_revision_labels_locale_check check (
    char_length(btrim(locale_code)) between 1 and 63
    and locale_code = btrim(locale_code)
  ),
  constraint concept_revision_labels_label_check check (
    char_length(label) between 1 and 240
    and label = btrim(label)
  ),
  constraint concept_revision_labels_revision_fkey foreign key (
    revision_id
  ) references linguistic.concept_revisions (revision_id)
    on update restrict
    on delete restrict
);

create table linguistic.lexemes (
  id uuid primary key,
  entity_type_code text generated always as ('lexeme'::text) stored,
  language_id uuid not null,
  constraint lexemes_id_entity_type_key unique (id, entity_type_code),
  constraint lexemes_id_language_key unique (id, language_id),
  constraint lexemes_entity_fkey foreign key (
    id,
    entity_type_code
  ) references linguistic.entities (id, entity_type_code)
    on update restrict
    on delete restrict,
  constraint lexemes_language_id_fkey foreign key (language_id)
    references linguistic.languages (id)
    on update restrict
    on delete restrict
);

create table linguistic.lexeme_revisions (
  revision_id uuid primary key,
  entity_id uuid not null,
  entity_type_code text generated always as ('lexeme'::text) stored,
  constraint lexeme_revisions_entity_revision_key unique (
    entity_id,
    revision_id
  ),
  constraint lexeme_revisions_typed_revision_key unique (
    entity_id,
    revision_id,
    entity_type_code
  ),
  constraint lexeme_revisions_revision_fkey foreign key (
    entity_id,
    revision_id,
    entity_type_code
  ) references linguistic.revisions (entity_id, id, entity_type_code)
    on update restrict
    on delete restrict,
  constraint lexeme_revisions_lexeme_fkey foreign key (
    entity_id,
    entity_type_code
  ) references linguistic.lexemes (id, entity_type_code)
    on update restrict
    on delete restrict
);

create table linguistic.lexeme_revision_varieties (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null,
  lexeme_id uuid not null,
  language_id uuid not null,
  variety_id uuid not null,
  constraint lexeme_revision_varieties_revision_variety_key unique (
    revision_id,
    variety_id
  ),
  constraint lexeme_revision_varieties_revision_fkey foreign key (
    lexeme_id,
    revision_id
  ) references linguistic.lexeme_revisions (entity_id, revision_id)
    on update restrict
    on delete restrict,
  constraint lexeme_revision_varieties_lexeme_language_fkey foreign key (
    lexeme_id,
    language_id
  ) references linguistic.lexemes (id, language_id)
    on update restrict
    on delete restrict,
  constraint lexeme_revision_varieties_variety_language_fkey foreign key (
    variety_id,
    language_id
  ) references linguistic.varieties (id, language_id)
    on update restrict
    on delete restrict
);

create table linguistic.senses (
  id uuid primary key,
  entity_type_code text generated always as ('sense'::text) stored,
  lexeme_id uuid not null,
  constraint senses_id_entity_type_key unique (id, entity_type_code),
  constraint senses_id_lexeme_key unique (id, lexeme_id),
  constraint senses_entity_fkey foreign key (
    id,
    entity_type_code
  ) references linguistic.entities (id, entity_type_code)
    on update restrict
    on delete restrict,
  constraint senses_lexeme_id_fkey foreign key (lexeme_id)
    references linguistic.lexemes (id)
    on update restrict
    on delete restrict
);

create table linguistic.sense_revisions (
  revision_id uuid primary key,
  entity_id uuid not null,
  entity_type_code text generated always as ('sense'::text) stored,
  lexeme_id uuid not null,
  lexeme_revision_id uuid not null,
  constraint sense_revisions_entity_revision_key unique (
    entity_id,
    revision_id
  ),
  constraint sense_revisions_typed_revision_key unique (
    entity_id,
    revision_id,
    entity_type_code
  ),
  constraint sense_revisions_revision_lexeme_revision_key unique (
    revision_id,
    lexeme_revision_id
  ),
  constraint sense_revisions_revision_fkey foreign key (
    entity_id,
    revision_id,
    entity_type_code
  ) references linguistic.revisions (entity_id, id, entity_type_code)
    on update restrict
    on delete restrict,
  constraint sense_revisions_sense_lexeme_fkey foreign key (
    entity_id,
    lexeme_id
  ) references linguistic.senses (id, lexeme_id)
    on update restrict
    on delete restrict,
  constraint sense_revisions_lexeme_revision_fkey foreign key (
    lexeme_id,
    lexeme_revision_id
  ) references linguistic.lexeme_revisions (entity_id, revision_id)
    on update restrict
    on delete restrict
);

create table linguistic.sense_revision_glosses (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null,
  locale_code text not null,
  gloss_type_code text not null,
  gloss text not null,
  is_preferred boolean not null default false,
  constraint sense_revision_glosses_type_check check (
    gloss_type_code in ('gloss', 'definition')
  ),
  constraint sense_revision_glosses_locale_check check (
    char_length(btrim(locale_code)) between 1 and 63
    and locale_code = btrim(locale_code)
  ),
  constraint sense_revision_glosses_gloss_check check (
    char_length(gloss) between 1 and 4000
    and gloss = btrim(gloss)
  ),
  constraint sense_revision_glosses_revision_fkey foreign key (
    revision_id
  ) references linguistic.sense_revisions (revision_id)
    on update restrict
    on delete restrict
);

create table linguistic.sense_revision_concepts (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null,
  concept_id uuid not null,
  role_code text not null,
  constraint sense_revision_concepts_revision_concept_key unique (
    revision_id,
    concept_id
  ),
  constraint sense_revision_concepts_role_check check (
    role_code in ('primary', 'related')
  ),
  constraint sense_revision_concepts_revision_fkey foreign key (
    revision_id
  ) references linguistic.sense_revisions (revision_id)
    on update restrict
    on delete restrict,
  constraint sense_revision_concepts_concept_fkey foreign key (concept_id)
    references linguistic.concepts (id)
    on update restrict
    on delete restrict
);

create table linguistic.sense_revision_varieties (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null,
  lexeme_revision_id uuid not null,
  variety_id uuid not null,
  constraint sense_revision_varieties_revision_variety_key unique (
    revision_id,
    variety_id
  ),
  constraint sense_revision_varieties_sense_basis_fkey foreign key (
    revision_id,
    lexeme_revision_id
  ) references linguistic.sense_revisions (
    revision_id,
    lexeme_revision_id
  )
    on update restrict
    on delete restrict,
  constraint sense_revision_varieties_lexeme_variety_fkey foreign key (
    lexeme_revision_id,
    variety_id
  ) references linguistic.lexeme_revision_varieties (
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
    where entity.entity_type_code in ('concept', 'lexeme', 'sense')
      and (
        (
          entity.entity_type_code = 'concept'
          and not exists (
            select 1
            from linguistic.concepts as concept
            where concept.id = entity.id
          )
        )
        or (
          entity.entity_type_code = 'lexeme'
          and not exists (
            select 1
            from linguistic.lexemes as lexeme
            where lexeme.id = entity.id
          )
        )
        or (
          entity.entity_type_code = 'sense'
          and not exists (
            select 1
            from linguistic.senses as sense
            where sense.id = entity.id
          )
        )
      )
  ) then
    raise exception using
      errcode = '55000',
      message = 'pre-existing typed linguistic entity has no stable subtype',
      hint = 'Resolve the incompatible data explicitly before applying Migration 3.';
  end if;

  if exists (
    select 1
    from linguistic.revisions as revision
    where revision.entity_type_code in ('concept', 'lexeme', 'sense')
      and (
        (
          revision.entity_type_code = 'concept'
          and not exists (
            select 1
            from linguistic.concept_revisions as concept_revision
            where concept_revision.revision_id = revision.id
          )
        )
        or (
          revision.entity_type_code = 'lexeme'
          and not exists (
            select 1
            from linguistic.lexeme_revisions as lexeme_revision
            where lexeme_revision.revision_id = revision.id
          )
        )
        or (
          revision.entity_type_code = 'sense'
          and not exists (
            select 1
            from linguistic.sense_revisions as sense_revision
            where sense_revision.revision_id = revision.id
          )
        )
      )
  ) then
    raise exception using
      errcode = '55000',
      message = 'pre-existing typed linguistic revision has no revision subtype',
      hint = 'Resolve the incompatible data explicitly before applying Migration 3.';
  end if;
end;
$$;

create index lexemes_language_id_idx
  on linguistic.lexemes (language_id);

create index senses_lexeme_id_idx
  on linguistic.senses (lexeme_id);

create unique index concept_revision_labels_revision_locale_label_uidx
  on linguistic.concept_revision_labels (
    revision_id,
    lower(locale_code),
    label
  );

create unique index concept_revision_labels_preferred_uidx
  on linguistic.concept_revision_labels (
    revision_id,
    lower(locale_code)
  )
  where is_preferred;

create index concept_revision_labels_locale_label_idx
  on linguistic.concept_revision_labels (
    lower(locale_code),
    lower(label)
  );

create index lexeme_revision_varieties_variety_revision_idx
  on linguistic.lexeme_revision_varieties (variety_id, revision_id);

create index sense_revisions_lexeme_revision_id_idx
  on linguistic.sense_revisions (lexeme_revision_id);

create unique index sense_revision_glosses_preferred_uidx
  on linguistic.sense_revision_glosses (
    revision_id,
    lower(locale_code),
    gloss_type_code
  )
  where is_preferred;

create unique index sense_revision_glosses_revision_locale_type_gloss_uidx
  on linguistic.sense_revision_glosses (
    revision_id,
    lower(locale_code),
    gloss_type_code,
    gloss
  );

create index sense_revision_concepts_concept_lookup_idx
  on linguistic.sense_revision_concepts (concept_id, revision_id);

create unique index sense_revision_concepts_primary_uidx
  on linguistic.sense_revision_concepts (revision_id)
  where role_code = 'primary';

create index sense_revision_varieties_variety_revision_idx
  on linguistic.sense_revision_varieties (variety_id, revision_id);

create index sense_revision_varieties_lexeme_variety_idx
  on linguistic.sense_revision_varieties (
    lexeme_revision_id,
    variety_id
  );

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
  end if;

  return null;
end;
$$;

create or replace function linguistic.guard_stable_subtype_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception using
    errcode = '55000',
    message = 'stable linguistic subtype rows are immutable';
end;
$$;

create or replace function linguistic.guard_revision_subtype_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception using
    errcode = '55000',
    message = 'linguistic revision subtype rows are immutable';
end;
$$;

create or replace function linguistic.guard_snapshot_child_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_revision_id uuid;
  target_entity_id uuid;
  current_revision_id uuid;
  editorial_status_code text;
begin
  if tg_op = 'UPDATE' then
    raise exception using
      errcode = '55000',
      message = 'snapshot assertion rows cannot be updated',
      hint = 'Delete and insert the assertion while its revision is the current draft.';
  end if;

  if tg_op = 'DELETE' then
    target_revision_id = old.revision_id;
  else
    target_revision_id = new.revision_id;
  end if;

  select revision.entity_id
  into target_entity_id
  from linguistic.revisions as revision
  where revision.id = target_revision_id;

  if not found then
    raise exception using
      errcode = '23503',
      message = 'snapshot assertion references an unknown core revision';
  end if;

  -- Serialize snapshot writes with publication and revision appends.
  select entity.current_revision_id
  into current_revision_id
  from linguistic.entities as entity
  where entity.id = target_entity_id
  for update;

  if not found then
    raise exception using
      errcode = '23503',
      message = 'snapshot assertion revision has no owning entity';
  end if;

  select revision.editorial_status_code
  into editorial_status_code
  from linguistic.revisions as revision
  where revision.id = target_revision_id
    and revision.entity_id = target_entity_id;

  if not found then
    raise exception using
      errcode = '23503',
      message = 'snapshot assertion core revision disappeared during validation';
  end if;

  if current_revision_id is distinct from target_revision_id
    or editorial_status_code is distinct from 'draft'
  then
    raise exception using
      errcode = '55000',
      message = 'snapshot assertions can change only on the current draft revision';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create trigger guard_concepts_mutation
before update or delete on linguistic.concepts
for each row
execute function linguistic.guard_stable_subtype_mutation();

create trigger guard_lexemes_mutation
before update or delete on linguistic.lexemes
for each row
execute function linguistic.guard_stable_subtype_mutation();

create trigger guard_senses_mutation
before update or delete on linguistic.senses
for each row
execute function linguistic.guard_stable_subtype_mutation();

create trigger guard_concept_revisions_mutation
before update or delete on linguistic.concept_revisions
for each row
execute function linguistic.guard_revision_subtype_mutation();

create trigger guard_lexeme_revisions_mutation
before update or delete on linguistic.lexeme_revisions
for each row
execute function linguistic.guard_revision_subtype_mutation();

create trigger guard_sense_revisions_mutation
before update or delete on linguistic.sense_revisions
for each row
execute function linguistic.guard_revision_subtype_mutation();

create trigger guard_concept_revision_labels_snapshot
before insert or update or delete on linguistic.concept_revision_labels
for each row
execute function linguistic.guard_snapshot_child_mutation();

create trigger guard_lexeme_revision_varieties_snapshot
before insert or update or delete on linguistic.lexeme_revision_varieties
for each row
execute function linguistic.guard_snapshot_child_mutation();

create trigger guard_sense_revision_glosses_snapshot
before insert or update or delete on linguistic.sense_revision_glosses
for each row
execute function linguistic.guard_snapshot_child_mutation();

create trigger guard_sense_revision_concepts_snapshot
before insert or update or delete on linguistic.sense_revision_concepts
for each row
execute function linguistic.guard_snapshot_child_mutation();

create trigger guard_sense_revision_varieties_snapshot
before insert or update or delete on linguistic.sense_revision_varieties
for each row
execute function linguistic.guard_snapshot_child_mutation();

create constraint trigger entities_typed_subtype_complete
after insert or update of entity_type_code
on linguistic.entities
deferrable initially deferred
for each row
execute function linguistic.assert_entity_subtype_exists();

create constraint trigger revisions_typed_subtype_complete
after insert or update of entity_type_code
on linguistic.revisions
deferrable initially deferred
for each row
execute function linguistic.assert_revision_subtype_exists();

alter table linguistic.concepts enable row level security;
alter table linguistic.concept_revisions enable row level security;
alter table linguistic.concept_revision_labels enable row level security;
alter table linguistic.lexemes enable row level security;
alter table linguistic.lexeme_revisions enable row level security;
alter table linguistic.lexeme_revision_varieties enable row level security;
alter table linguistic.senses enable row level security;
alter table linguistic.sense_revisions enable row level security;
alter table linguistic.sense_revision_glosses enable row level security;
alter table linguistic.sense_revision_concepts enable row level security;
alter table linguistic.sense_revision_varieties enable row level security;

revoke all on table
  linguistic.concepts,
  linguistic.concept_revisions,
  linguistic.concept_revision_labels,
  linguistic.lexemes,
  linguistic.lexeme_revisions,
  linguistic.lexeme_revision_varieties,
  linguistic.senses,
  linguistic.sense_revisions,
  linguistic.sense_revision_glosses,
  linguistic.sense_revision_concepts,
  linguistic.sense_revision_varieties
from public, anon, authenticated, service_role;

revoke execute on function linguistic.assert_entity_subtype_exists()
  from public, anon, authenticated, service_role;

revoke execute on function linguistic.assert_revision_subtype_exists()
  from public, anon, authenticated, service_role;

revoke execute on function linguistic.guard_stable_subtype_mutation()
  from public, anon, authenticated, service_role;

revoke execute on function linguistic.guard_revision_subtype_mutation()
  from public, anon, authenticated, service_role;

revoke execute on function linguistic.guard_snapshot_child_mutation()
  from public, anon, authenticated, service_role;

comment on table linguistic.concepts is
  'Stable language-independent concept identities backed by core entities.';

comment on table linguistic.concept_revisions is
  'Typed markers for concept revision snapshots; localized content lives in child assertions.';

comment on table linguistic.concept_revision_labels is
  'Localized metadata labels belonging to one complete concept revision snapshot.';

comment on column linguistic.concept_revision_labels.id is
  'Snapshot-scoped assertion UUID reserved as a precise future provenance target.';

comment on table linguistic.lexemes is
  'Stable language-specific lexical identities. A Lexeme is not a Form and stores no surface or lemma.';

comment on table linguistic.lexeme_revisions is
  'Typed markers for lexeme revision snapshots; lexical surfaces remain the responsibility of future Form entities.';

comment on table linguistic.lexeme_revision_varieties is
  'Complete per-revision snapshot of varieties in which a Lexeme is considered valid.';

comment on column linguistic.lexeme_revision_varieties.id is
  'Snapshot-scoped assertion UUID reserved as a precise future provenance target.';

comment on table linguistic.senses is
  'Stable Sense identities permanently assigned to one Lexeme.';

comment on table linguistic.sense_revisions is
  'Typed Sense snapshots anchored to the exact Lexeme revision that supplies their lexical basis.';

comment on column linguistic.sense_revisions.lexeme_revision_id is
  'Lexical snapshot basis for this Sense revision; it is not the stable Lexeme identity.';

comment on table linguistic.sense_revision_glosses is
  'Localized gloss and definition assertions belonging to one Sense revision snapshot.';

comment on column linguistic.sense_revision_glosses.id is
  'Snapshot-scoped assertion UUID reserved as a precise future provenance target.';

comment on table linguistic.sense_revision_concepts is
  'Versioned mappings from a Sense snapshot to stable Concept identities.';

comment on column linguistic.sense_revision_concepts.id is
  'Snapshot-scoped assertion UUID reserved as a precise future provenance target.';

comment on column linguistic.sense_revision_concepts.concept_id is
  'Stable Concept identity, deliberately not a pinned Concept revision.';

comment on table linguistic.sense_revision_varieties is
  'Sense variety snapshot constrained to the varieties of its anchored Lexeme revision.';

comment on column linguistic.sense_revision_varieties.id is
  'Snapshot-scoped assertion UUID reserved as a precise future provenance target.';

comment on function linguistic.assert_entity_subtype_exists() is
  'At commit, requires each Concept, Lexeme, or Sense entity to have its generated stable subtype row.';

comment on function linguistic.assert_revision_subtype_exists() is
  'At commit, requires each Concept, Lexeme, or Sense core revision to have its typed revision marker.';

comment on function linguistic.guard_stable_subtype_mutation() is
  'Rejects updates and deletes of immutable stable linguistic subtype rows.';

comment on function linguistic.guard_revision_subtype_mutation() is
  'Rejects updates and deletes of immutable typed revision marker rows.';

comment on function linguistic.guard_snapshot_child_mutation() is
  'Serializes snapshot writes and permits only inserts or deletes on the owning entity current draft revision.';
