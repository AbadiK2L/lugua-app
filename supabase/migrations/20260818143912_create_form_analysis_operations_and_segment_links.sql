create table linguistic.form_analysis_revision_operations (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null,
  language_id uuid not null,
  operation_order integer not null,
  grammar_rule_id uuid not null,
  grammar_rule_revision_id uuid not null,
  analysis_text text,
  constraint form_analysis_revision_operations_revision_id_key unique (
    revision_id,
    id
  ),
  constraint form_analysis_revision_operations_revision_order_key unique (
    revision_id,
    operation_order
  ),
  constraint form_analysis_revision_operations_order_check check (
    operation_order > 0
  ),
  constraint form_analysis_revision_operations_analysis_text_check check (
    analysis_text is null
    or (
      char_length(analysis_text) between 1 and 1000
      and analysis_text !~ '^[[:space:]]'
      and analysis_text !~ '[[:space:]]$'
    )
  ),
  constraint form_analysis_revision_operations_revision_language_fkey foreign key (
    revision_id,
    language_id
  ) references linguistic.form_analysis_revisions (
    revision_id,
    language_id
  )
    on update restrict
    on delete restrict,
  constraint form_analysis_revision_operations_grammar_rule_fkey foreign key (
    grammar_rule_id,
    grammar_rule_revision_id,
    language_id
  ) references linguistic.grammar_rule_revisions (
    entity_id,
    revision_id,
    language_id
  )
    on update restrict
    on delete restrict
);

create table linguistic.form_analysis_revision_operation_segment_targets (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null,
  operation_id uuid not null,
  segment_id uuid not null,
  constraint form_analysis_operation_segment_targets_link_key unique (
    revision_id,
    operation_id,
    segment_id
  ),
  constraint form_analysis_operation_segment_targets_operation_fkey foreign key (
    revision_id,
    operation_id
  ) references linguistic.form_analysis_revision_operations (
    revision_id,
    id
  )
    on update restrict
    on delete restrict,
  constraint form_analysis_operation_segment_targets_segment_fkey foreign key (
    revision_id,
    segment_id
  ) references linguistic.form_analysis_revision_segments (
    revision_id,
    id
  )
    on update restrict
    on delete restrict
);

create table linguistic.form_analysis_revision_operation_segment_realizations (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null,
  operation_id uuid not null,
  segment_id uuid not null,
  constraint form_analysis_operation_segment_realizations_link_key unique (
    revision_id,
    operation_id,
    segment_id
  ),
  constraint form_analysis_operation_segment_realizations_operation_fkey foreign key (
    revision_id,
    operation_id
  ) references linguistic.form_analysis_revision_operations (
    revision_id,
    id
  )
    on update restrict
    on delete restrict,
  constraint form_analysis_operation_segment_realizations_segment_fkey foreign key (
    revision_id,
    segment_id
  ) references linguistic.form_analysis_revision_segments (
    revision_id,
    id
  )
    on update restrict
    on delete restrict
);

create index form_analysis_revision_operations_rule_revision_idx
  on linguistic.form_analysis_revision_operations (
    grammar_rule_id,
    grammar_rule_revision_id,
    revision_id
  );

create index form_analysis_operation_segment_targets_segment_idx
  on linguistic.form_analysis_revision_operation_segment_targets (
    revision_id,
    segment_id,
    operation_id
  );

create index form_analysis_operation_segment_realizations_segment_idx
  on linguistic.form_analysis_revision_operation_segment_realizations (
    revision_id,
    segment_id,
    operation_id
  );

create trigger guard_form_analysis_revision_operations_snapshot
before insert or update or delete
on linguistic.form_analysis_revision_operations
for each row
execute function linguistic.guard_snapshot_child_mutation();

create trigger guard_form_analysis_operation_segment_targets_snapshot
before insert or update or delete
on linguistic.form_analysis_revision_operation_segment_targets
for each row
execute function linguistic.guard_snapshot_child_mutation();

create trigger guard_form_analysis_operation_segment_realizations_snapshot
before insert or update or delete
on linguistic.form_analysis_revision_operation_segment_realizations
for each row
execute function linguistic.guard_snapshot_child_mutation();

alter table linguistic.form_analysis_revision_operations
  enable row level security;

alter table linguistic.form_analysis_revision_operation_segment_targets
  enable row level security;

alter table linguistic.form_analysis_revision_operation_segment_realizations
  enable row level security;

revoke all on table
  linguistic.form_analysis_revision_operations,
  linguistic.form_analysis_revision_operation_segment_targets,
  linguistic.form_analysis_revision_operation_segment_realizations
from public, anon, authenticated, service_role;

comment on table linguistic.form_analysis_revision_operations is
  'Snapshot-local occurrences of exact GrammarRuleRevisions inside FormAnalysisRevisions; zero Target and Realization rows means no Segment relation is asserted, not zero morphology, absence, empty realization, no effect, or invalid data.';

comment on column linguistic.form_analysis_revision_operations.id is
  'Snapshot-scoped Operation UUID reserved as a precise future provenance, validation, and dispute target.';

comment on column linguistic.form_analysis_revision_operations.language_id is
  'Integrity copy shared by the exact FormAnalysisRevision and GrammarRuleRevision pins.';

comment on column linguistic.form_analysis_revision_operations.operation_order is
  'Positive explicit analysis-local ordering; it is not automatically temporal, diachronic, surface-based, causal, or universally derivational.';

comment on column linguistic.form_analysis_revision_operations.grammar_rule_id is
  'Stable GrammarRule half of the exact immutable historical rule pin.';

comment on column linguistic.form_analysis_revision_operations.grammar_rule_revision_id is
  'Exact GrammarRuleRevision pin; the pinned revision is not required to be current or published.';

comment on column linguistic.form_analysis_revision_operations.analysis_text is
  'Optional occurrence-local analytical note; this is not a copy of the GrammarRuleRevision label or description.';

comment on table linguistic.form_analysis_revision_operation_segment_targets is
  'Typed snapshot assertions that an Operation applies analytically to a same-revision Segment.';

comment on column linguistic.form_analysis_revision_operation_segment_targets.id is
  'Snapshot-scoped Operation Target link UUID reserved as a precise future provenance, validation, and dispute target.';

comment on table linguistic.form_analysis_revision_operation_segment_realizations is
  'Typed snapshot assertions that a same-revision Segment realizes or expones an Operation; zero-span Segments are allowed.';

comment on column linguistic.form_analysis_revision_operation_segment_realizations.id is
  'Snapshot-scoped Operation Realization link UUID reserved as a precise future provenance, validation, and dispute target.';
