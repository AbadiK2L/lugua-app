create schema linguistic;

revoke all on schema linguistic
  from public, anon, authenticated, service_role;

alter default privileges in schema linguistic
  revoke all on tables from public, anon, authenticated, service_role;

alter default privileges in schema linguistic
  revoke all on sequences from public, anon, authenticated, service_role;

alter default privileges in schema linguistic
  revoke all on functions from public, anon, authenticated, service_role;

create table linguistic.editorial_statuses (
  code text primary key,
  description text not null,
  is_active boolean not null default true,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint editorial_statuses_code_format_check check (
    code = lower(btrim(code))
    and code ~ '^[a-z][a-z0-9_]{0,63}$'
  ),
  constraint editorial_statuses_description_length_check check (
    char_length(btrim(description)) >= 1
    and char_length(description) <= 500
  ),
  constraint editorial_statuses_sort_order_check check (sort_order >= 0)
);

create table linguistic.entity_types (
  code text primary key,
  description text not null,
  is_active boolean not null default true,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint entity_types_code_format_check check (
    code = lower(btrim(code))
    and code ~ '^[a-z][a-z0-9_]{0,63}$'
  ),
  constraint entity_types_description_length_check check (
    char_length(btrim(description)) >= 1
    and char_length(description) <= 500
  ),
  constraint entity_types_sort_order_check check (sort_order >= 0)
);

insert into linguistic.editorial_statuses (
  code,
  description,
  sort_order
)
values
  ('draft', 'Content is being prepared and is not ready for publication.', 10),
  ('published', 'Content is approved and available for publication.', 20),
  ('deprecated', 'Content is retained but is no longer recommended.', 30);

insert into linguistic.entity_types (
  code,
  description,
  sort_order
)
values
  ('concept', 'A language-independent unit of meaning.', 10),
  ('lexeme', 'A lexical unit grouping related senses and forms.', 20),
  ('sense', 'A contextual meaning associated with a lexeme.', 30),
  ('form', 'An observable written or spoken linguistic surface form.', 40),
  ('form_analysis', 'A structured linguistic analysis of a form.', 50),
  ('noun_class_system', 'A system organizing nouns into grammatical classes.', 60),
  ('noun_class', 'A grammatical noun class within a noun class system.', 70),
  ('grammar_rule', 'A formalized rule describing grammatical behavior.', 80),
  ('construction', 'A conventional pairing of linguistic form and meaning.', 90),
  ('linguistic_relation', 'A typed relationship between linguistic entities.', 100);

create table linguistic.languages (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  native_name text,
  iso_639_1 text,
  iso_639_2 text,
  iso_639_3 text,
  glottocode text,
  editorial_status_code text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint languages_code_key unique (code),
  constraint languages_code_format_check check (
    code = lower(btrim(code))
    and code ~ '^[a-z][a-z0-9_-]{0,31}$'
  ),
  constraint languages_name_length_check check (
    char_length(btrim(name)) >= 1
    and char_length(name) <= 120
  ),
  constraint languages_native_name_length_check check (
    native_name is null
    or (
      char_length(btrim(native_name)) >= 1
      and char_length(native_name) <= 120
    )
  ),
  constraint languages_iso_639_1_format_check check (
    iso_639_1 is null or iso_639_1 ~ '^[a-z]{2}$'
  ),
  constraint languages_iso_639_2_format_check check (
    iso_639_2 is null or iso_639_2 ~ '^[a-z]{3}$'
  ),
  constraint languages_iso_639_3_format_check check (
    iso_639_3 is null or iso_639_3 ~ '^[a-z]{3}$'
  ),
  constraint languages_glottocode_format_check check (
    glottocode is null or glottocode ~ '^[a-z0-9]{4}[0-9]{4}$'
  ),
  constraint languages_editorial_status_code_fkey foreign key (
    editorial_status_code
  ) references linguistic.editorial_statuses (code)
    on update restrict
    on delete restrict
);

create table linguistic.varieties (
  id uuid primary key default gen_random_uuid(),
  language_id uuid not null,
  code text not null,
  name text not null,
  iso_639_3 text,
  glottocode text,
  region text,
  description text,
  parent_variety_id uuid,
  editorial_status_code text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint varieties_language_id_fkey foreign key (language_id)
    references linguistic.languages (id)
    on delete restrict,
  constraint varieties_language_code_key unique (language_id, code),
  constraint varieties_id_language_key unique (id, language_id),
  constraint varieties_code_format_check check (
    code = lower(btrim(code))
    and code ~ '^[a-z][a-z0-9_-]{0,31}$'
  ),
  constraint varieties_name_length_check check (
    char_length(btrim(name)) >= 1
    and char_length(name) <= 120
  ),
  constraint varieties_region_length_check check (
    region is null
    or (
      char_length(btrim(region)) >= 1
      and char_length(region) <= 200
    )
  ),
  constraint varieties_description_length_check check (
    description is null
    or (
      char_length(btrim(description)) >= 1
      and char_length(description) <= 4000
    )
  ),
  constraint varieties_iso_639_3_format_check check (
    iso_639_3 is null or iso_639_3 ~ '^[a-z]{3}$'
  ),
  constraint varieties_glottocode_format_check check (
    glottocode is null or glottocode ~ '^[a-z0-9]{4}[0-9]{4}$'
  ),
  constraint varieties_parent_not_self_check check (
    parent_variety_id is null or parent_variety_id <> id
  ),
  constraint varieties_parent_language_fkey foreign key (
    parent_variety_id,
    language_id
  ) references linguistic.varieties (id, language_id)
    on delete restrict,
  constraint varieties_editorial_status_code_fkey foreign key (
    editorial_status_code
  ) references linguistic.editorial_statuses (code)
    on update restrict
    on delete restrict
);

create table linguistic.orthographies (
  id uuid primary key default gen_random_uuid(),
  language_id uuid not null,
  code text not null,
  name text not null,
  script_code text not null,
  description text,
  is_standardized boolean not null default false,
  valid_from date,
  valid_to date,
  editorial_status_code text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orthographies_language_id_fkey foreign key (language_id)
    references linguistic.languages (id)
    on delete restrict,
  constraint orthographies_language_code_key unique (language_id, code),
  constraint orthographies_id_language_key unique (id, language_id),
  constraint orthographies_code_format_check check (
    code = lower(btrim(code))
    and code ~ '^[a-z][a-z0-9_-]{0,31}$'
  ),
  constraint orthographies_name_length_check check (
    char_length(btrim(name)) >= 1
    and char_length(name) <= 120
  ),
  constraint orthographies_script_code_format_check check (
    script_code ~ '^[A-Z][a-z]{3}$'
  ),
  constraint orthographies_description_length_check check (
    description is null
    or (
      char_length(btrim(description)) >= 1
      and char_length(description) <= 4000
    )
  ),
  constraint orthographies_valid_dates_check check (
    valid_to is null
    or valid_from is null
    or valid_to >= valid_from
  ),
  constraint orthographies_editorial_status_code_fkey foreign key (
    editorial_status_code
  ) references linguistic.editorial_statuses (code)
    on update restrict
    on delete restrict
);

create table linguistic.orthography_varieties (
  orthography_id uuid not null,
  variety_id uuid not null,
  language_id uuid not null,
  created_at timestamptz not null default now(),
  constraint orthography_varieties_pkey primary key (
    orthography_id,
    variety_id
  ),
  constraint orthography_varieties_orthography_language_fkey foreign key (
    orthography_id,
    language_id
  ) references linguistic.orthographies (id, language_id)
    on delete restrict,
  constraint orthography_varieties_variety_language_fkey foreign key (
    variety_id,
    language_id
  ) references linguistic.varieties (id, language_id)
    on delete restrict
);

create unique index languages_iso_639_1_unique_idx
  on linguistic.languages (iso_639_1)
  where iso_639_1 is not null;

create unique index languages_iso_639_2_unique_idx
  on linguistic.languages (iso_639_2)
  where iso_639_2 is not null;

create unique index languages_iso_639_3_unique_idx
  on linguistic.languages (iso_639_3)
  where iso_639_3 is not null;

create unique index languages_glottocode_unique_idx
  on linguistic.languages (glottocode)
  where glottocode is not null;

create unique index varieties_glottocode_unique_idx
  on linguistic.varieties (glottocode)
  where glottocode is not null;

create index varieties_iso_639_3_idx
  on linguistic.varieties (iso_639_3)
  where iso_639_3 is not null;

create index varieties_parent_variety_idx
  on linguistic.varieties (parent_variety_id)
  where parent_variety_id is not null;

create index orthographies_language_script_idx
  on linguistic.orthographies (language_id, script_code);

create index orthography_varieties_variety_orthography_idx
  on linguistic.orthography_varieties (variety_id, orthography_id);

create or replace function linguistic.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function linguistic.assert_variety_hierarchy_acyclic()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_variety_id uuid;
  current_language_id uuid;
  current_parent_variety_id uuid;
begin
  select
    variety.id,
    variety.language_id,
    variety.parent_variety_id
  into
    current_variety_id,
    current_language_id,
    current_parent_variety_id
  from linguistic.varieties as variety
  where variety.id = new.id;

  if not found or current_parent_variety_id is null then
    return null;
  end if;

  -- Serialize final hierarchy checks per language across transactions.
  perform 1
  from linguistic.languages as language
  where language.id = current_language_id
  for update;

  if exists (
    with recursive parent_chain (
      id,
      parent_variety_id,
      path,
      is_cycle
    ) as (
      select
        candidate.id,
        candidate.parent_variety_id,
        array[candidate.id],
        candidate.id = current_variety_id
      from linguistic.varieties as candidate
      where candidate.id = current_parent_variety_id
        and candidate.language_id = current_language_id

      union all

      select
        candidate.id,
        candidate.parent_variety_id,
        parent_chain.path || candidate.id,
        candidate.id = any(parent_chain.path)
      from linguistic.varieties as candidate
      join parent_chain
        on candidate.id = parent_chain.parent_variety_id
      where candidate.language_id = current_language_id
        and not parent_chain.is_cycle
    )
    select 1
    from parent_chain
    where parent_chain.id = current_variety_id
  ) then
    raise exception using
      errcode = '23514',
      message = 'variety hierarchy cycle detected',
      detail = 'Variety ' || current_variety_id::text
        || ' would become its own ancestor.',
      hint = 'Choose a parent outside this variety''s descendant chain.';
  end if;

  return null;
end;
$$;

create trigger set_editorial_statuses_updated_at
before update on linguistic.editorial_statuses
for each row
execute function linguistic.set_updated_at();

create trigger set_entity_types_updated_at
before update on linguistic.entity_types
for each row
execute function linguistic.set_updated_at();

create trigger set_languages_updated_at
before update on linguistic.languages
for each row
execute function linguistic.set_updated_at();

create trigger set_varieties_updated_at
before update on linguistic.varieties
for each row
execute function linguistic.set_updated_at();

create trigger set_orthographies_updated_at
before update on linguistic.orthographies
for each row
execute function linguistic.set_updated_at();

create constraint trigger varieties_hierarchy_acyclic
after insert or update of parent_variety_id, language_id
on linguistic.varieties
deferrable initially deferred
for each row
execute function linguistic.assert_variety_hierarchy_acyclic();

alter table linguistic.editorial_statuses enable row level security;
alter table linguistic.entity_types enable row level security;
alter table linguistic.languages enable row level security;
alter table linguistic.varieties enable row level security;
alter table linguistic.orthographies enable row level security;
alter table linguistic.orthography_varieties enable row level security;

revoke all on all tables in schema linguistic
  from public, anon, authenticated, service_role;

revoke all on all sequences in schema linguistic
  from public, anon, authenticated, service_role;

revoke all on all functions in schema linguistic
  from public, anon, authenticated, service_role;

comment on schema linguistic is
  'Internal canonical linguistic catalog; it is not a direct client API.';

comment on table linguistic.editorial_statuses is
  'Stable workflow states shared by versioned linguistic content.';

comment on table linguistic.entity_types is
  'Reserved V1 entity categories for later polymorphic catalog migrations.';

comment on table linguistic.languages is
  'Canonical language records identified by stable Lugua internal codes.';

comment on table linguistic.varieties is
  'Language varieties with same-language hierarchical relationships.';

comment on table linguistic.orthographies is
  'Named writing conventions associated with a language and script.';

comment on table linguistic.orthography_varieties is
  'Same-language associations between orthographies and varieties.';
