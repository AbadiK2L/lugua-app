create table linguistic.entities (
  id uuid primary key default gen_random_uuid(),
  entity_type_code text not null,
  current_revision_id uuid not null,
  created_at timestamptz not null default now(),
  constraint entities_id_entity_type_key unique (id, entity_type_code),
  constraint entities_entity_type_code_fkey foreign key (
    entity_type_code
  ) references linguistic.entity_types (code)
    on update restrict
    on delete restrict
);

create table linguistic.revisions (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null,
  entity_type_code text not null,
  revision integer not null,
  supersedes_revision_id uuid,
  editorial_status_code text not null default 'draft',
  editorial_status_changed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  created_by uuid,
  constraint revisions_entity_revision_key unique (entity_id, revision),
  constraint revisions_entity_id_key unique (entity_id, id),
  constraint revisions_entity_id_entity_type_key unique (
    entity_id,
    id,
    entity_type_code
  ),
  constraint revisions_revision_positive_check check (revision >= 1),
  constraint revisions_supersedes_not_self_check check (
    id <> supersedes_revision_id
  ),
  constraint revisions_lineage_shape_check check (
    (
      revision = 1
      and supersedes_revision_id is null
    )
    or (
      revision > 1
      and supersedes_revision_id is not null
    )
  ),
  constraint revisions_entity_type_fkey foreign key (
    entity_id,
    entity_type_code
  ) references linguistic.entities (id, entity_type_code)
    on update restrict
    on delete restrict,
  constraint revisions_supersedes_fkey foreign key (
    entity_id,
    supersedes_revision_id,
    entity_type_code
  ) references linguistic.revisions (entity_id, id, entity_type_code)
    on update restrict
    on delete restrict,
  constraint revisions_editorial_status_code_fkey foreign key (
    editorial_status_code
  ) references linguistic.editorial_statuses (code)
    on update restrict
    on delete restrict,
  constraint revisions_created_by_fkey foreign key (created_by)
    references public.profiles (id)
    on update restrict
    on delete set null
);

alter table linguistic.entities
  add constraint entities_current_revision_fkey foreign key (
    id,
    current_revision_id,
    entity_type_code
  ) references linguistic.revisions (entity_id, id, entity_type_code)
    on update restrict
    on delete restrict
    deferrable initially deferred;

create table linguistic.revision_status_events (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null,
  from_status_code text,
  to_status_code text not null,
  changed_at timestamptz not null default now(),
  changed_by uuid,
  constraint revision_status_events_status_change_check check (
    case
      when from_status_code is null then to_status_code = 'draft'
      when from_status_code = 'draft' then
        to_status_code in ('published', 'deprecated')
      when from_status_code = 'published' then
        to_status_code = 'deprecated'
      else false
    end
  ),
  constraint revision_status_events_revision_id_fkey foreign key (
    revision_id
  ) references linguistic.revisions (id)
    on update restrict
    on delete restrict,
  constraint revision_status_events_from_status_code_fkey foreign key (
    from_status_code
  ) references linguistic.editorial_statuses (code)
    on update restrict
    on delete restrict,
  constraint revision_status_events_to_status_code_fkey foreign key (
    to_status_code
  ) references linguistic.editorial_statuses (code)
    on update restrict
    on delete restrict,
  constraint revision_status_events_changed_by_fkey foreign key (changed_by)
    references public.profiles (id)
    on update restrict
    on delete set null
);

create index entities_entity_type_code_idx
  on linguistic.entities (entity_type_code);

create unique index revisions_supersedes_revision_id_uidx
  on linguistic.revisions (supersedes_revision_id)
  where supersedes_revision_id is not null;

create index revisions_created_by_idx
  on linguistic.revisions (created_by)
  where created_by is not null;

create index revision_status_events_revision_changed_at_idx
  on linguistic.revision_status_events (revision_id, changed_at);

create index revision_status_events_changed_by_idx
  on linguistic.revision_status_events (changed_by)
  where changed_by is not null;

create or replace function linguistic.guard_entity_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    raise exception using
      errcode = '55000',
      message = 'linguistic entities cannot be deleted';
  end if;

  if new.id is distinct from old.id
    or new.entity_type_code is distinct from old.entity_type_code
    or new.created_at is distinct from old.created_at
  then
    raise exception using
      errcode = '55000',
      message = 'only current_revision_id can be updated on a linguistic entity';
  end if;

  return new;
end;
$$;

create or replace function linguistic.enforce_revision_append()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  entity_current_revision_id uuid;
  entity_type_code text;
  predecessor_revision integer;
  predecessor_status_code text;
begin
  if new.revision is null or new.revision < 1 then
    raise exception using
      errcode = '23514',
      message = 'revision number must be at least 1';
  end if;

  if new.editorial_status_code is distinct from 'draft' then
    raise exception using
      errcode = '23514',
      message = 'new linguistic revisions must start in draft status';
  end if;

  if new.revision = 1 then
    select
      entity.current_revision_id,
      entity.entity_type_code
    into
      entity_current_revision_id,
      entity_type_code
    from linguistic.entities as entity
    where entity.id = new.entity_id;

    if not found then
      raise exception using
        errcode = '23503',
        message = 'revision references an unknown linguistic entity';
    end if;

    if entity_type_code is distinct from new.entity_type_code then
      raise exception using
        errcode = '23514',
        message = 'revision entity type does not match its entity';
    end if;

    if new.supersedes_revision_id is not null then
      raise exception using
        errcode = '23514',
        message = 'the first revision cannot supersede another revision';
    end if;

    if entity_current_revision_id is distinct from new.id then
      raise exception using
        errcode = '23514',
        message = 'a new entity must initially point to its first revision';
    end if;

    return new;
  end if;

  select
    entity.current_revision_id,
    entity.entity_type_code
  into
    entity_current_revision_id,
    entity_type_code
  from linguistic.entities as entity
  where entity.id = new.entity_id
  for update;

  if not found then
    raise exception using
      errcode = '23503',
      message = 'revision references an unknown linguistic entity';
  end if;

  if entity_type_code is distinct from new.entity_type_code then
    raise exception using
      errcode = '23514',
      message = 'revision entity type does not match its entity';
  end if;

  if new.supersedes_revision_id is distinct from entity_current_revision_id then
    raise exception using
      errcode = '23514',
      message = 'a revision must supersede the entity current revision';
  end if;

  select
    predecessor.revision,
    predecessor.editorial_status_code
  into
    predecessor_revision,
    predecessor_status_code
  from linguistic.revisions as predecessor
  where predecessor.entity_id = new.entity_id
    and predecessor.id = new.supersedes_revision_id
    and predecessor.entity_type_code = new.entity_type_code;

  if not found then
    raise exception using
      errcode = '23503',
      message = 'superseded revision does not belong to this entity and type';
  end if;

  if predecessor_status_code = 'deprecated' then
    raise exception using
      errcode = '55000',
      message = 'a deprecated current revision is terminal and cannot be superseded';
  end if;

  if predecessor_revision <> new.revision - 1 then
    raise exception using
      errcode = '23514',
      message = 'revision numbers must advance by exactly one';
  end if;

  return new;
end;
$$;

create or replace function linguistic.guard_revision_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    raise exception using
      errcode = '55000',
      message = 'linguistic revisions cannot be deleted';
  end if;

  if new.id is distinct from old.id
    or new.entity_id is distinct from old.entity_id
    or new.entity_type_code is distinct from old.entity_type_code
    or new.revision is distinct from old.revision
    or new.supersedes_revision_id is distinct from old.supersedes_revision_id
    or new.created_at is distinct from old.created_at
  then
    raise exception using
      errcode = '55000',
      message = 'revision identity and lineage fields are immutable';
  end if;

  -- This exception exists only for the nested UPDATE issued by the
  -- created_by foreign key's ON DELETE SET NULL action.
  if new.created_by is distinct from old.created_by
    and not (
      pg_catalog.pg_trigger_depth() > 1
      and old.created_by is not null
      and new.created_by is null
    )
  then
    raise exception using
      errcode = '55000',
      message = 'revision creator is immutable except for referential nullification';
  end if;

  if new.editorial_status_code is not distinct from old.editorial_status_code then
    if new.editorial_status_changed_at
      is distinct from old.editorial_status_changed_at
    then
      raise exception using
        errcode = '55000',
        message = 'editorial_status_changed_at changes only with status';
    end if;

    return new;
  end if;

  perform 1
  from linguistic.entities as entity
  where entity.id = old.entity_id
    and entity.entity_type_code = old.entity_type_code
    and entity.current_revision_id = old.id
  for update;

  if not found then
    raise exception using
      errcode = '55000',
      message = 'only the current revision can change editorial status';
  end if;

  if not (
    (
      old.editorial_status_code = 'draft'
      and new.editorial_status_code in ('published', 'deprecated')
    )
    or (
      old.editorial_status_code = 'published'
      and new.editorial_status_code = 'deprecated'
    )
  ) then
    raise exception using
      errcode = '23514',
      message = 'invalid linguistic revision editorial status transition';
  end if;

  new.editorial_status_changed_at = now();
  return new;
end;
$$;

create or replace function linguistic.write_revision_status_event()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into linguistic.revision_status_events (
      revision_id,
      from_status_code,
      to_status_code,
      changed_at,
      changed_by
    )
    values (
      new.id,
      null,
      new.editorial_status_code,
      new.editorial_status_changed_at,
      new.created_by
    );
  elsif new.editorial_status_code is distinct from old.editorial_status_code then
    insert into linguistic.revision_status_events (
      revision_id,
      from_status_code,
      to_status_code,
      changed_at,
      changed_by
    )
    values (
      new.id,
      old.editorial_status_code,
      new.editorial_status_code,
      new.editorial_status_changed_at,
      null
    );
  end if;

  return null;
end;
$$;

create or replace function linguistic.guard_revision_status_event_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    -- This exception exists only for the nested UPDATE issued by the
    -- changed_by foreign key's ON DELETE SET NULL action.
    if pg_catalog.pg_trigger_depth() > 1
      and old.changed_by is not null
      and new.changed_by is null
      and new.id is not distinct from old.id
      and new.revision_id is not distinct from old.revision_id
      and new.from_status_code is not distinct from old.from_status_code
      and new.to_status_code is not distinct from old.to_status_code
      and new.changed_at is not distinct from old.changed_at
    then
      return new;
    end if;
  end if;

  raise exception using
    errcode = '55000',
    message = 'revision status events are append-only';
end;
$$;

create or replace function linguistic.assert_current_revision_is_tip()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_entity_id uuid;
  current_revision_id uuid;
  current_entity_type_code text;
  current_revision_entity_type_code text;
  current_revision_number integer;
  tip_revision_id uuid;
  tip_revision_number integer;
begin
  if tg_table_name = 'entities' then
    target_entity_id = new.id;
  elsif tg_table_name = 'revisions' then
    target_entity_id = new.entity_id;
  else
    raise exception using
      errcode = '55000',
      message = 'unexpected trigger source for current revision validation';
  end if;

  select
    entity.current_revision_id,
    entity.entity_type_code
  into
    current_revision_id,
    current_entity_type_code
  from linguistic.entities as entity
  where entity.id = target_entity_id;

  if not found then
    raise exception using
      errcode = '23514',
      message = 'cannot validate a missing linguistic entity';
  end if;

  select
    revision.entity_type_code,
    revision.revision
  into
    current_revision_entity_type_code,
    current_revision_number
  from linguistic.revisions as revision
  where revision.entity_id = target_entity_id
    and revision.id = current_revision_id;

  if not found then
    raise exception using
      errcode = '23514',
      message = 'entity current revision does not exist in its revision chain';
  end if;

  if current_revision_entity_type_code is distinct from current_entity_type_code then
    raise exception using
      errcode = '23514',
      message = 'entity current revision has a different entity type';
  end if;

  select
    revision.id,
    revision.revision
  into
    tip_revision_id,
    tip_revision_number
  from linguistic.revisions as revision
  where revision.entity_id = target_entity_id
  order by revision.revision desc
  limit 1;

  if not found then
    raise exception using
      errcode = '23514',
      message = 'linguistic entity has no revisions';
  end if;

  if current_revision_id is distinct from tip_revision_id
    or current_revision_number is distinct from tip_revision_number
  then
    raise exception using
      errcode = '23514',
      message = 'entity current revision must be the tip of its revision chain';
  end if;

  if exists (
    select 1
    from linguistic.revisions as successor
    where successor.entity_id = target_entity_id
      and successor.supersedes_revision_id = current_revision_id
  ) then
    raise exception using
      errcode = '23514',
      message = 'entity current revision cannot have a successor';
  end if;

  return null;
end;
$$;

create trigger guard_entity_mutation
before update or delete on linguistic.entities
for each row
execute function linguistic.guard_entity_mutation();

create trigger enforce_revision_append
before insert on linguistic.revisions
for each row
execute function linguistic.enforce_revision_append();

create trigger guard_revision_mutation
before update or delete on linguistic.revisions
for each row
execute function linguistic.guard_revision_mutation();

create trigger write_revision_status_event
after insert or update of editorial_status_code
on linguistic.revisions
for each row
execute function linguistic.write_revision_status_event();

create trigger guard_revision_status_event_mutation
before update or delete on linguistic.revision_status_events
for each row
execute function linguistic.guard_revision_status_event_mutation();

create constraint trigger entities_current_revision_is_tip
after insert or update of current_revision_id
on linguistic.entities
deferrable initially deferred
for each row
execute function linguistic.assert_current_revision_is_tip();

create constraint trigger revisions_current_revision_is_tip
after insert on linguistic.revisions
deferrable initially deferred
for each row
execute function linguistic.assert_current_revision_is_tip();

alter table linguistic.entities enable row level security;
alter table linguistic.revisions enable row level security;
alter table linguistic.revision_status_events enable row level security;

revoke all on table
  linguistic.entities,
  linguistic.revisions,
  linguistic.revision_status_events
from public, anon, authenticated, service_role;

revoke all on function linguistic.guard_entity_mutation()
  from public, anon, authenticated, service_role;

revoke all on function linguistic.enforce_revision_append()
  from public, anon, authenticated, service_role;

revoke all on function linguistic.guard_revision_mutation()
  from public, anon, authenticated, service_role;

revoke all on function linguistic.write_revision_status_event()
  from public, anon, authenticated, service_role;

revoke all on function linguistic.guard_revision_status_event_mutation()
  from public, anon, authenticated, service_role;

revoke all on function linguistic.assert_current_revision_is_tip()
  from public, anon, authenticated, service_role;

comment on table linguistic.entities is
  'Stable identities for versioned linguistic catalog records.';

comment on column linguistic.entities.current_revision_id is
  'Latest working revision, whether draft, published, or deprecated. Future public readers may use the latest preceding published revision while current is draft. A deprecated current revision retires the entity and forbids that fallback.';

comment on table linguistic.revisions is
  'Append-only linguistic entity revisions with controlled editorial status transitions.';

comment on column linguistic.revisions.supersedes_revision_id is
  'Immediate predecessor in the entity linear revision chain; null only for revision 1.';

comment on table linguistic.revision_status_events is
  'Append-only audit trail of every linguistic revision editorial status change; actor references may only be cleared by referential nullification.';

comment on function linguistic.guard_entity_mutation() is
  'Rejects entity deletion and permits updates only to the current revision pointer.';

comment on function linguistic.enforce_revision_append() is
  'Serializes revision appends and enforces a draft-only linear revision chain.';

comment on function linguistic.guard_revision_mutation() is
  'Keeps revision identity immutable, permits referential creator nullification, and validates current-revision status transitions.';

comment on function linguistic.write_revision_status_event() is
  'Records the initial draft state and every subsequent editorial status transition.';

comment on function linguistic.guard_revision_status_event_mutation() is
  'Rejects direct updates and deletes while permitting referential actor nullification.';

comment on function linguistic.assert_current_revision_is_tip() is
  'Defers validation that each entity current revision is the final revision-chain tip.';
