export type PublishedDictionaryMatchedField = "surface" | "gloss";

export type PublishedDictionarySearchRpcRow = {
  lexeme_id: string;
  lexeme_revision_id: string;
  language_id: string;
  language_code: string;
  form_id: string;
  form_revision_id: string;
  form_modality_code: string;
  surface_text: string;
  variety_id: string | null;
  variety_code: string | null;
  gloss_type_code: string | null;
  gloss_text: string | null;
  gloss_locale_code: string | null;
  matched_field: PublishedDictionaryMatchedField;
  exact_match: boolean;
};

export type PublishedDictionarySearchEntry = {
  lexemeId: string;
  lexemeRevisionId: string;
  languageId: string;
  languageCode: string;
  formId: string;
  formRevisionId: string;
  formModalityCode: string;
  surfaceText: string;
  varietyId: string | null;
  varietyCode: string | null;
  glossTypeCode: string | null;
  glossText: string | null;
  glossLocaleCode: string | null;
  matchedField: PublishedDictionaryMatchedField;
  exactMatch: boolean;
};

export type PublishedDictionaryLanguage = {
  id: string;
  code: string;
  name: string;
  nativeName: string | null;
};

export type PublishedDictionaryVariety = {
  id: string;
  code: string;
  name: string;
  region: string | null;
};

export type PublishedDictionarySenseVariety = {
  senseVarietyId: string;
  variety: PublishedDictionaryVariety;
};

export type PublishedDictionaryGloss = {
  glossId: string;
  glossTypeCode: string;
  localeCode: string;
  glossText: string;
};

export type PublishedDictionarySense = {
  senseId: string;
  senseRevisionId: string;
  varieties: PublishedDictionarySenseVariety[];
  glosses: PublishedDictionaryGloss[];
};

export type PublishedDictionaryOrthography = {
  formOrthographyId: string;
  orthographyId: string;
  code: string;
  name: string;
  scriptCode: string;
};

export type PublishedDictionaryAnalysis = {
  formAnalysisId: string;
  formAnalysisRevisionId: string;
  lexemeAssertionId: string;
  senseAssertionId: string | null;
  senseId: string | null;
  senseRevisionId: string | null;
  varieties: PublishedDictionaryVariety[];
};

export type PublishedDictionaryForm = {
  formId: string;
  formRevisionId: string;
  modalityCode: string;
  surfaceText: string;
  varieties: PublishedDictionaryVariety[];
  orthographies: PublishedDictionaryOrthography[];
  analyses: PublishedDictionaryAnalysis[];
};

export type PublishedDictionaryClassification = {
  id: string;
  revisionId: string;
  code: string;
  labelLocaleCode: string | null;
  label: string | null;
};

export type PublishedDictionaryClassAssignment = {
  assignmentId: string;
  lexemeRevisionVarietyId: string;
  varietyId: string;
  system: PublishedDictionaryClassification;
  class: PublishedDictionaryClassification;
};

export type PublishedDictionaryNounClassPairing = {
  pairingId: string;
  varietyId: string;
  system: PublishedDictionaryClassification;
  classA: PublishedDictionaryClassification;
  classB: PublishedDictionaryClassification;
};

export type PublishedDictionaryParadigmVerbClass = {
  membershipId: string;
  system: PublishedDictionaryClassification;
  class: PublishedDictionaryClassification;
};

export type PublishedDictionaryParadigm = {
  membershipId: string;
  paradigmId: string;
  paradigmRevisionId: string;
  varietyId: string;
  labelLocaleCode: string | null;
  label: string | null;
  description: string | null;
  verbClasses: PublishedDictionaryParadigmVerbClass[];
};

export type PublishedDictionaryProvenanceTargetKind =
  | "revision"
  | "lexeme_revision_variety"
  | "sense_revision_gloss"
  | "sense_revision_variety"
  | "form_revision_variety"
  | "form_revision_orthography"
  | "form_analysis_revision_lexeme"
  | "form_analysis_revision_sense"
  | "form_analysis_revision_variety"
  | "noun_class_pairing"
  | "lexeme_revision_noun_class"
  | "lexeme_revision_verb_class"
  | "paradigm_revision_lexeme"
  | "paradigm_revision_verb_class";

export type PublishedDictionaryProvenance = {
  provenanceLinkId: string;
  targetKind: PublishedDictionaryProvenanceTargetKind;
  targetId: string;
  sourceId: string;
  sourceLabel: string;
  citationText: string;
  canonicalUri: string | null;
  publicationYear: number | null;
  sourceLocationId: string | null;
  locatorText: string | null;
  locationUri: string | null;
};

export type PublishedLexemeEntry = {
  localeCode: string;
  lexemeId: string;
  lexemeRevisionId: string;
  language: PublishedDictionaryLanguage;
  varieties: PublishedDictionaryVariety[];
  senses: PublishedDictionarySense[];
  forms: PublishedDictionaryForm[];
  nounClasses: PublishedDictionaryClassAssignment[];
  nounClassPairings: PublishedDictionaryNounClassPairing[];
  verbClasses: PublishedDictionaryClassAssignment[];
  paradigms: PublishedDictionaryParadigm[];
  provenance: PublishedDictionaryProvenance[];
};
