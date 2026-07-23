import type {
  AudioStatus,
  CEFRLevel,
  ContentSource,
  LearningConceptKind,
  ValidationStatus,
} from "@/src/types/learning";

export type DictionaryProvider = "local_curriculum" | "orelc";

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
  level: CEFRLevel;

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
