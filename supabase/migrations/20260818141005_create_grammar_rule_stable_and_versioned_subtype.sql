create table linguistic.grammar_rules (
  id uuid primary key,
  entity_type_code text generated always as ('grammar_rule'::text) stored,
  language_id uuid not null,
  constraint grammar_rules_id_entity_type_key unique (
    id,
    entity_type_code
  ),
  constraint grammar_rules_id_language_key unique (
    id,
    language_id
  ),
  constraint grammar_rules_entity_fkey foreign key (
    id,
    entity_type_code
  ) references linguistic.entities (id, entity_type_code)
    on update restrict
    on delete restrict,
  constraint grammar_rules_language_id_fkey foreign key (
    language_id
  ) references linguistic.languages (id)
    on update restrict
    on delete restrict
);

create table linguistic.grammar_rule_revisions (
  revision_id uuid primary key,
  entity_id uuid not null,
  entity_type_code text generated always as ('grammar_rule'::text) stored,
  language_id uuid not null,
  presentation_locale_code text not null,
  label text not null,
  description text,
  constraint grammar_rule_revisions_entity_revision_key unique (
    entity_id,
    revision_id
  ),
  constraint grammar_rule_revisions_typed_revision_key unique (
    entity_id,
    revision_id,
    entity_type_code
  ),
  constraint grammar_rule_revisions_revision_language_key unique (
    revision_id,
    language_id
  ),
  constraint grammar_rule_revisions_entity_revision_language_key unique (
    entity_id,
    revision_id,
    language_id
  ),
  constraint grammar_rule_revisions_presentation_locale_check check (
    char_length(presentation_locale_code) between 1 and 63
    and presentation_locale_code !~ '^[[:space:]]'
    and presentation_locale_code !~ '[[:space:]]$'
  ),
  constraint grammar_rule_revisions_label_check check (
    char_length(label) between 1 and 240
    and label !~ '^[[:space:]]'
    and label !~ '[[:space:]]$'
  ),
  constraint grammar_rule_revisions_description_check check (
    description is null
    or (
      char_length(description) between 1 and 4000
      and description !~ '^[[:space:]]'
      and description !~ '[[:space:]]$'
    )
  ),
  constraint grammar_rule_revisions_revision_fkey foreign key (
    entity_id,
    revision_id,
    entity_type_code
  ) references linguistic.revisions (entity_id, id, entity_type_code)
    on update restrict
    on delete restrict,
  constraint grammar_rule_revisions_rule_fkey foreign key (
    entity_id,
    entity_type_code
  ) references linguistic.grammar_rules (id, entity_type_code)
    on update restrict
    on delete restrict,
  constraint grammar_rule_revisions_stable_language_fkey foreign key (
    entity_id,
    language_id
  ) references linguistic.grammar_rules (id, language_id)
    on update restrict
    on delete restrict
);

create table linguistic.grammar_rule_revision_varieties (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null,
  language_id uuid not null,
  variety_id uuid not null,
  constraint grammar_rule_revision_varieties_revision_variety_key unique (
    revision_id,
    variety_id
  ),
  constraint grammar_rule_revision_varieties_revision_language_fkey foreign key (
    revision_id,
    language_id
  ) references linguistic.grammar_rule_revisions (
    revision_id,
    language_id
  )
    on update restrict
    on delete restrict,
  constraint grammar_rule_revision_varieties_variety_language_fkey foreign key (
    variety_id,
    language_id
  ) references linguistic.varieties (id, language_id)
    on update restrict
    on delete restrict
);

do $$
begin
  if exists (
    select 1
    from linguistic.entities as entity
    where entity.entity_type_code = 'grammar_rule'
      and not exists (
        select 1
        from linguistic.grammar_rules as grammar_rule
        where grammar_rule.id = entity.id
      )
  ) then
    raise exception using
      errcode = '55000',
      message = 'pre-existing grammar rule entity has no stable subtype',
      hint = 'Resolve the incompatible data explicitly before applying Migration 8.';
  end if;

  if exists (
    select 1
    from linguistic.revisions as revision
    where revision.entity_type_code = 'grammar_rule'
      and not exists (
        select 1
        from linguistic.grammar_rule_revisions as grammar_rule_revision
        where grammar_rule_revision.revision_id = revision.id
          and grammar_rule_revision.entity_id = revision.entity_id
      )
  ) then
    raise exception using
      errcode = '55000',
      message = 'pre-existing grammar rule revision has no typed subtype',
      hint = 'Resolve the incompatible data explicitly before applying Migration 8.';
  end if;
end;
$$;

create index grammar_rules_language_id_idx
  on linguistic.grammar_rules (language_id);

create index grammar_rule_revision_varieties_variety_revision_idx
  on linguistic.grammar_rule_revision_varieties (variety_id, revision_id);

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
  elsif target_entity_type_code = 'form' then
    if not exists (
      select 1
      from linguistic.forms as form_subtype
      where form_subtype.id = target_entity_id
    ) then
      raise exception using
        errcode = '23514',
        message = 'form entity is missing its stable form subtype';
    end if;
  elsif target_entity_type_code = 'form_analysis' then
    if not exists (
      select 1
      from linguistic.form_analyses as form_analysis_subtype
      where form_analysis_subtype.id = target_entity_id
    ) then
      raise exception using
        errcode = '23514',
        message = 'form analysis entity is missing its stable subtype';
    end if;
  elsif target_entity_type_code = 'grammar_rule' then
    if not exists (
      select 1
      from linguistic.grammar_rules as grammar_rule
      where grammar_rule.id = target_entity_id
    ) then
      raise exception using
        errcode = '23514',
        message = 'grammar rule entity is missing its stable subtype';
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
  elsif target_entity_type_code = 'form' then
    if not exists (
      select 1
      from linguistic.form_revisions as form_revision
      where form_revision.revision_id = target_revision_id
        and form_revision.entity_id = target_entity_id
    ) then
      raise exception using
        errcode = '23514',
        message = 'form revision is missing its typed revision subtype';
    end if;
  elsif target_entity_type_code = 'form_analysis' then
    if not exists (
      select 1
      from linguistic.form_analysis_revisions as form_analysis_revision
      where form_analysis_revision.revision_id = target_revision_id
        and form_analysis_revision.entity_id = target_entity_id
    ) then
      raise exception using
        errcode = '23514',
        message = 'form analysis revision is missing its typed subtype';
    end if;
  elsif target_entity_type_code = 'grammar_rule' then
    if not exists (
      select 1
      from linguistic.grammar_rule_revisions as grammar_rule_revision
      where grammar_rule_revision.revision_id = target_revision_id
        and grammar_rule_revision.entity_id = target_entity_id
    ) then
      raise exception using
        errcode = '23514',
        message = 'grammar rule revision is missing its typed subtype';
    end if;
  end if;

  return null;
end;
$$;

create trigger guard_grammar_rules_mutation
before update or delete on linguistic.grammar_rules
for each row
execute function linguistic.guard_stable_subtype_mutation();

create trigger guard_grammar_rule_revisions_mutation
before update or delete on linguistic.grammar_rule_revisions
for each row
execute function linguistic.guard_revision_subtype_mutation();

create trigger guard_grammar_rule_revision_varieties_snapshot
before insert or update or delete
on linguistic.grammar_rule_revision_varieties
for each row
execute function linguistic.guard_snapshot_child_mutation();

alter table linguistic.grammar_rules enable row level security;
alter table linguistic.grammar_rule_revisions enable row level security;
alter table linguistic.grammar_rule_revision_varieties
  enable row level security;

revoke all on table
  linguistic.grammar_rules,
  linguistic.grammar_rule_revisions,
  linguistic.grammar_rule_revision_varieties
from public, anon, authenticated, service_role;

revoke execute on function linguistic.assert_entity_subtype_exists()
  from public, anon, authenticated, service_role;

revoke execute on function linguistic.assert_revision_subtype_exists()
  from public, anon, authenticated, service_role;

comment on table linguistic.grammar_rules is
  'Stable reusable language-scoped grammatical knowledge identities.';

comment on column linguistic.grammar_rules.language_id is
  'Language being analysed; this is stable identity, not presentation language.';

comment on table linguistic.grammar_rule_revisions is
  'Immutable editorial snapshots of GrammarRules; published status means editorially usable, not exclusive or scientifically proven truth.';

comment on column linguistic.grammar_rule_revisions.language_id is
  'Integrity copy of the stable GrammarRule language being analysed, reserved for declarative same-language links.';

comment on column linguistic.grammar_rule_revisions.presentation_locale_code is
  'Locale of this revision editorial label and description; single-locale V1 metadata that a future migration may extract into multiple localized texts.';

comment on column linguistic.grammar_rule_revisions.label is
  'Editorial human-readable name; duplicate labels are allowed and this is not a unique semantic identifier.';

comment on column linguistic.grammar_rule_revisions.description is
  'Optional human editorial explanation; this is not executable grammar.';

comment on constraint grammar_rule_revisions_entity_revision_language_key
on linguistic.grammar_rule_revisions is
  'Supports a future M9 exact GrammarRule entity, revision, and language pin from an Operation.';

comment on table linguistic.grammar_rule_revision_varieties is
  'Explicit revision-level variety scope assertions; zero rows means unspecified scope, never all varieties.';

comment on column linguistic.grammar_rule_revision_varieties.id is
  'Snapshot-scoped variety assertion UUID reserved as a precise future provenance target.';
