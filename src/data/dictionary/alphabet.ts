import type { DictionaryEntry } from "@/src/types/dictionary";

export const SHIKOMORI_ALPHABET = [
  "A",
  "B",
  "Ɓ",
  "C",
  "D",
  "Ɗ",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "Y",
  "Z",
] as const;

export type ShikomoriAlphabetLetter = (typeof SHIKOMORI_ALPHABET)[number];
export type DictionaryLetterSelection = "all" | ShikomoriAlphabetLetter;

const alphabetPositions = new Map<ShikomoriAlphabetLetter, number>(
  SHIKOMORI_ALPHABET.map((letter, index) => [letter, index]),
);

export function normalizeDictionaryLetter(value: string): string {
  return value.trim().toLocaleUpperCase();
}

export function getDictionaryInitial(
  value: string,
): ShikomoriAlphabetLetter | "OTHER" {
  const initial = normalizeDictionaryLetter(value).charAt(0);

  return alphabetPositions.has(initial as ShikomoriAlphabetLetter)
    ? (initial as ShikomoriAlphabetLetter)
    : "OTHER";
}

export function compareShikomoriHeadwords(
  left: DictionaryEntry,
  right: DictionaryEntry,
): number {
  const leftInitial = getDictionaryInitial(left.headword);
  const rightInitial = getDictionaryInitial(right.headword);
  const leftPosition =
    leftInitial === "OTHER"
      ? SHIKOMORI_ALPHABET.length
      : alphabetPositions.get(leftInitial) ?? SHIKOMORI_ALPHABET.length;
  const rightPosition =
    rightInitial === "OTHER"
      ? SHIKOMORI_ALPHABET.length
      : alphabetPositions.get(rightInitial) ?? SHIKOMORI_ALPHABET.length;

  if (leftPosition !== rightPosition) {
    return leftPosition - rightPosition;
  }

  const normalizedLeft = normalizeDictionaryLetter(left.headword);
  const normalizedRight = normalizeDictionaryLetter(right.headword);
  const secondaryComparison = normalizedLeft.localeCompare(
    normalizedRight,
    "fr",
    { sensitivity: "base" },
  );

  return secondaryComparison || left.headword.localeCompare(right.headword, "fr");
}

export function sortDictionaryEntries(
  entries: DictionaryEntry[],
): DictionaryEntry[] {
  return [...entries].sort(compareShikomoriHeadwords);
}

export type DictionarySection = {
  title: ShikomoriAlphabetLetter | "OTHER";
  data: DictionaryEntry[];
};

export function groupDictionaryEntriesByInitial(
  entries: DictionaryEntry[],
): DictionarySection[] {
  const groupedEntries = new Map<
    ShikomoriAlphabetLetter | "OTHER",
    DictionaryEntry[]
  >();

  for (const entry of sortDictionaryEntries(entries)) {
    const initial = getDictionaryInitial(entry.headword);
    const currentEntries = groupedEntries.get(initial) ?? [];
    currentEntries.push(entry);
    groupedEntries.set(initial, currentEntries);
  }

  return [
    ...SHIKOMORI_ALPHABET,
    "OTHER" as const,
  ].flatMap((title) => {
    const data = groupedEntries.get(title);
    return data?.length ? [{ title, data }] : [];
  });
}
