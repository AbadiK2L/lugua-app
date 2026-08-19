create table linguistic.documentary_provenance_links (
  id uuid default gen_random_uuid(),
  source_id uuid not null,
  source_location_id uuid,
  provenance_note text,
  created_at timestamptz not null default now(),
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
  constraint dpl_pkey primary key (id),
  constraint dpl_one_target_check check (
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
      target_form_analysis_revision_operation_segment_realization_id
    ) = 1
  ),
  constraint dpl_note_check check (
    provenance_note is null
    or (
      char_length(provenance_note) between 1 and 1000
      and provenance_note !~ '^[[:space:]]'
      and provenance_note !~ '[[:space:]]$'
    )
  ),
  constraint dpl_source_fkey foreign key (source_id)
    references linguistic.sources (id)
    on update restrict
    on delete restrict,
  constraint dpl_source_location_fkey foreign key (
    source_location_id,
    source_id
  ) references linguistic.source_locations (id, source_id)
    match simple
    on update restrict
    on delete restrict,
  constraint dpl_target_revision_fkey foreign key (target_revision_id)
    references linguistic.revisions (id)
    on update restrict
    on delete restrict,
  constraint dpl_target_concept_label_fkey foreign key (
    target_concept_revision_label_id
  ) references linguistic.concept_revision_labels (id)
    on update restrict
    on delete restrict,
  constraint dpl_target_lexeme_variety_fkey foreign key (
    target_lexeme_revision_variety_id
  ) references linguistic.lexeme_revision_varieties (id)
    on update restrict
    on delete restrict,
  constraint dpl_target_sense_gloss_fkey foreign key (
    target_sense_revision_gloss_id
  ) references linguistic.sense_revision_glosses (id)
    on update restrict
    on delete restrict,
  constraint dpl_target_sense_concept_fkey foreign key (
    target_sense_revision_concept_id
  ) references linguistic.sense_revision_concepts (id)
    on update restrict
    on delete restrict,
  constraint dpl_target_sense_variety_fkey foreign key (
    target_sense_revision_variety_id
  ) references linguistic.sense_revision_varieties (id)
    on update restrict
    on delete restrict,
  constraint dpl_target_form_variety_fkey foreign key (
    target_form_revision_variety_id
  ) references linguistic.form_revision_varieties (id)
    on update restrict
    on delete restrict,
  constraint dpl_target_form_orthography_fkey foreign key (
    target_form_revision_orthography_id
  ) references linguistic.form_revision_orthographies (id)
    on update restrict
    on delete restrict,
  constraint dpl_target_analysis_lexeme_fkey foreign key (
    target_form_analysis_revision_lexeme_id
  ) references linguistic.form_analysis_revision_lexemes (id)
    on update restrict
    on delete restrict,
  constraint dpl_target_analysis_sense_fkey foreign key (
    target_form_analysis_revision_sense_id
  ) references linguistic.form_analysis_revision_senses (id)
    on update restrict
    on delete restrict,
  constraint dpl_target_analysis_variety_fkey foreign key (
    target_form_analysis_revision_variety_id
  ) references linguistic.form_analysis_revision_varieties (id)
    on update restrict
    on delete restrict,
  constraint dpl_target_feature_definition_fkey foreign key (
    target_grammatical_feature_definition_id
  ) references linguistic.grammatical_feature_definitions (id)
    on update restrict
    on delete restrict,
  constraint dpl_target_feature_value_fkey foreign key (
    target_grammatical_feature_value_id
  ) references linguistic.grammatical_feature_values (id)
    on update restrict
    on delete restrict,
  constraint dpl_target_analysis_feature_fkey foreign key (
    target_form_analysis_revision_feature_id
  ) references linguistic.form_analysis_revision_features (id)
    on update restrict
    on delete restrict,
  constraint dpl_target_analysis_segment_fkey foreign key (
    target_form_analysis_revision_segment_id
  ) references linguistic.form_analysis_revision_segments (id)
    on update restrict
    on delete restrict,
  constraint dpl_target_analysis_span_fkey foreign key (
    target_form_analysis_revision_segment_span_id
  ) references linguistic.form_analysis_revision_segment_spans (id)
    on update restrict
    on delete restrict,
  constraint dpl_target_feature_segment_target_fkey foreign key (
    target_form_analysis_revision_feature_segment_target_id
  ) references linguistic.form_analysis_revision_feature_segment_targets (id)
    on update restrict
    on delete restrict,
  constraint dpl_target_feature_segment_realization_fkey foreign key (
    target_form_analysis_revision_feature_segment_realization_id
  ) references linguistic.form_analysis_revision_feature_segment_realizations (id)
    on update restrict
    on delete restrict,
  constraint dpl_target_rule_variety_fkey foreign key (
    target_grammar_rule_revision_variety_id
  ) references linguistic.grammar_rule_revision_varieties (id)
    on update restrict
    on delete restrict,
  constraint dpl_target_analysis_operation_fkey foreign key (
    target_form_analysis_revision_operation_id
  ) references linguistic.form_analysis_revision_operations (id)
    on update restrict
    on delete restrict,
  constraint dpl_target_operation_segment_target_fkey foreign key (
    target_form_analysis_revision_operation_segment_target_id
  ) references linguistic.form_analysis_revision_operation_segment_targets (id)
    on update restrict
    on delete restrict,
  constraint dpl_target_operation_segment_realization_fkey foreign key (
    target_form_analysis_revision_operation_segment_realization_id
  ) references linguistic.form_analysis_revision_operation_segment_realizations (id)
    on update restrict
    on delete restrict
);

create unique index dpl_revision_source_uq
  on linguistic.documentary_provenance_links (
    target_revision_id,
    source_id,
    source_location_id
  ) nulls not distinct
  where target_revision_id is not null;

create unique index dpl_concept_label_source_uq
  on linguistic.documentary_provenance_links (
    target_concept_revision_label_id,
    source_id,
    source_location_id
  ) nulls not distinct
  where target_concept_revision_label_id is not null;

create unique index dpl_lexeme_var_source_uq
  on linguistic.documentary_provenance_links (
    target_lexeme_revision_variety_id,
    source_id,
    source_location_id
  ) nulls not distinct
  where target_lexeme_revision_variety_id is not null;

create unique index dpl_sense_gloss_source_uq
  on linguistic.documentary_provenance_links (
    target_sense_revision_gloss_id,
    source_id,
    source_location_id
  ) nulls not distinct
  where target_sense_revision_gloss_id is not null;

create unique index dpl_sense_concept_source_uq
  on linguistic.documentary_provenance_links (
    target_sense_revision_concept_id,
    source_id,
    source_location_id
  ) nulls not distinct
  where target_sense_revision_concept_id is not null;

create unique index dpl_sense_var_source_uq
  on linguistic.documentary_provenance_links (
    target_sense_revision_variety_id,
    source_id,
    source_location_id
  ) nulls not distinct
  where target_sense_revision_variety_id is not null;

create unique index dpl_form_var_source_uq
  on linguistic.documentary_provenance_links (
    target_form_revision_variety_id,
    source_id,
    source_location_id
  ) nulls not distinct
  where target_form_revision_variety_id is not null;

create unique index dpl_form_orth_source_uq
  on linguistic.documentary_provenance_links (
    target_form_revision_orthography_id,
    source_id,
    source_location_id
  ) nulls not distinct
  where target_form_revision_orthography_id is not null;

create unique index dpl_analysis_lexeme_source_uq
  on linguistic.documentary_provenance_links (
    target_form_analysis_revision_lexeme_id,
    source_id,
    source_location_id
  ) nulls not distinct
  where target_form_analysis_revision_lexeme_id is not null;

create unique index dpl_analysis_sense_source_uq
  on linguistic.documentary_provenance_links (
    target_form_analysis_revision_sense_id,
    source_id,
    source_location_id
  ) nulls not distinct
  where target_form_analysis_revision_sense_id is not null;

create unique index dpl_analysis_var_source_uq
  on linguistic.documentary_provenance_links (
    target_form_analysis_revision_variety_id,
    source_id,
    source_location_id
  ) nulls not distinct
  where target_form_analysis_revision_variety_id is not null;

create unique index dpl_feature_def_source_uq
  on linguistic.documentary_provenance_links (
    target_grammatical_feature_definition_id,
    source_id,
    source_location_id
  ) nulls not distinct
  where target_grammatical_feature_definition_id is not null;

create unique index dpl_feature_value_source_uq
  on linguistic.documentary_provenance_links (
    target_grammatical_feature_value_id,
    source_id,
    source_location_id
  ) nulls not distinct
  where target_grammatical_feature_value_id is not null;

create unique index dpl_analysis_feature_source_uq
  on linguistic.documentary_provenance_links (
    target_form_analysis_revision_feature_id,
    source_id,
    source_location_id
  ) nulls not distinct
  where target_form_analysis_revision_feature_id is not null;

create unique index dpl_analysis_segment_source_uq
  on linguistic.documentary_provenance_links (
    target_form_analysis_revision_segment_id,
    source_id,
    source_location_id
  ) nulls not distinct
  where target_form_analysis_revision_segment_id is not null;

create unique index dpl_analysis_span_source_uq
  on linguistic.documentary_provenance_links (
    target_form_analysis_revision_segment_span_id,
    source_id,
    source_location_id
  ) nulls not distinct
  where target_form_analysis_revision_segment_span_id is not null;

create unique index dpl_feature_seg_target_source_uq
  on linguistic.documentary_provenance_links (
    target_form_analysis_revision_feature_segment_target_id,
    source_id,
    source_location_id
  ) nulls not distinct
  where target_form_analysis_revision_feature_segment_target_id is not null;

create unique index dpl_feature_seg_real_source_uq
  on linguistic.documentary_provenance_links (
    target_form_analysis_revision_feature_segment_realization_id,
    source_id,
    source_location_id
  ) nulls not distinct
  where target_form_analysis_revision_feature_segment_realization_id is not null;

create unique index dpl_rule_var_source_uq
  on linguistic.documentary_provenance_links (
    target_grammar_rule_revision_variety_id,
    source_id,
    source_location_id
  ) nulls not distinct
  where target_grammar_rule_revision_variety_id is not null;

create unique index dpl_analysis_operation_source_uq
  on linguistic.documentary_provenance_links (
    target_form_analysis_revision_operation_id,
    source_id,
    source_location_id
  ) nulls not distinct
  where target_form_analysis_revision_operation_id is not null;

create unique index dpl_operation_seg_target_source_uq
  on linguistic.documentary_provenance_links (
    target_form_analysis_revision_operation_segment_target_id,
    source_id,
    source_location_id
  ) nulls not distinct
  where target_form_analysis_revision_operation_segment_target_id is not null;

create unique index dpl_operation_seg_real_source_uq
  on linguistic.documentary_provenance_links (
    target_form_analysis_revision_operation_segment_realization_id,
    source_id,
    source_location_id
  ) nulls not distinct
  where target_form_analysis_revision_operation_segment_realization_id is not null;

create index dpl_source_idx
  on linguistic.documentary_provenance_links (source_id);

create index dpl_location_source_idx
  on linguistic.documentary_provenance_links (
    source_location_id,
    source_id
  )
  where source_location_id is not null;

create function linguistic.guard_documentary_provenance_link_update()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception using
    errcode = '55000',
    message = 'documentary provenance links are immutable; delete and recreate the link instead';
end;
$$;

create trigger guard_dpl_update
before update on linguistic.documentary_provenance_links
for each row
execute function linguistic.guard_documentary_provenance_link_update();

alter table linguistic.documentary_provenance_links
  enable row level security;

revoke all on table linguistic.documentary_provenance_links
from public, anon, authenticated, service_role;

revoke execute on function
  linguistic.guard_documentary_provenance_link_update()
from public, anon, authenticated, service_role;

comment on table linguistic.documentary_provenance_links is
  'Typed documentary support or reference links between immutable Sources and exact linguistic Revisions or assertion-level targets. A link does not imply truth, validation, Attestation, import lineage, or permission to reuse Source content.';

comment on column linguistic.documentary_provenance_links.id is
  'Technical identity of this documentary provenance link and a future discussion, validation, retraction, or audit target.';

comment on column linguistic.documentary_provenance_links.source_id is
  'Mandatory documentary Source supporting or referencing the selected target.';

comment on column linguistic.documentary_provenance_links.source_location_id is
  'Optional precise SourceLocation; when present, the composite foreign key requires it to belong to source_id.';

comment on column linguistic.documentary_provenance_links.provenance_note is
  'Optional explanation of documentary relevance; it is not validation, confidence, review, or a scientific verdict.';

comment on column linguistic.documentary_provenance_links.created_at is
  'Catalog link insertion timestamp.';

comment on constraint dpl_one_target_check
on linguistic.documentary_provenance_links is
  'Exactly one typed documentary provenance target must be selected.';

comment on column linguistic.documentary_provenance_links.target_revision_id is
  'Generic snapshot-level provenance target for a linguistic core Revision.';

comment on column linguistic.documentary_provenance_links.target_concept_revision_label_id is
  'Exact ConceptRevision localized label assertion target.';

comment on column linguistic.documentary_provenance_links.target_lexeme_revision_variety_id is
  'Exact LexemeRevision variety assertion target.';

comment on column linguistic.documentary_provenance_links.target_sense_revision_gloss_id is
  'Exact SenseRevision gloss or definition assertion target.';

comment on column linguistic.documentary_provenance_links.target_sense_revision_concept_id is
  'Exact SenseRevision to Concept mapping assertion target.';

comment on column linguistic.documentary_provenance_links.target_sense_revision_variety_id is
  'Exact SenseRevision variety assertion target.';

comment on column linguistic.documentary_provenance_links.target_form_revision_variety_id is
  'Exact FormRevision variety assertion target.';

comment on column linguistic.documentary_provenance_links.target_form_revision_orthography_id is
  'Exact FormRevision orthography assertion target.';

comment on column linguistic.documentary_provenance_links.target_form_analysis_revision_lexeme_id is
  'Exact FormAnalysisRevision Lexeme assertion target.';

comment on column linguistic.documentary_provenance_links.target_form_analysis_revision_sense_id is
  'Exact FormAnalysisRevision Sense assertion target.';

comment on column linguistic.documentary_provenance_links.target_form_analysis_revision_variety_id is
  'Exact FormAnalysisRevision variety assertion target.';

comment on column linguistic.documentary_provenance_links.target_grammatical_feature_definition_id is
  'Exact immutable grammatical feature definition target.';

comment on column linguistic.documentary_provenance_links.target_grammatical_feature_value_id is
  'Exact immutable controlled grammatical feature value target.';

comment on column linguistic.documentary_provenance_links.target_form_analysis_revision_feature_id is
  'Exact FormAnalysisRevision feature assertion target.';

comment on column linguistic.documentary_provenance_links.target_form_analysis_revision_segment_id is
  'Exact FormAnalysisRevision Segment target.';

comment on column linguistic.documentary_provenance_links.target_form_analysis_revision_segment_span_id is
  'Exact FormAnalysisRevision Segment Span target.';

comment on column linguistic.documentary_provenance_links.target_form_analysis_revision_feature_segment_target_id is
  'Exact assertion that a Feature applies to a Segment.';

comment on column linguistic.documentary_provenance_links.target_form_analysis_revision_feature_segment_realization_id is
  'Exact assertion that a Segment realizes or expones a Feature.';

comment on column linguistic.documentary_provenance_links.target_grammar_rule_revision_variety_id is
  'Exact GrammarRuleRevision variety scope assertion target.';

comment on column linguistic.documentary_provenance_links.target_form_analysis_revision_operation_id is
  'Exact FormAnalysisRevision Operation target.';

comment on column linguistic.documentary_provenance_links.target_form_analysis_revision_operation_segment_target_id is
  'Exact assertion that an Operation applies to a Segment.';

comment on column linguistic.documentary_provenance_links.target_form_analysis_revision_operation_segment_realization_id is
  'Exact assertion that a Segment realizes or expones an Operation.';

comment on function linguistic.guard_documentary_provenance_link_update() is
  'Rejects updates while leaving inserts and internal corrective deletes structurally possible.';
