create table linguistic.sources (
  id uuid primary key default gen_random_uuid(),
  display_label text not null,
  citation_text text not null,
  canonical_uri text,
  publication_year integer,
  rights_note text,
  created_at timestamptz not null default now(),
  constraint sources_display_label_check check (
    char_length(display_label) between 1 and 240
    and display_label !~ '^[[:space:]]'
    and display_label !~ '[[:space:]]$'
  ),
  constraint sources_citation_text_check check (
    char_length(citation_text) between 1 and 4000
    and citation_text !~ '^[[:space:]]'
    and citation_text !~ '[[:space:]]$'
  ),
  constraint sources_canonical_uri_check check (
    canonical_uri is null
    or (
      char_length(canonical_uri) between 1 and 4096
      and canonical_uri !~ '^[[:space:]]'
      and canonical_uri !~ '[[:space:]]$'
    )
  ),
  constraint sources_publication_year_check check (
    publication_year is null
    or publication_year between 1 and 9999
  ),
  constraint sources_rights_note_check check (
    rights_note is null
    or (
      char_length(rights_note) between 1 and 4000
      and rights_note !~ '^[[:space:]]'
      and rights_note !~ '[[:space:]]$'
    )
  )
);

create table linguistic.source_locations (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null,
  locator_text text not null,
  location_uri text,
  created_at timestamptz not null default now(),
  constraint source_locations_id_source_id_key unique (
    id,
    source_id
  ),
  constraint source_locations_locator_text_check check (
    char_length(locator_text) between 1 and 500
    and locator_text !~ '^[[:space:]]'
    and locator_text !~ '[[:space:]]$'
  ),
  constraint source_locations_location_uri_check check (
    location_uri is null
    or (
      char_length(location_uri) between 1 and 4096
      and location_uri !~ '^[[:space:]]'
      and location_uri !~ '[[:space:]]$'
    )
  ),
  constraint source_locations_source_id_fkey foreign key (
    source_id
  ) references linguistic.sources (id)
    on update restrict
    on delete restrict
);

create index source_locations_source_id_idx
  on linguistic.source_locations (source_id);

create function linguistic.guard_immutable_source_metadata()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception using
    errcode = '55000',
    message = 'source metadata is immutable; create a new source or source location instead';
end;
$$;

create trigger guard_sources_mutation
before update or delete on linguistic.sources
for each row
execute function linguistic.guard_immutable_source_metadata();

create trigger guard_source_locations_mutation
before update or delete on linguistic.source_locations
for each row
execute function linguistic.guard_immutable_source_metadata();

alter table linguistic.sources
  enable row level security;

alter table linguistic.source_locations
  enable row level security;

revoke all on table
  linguistic.sources,
  linguistic.source_locations
from public, anon, authenticated, service_role;

revoke execute on function
  linguistic.guard_immutable_source_metadata()
from public, anon, authenticated, service_role;

comment on table linguistic.sources is
  'Immutable citable documentary source versions used as future provenance anchors. A new edition, version, or substantively different snapshot receives a new Source UUID. A web Source without a genuinely preserved snapshot cannot guarantee perfect reproducibility.';

comment on column linguistic.sources.id is
  'Technical identity of this exact citable Source version, not of an abstract work.';

comment on column linguistic.sources.display_label is
  'Human-friendly display identifier, including pseudonymous human-session labels, not a unique bibliographic identity.';

comment on column linguistic.sources.citation_text is
  'Complete human-presentable citation, not a normalized bibliographic model.';

comment on column linguistic.sources.canonical_uri is
  'Optional documentary locator, not the Source identity; a stable URI does not imply immutable content.';

comment on column linguistic.sources.publication_year is
  'Optional coarse metadata only, not a universal date model.';

comment on column linguistic.sources.rights_note is
  'Human descriptive rights or licensing note; it never grants automatic permission to import, redistribute, reproduce, or publish. NULL means information was not recorded, not that the Source is free to use.';

comment on column linguistic.sources.created_at is
  'Catalog insertion timestamp, not the Source publication date.';

comment on table linguistic.source_locations is
  'Immutable precise locators inside Sources. A SourceLocation alone does not constitute a linguistic Attestation and contains no excerpt or copied protected content.';

comment on column linguistic.source_locations.id is
  'Technical identity of this exact immutable SourceLocation.';

comment on column linguistic.source_locations.source_id is
  'Source containing this precise documentary locator.';

comment on column linguistic.source_locations.locator_text is
  'Generic human-readable locator without normalization or an imposed locator type.';

comment on column linguistic.source_locations.location_uri is
  'Optional URI that may locate the cited position more precisely than the Source canonical URI.';

comment on column linguistic.source_locations.created_at is
  'Catalog insertion timestamp for this immutable SourceLocation.';

comment on constraint source_locations_id_source_id_key
on linguistic.source_locations is
  'Intentional composite key for future M11 foreign keys that must prove a SourceLocation belongs to the same Source.';

comment on function linguistic.guard_immutable_source_metadata() is
  'Rejects updates and deletes of append-only Source and SourceLocation metadata; corrections require new UUIDs.';
