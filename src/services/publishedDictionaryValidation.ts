import type {
  PublishedDictionaryAnalysis,
  PublishedDictionaryClassAssignment,
  PublishedDictionaryClassification,
  PublishedDictionaryForm,
  PublishedDictionaryGloss,
  PublishedDictionaryNounClassPairing,
  PublishedDictionaryOrthography,
  PublishedDictionaryParadigm,
  PublishedDictionaryParadigmVerbClass,
  PublishedDictionaryProvenance,
  PublishedDictionaryProvenanceTargetKind,
  PublishedDictionarySearchEntry,
  PublishedDictionarySense,
  PublishedDictionarySenseVariety,
  PublishedDictionaryVariety,
  PublishedLexemeEntry,
} from "../types/publishedDictionary";

type JsonObject = Record<string, unknown>;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PROVENANCE_TARGET_KINDS = new Set<PublishedDictionaryProvenanceTargetKind>([
  "revision",
  "lexeme_revision_variety",
  "sense_revision_gloss",
  "sense_revision_variety",
  "form_revision_variety",
  "form_revision_orthography",
  "form_analysis_revision_lexeme",
  "form_analysis_revision_sense",
  "form_analysis_revision_variety",
  "noun_class_pairing",
  "lexeme_revision_noun_class",
  "lexeme_revision_verb_class",
  "paradigm_revision_lexeme",
  "paradigm_revision_verb_class",
]);

export class PublishedDictionaryValidationError extends Error {
  constructor(path: string, expectation: string) {
    super(`Invalid published dictionary response at ${path}: ${expectation}.`);
    this.name = "PublishedDictionaryValidationError";
  }
}

function expectObject(
  value: unknown,
  path: string,
  expectedKeys: readonly string[],
): JsonObject {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new PublishedDictionaryValidationError(path, "expected an object");
  }

  const object = value as JsonObject;
  const actualKeys = Object.keys(object).sort();
  const sortedExpectedKeys = [...expectedKeys].sort();

  if (
    actualKeys.length !== sortedExpectedKeys.length ||
    actualKeys.some((key, index) => key !== sortedExpectedKeys[index])
  ) {
    throw new PublishedDictionaryValidationError(
      path,
      `expected exactly the keys ${sortedExpectedKeys.join(", ")}`,
    );
  }

  return object;
}

function expectArray(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new PublishedDictionaryValidationError(path, "expected an array");
  }

  return value;
}

function expectString(value: unknown, path: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new PublishedDictionaryValidationError(
      path,
      "expected a non-empty string",
    );
  }

  return value;
}

function expectNullableString(value: unknown, path: string): string | null {
  if (value === null) {
    return null;
  }

  return expectString(value, path);
}

function expectUuid(value: unknown, path: string): string {
  const result = expectString(value, path);

  if (!UUID_PATTERN.test(result)) {
    throw new PublishedDictionaryValidationError(path, "expected a UUID");
  }

  return result;
}

function expectNullableUuid(value: unknown, path: string): string | null {
  if (value === null) {
    return null;
  }

  return expectUuid(value, path);
}

function expectBoolean(value: unknown, path: string): boolean {
  if (typeof value !== "boolean") {
    throw new PublishedDictionaryValidationError(path, "expected a boolean");
  }

  return value;
}

function expectNullableInteger(value: unknown, path: string): number | null {
  if (value === null) {
    return null;
  }

  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new PublishedDictionaryValidationError(path, "expected an integer");
  }

  return value;
}

function expectNullablePair(
  left: unknown,
  right: unknown,
  path: string,
): void {
  if ((left === null) !== (right === null)) {
    throw new PublishedDictionaryValidationError(
      path,
      "expected both related values to be null or both to be present",
    );
  }
}

function parseVariety(value: unknown, path: string): PublishedDictionaryVariety {
  const object = expectObject(value, path, ["id", "code", "name", "region"]);

  return {
    id: expectUuid(object.id, `${path}.id`),
    code: expectString(object.code, `${path}.code`),
    name: expectString(object.name, `${path}.name`),
    region: expectNullableString(object.region, `${path}.region`),
  };
}

function parseSenseVariety(
  value: unknown,
  path: string,
): PublishedDictionarySenseVariety {
  const object = expectObject(value, path, ["sense_variety_id", "variety"]);

  return {
    senseVarietyId: expectUuid(
      object.sense_variety_id,
      `${path}.sense_variety_id`,
    ),
    variety: parseVariety(object.variety, `${path}.variety`),
  };
}

function parseGloss(value: unknown, path: string): PublishedDictionaryGloss {
  const object = expectObject(value, path, [
    "gloss_id",
    "gloss_type_code",
    "locale_code",
    "gloss_text",
  ]);

  return {
    glossId: expectUuid(object.gloss_id, `${path}.gloss_id`),
    glossTypeCode: expectString(
      object.gloss_type_code,
      `${path}.gloss_type_code`,
    ),
    localeCode: expectString(object.locale_code, `${path}.locale_code`),
    glossText: expectString(object.gloss_text, `${path}.gloss_text`),
  };
}

function parseSense(value: unknown, path: string): PublishedDictionarySense {
  const object = expectObject(value, path, [
    "sense_id",
    "sense_revision_id",
    "varieties",
    "glosses",
  ]);

  return {
    senseId: expectUuid(object.sense_id, `${path}.sense_id`),
    senseRevisionId: expectUuid(
      object.sense_revision_id,
      `${path}.sense_revision_id`,
    ),
    varieties: expectArray(object.varieties, `${path}.varieties`).map(
      (item, index) => parseSenseVariety(item, `${path}.varieties[${index}]`),
    ),
    glosses: expectArray(object.glosses, `${path}.glosses`).map((item, index) =>
      parseGloss(item, `${path}.glosses[${index}]`),
    ),
  };
}

function parseOrthography(
  value: unknown,
  path: string,
): PublishedDictionaryOrthography {
  const object = expectObject(value, path, [
    "form_orthography_id",
    "orthography_id",
    "code",
    "name",
    "script_code",
  ]);

  return {
    formOrthographyId: expectUuid(
      object.form_orthography_id,
      `${path}.form_orthography_id`,
    ),
    orthographyId: expectUuid(object.orthography_id, `${path}.orthography_id`),
    code: expectString(object.code, `${path}.code`),
    name: expectString(object.name, `${path}.name`),
    scriptCode: expectString(object.script_code, `${path}.script_code`),
  };
}

function parseAnalysis(
  value: unknown,
  path: string,
): PublishedDictionaryAnalysis {
  const object = expectObject(value, path, [
    "form_analysis_id",
    "form_analysis_revision_id",
    "lexeme_assertion_id",
    "sense_assertion_id",
    "sense_id",
    "sense_revision_id",
    "varieties",
  ]);
  const senseAssertionId = expectNullableUuid(
    object.sense_assertion_id,
    `${path}.sense_assertion_id`,
  );
  const senseId = expectNullableUuid(object.sense_id, `${path}.sense_id`);
  const senseRevisionId = expectNullableUuid(
    object.sense_revision_id,
    `${path}.sense_revision_id`,
  );
  const nullableSenseValues = [senseAssertionId, senseId, senseRevisionId];

  if (
    nullableSenseValues.some((item) => item === null) &&
    nullableSenseValues.some((item) => item !== null)
  ) {
    throw new PublishedDictionaryValidationError(
      path,
      "expected all sense assertion fields to be null or all to be present",
    );
  }

  return {
    formAnalysisId: expectUuid(
      object.form_analysis_id,
      `${path}.form_analysis_id`,
    ),
    formAnalysisRevisionId: expectUuid(
      object.form_analysis_revision_id,
      `${path}.form_analysis_revision_id`,
    ),
    lexemeAssertionId: expectUuid(
      object.lexeme_assertion_id,
      `${path}.lexeme_assertion_id`,
    ),
    senseAssertionId,
    senseId,
    senseRevisionId,
    varieties: expectArray(object.varieties, `${path}.varieties`).map(
      (item, index) => parseVariety(item, `${path}.varieties[${index}]`),
    ),
  };
}

function parseForm(value: unknown, path: string): PublishedDictionaryForm {
  const object = expectObject(value, path, [
    "form_id",
    "form_revision_id",
    "modality_code",
    "surface_text",
    "varieties",
    "orthographies",
    "analyses",
  ]);

  return {
    formId: expectUuid(object.form_id, `${path}.form_id`),
    formRevisionId: expectUuid(
      object.form_revision_id,
      `${path}.form_revision_id`,
    ),
    modalityCode: expectString(object.modality_code, `${path}.modality_code`),
    surfaceText: expectString(object.surface_text, `${path}.surface_text`),
    varieties: expectArray(object.varieties, `${path}.varieties`).map(
      (item, index) => parseVariety(item, `${path}.varieties[${index}]`),
    ),
    orthographies: expectArray(
      object.orthographies,
      `${path}.orthographies`,
    ).map((item, index) =>
      parseOrthography(item, `${path}.orthographies[${index}]`),
    ),
    analyses: expectArray(object.analyses, `${path}.analyses`).map(
      (item, index) => parseAnalysis(item, `${path}.analyses[${index}]`),
    ),
  };
}

function parseClassification(
  value: unknown,
  path: string,
): PublishedDictionaryClassification {
  const object = expectObject(value, path, [
    "id",
    "revision_id",
    "code",
    "label_locale_code",
    "label",
  ]);
  expectNullablePair(
    object.label_locale_code,
    object.label,
    `${path}.label_locale_code/label`,
  );

  return {
    id: expectUuid(object.id, `${path}.id`),
    revisionId: expectUuid(object.revision_id, `${path}.revision_id`),
    code: expectString(object.code, `${path}.code`),
    labelLocaleCode: expectNullableString(
      object.label_locale_code,
      `${path}.label_locale_code`,
    ),
    label: expectNullableString(object.label, `${path}.label`),
  };
}

function parseClassAssignment(
  value: unknown,
  path: string,
): PublishedDictionaryClassAssignment {
  const object = expectObject(value, path, [
    "assignment_id",
    "lexeme_revision_variety_id",
    "variety_id",
    "system",
    "class",
  ]);

  return {
    assignmentId: expectUuid(object.assignment_id, `${path}.assignment_id`),
    lexemeRevisionVarietyId: expectUuid(
      object.lexeme_revision_variety_id,
      `${path}.lexeme_revision_variety_id`,
    ),
    varietyId: expectUuid(object.variety_id, `${path}.variety_id`),
    system: parseClassification(object.system, `${path}.system`),
    class: parseClassification(object.class, `${path}.class`),
  };
}

function parseNounClassPairing(
  value: unknown,
  path: string,
): PublishedDictionaryNounClassPairing {
  const object = expectObject(value, path, [
    "pairing_id",
    "variety_id",
    "system",
    "class_a",
    "class_b",
  ]);

  return {
    pairingId: expectUuid(object.pairing_id, `${path}.pairing_id`),
    varietyId: expectUuid(object.variety_id, `${path}.variety_id`),
    system: parseClassification(object.system, `${path}.system`),
    classA: parseClassification(object.class_a, `${path}.class_a`),
    classB: parseClassification(object.class_b, `${path}.class_b`),
  };
}

function parseParadigmVerbClass(
  value: unknown,
  path: string,
): PublishedDictionaryParadigmVerbClass {
  const object = expectObject(value, path, ["membership_id", "system", "class"]);

  return {
    membershipId: expectUuid(object.membership_id, `${path}.membership_id`),
    system: parseClassification(object.system, `${path}.system`),
    class: parseClassification(object.class, `${path}.class`),
  };
}

function parseParadigm(
  value: unknown,
  path: string,
): PublishedDictionaryParadigm {
  const object = expectObject(value, path, [
    "membership_id",
    "paradigm_id",
    "paradigm_revision_id",
    "variety_id",
    "label_locale_code",
    "label",
    "description",
    "verb_classes",
  ]);
  expectNullablePair(
    object.label_locale_code,
    object.label,
    `${path}.label_locale_code/label`,
  );

  return {
    membershipId: expectUuid(object.membership_id, `${path}.membership_id`),
    paradigmId: expectUuid(object.paradigm_id, `${path}.paradigm_id`),
    paradigmRevisionId: expectUuid(
      object.paradigm_revision_id,
      `${path}.paradigm_revision_id`,
    ),
    varietyId: expectUuid(object.variety_id, `${path}.variety_id`),
    labelLocaleCode: expectNullableString(
      object.label_locale_code,
      `${path}.label_locale_code`,
    ),
    label: expectNullableString(object.label, `${path}.label`),
    description: expectNullableString(object.description, `${path}.description`),
    verbClasses: expectArray(
      object.verb_classes,
      `${path}.verb_classes`,
    ).map((item, index) =>
      parseParadigmVerbClass(item, `${path}.verb_classes[${index}]`),
    ),
  };
}

function parseProvenance(
  value: unknown,
  path: string,
): PublishedDictionaryProvenance {
  const object = expectObject(value, path, [
    "provenance_link_id",
    "target_kind",
    "target_id",
    "source_id",
    "source_label",
    "citation_text",
    "canonical_uri",
    "publication_year",
    "source_location_id",
    "locator_text",
    "location_uri",
  ]);
  const targetKind = expectString(object.target_kind, `${path}.target_kind`);

  if (!PROVENANCE_TARGET_KINDS.has(targetKind as PublishedDictionaryProvenanceTargetKind)) {
    throw new PublishedDictionaryValidationError(
      `${path}.target_kind`,
      "expected a supported provenance target kind",
    );
  }

  const sourceLocationId = expectNullableUuid(
    object.source_location_id,
    `${path}.source_location_id`,
  );
  const locatorText = expectNullableString(
    object.locator_text,
    `${path}.locator_text`,
  );

  if ((sourceLocationId === null) !== (locatorText === null)) {
    throw new PublishedDictionaryValidationError(
      path,
      "expected a source location id and locator text together",
    );
  }

  return {
    provenanceLinkId: expectUuid(
      object.provenance_link_id,
      `${path}.provenance_link_id`,
    ),
    targetKind: targetKind as PublishedDictionaryProvenanceTargetKind,
    targetId: expectUuid(object.target_id, `${path}.target_id`),
    sourceId: expectUuid(object.source_id, `${path}.source_id`),
    sourceLabel: expectString(object.source_label, `${path}.source_label`),
    citationText: expectString(object.citation_text, `${path}.citation_text`),
    canonicalUri: expectNullableString(
      object.canonical_uri,
      `${path}.canonical_uri`,
    ),
    publicationYear: expectNullableInteger(
      object.publication_year,
      `${path}.publication_year`,
    ),
    sourceLocationId,
    locatorText,
    locationUri: expectNullableString(
      object.location_uri,
      `${path}.location_uri`,
    ),
  };
}

export function parsePublishedDictionarySearchResponse(
  value: unknown,
): PublishedDictionarySearchEntry[] {
  return expectArray(value, "search").map((item, index) => {
    const path = `search[${index}]`;
    const object = expectObject(item, path, [
      "lexeme_id",
      "lexeme_revision_id",
      "language_id",
      "language_code",
      "form_id",
      "form_revision_id",
      "form_modality_code",
      "surface_text",
      "variety_id",
      "variety_code",
      "gloss_type_code",
      "gloss_text",
      "gloss_locale_code",
      "matched_field",
      "exact_match",
    ]);
    const varietyId = expectNullableUuid(object.variety_id, `${path}.variety_id`);
    const varietyCode = expectNullableString(
      object.variety_code,
      `${path}.variety_code`,
    );
    expectNullablePair(varietyId, varietyCode, `${path}.variety`);

    const glossTypeCode = expectNullableString(
      object.gloss_type_code,
      `${path}.gloss_type_code`,
    );
    const glossText = expectNullableString(object.gloss_text, `${path}.gloss_text`);
    const glossLocaleCode = expectNullableString(
      object.gloss_locale_code,
      `${path}.gloss_locale_code`,
    );
    const nullableGlossValues = [glossTypeCode, glossText, glossLocaleCode];

    if (
      nullableGlossValues.some((itemValue) => itemValue === null) &&
      nullableGlossValues.some((itemValue) => itemValue !== null)
    ) {
      throw new PublishedDictionaryValidationError(
        `${path}.gloss`,
        "expected all gloss fields to be null or all to be present",
      );
    }

    const matchedField = expectString(
      object.matched_field,
      `${path}.matched_field`,
    );

    if (matchedField !== "surface" && matchedField !== "gloss") {
      throw new PublishedDictionaryValidationError(
        `${path}.matched_field`,
        "expected surface or gloss",
      );
    }

    if (matchedField === "gloss" && glossText === null) {
      throw new PublishedDictionaryValidationError(
        `${path}.gloss`,
        "expected gloss data for a gloss match",
      );
    }

    return {
      lexemeId: expectUuid(object.lexeme_id, `${path}.lexeme_id`),
      lexemeRevisionId: expectUuid(
        object.lexeme_revision_id,
        `${path}.lexeme_revision_id`,
      ),
      languageId: expectUuid(object.language_id, `${path}.language_id`),
      languageCode: expectString(object.language_code, `${path}.language_code`),
      formId: expectUuid(object.form_id, `${path}.form_id`),
      formRevisionId: expectUuid(
        object.form_revision_id,
        `${path}.form_revision_id`,
      ),
      formModalityCode: expectString(
        object.form_modality_code,
        `${path}.form_modality_code`,
      ),
      surfaceText: expectString(object.surface_text, `${path}.surface_text`),
      varietyId,
      varietyCode,
      glossTypeCode,
      glossText,
      glossLocaleCode,
      matchedField,
      exactMatch: expectBoolean(object.exact_match, `${path}.exact_match`),
    };
  });
}

export function parsePublishedLexemeEntryResponse(
  value: unknown,
): PublishedLexemeEntry {
  const object = expectObject(value, "entry", [
    "locale_code",
    "lexeme_id",
    "lexeme_revision_id",
    "language",
    "varieties",
    "senses",
    "forms",
    "noun_classes",
    "noun_class_pairings",
    "verb_classes",
    "paradigms",
    "provenance",
  ]);
  const language = expectObject(object.language, "entry.language", [
    "id",
    "code",
    "name",
    "native_name",
  ]);

  return {
    localeCode: expectString(object.locale_code, "entry.locale_code"),
    lexemeId: expectUuid(object.lexeme_id, "entry.lexeme_id"),
    lexemeRevisionId: expectUuid(
      object.lexeme_revision_id,
      "entry.lexeme_revision_id",
    ),
    language: {
      id: expectUuid(language.id, "entry.language.id"),
      code: expectString(language.code, "entry.language.code"),
      name: expectString(language.name, "entry.language.name"),
      nativeName: expectNullableString(
        language.native_name,
        "entry.language.native_name",
      ),
    },
    varieties: expectArray(object.varieties, "entry.varieties").map(
      (item, index) => parseVariety(item, `entry.varieties[${index}]`),
    ),
    senses: expectArray(object.senses, "entry.senses").map((item, index) =>
      parseSense(item, `entry.senses[${index}]`),
    ),
    forms: expectArray(object.forms, "entry.forms").map((item, index) =>
      parseForm(item, `entry.forms[${index}]`),
    ),
    nounClasses: expectArray(object.noun_classes, "entry.noun_classes").map(
      (item, index) =>
        parseClassAssignment(item, `entry.noun_classes[${index}]`),
    ),
    nounClassPairings: expectArray(
      object.noun_class_pairings,
      "entry.noun_class_pairings",
    ).map((item, index) =>
      parseNounClassPairing(item, `entry.noun_class_pairings[${index}]`),
    ),
    verbClasses: expectArray(object.verb_classes, "entry.verb_classes").map(
      (item, index) =>
        parseClassAssignment(item, `entry.verb_classes[${index}]`),
    ),
    paradigms: expectArray(object.paradigms, "entry.paradigms").map(
      (item, index) => parseParadigm(item, `entry.paradigms[${index}]`),
    ),
    provenance: expectArray(object.provenance, "entry.provenance").map(
      (item, index) => parseProvenance(item, `entry.provenance[${index}]`),
    ),
  };
}

export function parseNullablePublishedLexemeEntryResponse(
  value: unknown,
): PublishedLexemeEntry | null {
  if (value === null) {
    return null;
  }

  return parsePublishedLexemeEntryResponse(value);
}
