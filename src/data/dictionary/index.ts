import { resolveInteractiveLesson } from "@/src/data/curriculum";
import { shikomoriQuestionsA1Chapter } from "@/src/data/curriculum/shikomori/questions-a1";
import {
  getDictionaryInitial,
  sortDictionaryEntries,
  type DictionaryLetterSelection,
} from "@/src/data/dictionary/alphabet";
import type { Concept, LinguisticExample } from "@/src/types/learning";
import type {
  DictionaryEntry,
  DictionaryExample,
  DictionaryPartOfSpeech,
} from "@/src/types/dictionary";

const punctuationPattern = /[^\p{L}\p{N}]+/gu;
const diacriticPattern = /[\u0300-\u036f]/g;

export function normalizeDictionaryText(value: string) {
  return value
    .normalize("NFD")
    .replace(diacriticPattern, "")
    .toLocaleLowerCase()
    .replace(punctuationPattern, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function addUniqueMeaning(meanings: string[], candidate: string) {
  const normalizedCandidate = normalizeDictionaryText(candidate);

  if (!normalizedCandidate) {
    return;
  }

  const alreadyIncluded = meanings.some(
    (meaning) => normalizeDictionaryText(meaning) === normalizedCandidate,
  );

  if (!alreadyIncluded) {
    meanings.push(candidate);
  }
}

function getExplicitFrenchMeanings(concept: Concept) {
  const meanings: string[] = [];

  for (const usage of concept.lessonConfig?.usages ?? []) {
    addUniqueMeaning(meanings, usage.meaning);
  }

  return meanings;
}

function toDictionaryExample(
  concept: Concept,
  example: LinguisticExample,
): DictionaryExample {
  const context = example.contextId
    ? concept.contexts.find((candidate) => candidate.id === example.contextId)
    : undefined;

  return {
    id: example.id,
    targetLanguageText: example.targetLanguageText,
    frenchText: example.frenchText,
    ...(example.contextId ? { contextId: example.contextId } : {}),
    ...(context?.label ? { contextLabel: context.label } : {}),
    ...(context?.description ? { contextDescription: context.description } : {}),
  };
}

function createSearchableTerms(
  concept: Concept,
  chapterTitle: string,
  blockTitle: string,
  frenchMeanings: string[],
  examples: DictionaryExample[],
) {
  return [
    concept.key,
    ...frenchMeanings,
    ...examples.flatMap((example) => [
      example.targetLanguageText,
      example.frenchText,
      example.contextLabel ?? "",
      example.contextDescription ?? "",
    ]),
    chapterTitle,
    blockTitle,
  ];
}

function createDictionaryEntry(
  concept: Concept,
  blockTitle: string,
): DictionaryEntry {
  const chapter = shikomoriQuestionsA1Chapter;
  const frenchMeanings = getExplicitFrenchMeanings(concept);
  const examples = concept.examples.map((example) =>
    toDictionaryExample(concept, example),
  );
  const lesson = resolveInteractiveLesson(concept, chapter);

  return {
    id: concept.id,
    languageId: chapter.languageId,
    headword: concept.key,
    frenchMeanings,
    searchableTerms: createSearchableTerms(
      concept,
      chapter.title,
      blockTitle,
      frenchMeanings,
      examples,
    ),
    provider: "local_curriculum",
    conceptKind: concept.lessonConfig?.conceptKind ?? "vocabulary",
    partOfSpeech: "question_word",
    level: chapter.level,
    chapterId: chapter.id,
    chapterTitle: chapter.title,
    blockId: concept.blockId,
    blockTitle,
    ...(concept.id ? { conceptId: concept.id } : {}),
    lessonAvailable: Boolean(lesson),
    ...(concept.dialect ? { dialect: concept.dialect } : {}),
    validationStatus: concept.validationStatus,
    source: concept.source,
    audioStatus: concept.audioStatus,
    ...(concept.audioUrl ? { audioUrl: concept.audioUrl } : {}),
    ...(concept.speaker ? { speaker: concept.speaker } : {}),
    examples,
  };
}

export const dictionaryEntries: DictionaryEntry[] = sortDictionaryEntries(
  shikomoriQuestionsA1Chapter.blocks.flatMap((block) =>
    block.concepts.map((concept) => createDictionaryEntry(concept, block.title)),
  ),
);

export function getDictionaryEntryById(id: string) {
  return dictionaryEntries.find((entry) => entry.id === id);
}

export function searchDictionaryEntries(
  query: string,
  entries: DictionaryEntry[] = dictionaryEntries,
) {
  const normalizedQuery = normalizeDictionaryText(query);

  return sortDictionaryEntries(
    entries.filter((entry) => {
      if (!normalizedQuery) {
        return true;
      }

      return entry.searchableTerms.some((term) =>
        normalizeDictionaryText(term).includes(normalizedQuery),
      );
    }),
  );
}

export type DictionaryFilterInput = {
  entries: DictionaryEntry[];
  query: string;
  selectedPartsOfSpeech: DictionaryPartOfSpeech[];
  selectedLetter: DictionaryLetterSelection;
};

export function filterDictionaryEntries({
  entries,
  query,
  selectedPartsOfSpeech,
  selectedLetter,
}: DictionaryFilterInput): DictionaryEntry[] {
  const normalizedQuery = normalizeDictionaryText(query);

  return sortDictionaryEntries(
    entries.filter((entry) => {
      const matchesQuery =
        !normalizedQuery ||
        entry.searchableTerms.some((term) =>
          normalizeDictionaryText(term).includes(normalizedQuery),
        );
      const matchesPartOfSpeech =
        selectedPartsOfSpeech.length === 0 ||
        (entry.partOfSpeech !== undefined &&
          selectedPartsOfSpeech.includes(entry.partOfSpeech));
      const matchesLetter =
        selectedLetter === "all" ||
        getDictionaryInitial(entry.headword) === selectedLetter;

      return matchesQuery && matchesPartOfSpeech && matchesLetter;
    }),
  );
}
