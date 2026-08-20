create or replace function linguistic.guard_evidence_lifecycle_event_insert()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  locked_target_id uuid;
  previous_sequence bigint;
  previous_action_code text;
begin
  if num_nonnulls(
    new.target_documentary_provenance_link_id,
    new.target_form_attestation_id
  ) <> 1 then
    raise exception using
      errcode = '55000',
      message = 'an evidence lifecycle event must target exactly one evidence record';
  end if;

  if new.action_code is null
    or new.action_code not in ('retracted', 'reinstated') then
    raise exception using
      errcode = '55000',
      message = 'evidence lifecycle action must be retracted or reinstated';
  end if;

  if new.event_sequence is not null then
    raise exception using
      errcode = '55000',
      message = 'evidence lifecycle event sequence is allocated by the database';
  end if;

  if new.target_documentary_provenance_link_id is not null then
    select target.id
      into locked_target_id
      from linguistic.documentary_provenance_links as target
      where target.id = new.target_documentary_provenance_link_id
      for update;

    if not found then
      raise exception using
        errcode = '23503',
        message = 'target documentary provenance link does not exist';
    end if;

    select lifecycle_event.event_sequence,
           lifecycle_event.action_code
      into previous_sequence,
           previous_action_code
      from linguistic.evidence_lifecycle_events as lifecycle_event
      where lifecycle_event.target_documentary_provenance_link_id =
        new.target_documentary_provenance_link_id
      order by lifecycle_event.event_sequence desc
      limit 1;
  else
    select target.id
      into locked_target_id
      from linguistic.form_attestations as target
      where target.id = new.target_form_attestation_id
      for update;

    if not found then
      raise exception using
        errcode = '23503',
        message = 'target form attestation does not exist';
    end if;

    select lifecycle_event.event_sequence,
           lifecycle_event.action_code
      into previous_sequence,
           previous_action_code
      from linguistic.evidence_lifecycle_events as lifecycle_event
      where lifecycle_event.target_form_attestation_id =
        new.target_form_attestation_id
      order by lifecycle_event.event_sequence desc
      limit 1;
  end if;

  if previous_sequence is null then
    if new.action_code <> 'retracted' then
      raise exception using
        errcode = '55000',
        message = 'the first evidence lifecycle event must be retracted';
    end if;

    new.event_sequence := 1;
    return new;
  end if;

  if not (
    previous_action_code = 'retracted'
    and new.action_code = 'reinstated'
  ) and not (
    previous_action_code = 'reinstated'
    and new.action_code = 'retracted'
  ) then
    raise exception using
      errcode = '55000',
      message = 'evidence lifecycle actions must alternate strictly';
  end if;

  new.event_sequence := previous_sequence + 1;
  return new;
end;
$$;

revoke execute on function linguistic.guard_evidence_lifecycle_event_insert()
  from public, anon, authenticated, service_role;

comment on table linguistic.evidence_lifecycle_events is
  'Append-only retraction and reinstatement history for documentary provenance links and form attestations. Active state is derived: evidence with no event is active, a latest retracted event is inactive, and a latest reinstated event is active. Review, retraction, editorial status, and truth remain independent concepts.';

comment on column linguistic.evidence_lifecycle_events.id is
  'Stable identifier for this immutable lifecycle event.';

comment on column linguistic.evidence_lifecycle_events.target_documentary_provenance_link_id is
  'Documentary provenance link affected by this event when the other target is null.';

comment on column linguistic.evidence_lifecycle_events.target_form_attestation_id is
  'Form attestation affected by this event when the other target is null.';

comment on column linguistic.evidence_lifecycle_events.event_sequence is
  'Database-allocated per-target sequence and authoritative lifecycle order; created_at and id do not determine state.';

comment on column linguistic.evidence_lifecycle_events.action_code is
  'Lifecycle action. The first event must be retracted, followed by strict retracted/reinstated alternation.';

comment on column linguistic.evidence_lifecycle_events.review_actor_id is
  'Required stable human actor responsible for the lifecycle action.';

comment on column linguistic.evidence_lifecycle_events.reason is
  'Required concise rationale with 1 to 2000 characters and no outer whitespace.';

comment on column linguistic.evidence_lifecycle_events.created_at is
  'Audit timestamp for the immutable event; it is not the authoritative lifecycle order.';

comment on constraint ele_one_target_check
  on linguistic.evidence_lifecycle_events is
  'Each event targets exactly one documentary provenance link or form attestation.';

comment on function linguistic.guard_evidence_lifecycle_event_insert() is
  'Validates the target and action, locks the target evidence row, enforces first retraction and strict alternation, and allocates the per-target event sequence.';

comment on function linguistic.guard_evidence_lifecycle_event_mutation() is
  'Rejects UPDATE and DELETE so evidence lifecycle history remains append-only.';

comment on function linguistic.guard_documentary_provenance_link_delete() is
  'Blocks physical deletion of M11 documentary provenance links; record a lifecycle retraction instead. The existing UPDATE guard remains independent.';

comment on function linguistic.guard_form_attestation_delete() is
  'Blocks physical deletion of M12 form attestations; record a lifecycle retraction instead. The existing UPDATE guard remains independent.';

comment on function linguistic.guard_documentary_provenance_link_update() is
  'Rejects updates. Physical deletes are blocked separately by M14; lifecycle state changes use append-only events.';

comment on function linguistic.guard_form_attestation_update() is
  'Rejects updates. Physical deletes are blocked separately by M14; lifecycle state changes use append-only events.';
