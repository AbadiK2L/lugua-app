do $$
begin
  if exists (
    select 1
    from linguistic.entity_types as entity_type
    where entity_type.code = 'paradigm'
      and (
        entity_type.description is distinct from
          'A stable editorial identity for a versioned linguistic paradigm in one language variety.'
        or entity_type.sort_order is distinct from 130
      )
  ) then
    raise exception using
      errcode = '55000',
      message = 'pre-existing paradigm entity type is incompatible with M17';
  end if;

  if exists (
    select 1
    from linguistic.entity_types as entity_type
    where entity_type.code = 'paradigm'
  ) then
    raise exception using
      errcode = '55000',
      message = 'paradigm entity type already exists before M17';
  end if;
end;
$$;

insert into linguistic.entity_types (
  code,
  description,
  sort_order
)
values (
  'paradigm',
  'A stable editorial identity for a versioned linguistic paradigm in one language variety.',
  130
);

create table linguistic.paradigms (
  id uuid not null,
  entity_type_code text generated always as ('paradigm'::text) stored,
  variety_id uuid not null,
  language_id uuid not null,
  constraint paradigms_pkey primary key (id),
  constraint paradigms_id_entity_type_key unique (
    id,
    entity_type_code
  ),
  constraint paradigms_id_context_key unique (
    id,
    variety_id,
    language_id
  ),
  constraint paradigms_entity_fkey foreign key (
    id,
    entity_type_code
  ) references linguistic.entities (id, entity_type_code)
    on update restrict
    on delete restrict,
  constraint paradigms_variety_language_fkey foreign key (
    variety_id,
    language_id
  ) references linguistic.varieties (id, language_id)
    on update restrict
    on delete restrict
);

create table linguistic.paradigm_revisions (
  revision_id uuid not null,
  entity_id uuid not null,
  entity_type_code text generated always as ('paradigm'::text) stored,
  variety_id uuid not null,
  language_id uuid not null,
  presentation_locale_code text not null,
  label text not null,
  description text,
  constraint paradigm_revisions_pkey primary key (revision_id),
  constraint paradigm_revisions_entity_revision_key unique (
    entity_id,
    revision_id
  ),
  constraint paradigm_revisions_typed_revision_key unique (
    entity_id,
    revision_id,
    entity_type_code
  ),
  constraint paradigm_revisions_revision_context_key unique (
    revision_id,
    variety_id,
    language_id
  ),
  constraint paradigm_revisions_presentation_locale_check check (
    char_length(presentation_locale_code) between 1 and 63
    and presentation_locale_code !~ '^[[:space:]]'
    and presentation_locale_code !~ '[[:space:]]$'
  ),
  constraint paradigm_revisions_label_check check (
    char_length(label) between 1 and 240
    and label !~ '^[[:space:]]'
    and label !~ '[[:space:]]$'
  ),
  constraint paradigm_revisions_description_check check (
    description is null
    or (
      char_length(description) between 1 and 4000
      and description !~ '^[[:space:]]'
      and description !~ '[[:space:]]$'
    )
  ),
  constraint paradigm_revisions_revision_fkey foreign key (
    entity_id,
    revision_id,
    entity_type_code
  ) references linguistic.revisions (entity_id, id, entity_type_code)
    on update restrict
    on delete restrict,
  constraint paradigm_revisions_paradigm_fkey foreign key (
    entity_id,
    entity_type_code
  ) references linguistic.paradigms (id, entity_type_code)
    on update restrict
    on delete restrict,
  constraint paradigm_revisions_stable_context_fkey foreign key (
    entity_id,
    variety_id,
    language_id
  ) references linguistic.paradigms (id, variety_id, language_id)
    on update restrict
    on delete restrict
);

create table linguistic.paradigm_revision_lexemes (
  id uuid not null default gen_random_uuid(),
  revision_id uuid not null,
  lexeme_id uuid not null,
  lexeme_revision_id uuid not null,
  lexeme_revision_variety_id uuid not null,
  variety_id uuid not null,
  language_id uuid not null,
  constraint paradigm_revision_lexemes_pkey primary key (id),
  constraint prl_member_context_key unique (
    revision_id,
    variety_id,
    language_id,
    lexeme_id
  ),
  constraint prl_paradigm_revision_fkey foreign key (
    revision_id,
    variety_id,
    language_id
  ) references linguistic.paradigm_revisions (
    revision_id,
    variety_id,
    language_id
  )
    on update restrict
    on delete restrict,
  constraint prl_lexeme_revision_variety_fkey foreign key (
    lexeme_revision_variety_id,
    lexeme_revision_id,
    lexeme_id,
    language_id,
    variety_id
  ) references linguistic.lexeme_revision_varieties (
    id,
    revision_id,
    lexeme_id,
    language_id,
    variety_id
  )
    on update restrict
    on delete restrict
);

create table linguistic.paradigm_revision_verb_classes (
  id uuid not null default gen_random_uuid(),
  revision_id uuid not null,
  variety_id uuid not null,
  language_id uuid not null,
  verb_class_system_id uuid not null,
  verb_class_system_revision_id uuid not null,
  verb_class_id uuid not null,
  verb_class_revision_id uuid not null,
  constraint paradigm_revision_verb_classes_pkey primary key (id),
  constraint prvc_exact_membership_key unique (
    revision_id,
    variety_id,
    language_id,
    verb_class_system_revision_id,
    verb_class_revision_id
  ),
  constraint prvc_paradigm_revision_fkey foreign key (
    revision_id,
    variety_id,
    language_id
  ) references linguistic.paradigm_revisions (
    revision_id,
    variety_id,
    language_id
  )
    on update restrict
    on delete restrict,
  constraint prvc_system_revision_context_fkey foreign key (
    verb_class_system_id,
    verb_class_system_revision_id,
    variety_id,
    language_id
  ) references linguistic.verb_class_system_revisions (
    entity_id,
    revision_id,
    variety_id,
    language_id
  )
    on update restrict
    on delete restrict,
  constraint prvc_class_revision_context_fkey foreign key (
    verb_class_id,
    verb_class_revision_id,
    verb_class_system_id,
    verb_class_system_revision_id,
    variety_id,
    language_id
  ) references linguistic.verb_class_revisions (
    entity_id,
    revision_id,
    verb_class_system_id,
    verb_class_system_revision_id,
    variety_id,
    language_id
  )
    on update restrict
    on delete restrict
);

create table linguistic.paradigm_revision_slots (
  id uuid not null default gen_random_uuid(),
  revision_id uuid not null,
  variety_id uuid not null,
  language_id uuid not null,
  slot_order integer not null,
  code text not null,
  analysis_text text,
  constraint paradigm_revision_slots_pkey primary key (id),
  constraint prs_revision_slot_context_key unique (
    revision_id,
    id,
    variety_id,
    language_id
  ),
  constraint prs_revision_order_key unique (
    revision_id,
    slot_order
  ),
  constraint prs_revision_code_key unique (
    revision_id,
    code
  ),
  constraint prs_slot_order_check check (slot_order > 0),
  constraint prs_code_check check (
    char_length(code) between 1 and 120
    and code !~ '^[[:space:]]'
    and code !~ '[[:space:]]$'
  ),
  constraint prs_analysis_text_check check (
    analysis_text is null
    or (
      char_length(analysis_text) between 1 and 1000
      and analysis_text !~ '^[[:space:]]'
      and analysis_text !~ '[[:space:]]$'
    )
  ),
  constraint prs_paradigm_revision_fkey foreign key (
    revision_id,
    variety_id,
    language_id
  ) references linguistic.paradigm_revisions (
    revision_id,
    variety_id,
    language_id
  )
    on update restrict
    on delete restrict
);

create table linguistic.paradigm_revision_slot_features (
  id uuid not null default gen_random_uuid(),
  revision_id uuid not null,
  slot_id uuid not null,
  variety_id uuid not null,
  language_id uuid not null,
  feature_definition_id uuid not null,
  controlled_value_id uuid,
  raw_value_text text,
  constraint paradigm_revision_slot_features_pkey primary key (id),
  constraint prs_features_value_xor_check check (
    num_nonnulls(controlled_value_id, raw_value_text) = 1
  ),
  constraint prs_features_raw_value_check check (
    raw_value_text is null
    or (
      char_length(raw_value_text) between 1 and 500
      and raw_value_text !~ '^[[:space:]]'
      and raw_value_text !~ '[[:space:]]$'
    )
  ),
  constraint prs_features_slot_context_fkey foreign key (
    revision_id,
    slot_id,
    variety_id,
    language_id
  ) references linguistic.paradigm_revision_slots (
    revision_id,
    id,
    variety_id,
    language_id
  )
    on update restrict
    on delete restrict,
  constraint prs_features_definition_language_fkey foreign key (
    feature_definition_id,
    language_id
  ) references linguistic.grammatical_feature_definitions (
    id,
    language_id
  )
    on update restrict
    on delete restrict,
  constraint prs_features_controlled_value_fkey foreign key (
    controlled_value_id,
    feature_definition_id
  ) references linguistic.grammatical_feature_values (
    id,
    feature_definition_id
  )
    on update restrict
    on delete restrict
);

create table linguistic.paradigm_slot_claim_types (
  code text not null,
  description text not null,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  constraint paradigm_slot_claim_types_pkey primary key (code),
  constraint paradigm_slot_claim_types_sort_order_key unique (sort_order),
  constraint psct_code_check check (
    char_length(code) between 1 and 40
    and code ~ '^[a-z][a-z_]*$'
  ),
  constraint psct_description_check check (
    char_length(description) between 1 and 500
    and description !~ '^[[:space:]]'
    and description !~ '[[:space:]]$'
  ),
  constraint psct_sort_order_check check (sort_order > 0)
);

insert into linguistic.paradigm_slot_claim_types (
  code,
  description,
  sort_order
)
values
  (
    'structurally_impossible',
    'The analysis positively asserts that no realization is possible within the selected scope.',
    10
  ),
  (
    'possible_unattested',
    'The analysis asserts that the slot is possible, but no attestation is currently claimed within the selected scope.',
    20
  );

do $$
begin
  if (
    select count(*)
    from linguistic.paradigm_slot_claim_types
  ) <> 2
    or not exists (
      select 1
      from linguistic.paradigm_slot_claim_types as claim_type
      where claim_type.code = 'structurally_impossible'
        and claim_type.description =
          'The analysis positively asserts that no realization is possible within the selected scope.'
        and claim_type.sort_order = 10
    )
    or not exists (
      select 1
      from linguistic.paradigm_slot_claim_types as claim_type
      where claim_type.code = 'possible_unattested'
        and claim_type.description =
          'The analysis asserts that the slot is possible, but no attestation is currently claimed within the selected scope.'
        and claim_type.sort_order = 20
    )
  then
    raise exception using
      errcode = '55000',
      message = 'paradigm slot claim type seed verification failed';
  end if;
end;
$$;

create table linguistic.paradigm_revision_slot_claims (
  id uuid not null default gen_random_uuid(),
  revision_id uuid not null,
  slot_id uuid not null,
  variety_id uuid not null,
  language_id uuid not null,
  scope_code text not null,
  lexeme_id uuid,
  claim_type_code text not null,
  analysis_text text,
  constraint paradigm_revision_slot_claims_pkey primary key (id),
  constraint prsc_scope_check check (
    (
      scope_code = 'paradigm'
      and lexeme_id is null
    )
    or (
      scope_code = 'lexeme'
      and lexeme_id is not null
    )
  ),
  constraint prsc_analysis_text_check check (
    analysis_text is null
    or (
      char_length(analysis_text) between 1 and 1000
      and analysis_text !~ '^[[:space:]]'
      and analysis_text !~ '[[:space:]]$'
    )
  ),
  constraint prsc_claim_type_fkey foreign key (claim_type_code)
    references linguistic.paradigm_slot_claim_types (code)
    on update restrict
    on delete restrict,
  constraint prsc_slot_context_fkey foreign key (
    revision_id,
    slot_id,
    variety_id,
    language_id
  ) references linguistic.paradigm_revision_slots (
    revision_id,
    id,
    variety_id,
    language_id
  )
    on update restrict
    on delete restrict,
  constraint prsc_lexeme_member_context_fkey foreign key (
    revision_id,
    variety_id,
    language_id,
    lexeme_id
  ) references linguistic.paradigm_revision_lexemes (
    revision_id,
    variety_id,
    language_id,
    lexeme_id
  )
    on update restrict
    on delete restrict
);

create table linguistic.paradigm_revision_slot_realizations (
  id uuid not null default gen_random_uuid(),
  revision_id uuid not null,
  slot_id uuid not null,
  variety_id uuid not null,
  language_id uuid not null,
  lexeme_id uuid not null,
  form_analysis_revision_id uuid not null,
  constraint paradigm_revision_slot_realizations_pkey primary key (id),
  constraint prsr_exact_realization_key unique (
    revision_id,
    slot_id,
    lexeme_id,
    form_analysis_revision_id
  ),
  constraint prsr_slot_context_fkey foreign key (
    revision_id,
    slot_id,
    variety_id,
    language_id
  ) references linguistic.paradigm_revision_slots (
    revision_id,
    id,
    variety_id,
    language_id
  )
    on update restrict
    on delete restrict,
  constraint prsr_lexeme_member_context_fkey foreign key (
    revision_id,
    variety_id,
    language_id,
    lexeme_id
  ) references linguistic.paradigm_revision_lexemes (
    revision_id,
    variety_id,
    language_id,
    lexeme_id
  )
    on update restrict
    on delete restrict,
  constraint prsr_analysis_language_fkey foreign key (
    form_analysis_revision_id,
    language_id
  ) references linguistic.form_analysis_revisions (
    revision_id,
    language_id
  )
    on update restrict
    on delete restrict,
  constraint prsr_analysis_lexeme_fkey foreign key (
    form_analysis_revision_id,
    lexeme_id
  ) references linguistic.form_analysis_revision_lexemes (
    revision_id,
    lexeme_id
  )
    on update restrict
    on delete restrict,
  constraint prsr_analysis_variety_fkey foreign key (
    form_analysis_revision_id,
    variety_id
  ) references linguistic.form_analysis_revision_varieties (
    revision_id,
    variety_id
  )
    on update restrict
    on delete restrict
);

create index paradigms_variety_language_idx
  on linguistic.paradigms (variety_id, language_id);

create index paradigm_revisions_entity_type_idx
  on linguistic.paradigm_revisions (entity_id, entity_type_code);

create index paradigm_revisions_stable_context_idx
  on linguistic.paradigm_revisions (
    entity_id,
    variety_id,
    language_id
  );

create index prl_lexeme_variety_context_idx
  on linguistic.paradigm_revision_lexemes (
    lexeme_revision_variety_id,
    lexeme_revision_id,
    lexeme_id,
    language_id,
    variety_id
  );

create index prl_lexeme_revision_lookup_idx
  on linguistic.paradigm_revision_lexemes (
    lexeme_id,
    lexeme_revision_id,
    revision_id
  );

create index prvc_system_revision_context_idx
  on linguistic.paradigm_revision_verb_classes (
    verb_class_system_id,
    verb_class_system_revision_id,
    variety_id,
    language_id
  );

create index prvc_class_revision_context_idx
  on linguistic.paradigm_revision_verb_classes (
    verb_class_id,
    verb_class_revision_id,
    verb_class_system_id,
    verb_class_system_revision_id,
    variety_id,
    language_id
  );

create index prs_parent_context_idx
  on linguistic.paradigm_revision_slots (
    revision_id,
    variety_id,
    language_id
  );

create index prs_features_slot_context_idx
  on linguistic.paradigm_revision_slot_features (
    revision_id,
    slot_id,
    variety_id,
    language_id
  );

create index prs_features_definition_language_idx
  on linguistic.paradigm_revision_slot_features (
    feature_definition_id,
    language_id
  );

create index prs_features_controlled_value_idx
  on linguistic.paradigm_revision_slot_features (
    controlled_value_id,
    feature_definition_id
  )
  where controlled_value_id is not null;

create unique index prs_features_controlled_value_uidx
  on linguistic.paradigm_revision_slot_features (
    revision_id,
    slot_id,
    feature_definition_id,
    controlled_value_id
  )
  where controlled_value_id is not null;

create unique index prs_features_raw_value_uidx
  on linguistic.paradigm_revision_slot_features (
    revision_id,
    slot_id,
    feature_definition_id,
    raw_value_text
  )
  where raw_value_text is not null;

create index prsc_claim_type_idx
  on linguistic.paradigm_revision_slot_claims (claim_type_code);

create index prsc_slot_context_idx
  on linguistic.paradigm_revision_slot_claims (
    revision_id,
    slot_id,
    variety_id,
    language_id
  );

create index prsc_lexeme_member_context_idx
  on linguistic.paradigm_revision_slot_claims (
    revision_id,
    variety_id,
    language_id,
    lexeme_id
  );

create unique index prsc_paradigm_scope_uidx
  on linguistic.paradigm_revision_slot_claims (
    revision_id,
    slot_id
  )
  where scope_code = 'paradigm';

create unique index prsc_lexeme_scope_uidx
  on linguistic.paradigm_revision_slot_claims (
    revision_id,
    slot_id,
    lexeme_id
  )
  where scope_code = 'lexeme';

create index prsr_slot_context_idx
  on linguistic.paradigm_revision_slot_realizations (
    revision_id,
    slot_id,
    variety_id,
    language_id
  );

create index prsr_lexeme_member_context_idx
  on linguistic.paradigm_revision_slot_realizations (
    revision_id,
    variety_id,
    language_id,
    lexeme_id
  );

create index prsr_analysis_language_idx
  on linguistic.paradigm_revision_slot_realizations (
    form_analysis_revision_id,
    language_id
  );

create index prsr_analysis_lexeme_idx
  on linguistic.paradigm_revision_slot_realizations (
    form_analysis_revision_id,
    lexeme_id
  );

create index prsr_analysis_variety_idx
  on linguistic.paradigm_revision_slot_realizations (
    form_analysis_revision_id,
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
  elsif target_entity_type_code = 'noun_class_system' then
    if not exists (
      select 1
      from linguistic.noun_class_systems as noun_class_system
      where noun_class_system.id = target_entity_id
    ) then
      raise exception using
        errcode = '23514',
        message = 'noun class system entity is missing its stable subtype';
    end if;
  elsif target_entity_type_code = 'noun_class' then
    if not exists (
      select 1
      from linguistic.noun_classes as noun_class
      where noun_class.id = target_entity_id
    ) then
      raise exception using
        errcode = '23514',
        message = 'noun class entity is missing its stable subtype';
    end if;
  elsif target_entity_type_code = 'verb_class_system' then
    if not exists (
      select 1
      from linguistic.verb_class_systems as verb_class_system
      where verb_class_system.id = target_entity_id
    ) then
      raise exception using
        errcode = '23514',
        message = 'verb class system entity is missing its stable subtype';
    end if;
  elsif target_entity_type_code = 'verb_class' then
    if not exists (
      select 1
      from linguistic.verb_classes as verb_class
      where verb_class.id = target_entity_id
    ) then
      raise exception using
        errcode = '23514',
        message = 'verb class entity is missing its stable subtype';
    end if;
  elsif target_entity_type_code = 'paradigm' then
    if not exists (
      select 1
      from linguistic.paradigms as paradigm
      where paradigm.id = target_entity_id
    ) then
      raise exception using
        errcode = '23514',
        message = 'paradigm entity is missing its stable subtype';
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
  elsif target_entity_type_code = 'noun_class_system' then
    if not exists (
      select 1
      from linguistic.noun_class_system_revisions as system_revision
      where system_revision.revision_id = target_revision_id
        and system_revision.entity_id = target_entity_id
    ) then
      raise exception using
        errcode = '23514',
        message = 'noun class system revision is missing its typed subtype';
    end if;
  elsif target_entity_type_code = 'noun_class' then
    if not exists (
      select 1
      from linguistic.noun_class_revisions as noun_class_revision
      where noun_class_revision.revision_id = target_revision_id
        and noun_class_revision.entity_id = target_entity_id
    ) then
      raise exception using
        errcode = '23514',
        message = 'noun class revision is missing its typed subtype';
    end if;
  elsif target_entity_type_code = 'verb_class_system' then
    if not exists (
      select 1
      from linguistic.verb_class_system_revisions as system_revision
      where system_revision.revision_id = target_revision_id
        and system_revision.entity_id = target_entity_id
    ) then
      raise exception using
        errcode = '23514',
        message = 'verb class system revision is missing its typed subtype';
    end if;
  elsif target_entity_type_code = 'verb_class' then
    if not exists (
      select 1
      from linguistic.verb_class_revisions as verb_class_revision
      where verb_class_revision.revision_id = target_revision_id
        and verb_class_revision.entity_id = target_entity_id
    ) then
      raise exception using
        errcode = '23514',
        message = 'verb class revision is missing its typed subtype';
    end if;
  elsif target_entity_type_code = 'paradigm' then
    if not exists (
      select 1
      from linguistic.paradigm_revisions as paradigm_revision
      where paradigm_revision.revision_id = target_revision_id
        and paradigm_revision.entity_id = target_entity_id
    ) then
      raise exception using
        errcode = '23514',
        message = 'paradigm revision is missing its typed subtype';
    end if;
  end if;

  return null;
end;
$$;

create function linguistic.guard_paradigm_slot_claim_type_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception using
    errcode = '55000',
    message = 'paradigm slot claim types are a closed immutable structural vocabulary';
end;
$$;

create function linguistic.validate_paradigm_slot_claim_insert()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  perform 1
  from linguistic.paradigm_revision_slots as slot
  where slot.revision_id = new.revision_id
    and slot.id = new.slot_id
    and slot.variety_id = new.variety_id
    and slot.language_id = new.language_id
  for update;

  if not found then
    raise exception using
      errcode = '23503',
      message = 'paradigm slot claim references an unknown slot context';
  end if;

  if exists (
    select 1
    from linguistic.paradigm_revision_slot_claims as existing_claim
    where existing_claim.revision_id = new.revision_id
      and existing_claim.slot_id = new.slot_id
      and existing_claim.variety_id = new.variety_id
      and existing_claim.language_id = new.language_id
      and existing_claim.scope_code = new.scope_code
      and existing_claim.lexeme_id is not distinct from new.lexeme_id
  ) then
    raise exception using
      errcode = '55000',
      message = 'a paradigm slot claim already exists for the same scope';
  end if;

  if new.claim_type_code = 'structurally_impossible' then
    if new.scope_code = 'paradigm' then
      if exists (
        select 1
        from linguistic.paradigm_revision_slot_realizations as realization
        where realization.revision_id = new.revision_id
          and realization.slot_id = new.slot_id
          and realization.variety_id = new.variety_id
          and realization.language_id = new.language_id
      ) then
        raise exception using
          errcode = '55000',
          message = 'structurally_impossible conflicts with an existing slot realization in the same scope';
      end if;

      if exists (
        select 1
        from linguistic.paradigm_revision_slot_claims as existing_claim
        where existing_claim.revision_id = new.revision_id
          and existing_claim.slot_id = new.slot_id
          and existing_claim.variety_id = new.variety_id
          and existing_claim.language_id = new.language_id
          and existing_claim.scope_code = 'lexeme'
          and existing_claim.claim_type_code = 'possible_unattested'
      ) then
        raise exception using
          errcode = '55000',
          message = 'structurally_impossible conflicts with a possible_unattested claim in an overlapping scope';
      end if;
    elsif new.scope_code = 'lexeme' then
      if exists (
        select 1
        from linguistic.paradigm_revision_slot_realizations as realization
        where realization.revision_id = new.revision_id
          and realization.slot_id = new.slot_id
          and realization.variety_id = new.variety_id
          and realization.language_id = new.language_id
          and realization.lexeme_id = new.lexeme_id
      ) then
        raise exception using
          errcode = '55000',
          message = 'structurally_impossible conflicts with an existing slot realization in the same scope';
      end if;
    end if;
  elsif new.claim_type_code = 'possible_unattested'
    and new.scope_code = 'lexeme'
    and exists (
      select 1
      from linguistic.paradigm_revision_slot_claims as existing_claim
      where existing_claim.revision_id = new.revision_id
        and existing_claim.slot_id = new.slot_id
        and existing_claim.variety_id = new.variety_id
        and existing_claim.language_id = new.language_id
        and existing_claim.scope_code = 'paradigm'
        and existing_claim.claim_type_code = 'structurally_impossible'
    )
  then
    raise exception using
      errcode = '55000',
      message = 'structurally_impossible conflicts with a possible_unattested claim in an overlapping scope';
  end if;

  return new;
end;
$$;

create function linguistic.validate_paradigm_slot_realization_insert()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  perform 1
  from linguistic.paradigm_revision_slots as slot
  where slot.revision_id = new.revision_id
    and slot.id = new.slot_id
    and slot.variety_id = new.variety_id
    and slot.language_id = new.language_id
  for update;

  if not found then
    raise exception using
      errcode = '23503',
      message = 'paradigm slot realization references an unknown slot context';
  end if;

  if exists (
    select 1
    from linguistic.paradigm_revision_slot_claims as existing_claim
    where existing_claim.revision_id = new.revision_id
      and existing_claim.slot_id = new.slot_id
      and existing_claim.variety_id = new.variety_id
      and existing_claim.language_id = new.language_id
      and existing_claim.claim_type_code = 'structurally_impossible'
      and (
        existing_claim.scope_code = 'paradigm'
        or (
          existing_claim.scope_code = 'lexeme'
          and existing_claim.lexeme_id = new.lexeme_id
        )
      )
  ) then
    raise exception using
      errcode = '55000',
      message = 'slot realization conflicts with a structurally_impossible claim in the same scope';
  end if;

  return new;
end;
$$;

create trigger guard_paradigms_mutation
before update or delete on linguistic.paradigms
for each row
execute function linguistic.guard_stable_subtype_mutation();

create trigger guard_paradigm_revisions_mutation
before update or delete on linguistic.paradigm_revisions
for each row
execute function linguistic.guard_revision_subtype_mutation();

create trigger guard_paradigm_revision_lexemes_snapshot
before insert or update or delete on linguistic.paradigm_revision_lexemes
for each row
execute function linguistic.guard_snapshot_child_mutation();

create trigger guard_paradigm_revision_verb_classes_snapshot
before insert or update or delete
on linguistic.paradigm_revision_verb_classes
for each row
execute function linguistic.guard_snapshot_child_mutation();

create trigger guard_paradigm_revision_slots_snapshot
before insert or update or delete on linguistic.paradigm_revision_slots
for each row
execute function linguistic.guard_snapshot_child_mutation();

create trigger guard_paradigm_revision_slot_features_snapshot
before insert or update or delete
on linguistic.paradigm_revision_slot_features
for each row
execute function linguistic.guard_snapshot_child_mutation();

create trigger guard_paradigm_slot_claim_types_mutation
before insert or update or delete on linguistic.paradigm_slot_claim_types
for each row
execute function linguistic.guard_paradigm_slot_claim_type_mutation();

create trigger guard_paradigm_revision_slot_claims_snapshot
before insert or update or delete
on linguistic.paradigm_revision_slot_claims
for each row
execute function linguistic.guard_snapshot_child_mutation();

create trigger validate_paradigm_revision_slot_claim_insert
before insert on linguistic.paradigm_revision_slot_claims
for each row
execute function linguistic.validate_paradigm_slot_claim_insert();

create trigger guard_paradigm_revision_slot_realizations_snapshot
before insert or update or delete
on linguistic.paradigm_revision_slot_realizations
for each row
execute function linguistic.guard_snapshot_child_mutation();

create trigger validate_paradigm_revision_slot_realization_insert
before insert on linguistic.paradigm_revision_slot_realizations
for each row
execute function linguistic.validate_paradigm_slot_realization_insert();

alter table linguistic.documentary_provenance_links
  add column target_paradigm_revision_lexeme_id uuid,
  add column target_paradigm_revision_verb_class_id uuid,
  add column target_paradigm_revision_slot_id uuid,
  add column target_paradigm_revision_slot_feature_id uuid,
  add column target_paradigm_revision_slot_claim_id uuid,
  add column target_paradigm_revision_slot_realization_id uuid,
  drop constraint dpl_one_target_check,
  add constraint dpl_one_target_check check (
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
      target_noun_class_pairing_id,
      target_lexeme_revision_noun_class_id,
      target_lexeme_revision_verb_class_id,
      target_paradigm_revision_lexeme_id,
      target_paradigm_revision_verb_class_id,
      target_paradigm_revision_slot_id,
      target_paradigm_revision_slot_feature_id,
      target_paradigm_revision_slot_claim_id,
      target_paradigm_revision_slot_realization_id
    ) = 1
  ),
  add constraint dpl_target_paradigm_lexeme_fkey foreign key (
    target_paradigm_revision_lexeme_id
  ) references linguistic.paradigm_revision_lexemes (id)
    on update restrict
    on delete restrict,
  add constraint dpl_target_paradigm_verb_class_fkey foreign key (
    target_paradigm_revision_verb_class_id
  ) references linguistic.paradigm_revision_verb_classes (id)
    on update restrict
    on delete restrict,
  add constraint dpl_target_paradigm_slot_fkey foreign key (
    target_paradigm_revision_slot_id
  ) references linguistic.paradigm_revision_slots (id)
    on update restrict
    on delete restrict,
  add constraint dpl_target_paradigm_slot_feature_fkey foreign key (
    target_paradigm_revision_slot_feature_id
  ) references linguistic.paradigm_revision_slot_features (id)
    on update restrict
    on delete restrict,
  add constraint dpl_target_paradigm_slot_claim_fkey foreign key (
    target_paradigm_revision_slot_claim_id
  ) references linguistic.paradigm_revision_slot_claims (id)
    on update restrict
    on delete restrict,
  add constraint dpl_target_paradigm_slot_realization_fkey foreign key (
    target_paradigm_revision_slot_realization_id
  ) references linguistic.paradigm_revision_slot_realizations (id)
    on update restrict
    on delete restrict;

create unique index dpl_paradigm_lexeme_source_uq
  on linguistic.documentary_provenance_links (
    target_paradigm_revision_lexeme_id,
    source_id,
    source_location_id
  ) nulls not distinct
  where target_paradigm_revision_lexeme_id is not null;

create unique index dpl_paradigm_verb_class_source_uq
  on linguistic.documentary_provenance_links (
    target_paradigm_revision_verb_class_id,
    source_id,
    source_location_id
  ) nulls not distinct
  where target_paradigm_revision_verb_class_id is not null;

create unique index dpl_paradigm_slot_source_uq
  on linguistic.documentary_provenance_links (
    target_paradigm_revision_slot_id,
    source_id,
    source_location_id
  ) nulls not distinct
  where target_paradigm_revision_slot_id is not null;

create unique index dpl_paradigm_slot_feature_source_uq
  on linguistic.documentary_provenance_links (
    target_paradigm_revision_slot_feature_id,
    source_id,
    source_location_id
  ) nulls not distinct
  where target_paradigm_revision_slot_feature_id is not null;

create unique index dpl_paradigm_slot_claim_source_uq
  on linguistic.documentary_provenance_links (
    target_paradigm_revision_slot_claim_id,
    source_id,
    source_location_id
  ) nulls not distinct
  where target_paradigm_revision_slot_claim_id is not null;

create unique index dpl_paradigm_slot_realization_source_uq
  on linguistic.documentary_provenance_links (
    target_paradigm_revision_slot_realization_id,
    source_id,
    source_location_id
  ) nulls not distinct
  where target_paradigm_revision_slot_realization_id is not null;

alter table linguistic.review_subjects
  add column target_paradigm_revision_lexeme_id uuid,
  add column target_paradigm_revision_verb_class_id uuid,
  add column target_paradigm_revision_slot_id uuid,
  add column target_paradigm_revision_slot_feature_id uuid,
  add column target_paradigm_revision_slot_claim_id uuid,
  add column target_paradigm_revision_slot_realization_id uuid,
  drop constraint review_subjects_one_target_check,
  add constraint review_subjects_one_target_check check (
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
      target_form_attestation_id,
      target_noun_class_pairing_id,
      target_lexeme_revision_noun_class_id,
      target_lexeme_revision_verb_class_id,
      target_paradigm_revision_lexeme_id,
      target_paradigm_revision_verb_class_id,
      target_paradigm_revision_slot_id,
      target_paradigm_revision_slot_feature_id,
      target_paradigm_revision_slot_claim_id,
      target_paradigm_revision_slot_realization_id
    ) = 1
  ),
  add constraint rs_paradigm_lexeme_fkey foreign key (
    target_paradigm_revision_lexeme_id
  ) references linguistic.paradigm_revision_lexemes (id)
    on update restrict
    on delete restrict,
  add constraint rs_paradigm_verb_class_fkey foreign key (
    target_paradigm_revision_verb_class_id
  ) references linguistic.paradigm_revision_verb_classes (id)
    on update restrict
    on delete restrict,
  add constraint rs_paradigm_slot_fkey foreign key (
    target_paradigm_revision_slot_id
  ) references linguistic.paradigm_revision_slots (id)
    on update restrict
    on delete restrict,
  add constraint rs_paradigm_slot_feature_fkey foreign key (
    target_paradigm_revision_slot_feature_id
  ) references linguistic.paradigm_revision_slot_features (id)
    on update restrict
    on delete restrict,
  add constraint rs_paradigm_slot_claim_fkey foreign key (
    target_paradigm_revision_slot_claim_id
  ) references linguistic.paradigm_revision_slot_claims (id)
    on update restrict
    on delete restrict,
  add constraint rs_paradigm_slot_realization_fkey foreign key (
    target_paradigm_revision_slot_realization_id
  ) references linguistic.paradigm_revision_slot_realizations (id)
    on update restrict
    on delete restrict;

create unique index rs_paradigm_lexeme_uidx
  on linguistic.review_subjects (target_paradigm_revision_lexeme_id)
  where target_paradigm_revision_lexeme_id is not null;

create unique index rs_paradigm_verb_class_uidx
  on linguistic.review_subjects (target_paradigm_revision_verb_class_id)
  where target_paradigm_revision_verb_class_id is not null;

create unique index rs_paradigm_slot_uidx
  on linguistic.review_subjects (target_paradigm_revision_slot_id)
  where target_paradigm_revision_slot_id is not null;

create unique index rs_paradigm_slot_feature_uidx
  on linguistic.review_subjects (target_paradigm_revision_slot_feature_id)
  where target_paradigm_revision_slot_feature_id is not null;

create unique index rs_paradigm_slot_claim_uidx
  on linguistic.review_subjects (target_paradigm_revision_slot_claim_id)
  where target_paradigm_revision_slot_claim_id is not null;

create unique index rs_paradigm_slot_realization_uidx
  on linguistic.review_subjects (target_paradigm_revision_slot_realization_id)
  where target_paradigm_revision_slot_realization_id is not null;

alter table linguistic.paradigms enable row level security;
alter table linguistic.paradigm_revisions enable row level security;
alter table linguistic.paradigm_revision_lexemes enable row level security;
alter table linguistic.paradigm_revision_verb_classes
  enable row level security;
alter table linguistic.paradigm_revision_slots enable row level security;
alter table linguistic.paradigm_revision_slot_features
  enable row level security;
alter table linguistic.paradigm_slot_claim_types
  enable row level security;
alter table linguistic.paradigm_revision_slot_claims
  enable row level security;
alter table linguistic.paradigm_revision_slot_realizations
  enable row level security;

revoke all on table
  linguistic.paradigms,
  linguistic.paradigm_revisions,
  linguistic.paradigm_revision_lexemes,
  linguistic.paradigm_revision_verb_classes,
  linguistic.paradigm_revision_slots,
  linguistic.paradigm_revision_slot_features,
  linguistic.paradigm_slot_claim_types,
  linguistic.paradigm_revision_slot_claims,
  linguistic.paradigm_revision_slot_realizations
from public, anon, authenticated, service_role;

revoke execute on function
  linguistic.assert_entity_subtype_exists(),
  linguistic.assert_revision_subtype_exists(),
  linguistic.guard_paradigm_slot_claim_type_mutation(),
  linguistic.validate_paradigm_slot_claim_insert(),
  linguistic.validate_paradigm_slot_realization_insert()
from public, anon, authenticated, service_role;

comment on table linguistic.paradigms is
  'Stable versioned Paradigm identities scoped to exactly one Variety and its language. They carry no business code, generated template, or automatic linguistic truth.';

comment on table linguistic.paradigm_revisions is
  'Immutable editorial Paradigm snapshots governed by the generic core Revision lifecycle and fixed to the stable Paradigm Variety and language.';

comment on table linguistic.paradigm_revision_lexemes is
  'Snapshot members that pin exact LexemeRevisions through exact LexemeRevision Variety assertions; membership is N:N and does not infer verbal classification.';

comment on table linguistic.paradigm_revision_verb_classes is
  'Optional snapshot members that pin exact VerbClassRevisions in exact system Revision contexts; multiple systems and classes may coexist without automatic inheritance to Lexemes.';

comment on table linguistic.paradigm_revision_slots is
  'Ordered editorial slots in a complete ParadigmRevision snapshot. A slot with no claim or realization asserts neither structural impossibility nor a documentary gap.';

comment on table linguistic.paradigm_revision_slot_features is
  'Atomic slot traits using only M6 language-scoped grammatical feature definitions and values; no parallel universal feature model or feature bundle is introduced.';

comment on table linguistic.paradigm_slot_claim_types is
  'Closed immutable structural vocabulary distinguishing positive impossibility from possible but currently unattested status; absence of a claim remains semantically neutral.';

comment on table linguistic.paradigm_revision_slot_claims is
  'Explicit paradigm- or Lexeme-scoped structural claims in a ParadigmRevision snapshot. Claims are analytical assertions, not documentary evidence, review consensus, or automatic truth.';

comment on table linguistic.paradigm_revision_slot_realizations is
  'Exact FormAnalysisRevision realizations for Paradigm slots and member Lexemes. Multiple analyses per slot preserve allomorphy, while reuse of one analysis across slots preserves syncretism without inferring either.';

comment on column linguistic.paradigms.id is
  'Stable UUID shared with the core Entity row.';

comment on column linguistic.paradigms.entity_type_code is
  'Generated paradigm discriminator for the typed Entity foreign key.';

comment on column linguistic.paradigms.variety_id is
  'Single stable Variety to which this Paradigm belongs.';

comment on column linguistic.paradigms.language_id is
  'Integrity copy of the owning Variety language for exact descendant context pins.';

comment on column linguistic.paradigm_revisions.revision_id is
  'Exact core Revision UUID represented by this typed Paradigm snapshot.';

comment on column linguistic.paradigm_revisions.entity_id is
  'Stable Paradigm identity revised by this snapshot.';

comment on column linguistic.paradigm_revisions.entity_type_code is
  'Generated paradigm discriminator for typed core Revision integrity.';

comment on column linguistic.paradigm_revisions.variety_id is
  'Integrity copy of the stable Paradigm Variety.';

comment on column linguistic.paradigm_revisions.language_id is
  'Integrity copy of the stable Paradigm language.';

comment on column linguistic.paradigm_revisions.presentation_locale_code is
  'Locale of this snapshot label and description, preserved without automatic normalization.';

comment on column linguistic.paradigm_revisions.label is
  'Human-readable editorial snapshot label rather than stable identity or a unique semantic code.';

comment on column linguistic.paradigm_revisions.description is
  'Optional editorial description of this exact Paradigm snapshot.';

comment on column linguistic.paradigm_revision_lexemes.id is
  'Snapshot-scoped lexical membership UUID and precise documentary provenance and Review target.';

comment on column linguistic.paradigm_revision_lexemes.revision_id is
  'Exact ParadigmRevision owning this lexical membership.';

comment on column linguistic.paradigm_revision_lexemes.lexeme_id is
  'Stable Lexeme identity proved by the exact LexemeRevision Variety assertion.';

comment on column linguistic.paradigm_revision_lexemes.lexeme_revision_id is
  'Exact LexemeRevision selected for this Paradigm snapshot.';

comment on column linguistic.paradigm_revision_lexemes.lexeme_revision_variety_id is
  'Exact LexemeRevision Variety assertion establishing the lexical snapshot and Variety.';

comment on column linguistic.paradigm_revision_lexemes.variety_id is
  'Integrity copy shared by the Paradigm and exact lexical Variety assertion.';

comment on column linguistic.paradigm_revision_lexemes.language_id is
  'Integrity copy shared by the Paradigm, Lexeme, and Variety contexts.';

comment on column linguistic.paradigm_revision_verb_classes.id is
  'Snapshot-scoped VerbClass membership UUID and precise documentary provenance and Review target.';

comment on column linguistic.paradigm_revision_verb_classes.revision_id is
  'Exact ParadigmRevision owning this optional VerbClass membership.';

comment on column linguistic.paradigm_revision_verb_classes.variety_id is
  'Integrity copy proving that the Paradigm, system, and class share one Variety.';

comment on column linguistic.paradigm_revision_verb_classes.language_id is
  'Integrity copy proving that the Paradigm, system, and class share one language.';

comment on column linguistic.paradigm_revision_verb_classes.verb_class_system_id is
  'Stable VerbClassSystem identity containing the selected class.';

comment on column linguistic.paradigm_revision_verb_classes.verb_class_system_revision_id is
  'Exact VerbClassSystemRevision selected by this Paradigm snapshot.';

comment on column linguistic.paradigm_revision_verb_classes.verb_class_id is
  'Stable VerbClass identity selected in the exact system context.';

comment on column linguistic.paradigm_revision_verb_classes.verb_class_revision_id is
  'Exact VerbClassRevision selected by this Paradigm snapshot.';

comment on column linguistic.paradigm_revision_slots.id is
  'Snapshot-scoped slot UUID and precise documentary provenance and Review target.';

comment on column linguistic.paradigm_revision_slots.revision_id is
  'Exact ParadigmRevision owning this editorial slot.';

comment on column linguistic.paradigm_revision_slots.variety_id is
  'Integrity copy of the owner ParadigmRevision Variety.';

comment on column linguistic.paradigm_revision_slots.language_id is
  'Integrity copy of the owner ParadigmRevision language.';

comment on column linguistic.paradigm_revision_slots.slot_order is
  'Positive explicit editorial order within one ParadigmRevision; it is not a universal grammatical dimension.';

comment on column linguistic.paradigm_revision_slots.code is
  'Case-sensitive snapshot-local slot handle preserved without automatic whitespace, case, or Unicode normalization.';

comment on column linguistic.paradigm_revision_slots.analysis_text is
  'Optional slot-local analytical note; it is not evidence, a generated template, or a structural claim.';

comment on column linguistic.paradigm_revision_slot_features.id is
  'Snapshot-scoped slot feature assertion UUID and precise documentary provenance and Review target.';

comment on column linguistic.paradigm_revision_slot_features.revision_id is
  'Exact ParadigmRevision owning this slot feature assertion.';

comment on column linguistic.paradigm_revision_slot_features.slot_id is
  'Exact same-context slot receiving this M6 grammatical feature assertion.';

comment on column linguistic.paradigm_revision_slot_features.variety_id is
  'Integrity copy of the slot and ParadigmRevision Variety.';

comment on column linguistic.paradigm_revision_slot_features.language_id is
  'Integrity copy shared by the slot and language-scoped M6 feature definition.';

comment on column linguistic.paradigm_revision_slot_features.feature_definition_id is
  'Exact immutable M6 grammatical feature definition asserted for the slot.';

comment on column linguistic.paradigm_revision_slot_features.controlled_value_id is
  'Optional exact M6 controlled value constrained to belong to feature_definition_id.';

comment on column linguistic.paradigm_revision_slot_features.raw_value_text is
  'Optional free analytical value preserved without automatic normalization and mutually exclusive with a controlled value.';

comment on column linguistic.paradigm_slot_claim_types.code is
  'Stable lowercase structural claim code; M17 seeds only structurally_impossible and possible_unattested.';

comment on column linguistic.paradigm_slot_claim_types.description is
  'Exact non-documentary meaning of the closed structural claim code.';

comment on column linguistic.paradigm_slot_claim_types.sort_order is
  'Positive unique presentation order for the closed structural vocabulary.';

comment on column linguistic.paradigm_slot_claim_types.created_at is
  'Catalog insertion timestamp for the immutable structural vocabulary row.';

comment on column linguistic.paradigm_revision_slot_claims.id is
  'Snapshot-scoped structural claim UUID and precise documentary provenance and Review target.';

comment on column linguistic.paradigm_revision_slot_claims.revision_id is
  'Exact ParadigmRevision owning this structural claim.';

comment on column linguistic.paradigm_revision_slot_claims.slot_id is
  'Exact same-context slot about which the structural claim is made.';

comment on column linguistic.paradigm_revision_slot_claims.variety_id is
  'Integrity copy of the selected slot and ParadigmRevision Variety.';

comment on column linguistic.paradigm_revision_slot_claims.language_id is
  'Integrity copy of the selected slot and ParadigmRevision language.';

comment on column linguistic.paradigm_revision_slot_claims.scope_code is
  'Closed scope selector: paradigm covers the entire slot, while lexeme covers one exact member Lexeme.';

comment on column linguistic.paradigm_revision_slot_claims.lexeme_id is
  'Required only for lexeme scope and proved to be an exact member of the same ParadigmRevision context.';

comment on column linguistic.paradigm_revision_slot_claims.claim_type_code is
  'Closed structural assertion type; no value is inferred from missing data, M12 attestations, or M14 lifecycle events.';

comment on column linguistic.paradigm_revision_slot_claims.analysis_text is
  'Optional analytical rationale that is neither Source content nor a Review decision.';

comment on column linguistic.paradigm_revision_slot_realizations.id is
  'Snapshot-scoped realization UUID and precise documentary provenance and Review target.';

comment on column linguistic.paradigm_revision_slot_realizations.revision_id is
  'Exact ParadigmRevision owning this realization assertion.';

comment on column linguistic.paradigm_revision_slot_realizations.slot_id is
  'Exact same-context slot realized by the selected FormAnalysisRevision.';

comment on column linguistic.paradigm_revision_slot_realizations.variety_id is
  'Integrity copy shared by the Paradigm member and exact FormAnalysisRevision Variety assertion.';

comment on column linguistic.paradigm_revision_slot_realizations.language_id is
  'Integrity copy shared by the Paradigm, Lexeme, and exact FormAnalysisRevision.';

comment on column linguistic.paradigm_revision_slot_realizations.lexeme_id is
  'Stable Lexeme that must be an exact member of both the ParadigmRevision and FormAnalysisRevision.';

comment on column linguistic.paradigm_revision_slot_realizations.form_analysis_revision_id is
  'Exact immutable FormAnalysisRevision realization pin; no additional direct FormRevision target is introduced.';

comment on constraint paradigms_id_context_key
on linguistic.paradigms is
  'Supports exact descendant pins to one stable Paradigm, Variety, and language context.';

comment on constraint paradigms_variety_language_fkey
on linguistic.paradigms is
  'Proves that the stable Paradigm Variety belongs to the copied language.';

comment on constraint paradigm_revisions_revision_context_key
on linguistic.paradigm_revisions is
  'Supports exact snapshot-child pins to one ParadigmRevision, Variety, and language context.';

comment on constraint paradigm_revisions_stable_context_fkey
on linguistic.paradigm_revisions is
  'Keeps every ParadigmRevision context equal to its stable Paradigm context.';

comment on constraint paradigm_revisions_presentation_locale_check
on linguistic.paradigm_revisions is
  'Requires a presentation locale of 1 to 63 characters without outer whitespace.';

comment on constraint paradigm_revisions_label_check
on linguistic.paradigm_revisions is
  'Requires a snapshot label of 1 to 240 characters without outer whitespace.';

comment on constraint paradigm_revisions_description_check
on linguistic.paradigm_revisions is
  'Allows an absent description or 1 to 4000 characters without outer whitespace.';

comment on constraint prl_member_context_key
on linguistic.paradigm_revision_lexemes is
  'Permits only one exact LexemeRevision selection per stable Lexeme in the same ParadigmRevision and Variety context.';

comment on constraint prl_lexeme_revision_variety_fkey
on linguistic.paradigm_revision_lexemes is
  'Pins membership to one exact LexemeRevision Variety row and proves its stable Lexeme, Variety, and language.';

comment on constraint prvc_exact_membership_key
on linguistic.paradigm_revision_verb_classes is
  'Forbids repetition of the same exact system Revision and class Revision membership within one ParadigmRevision context.';

comment on constraint prvc_system_revision_context_fkey
on linguistic.paradigm_revision_verb_classes is
  'Proves that the selected exact VerbClassSystemRevision belongs to the Paradigm Variety and language.';

comment on constraint prvc_class_revision_context_fkey
on linguistic.paradigm_revision_verb_classes is
  'Proves that the exact VerbClassRevision belongs to the selected exact system Revision, Variety, and language.';

comment on constraint prs_revision_slot_context_key
on linguistic.paradigm_revision_slots is
  'Provides the exact slot, ParadigmRevision, Variety, and language key used by every slot child.';

comment on constraint prs_revision_order_key
on linguistic.paradigm_revision_slots is
  'Makes each positive slot order unique within one ParadigmRevision.';

comment on constraint prs_revision_code_key
on linguistic.paradigm_revision_slots is
  'Makes each case-sensitive slot code unique within one ParadigmRevision.';

comment on constraint prs_code_check
on linguistic.paradigm_revision_slots is
  'Requires a slot code of 1 to 120 characters without outer whitespace.';

comment on constraint prs_features_value_xor_check
on linguistic.paradigm_revision_slot_features is
  'Requires exactly one controlled or free value for each atomic slot feature assertion.';

comment on index linguistic.prs_features_controlled_value_uidx is
  'Prevents exact duplicate controlled values for the same M6 feature definition on one slot while allowing different values.';

comment on index linguistic.prs_features_raw_value_uidx is
  'Prevents exact case-sensitive duplicate free values for the same M6 feature definition on one slot while allowing different values.';

comment on constraint paradigm_slot_claim_types_sort_order_key
on linguistic.paradigm_slot_claim_types is
  'Keeps the closed structural vocabulary presentation order deterministic.';

comment on constraint prsc_scope_check
on linguistic.paradigm_revision_slot_claims is
  'Enforces the exact paradigm-without-Lexeme or lexeme-with-Lexeme scope shape and rejects every other combination.';

comment on index linguistic.prsc_paradigm_scope_uidx is
  'Allows at most one claim of any structural type for the exact paradigm-wide slot scope.';

comment on index linguistic.prsc_lexeme_scope_uidx is
  'Allows at most one claim of any structural type for the exact slot and member Lexeme scope.';

comment on constraint prsc_lexeme_member_context_fkey
on linguistic.paradigm_revision_slot_claims is
  'For lexeme scope, proves that the selected Lexeme belongs to the exact ParadigmRevision, Variety, and language.';

comment on constraint prsr_exact_realization_key
on linguistic.paradigm_revision_slot_realizations is
  'Prevents repetition of the same exact slot, Lexeme, and FormAnalysisRevision realization without selecting a preferred truth.';

comment on constraint prsr_analysis_lexeme_fkey
on linguistic.paradigm_revision_slot_realizations is
  'Proves that the exact FormAnalysisRevision explicitly targets the realization Lexeme.';

comment on constraint prsr_analysis_variety_fkey
on linguistic.paradigm_revision_slot_realizations is
  'Proves that the exact FormAnalysisRevision explicitly covers the Paradigm Variety.';

comment on column linguistic.documentary_provenance_links.target_paradigm_revision_lexeme_id is
  'Exact ParadigmRevision lexical membership target; documentary support does not establish truth or alter M14 evidence lifecycle state.';

comment on column linguistic.documentary_provenance_links.target_paradigm_revision_verb_class_id is
  'Exact ParadigmRevision VerbClass membership target; documentary support does not establish truth or alter M14 evidence lifecycle state.';

comment on column linguistic.documentary_provenance_links.target_paradigm_revision_slot_id is
  'Exact ParadigmRevision slot target; documentary support does not establish truth or alter M14 evidence lifecycle state.';

comment on column linguistic.documentary_provenance_links.target_paradigm_revision_slot_feature_id is
  'Exact ParadigmRevision slot feature assertion target; documentary support remains distinct from Review and M14 retraction.';

comment on column linguistic.documentary_provenance_links.target_paradigm_revision_slot_claim_id is
  'Exact ParadigmRevision slot claim target; documentary support neither infers the claim nor makes the assertion automatically true.';

comment on column linguistic.documentary_provenance_links.target_paradigm_revision_slot_realization_id is
  'Exact ParadigmRevision slot realization target; documentary support remains separate from analytical identity and M14 evidence lifecycle.';

comment on column linguistic.review_subjects.target_paradigm_revision_lexeme_id is
  'Unique ReviewSubject target for one exact ParadigmRevision lexical membership; Review does not establish automatic truth.';

comment on column linguistic.review_subjects.target_paradigm_revision_verb_class_id is
  'Unique ReviewSubject target for one exact ParadigmRevision VerbClass membership; Review does not establish automatic truth.';

comment on column linguistic.review_subjects.target_paradigm_revision_slot_id is
  'Unique ReviewSubject target for one exact ParadigmRevision slot; Review remains independent from editorial status.';

comment on column linguistic.review_subjects.target_paradigm_revision_slot_feature_id is
  'Unique ReviewSubject target for one exact ParadigmRevision slot feature assertion; Review does not mutate the snapshot.';

comment on column linguistic.review_subjects.target_paradigm_revision_slot_claim_id is
  'Unique ReviewSubject target for one exact ParadigmRevision slot claim; Review remains distinct from M14 retraction and claim meaning.';

comment on column linguistic.review_subjects.target_paradigm_revision_slot_realization_id is
  'Unique ReviewSubject target for one exact ParadigmRevision slot realization; Review does not select a canonical or consensus realization.';

comment on constraint dpl_one_target_check
on linguistic.documentary_provenance_links is
  'Exactly one of the 31 declaratively typed documentary provenance target families must be selected.';

comment on constraint review_subjects_one_target_check
on linguistic.review_subjects is
  'Each ReviewSubject selects exactly one of the 33 declaratively typed target families.';

comment on function linguistic.assert_entity_subtype_exists() is
  'At commit, requires every supported typed Entity, including Paradigm, to have its generated stable subtype row without changing the ten historical branches.';

comment on function linguistic.assert_revision_subtype_exists() is
  'At commit, requires every supported typed core Revision, including ParadigmRevision, to have its exact revision subtype without changing the ten historical branches.';

comment on function linguistic.guard_paradigm_slot_claim_type_mutation() is
  'Rejects every insert, update, or delete after installation so the two structural slot claim types remain a closed immutable vocabulary.';

comment on function linguistic.validate_paradigm_slot_claim_insert() is
  'Locks the exact slot and serializes claim insertion against realizations and overlapping claims, preserving explicit scope semantics without inferring truth.';

comment on function linguistic.validate_paradigm_slot_realization_insert() is
  'Locks the exact slot and rejects realizations contradicted by paradigm- or Lexeme-scoped structural impossibility claims.';
