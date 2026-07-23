import type {
  AudioStatus,
  CEFRLevel,
  ContentSource,
  LearningConceptKind,
  ValidationStatus,
} from "@/src/types/learning";

export type DictionaryProvider = "local_curriculum" | "orelc";

export type DictionaryPartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "pronoun"
  | "preposition"
  | "conjunction"
  | "interjection"
  | "question_word"
  | "expression"
  | "other";

export type DictionaryDetailTab =
  | "definitions"
  | "synonyms"
  | "conjugation"
  | "etymology"
  | "map";

export type DictionarySynonym = {
  id: string;
  label: string;
  note?: string;
};

export type DictionaryConjugationForm = {
  label: string;
  value: string;
};

export type DictionaryConjugationGroup = {
  id: string;
  title: string;
  forms: DictionaryConjugationForm[];
};

export type DictionaryGeographicUsage = {
  id: string;
  variety: string;
  region?: string;
  status: "confirmed" | "draft";
  note?: string;
};

const dictionaryPartOfSpeechLabels: Record<DictionaryPartOfSpeech, string> = {
  noun: "Nom",
  verb: "Verbe",
  adjective: "Adjectif",
  adverb: "Adverbe",
  pronoun: "Pronom",
  preposition: "Préposition",
  conjunction: "Conjonction",
  interjection: "Interjection",
  question_word: "Mot interrogatif",
  expression: "Expression",
  other: "Autre",
};

export function getDictionaryPartOfSpeechLabel(
  partOfSpeech: DictionaryPartOfSpeech,
): string {
  return dictionaryPartOfSpeechLabels[partOfSpeech];
}

export type DictionaryExample = {
  id: string;
  targetLanguageText: string;
  frenchText: string;
  contextId?: string;
  contextLabel?: string;
  contextDescription?: string;
};

export type DictionaryEntry = {
  id: string;
  languageId: string;
  headword: string;
  frenchMeanings: string[];
  searchableTerms: string[];

  provider: DictionaryProvider;
  conceptKind: LearningConceptKind;
  partOfSpeech?: DictionaryPartOfSpeech;
  level: CEFRLevel;

  synonyms?: DictionarySynonym[];
  etymology?: string;
  conjugation?: DictionaryConjugationGroup[];
  geographicUsage?: DictionaryGeographicUsage[];

  chapterId: string;
  chapterTitle: string;
  blockId: string;
  blockTitle: string;

  conceptId?: string;
  lessonAvailable: boolean;

  dialect?: string;
  validationStatus: ValidationStatus;
  source: ContentSource;

  audioStatus: AudioStatus;
  audioUrl?: string;
  speaker?: string;

  examples: DictionaryExample[];
};
