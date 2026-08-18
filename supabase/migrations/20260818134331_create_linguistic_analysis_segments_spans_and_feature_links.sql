create table linguistic.form_analysis_revision_segments (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null,
  parent_segment_id uuid,
  segment_order integer not null,
  analysis_text text,
  constraint form_analysis_revision_segments_revision_id_key unique (
    revision_id,
    id
  ),
  constraint form_analysis_revision_segments_revision_order_key unique (
    revision_id,
    segment_order
  ),
  constraint form_analysis_revision_segments_order_check check (
    segment_order > 0
  ),
  constraint form_analysis_revision_segments_parent_not_self_check check (
    parent_segment_id is null or parent_segment_id <> id
  ),
  constraint form_analysis_revision_segments_analysis_text_check check (
    analysis_text is null
    or (
      char_length(analysis_text) between 1 and 500
      and analysis_text !~ '^[[:space:]]'
      and analysis_text !~ '[[:space:]]$'
    )
  ),
  constraint form_analysis_revision_segments_revision_id_fkey foreign key (
    revision_id
  ) references linguistic.form_analysis_revisions (revision_id)
    on update restrict
    on delete restrict,
  constraint form_analysis_revision_segments_parent_revision_fkey foreign key (
    revision_id,
    parent_segment_id
  ) references linguistic.form_analysis_revision_segments (
    revision_id,
    id
  )
    on update restrict
    on delete restrict
);

create table linguistic.form_analysis_revision_segment_spans (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null,
  segment_id uuid not null,
  span_order integer not null,
  start_codepoint integer not null,
  end_codepoint integer not null,
  constraint form_analysis_segment_spans_revision_segment_order_key unique (
    revision_id,
    segment_id,
    span_order
  ),
  constraint form_analysis_segment_spans_coordinates_key unique (
    revision_id,
    segment_id,
    start_codepoint,
    end_codepoint
  ),
  constraint form_analysis_segment_spans_order_check check (
    span_order > 0
  ),
  constraint form_analysis_segment_spans_start_codepoint_check check (
    start_codepoint >= 0
  ),
  constraint form_analysis_segment_spans_range_check check (
    end_codepoint > start_codepoint
  ),
  constraint form_analysis_segment_spans_segment_fkey foreign key (
    revision_id,
    segment_id
  ) references linguistic.form_analysis_revision_segments (
    revision_id,
    id
  )
    on update restrict
    on delete restrict
);

create table linguistic.form_analysis_revision_feature_segment_targets (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null,
  feature_assertion_id uuid not null,
  segment_id uuid not null,
  constraint form_analysis_feature_segment_targets_link_key unique (
    revision_id,
    feature_assertion_id,
    segment_id
  ),
  constraint form_analysis_feature_segment_targets_feature_fkey foreign key (
    revision_id,
    feature_assertion_id
  ) references linguistic.form_analysis_revision_features (
    revision_id,
    id
  )
    on update restrict
    on delete restrict,
  constraint form_analysis_feature_segment_targets_segment_fkey foreign key (
    revision_id,
    segment_id
  ) references linguistic.form_analysis_revision_segments (
    revision_id,
    id
  )
    on update restrict
    on delete restrict
);

create table linguistic.form_analysis_revision_feature_segment_realizations (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null,
  feature_assertion_id uuid not null,
  segment_id uuid not null,
  constraint form_analysis_feature_segment_realizations_link_key unique (
    revision_id,
    feature_assertion_id,
    segment_id
  ),
  constraint form_analysis_feature_segment_realizations_feature_fkey foreign key (
    revision_id,
    feature_assertion_id
  ) references linguistic.form_analysis_revision_features (
    revision_id,
    id
  )
    on update restrict
    on delete restrict,
  constraint form_analysis_feature_segment_realizations_segment_fkey foreign key (
    revision_id,
    segment_id
  ) references linguistic.form_analysis_revision_segments (
    revision_id,
    id
  )
    on update restrict
    on delete restrict
);

create index form_analysis_revision_segments_parent_idx
  on linguistic.form_analysis_revision_segments (
    revision_id,
    parent_segment_id
  )
  where parent_segment_id is not null;

create index form_analysis_feature_segment_targets_segment_idx
  on linguistic.form_analysis_revision_feature_segment_targets (
    revision_id,
    segment_id,
    feature_assertion_id
  );

create index form_analysis_feature_segment_realizations_segment_idx
  on linguistic.form_analysis_revision_feature_segment_realizations (
    revision_id,
    segment_id,
    feature_assertion_id
  );

create or replace function linguistic.assert_form_analysis_segment_hierarchy_acyclic()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.parent_segment_id is null then
    return null;
  end if;

  if exists (
    with recursive parent_chain (
      id,
      parent_segment_id,
      path,
      is_cycle
    ) as (
      select
        parent.id,
        parent.parent_segment_id,
        array[new.id, parent.id],
        parent.id = new.id
      from linguistic.form_analysis_revision_segments as parent
      where parent.revision_id = new.revision_id
        and parent.id = new.parent_segment_id

      union all

      select
        parent.id,
        parent.parent_segment_id,
        parent_chain.path || parent.id,
        parent.id = any(parent_chain.path)
      from linguistic.form_analysis_revision_segments as parent
      join parent_chain
        on parent.id = parent_chain.parent_segment_id
      where parent.revision_id = new.revision_id
        and not parent_chain.is_cycle
    )
    select 1
    from parent_chain
    where parent_chain.id = new.id
      or parent_chain.is_cycle
  ) then
    raise exception using
      errcode = '23514',
      message = 'form analysis segment hierarchy cycle detected',
      detail = 'Segment ' || new.id::text
        || ' would belong to a cyclic parent chain.',
      hint = 'Choose a parent outside the segment descendant chain.';
  end if;

  return null;
end;
$$;

create or replace function linguistic.validate_form_analysis_segment_span_bounds()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  surface_codepoint_length integer;
begin
  select pg_catalog.char_length(form_revision.surface_text)
  into surface_codepoint_length
  from linguistic.form_analysis_revisions as analysis_revision
  join linguistic.form_revisions as form_revision
    on form_revision.revision_id = analysis_revision.form_revision_id
  where analysis_revision.revision_id = new.revision_id;

  if not found then
    raise exception using
      errcode = '23503',
      message = 'segment span revision has no exact pinned Form revision surface';
  end if;

  if new.end_codepoint > surface_codepoint_length then
    raise exception using
      errcode = '23514',
      message = 'segment span exceeds the exact pinned Form revision surface',
      detail = 'end_codepoint ' || new.end_codepoint::text
        || ' exceeds surface code-point length '
        || surface_codepoint_length::text || '.';
  end if;

  return new;
end;
$$;

create trigger guard_analysis_segments_snapshot
before insert or update or delete
on linguistic.form_analysis_revision_segments
for each row
execute function linguistic.guard_snapshot_child_mutation();

create trigger guard_analysis_segment_spans_snapshot
before insert or update or delete
on linguistic.form_analysis_revision_segment_spans
for each row
execute function linguistic.guard_snapshot_child_mutation();

create trigger guard_analysis_feature_targets_snapshot
before insert or update or delete
on linguistic.form_analysis_revision_feature_segment_targets
for each row
execute function linguistic.guard_snapshot_child_mutation();

create trigger guard_analysis_feature_realizations_snapshot
before insert or update or delete
on linguistic.form_analysis_revision_feature_segment_realizations
for each row
execute function linguistic.guard_snapshot_child_mutation();

create constraint trigger analysis_segments_hierarchy_acyclic
after insert on linguistic.form_analysis_revision_segments
deferrable initially immediate
for each row
execute function linguistic.assert_form_analysis_segment_hierarchy_acyclic();

create trigger validate_analysis_segment_span_bounds
before insert on linguistic.form_analysis_revision_segment_spans
for each row
execute function linguistic.validate_form_analysis_segment_span_bounds();

alter table linguistic.form_analysis_revision_segments
  enable row level security;

alter table linguistic.form_analysis_revision_segment_spans
  enable row level security;

alter table linguistic.form_analysis_revision_feature_segment_targets
  enable row level security;

alter table linguistic.form_analysis_revision_feature_segment_realizations
  enable row level security;

revoke all on table
  linguistic.form_analysis_revision_segments,
  linguistic.form_analysis_revision_segment_spans,
  linguistic.form_analysis_revision_feature_segment_targets,
  linguistic.form_analysis_revision_feature_segment_realizations
from public, anon, authenticated, service_role;

revoke execute on function
  linguistic.assert_form_analysis_segment_hierarchy_acyclic()
from public, anon, authenticated, service_role;

revoke execute on function
  linguistic.validate_form_analysis_segment_span_bounds()
from public, anon, authenticated, service_role;

comment on table linguistic.form_analysis_revision_segments is
  'Snapshot-local analytical units; Segments are not automatically Forms, Lexemes, morphemes, or surface substrings, and zero spans does not imply a zero morpheme.';

comment on column linguistic.form_analysis_revision_segments.id is
  'Snapshot-scoped Segment UUID reserved as a precise future provenance, validation, and dispute target.';

comment on column linguistic.form_analysis_revision_segments.parent_segment_id is
  'Optional same-revision analytical parent; the hierarchy is acyclic and does not define a universal linguistic structure.';

comment on column linguistic.form_analysis_revision_segments.segment_order is
  'Positive global analytical order within the snapshot; it does not imply surface-coordinate, hierarchy, adjacency, or universal morphological order.';

comment on column linguistic.form_analysis_revision_segments.analysis_text is
  'Optional analytical notation preserved without normalization and not required to match the Form surface.';

comment on table linguistic.form_analysis_revision_segment_spans is
  'Continuous surface anchors for Segments; a Segment may have zero, one, or many ordered spans, including discontinuous or overlapping realizations.';

comment on column linguistic.form_analysis_revision_segment_spans.id is
  'Snapshot-scoped Span UUID reserved as a precise future provenance, validation, and dispute target.';

comment on column linguistic.form_analysis_revision_segment_spans.span_order is
  'Positive analytical ordering of this Segment spans; order values need not be contiguous or follow surface coordinates.';

comment on column linguistic.form_analysis_revision_segment_spans.start_codepoint is
  'Inclusive 0-based Unicode code-point offset into the exact pinned FormRevision.surface_text without normalization.';

comment on column linguistic.form_analysis_revision_segment_spans.end_codepoint is
  'Exclusive 0-based Unicode code-point offset into the exact pinned FormRevision.surface_text without normalization; the conceptual slice is substring(surface_text from start_codepoint + 1 for end_codepoint - start_codepoint).';

comment on table linguistic.form_analysis_revision_feature_segment_targets is
  'Typed snapshot assertions that a FeatureAssertion applies specifically to a same-revision Segment.';

comment on column linguistic.form_analysis_revision_feature_segment_targets.id is
  'Snapshot-scoped target-link UUID reserved as a precise future provenance, validation, and dispute target.';

comment on table linguistic.form_analysis_revision_feature_segment_realizations is
  'Typed snapshot assertions that a same-revision Segment realizes or expones a FeatureAssertion; zero-span Segments are allowed.';

comment on column linguistic.form_analysis_revision_feature_segment_realizations.id is
  'Snapshot-scoped realization-link UUID reserved as a precise future provenance, validation, and dispute target.';

comment on function linguistic.assert_form_analysis_segment_hierarchy_acyclic() is
  'Rejects same-revision Segment parent cycles, including cycles introduced by multi-row inserts.';

comment on function linguistic.validate_form_analysis_segment_span_bounds() is
  'Validates on insert that a code-point span ends within the exact FormRevision surface pinned by its FormAnalysisRevision.';
