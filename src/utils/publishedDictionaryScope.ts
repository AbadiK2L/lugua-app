import type { LanguageSelectionId } from "../components/home/LanguageSelector";

export const PUBLISHED_DICTIONARY_LOCALE = "fr";

// Add only catalogued UUIDs from a versioned configuration source. A UI variety
// code must never be assumed to be the UUID expected by the M18 search RPC.
export const PUBLISHED_DICTIONARY_VARIETY_IDS: Readonly<
  Partial<Record<Exclude<LanguageSelectionId, "shikomori">, string>>
> = {};

export type PublishedDictionaryScope =
  | {
      status: "ready";
      localeCode: string;
      languageCode: string;
      varietyId: string | null;
    }
  | {
      status: "unavailable";
      reason: "language_code_missing" | "variety_mapping_missing";
      localeCode: string;
      languageCode: string | null;
      selectedVariety: LanguageSelectionId;
    };

export function resolvePublishedDictionaryScope(
  preferredLanguage: string | null | undefined,
  selectedVariety: LanguageSelectionId,
): PublishedDictionaryScope {
  const languageCode = preferredLanguage?.trim() ?? "";

  if (!languageCode) {
    return {
      status: "unavailable",
      reason: "language_code_missing",
      localeCode: PUBLISHED_DICTIONARY_LOCALE,
      languageCode: null,
      selectedVariety,
    };
  }

  if (selectedVariety === "shikomori") {
    return {
      status: "ready",
      localeCode: PUBLISHED_DICTIONARY_LOCALE,
      languageCode,
      varietyId: null,
    };
  }

  const varietyId = PUBLISHED_DICTIONARY_VARIETY_IDS[selectedVariety];

  if (!varietyId) {
    return {
      status: "unavailable",
      reason: "variety_mapping_missing",
      localeCode: PUBLISHED_DICTIONARY_LOCALE,
      languageCode,
      selectedVariety,
    };
  }

  return {
    status: "ready",
    localeCode: PUBLISHED_DICTIONARY_LOCALE,
    languageCode,
    varietyId,
  };
}
