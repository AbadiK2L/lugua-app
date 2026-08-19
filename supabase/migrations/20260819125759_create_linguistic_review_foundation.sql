create table linguistic.review_decisions (
  code text,
  description text not null,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  constraint review_decisions_pkey primary key (code),
  constraint review_decisions_code_check check (
    char_length(code) between 1 and 40
    and code ~ '^[a-z][a-z0-9_]*$'
  ),
  constraint review_decisions_description_check check (
    char_length(description) between 1 and 500
    and description !~ '^[[:space:]]'
    and description !~ '[[:space:]]$'
  ),
  constraint review_decisions_sort_order_check check (sort_order > 0),
  constraint review_decisions_sort_order_key unique (sort_order)
);

insert into linguistic.review_decisions (
  code,
  description,
  sort_order
)
values
  (
    'supported',
    'The reviewer considers the target sufficiently supported within the scope examined.',
    10
  ),
  (
    'unsupported',
    'The reviewer considers the target unsupported or contradicted within the scope examined.',
    20
  ),
  (
    'inconclusive',
    'The reviewer considers the available material insufficient to reach a conclusion.',
    30
  );

create table linguistic.review_actors (
  id uuid default gen_random_uuid(),
  profile_id uuid,
  created_at timestamptz not null default now(),
  constraint review_actors_pkey primary key (id),
  constraint review_actors_profile_id_key unique (profile_id),
  constraint review_actors_profile_id_fkey foreign key (profile_id)
    references public.profiles (id)
    on update restrict
    on delete set null
);

create table linguistic.review_subjects (
  id uuid default gen_random_uuid(),
  target_revision_id uuid,
  target_concept_revision_label_id uuid,
  target_lexeme_revision_variety_id uuid,
  target_sense_revision_gloss_id uuid,
  target_sense_revision_concept_id uuid,
  target_sense_revision_variety_id uuid,
  target_form_revision_variety_id uuid,
  target_form_revision_orthography_id uuid,
  target_form_analysis_revision_lexeme_id uuid,
  target_form_analysis_revision_sense_id uuid,
  target_form_analysis_revision_variety_id uuid,
  target_grammatical_feature_definition_id uuid,
  target_grammatical_feature_value_id uuid,
  target_form_analysis_revision_feature_id uuid,
  target_form_analysis_revision_segment_id uuid,
  target_form_analysis_revision_segment_span_id uuid,
  target_form_analysis_revision_feature_segment_target_id uuid,
  target_form_analysis_revision_feature_segment_realization_id uuid,
  target_grammar_rule_revision_variety_id uuid,
  target_form_analysis_revision_operation_id uuid,
  target_form_analysis_revision_operation_segment_target_id uuid,
  target_form_analysis_revision_operation_segment_realization_id uuid,
  target_documentary_provenance_link_id uuid,
  target_form_attestation_id uuid,
  created_at timestamptz not null default now(),
  constraint review_subjects_pkey primary key (id),
  constraint review_subjects_one_target_check check (
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
      target_form_attestation_id
    ) = 1
  ),
  constraint rs_revision_fkey foreign key (target_revision_id)
    references linguistic.revisions (id)
    on update restrict
    on delete restrict,
  constraint rs_concept_label_fkey foreign key (
    target_concept_revision_label_id
  ) references linguistic.concept_revision_labels (id)
    on update restrict
    on delete restrict,
  constraint rs_lexeme_variety_fkey foreign key (
    target_lexeme_revision_variety_id
  ) references linguistic.lexeme_revision_varieties (id)
    on update restrict
    on delete restrict,
  constraint rs_sense_gloss_fkey foreign key (
    target_sense_revision_gloss_id
  ) references linguistic.sense_revision_glosses (id)
    on update restrict
    on delete restrict,
  constraint rs_sense_concept_fkey foreign key (
    target_sense_revision_concept_id
  ) references linguistic.sense_revision_concepts (id)
    on update restrict
    on delete restrict,
  constraint rs_sense_variety_fkey foreign key (
    target_sense_revision_variety_id
  ) references linguistic.sense_revision_varieties (id)
    on update restrict
    on delete restrict,
  constraint rs_form_variety_fkey foreign key (
    target_form_revision_variety_id
  ) references linguistic.form_revision_varieties (id)
    on update restrict
    on delete restrict,
  constraint rs_form_orthography_fkey foreign key (
    target_form_revision_orthography_id
  ) references linguistic.form_revision_orthographies (id)
    on update restrict
    on delete restrict,
  constraint rs_analysis_lexeme_fkey foreign key (
    target_form_analysis_revision_lexeme_id
  ) references linguistic.form_analysis_revision_lexemes (id)
    on update restrict
    on delete restrict,
  constraint rs_analysis_sense_fkey foreign key (
    target_form_analysis_revision_sense_id
  ) references linguistic.form_analysis_revision_senses (id)
    on update restrict
    on delete restrict,
  constraint rs_analysis_variety_fkey foreign key (
    target_form_analysis_revision_variety_id
  ) references linguistic.form_analysis_revision_varieties (id)
    on update restrict
    on delete restrict,
  constraint rs_feature_definition_fkey foreign key (
    target_grammatical_feature_definition_id
  ) references linguistic.grammatical_feature_definitions (id)
    on update restrict
    on delete restrict,
  constraint rs_feature_value_fkey foreign key (
    target_grammatical_feature_value_id
  ) references linguistic.grammatical_feature_values (id)
    on update restrict
    on delete restrict,
  constraint rs_analysis_feature_fkey foreign key (
    target_form_analysis_revision_feature_id
  ) references linguistic.form_analysis_revision_features (id)
    on update restrict
    on delete restrict,
  constraint rs_analysis_segment_fkey foreign key (
    target_form_analysis_revision_segment_id
  ) references linguistic.form_analysis_revision_segments (id)
    on update restrict
    on delete restrict,
  constraint rs_analysis_span_fkey foreign key (
    target_form_analysis_revision_segment_span_id
  ) references linguistic.form_analysis_revision_segment_spans (id)
    on update restrict
    on delete restrict,
  constraint rs_feature_segment_target_fkey foreign key (
    target_form_analysis_revision_feature_segment_target_id
  ) references linguistic.form_analysis_revision_feature_segment_targets (id)
    on update restrict
    on delete restrict,
  constraint rs_feature_segment_realization_fkey foreign key (
    target_form_analysis_revision_feature_segment_realization_id
  ) references linguistic.form_analysis_revision_feature_segment_realizations (id)
    on update restrict
    on delete restrict,
  constraint rs_rule_variety_fkey foreign key (
    target_grammar_rule_revision_variety_id
  ) references linguistic.grammar_rule_revision_varieties (id)
    on update restrict
    on delete restrict,
  constraint rs_analysis_operation_fkey foreign key (
    target_form_analysis_revision_operation_id
  ) references linguistic.form_analysis_revision_operations (id)
    on update restrict
    on delete restrict,
  constraint rs_operation_segment_target_fkey foreign key (
    target_form_analysis_revision_operation_segment_target_id
  ) references linguistic.form_analysis_revision_operation_segment_targets (id)
    on update restrict
    on delete restrict,
  constraint rs_operation_segment_realization_fkey foreign key (
    target_form_analysis_revision_operation_segment_realization_id
  ) references linguistic.form_analysis_revision_operation_segment_realizations (id)
    on update restrict
    on delete restrict,
  constraint rs_documentary_provenance_fkey foreign key (
    target_documentary_provenance_link_id
  ) references linguistic.documentary_provenance_links (id)
    on update restrict
    on delete restrict,
  constraint rs_form_attestation_fkey foreign key (
    target_form_attestation_id
  ) references linguistic.form_attestations (id)
    on update restrict
    on delete restrict
);

create unique index rs_revision_uidx
  on linguistic.review_subjects (target_revision_id)
  where target_revision_id is not null;

create unique index rs_concept_label_uidx
  on linguistic.review_subjects (target_concept_revision_label_id)
  where target_concept_revision_label_id is not null;

create unique index rs_lexeme_variety_uidx
  on linguistic.review_subjects (target_lexeme_revision_variety_id)
  where target_lexeme_revision_variety_id is not null;

create unique index rs_sense_gloss_uidx
  on linguistic.review_subjects (target_sense_revision_gloss_id)
  where target_sense_revision_gloss_id is not null;

create unique index rs_sense_concept_uidx
  on linguistic.review_subjects (target_sense_revision_concept_id)
  where target_sense_revision_concept_id is not null;

create unique index rs_sense_variety_uidx
  on linguistic.review_subjects (target_sense_revision_variety_id)
  where target_sense_revision_variety_id is not null;

create unique index rs_form_variety_uidx
  on linguistic.review_subjects (target_form_revision_variety_id)
  where target_form_revision_variety_id is not null;

create unique index rs_form_orthography_uidx
  on linguistic.review_subjects (target_form_revision_orthography_id)
  where target_form_revision_orthography_id is not null;

create unique index rs_analysis_lexeme_uidx
  on linguistic.review_subjects (target_form_analysis_revision_lexeme_id)
  where target_form_analysis_revision_lexeme_id is not null;

create unique index rs_analysis_sense_uidx
  on linguistic.review_subjects (target_form_analysis_revision_sense_id)
  where target_form_analysis_revision_sense_id is not null;

create unique index rs_analysis_variety_uidx
  on linguistic.review_subjects (target_form_analysis_revision_variety_id)
  where target_form_analysis_revision_variety_id is not null;

create unique index rs_feature_definition_uidx
  on linguistic.review_subjects (target_grammatical_feature_definition_id)
  where target_grammatical_feature_definition_id is not null;

create unique index rs_feature_value_uidx
  on linguistic.review_subjects (target_grammatical_feature_value_id)
  where target_grammatical_feature_value_id is not null;

create unique index rs_analysis_feature_uidx
  on linguistic.review_subjects (target_form_analysis_revision_feature_id)
  where target_form_analysis_revision_feature_id is not null;

create unique index rs_analysis_segment_uidx
  on linguistic.review_subjects (target_form_analysis_revision_segment_id)
  where target_form_analysis_revision_segment_id is not null;

create unique index rs_analysis_span_uidx
  on linguistic.review_subjects (
    target_form_analysis_revision_segment_span_id
  )
  where target_form_analysis_revision_segment_span_id is not null;

create unique index rs_feature_segment_target_uidx
  on linguistic.review_subjects (
    target_form_analysis_revision_feature_segment_target_id
  )
  where target_form_analysis_revision_feature_segment_target_id is not null;

create unique index rs_feature_segment_realization_uidx
  on linguistic.review_subjects (
    target_form_analysis_revision_feature_segment_realization_id
  )
  where target_form_analysis_revision_feature_segment_realization_id is not null;

create unique index rs_rule_variety_uidx
  on linguistic.review_subjects (target_grammar_rule_revision_variety_id)
  where target_grammar_rule_revision_variety_id is not null;

create unique index rs_analysis_operation_uidx
  on linguistic.review_subjects (target_form_analysis_revision_operation_id)
  where target_form_analysis_revision_operation_id is not null;

create unique index rs_operation_segment_target_uidx
  on linguistic.review_subjects (
    target_form_analysis_revision_operation_segment_target_id
  )
  where target_form_analysis_revision_operation_segment_target_id is not null;

create unique index rs_operation_segment_realization_uidx
  on linguistic.review_subjects (
    target_form_analysis_revision_operation_segment_realization_id
  )
  where target_form_analysis_revision_operation_segment_realization_id is not null;

create unique index rs_documentary_provenance_uidx
  on linguistic.review_subjects (target_documentary_provenance_link_id)
  where target_documentary_provenance_link_id is not null;

create unique index rs_form_attestation_uidx
  on linguistic.review_subjects (target_form_attestation_id)
  where target_form_attestation_id is not null;

create table linguistic.review_events (
  id uuid default gen_random_uuid(),
  review_subject_id uuid not null,
  reviewer_actor_id uuid not null,
  decision_code text not null,
  review_note text,
  supersedes_review_id uuid,
  created_at timestamptz not null default now(),
  constraint review_events_pkey primary key (id),
  constraint review_events_id_subject_actor_key unique (
    id,
    review_subject_id,
    reviewer_actor_id
  ),
  constraint review_events_note_check check (
    review_note is null
    or (
      char_length(review_note) between 1 and 2000
      and review_note !~ '^[[:space:]]'
      and review_note !~ '[[:space:]]$'
    )
  ),
  constraint review_events_supersedes_not_self_check check (
    supersedes_review_id is null
    or supersedes_review_id <> id
  ),
  constraint review_events_subject_fkey foreign key (review_subject_id)
    references linguistic.review_subjects (id)
    on update restrict
    on delete restrict,
  constraint review_events_actor_fkey foreign key (reviewer_actor_id)
    references linguistic.review_actors (id)
    on update restrict
    on delete restrict,
  constraint review_events_decision_fkey foreign key (decision_code)
    references linguistic.review_decisions (code)
    on update restrict
    on delete restrict,
  constraint review_events_supersedes_fkey foreign key (
    supersedes_review_id,
    review_subject_id,
    reviewer_actor_id
  ) references linguistic.review_events (
    id,
    review_subject_id,
    reviewer_actor_id
  )
    match simple
    on update restrict
    on delete restrict
);

create index review_events_subject_created_idx
  on linguistic.review_events (review_subject_id, created_at, id);

create index review_events_actor_created_idx
  on linguistic.review_events (reviewer_actor_id, created_at, id);

create unique index review_events_supersedes_uidx
  on linguistic.review_events (supersedes_review_id)
  where supersedes_review_id is not null;

create function linguistic.guard_review_actor_lifecycle()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.profile_id is null then
      raise exception using
        errcode = '55000',
        message = 'a review actor must be created with a profile';
    end if;

    return new;
  end if;

  if tg_op = 'DELETE' then
    raise exception using
      errcode = '55000',
      message = 'review actors cannot be deleted';
  end if;

  if old.profile_id is not null
    and new.profile_id is null
    and new.id is not distinct from old.id
    and new.created_at is not distinct from old.created_at
  then
    return new;
  end if;

  raise exception using
    errcode = '55000',
    message = 'review actors are immutable except for profile nullification';
end;
$$;

create function linguistic.guard_immutable_review_metadata()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception using
    errcode = '55000',
    message = 'review decision and subject metadata is immutable';
end;
$$;

create function linguistic.guard_review_event_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception using
    errcode = '55000',
    message = 'review events are append-only';
end;
$$;

create trigger guard_review_decisions_immutable
before update or delete on linguistic.review_decisions
for each row
execute function linguistic.guard_immutable_review_metadata();

create trigger guard_review_actors_lifecycle
before insert or update or delete on linguistic.review_actors
for each row
execute function linguistic.guard_review_actor_lifecycle();

create trigger guard_review_subjects_immutable
before update or delete on linguistic.review_subjects
for each row
execute function linguistic.guard_immutable_review_metadata();

create trigger guard_review_events_append_only
before update or delete on linguistic.review_events
for each row
execute function linguistic.guard_review_event_mutation();

alter table linguistic.review_decisions enable row level security;
alter table linguistic.review_actors enable row level security;
alter table linguistic.review_subjects enable row level security;
alter table linguistic.review_events enable row level security;

revoke all on table
  linguistic.review_decisions,
  linguistic.review_actors,
  linguistic.review_subjects,
  linguistic.review_events
from public, anon, authenticated, service_role;

revoke execute on function linguistic.guard_review_actor_lifecycle()
from public, anon, authenticated, service_role;

revoke execute on function linguistic.guard_immutable_review_metadata()
from public, anon, authenticated, service_role;

revoke execute on function linguistic.guard_review_event_mutation()
from public, anon, authenticated, service_role;

comment on table linguistic.review_decisions is
  'Immutable technical vocabulary for scoped human review decisions. A decision is not absolute truth, editorial status, consensus, or Retraction.';

comment on column linguistic.review_decisions.code is
  'Stable technical decision code; M13 seeds supported, unsupported, and inconclusive.';

comment on column linguistic.review_decisions.description is
  'Exact non-absolute meaning of the scoped human judgment represented by the code.';

comment on table linguistic.review_actors is
  'Stable identities for human linguistic reviewers, explicitly created without deriving reviewer authorization from an application role and without copied PII.';

comment on column linguistic.review_actors.id is
  'Persistent human reviewer identity retained independently of the linked account lifecycle.';

comment on column linguistic.review_actors.profile_id is
  'Optional live link to the reviewer application Profile. NULL is permitted only historically after profile removal and does not make existing Reviews anonymous.';

comment on table linguistic.review_subjects is
  'Immutable unique typed identities for exact scientific or documentary targets that can receive human Reviews.';

comment on constraint review_subjects_one_target_check
on linguistic.review_subjects is
  'Each ReviewSubject selects exactly one of the 24 declaratively typed target families.';

comment on table linguistic.review_events is
  'Append-only scoped human judgments. Reviews may disagree and never mutate truth, editorial status, DocumentaryProvenance, FormAttestation, or Retraction state.';

comment on column linguistic.review_events.review_subject_id is
  'Stable typed target identity examined by the human reviewer.';

comment on column linguistic.review_events.reviewer_actor_id is
  'Required stable human ReviewActor identity that issued this judgment.';

comment on column linguistic.review_events.decision_code is
  'Scoped decision: supported, unsupported, or inconclusive; never an absolute truth value.';

comment on column linguistic.review_events.review_note is
  'Optional analytical note, not copied Source content, confidence, consensus, or an absolute truth claim.';

comment on column linguistic.review_events.supersedes_review_id is
  'Optional correction or evolution of the same Actor position on the same ReviewSubject; the prior Review remains historical.';

comment on function linguistic.guard_review_actor_lifecycle() is
  'Requires a Profile when a human ReviewActor is created, forbids deletion, and permits only later profile nullification.';

comment on function linguistic.guard_immutable_review_metadata() is
  'Rejects updates and deletes of immutable ReviewDecision and ReviewSubject metadata.';

comment on function linguistic.guard_review_event_mutation() is
  'Rejects updates and deletes so ReviewEvents remain strictly append-only.';
