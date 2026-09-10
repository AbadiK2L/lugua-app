import { supabase } from "@/src/lib/supabase";
import {
  mapPublishedDictionaryError,
  PublishedDictionaryServiceError,
} from "@/src/services/publishedDictionaryErrors";
import {
  parsePublishedDictionarySearchResponse,
  parseNullablePublishedLexemeEntryResponse,
  PublishedDictionaryValidationError,
} from "@/src/services/publishedDictionaryValidation";
import type {
  PublishedDictionarySearchEntry,
  PublishedLexemeEntry,
} from "@/src/types/publishedDictionary";

export const PUBLISHED_DICTIONARY_LOCALE_CODE = "fr";
export const PUBLISHED_DICTIONARY_PAGE_SIZE = 20;

export {
  getPublishedDictionaryErrorMessage,
  mapPublishedDictionaryError,
  PublishedDictionaryServiceError,
  type PublishedDictionaryServiceErrorKind,
} from "@/src/services/publishedDictionaryErrors";

export type SearchPublishedDictionaryInput = {
  query: string;
  localeCode: string;
  languageCode: string | null;
  varietyId: string | null;
  limit?: number;
  offset?: number;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LANGUAGE_CODE_PATTERN = /^[a-z][a-z0-9_-]{0,31}$/;

function getClient() {
  if (!supabase) {
    throw new PublishedDictionaryServiceError(
      "configuration",
      "Le dictionnaire publié n’est pas configuré sur cet appareil.",
    );
  }

  return supabase;
}

function validateLocaleCode(localeCode: string) {
  if (
    localeCode.length < 1 ||
    localeCode.length > 63 ||
    localeCode !== localeCode.trim()
  ) {
    throw new PublishedDictionaryServiceError(
      "validation",
      "La locale du dictionnaire est invalide.",
    );
  }
}

function validateUuid(value: string, label: string) {
  if (!UUID_PATTERN.test(value)) {
    throw new PublishedDictionaryServiceError(
      "validation",
      `${label} n’est pas un identifiant valide.`,
    );
  }
}

function invalidResponse() {
  return new PublishedDictionaryServiceError(
    "invalid_response",
    "Le dictionnaire a renvoyé des données invalides. Réessaie plus tard.",
  );
}

export async function searchPublishedDictionary(
  input: SearchPublishedDictionaryInput,
): Promise<PublishedDictionarySearchEntry[]> {
  const query = input.query.trim();
  const limit = input.limit ?? PUBLISHED_DICTIONARY_PAGE_SIZE;
  const offset = input.offset ?? 0;

  if (query.length < 1 || query.length > 200) {
    throw new PublishedDictionaryServiceError(
      "validation",
      "La recherche doit contenir entre 1 et 200 caractères.",
    );
  }

  validateLocaleCode(input.localeCode);

  if (
    input.languageCode !== null &&
    !LANGUAGE_CODE_PATTERN.test(input.languageCode)
  ) {
    throw new PublishedDictionaryServiceError(
      "validation",
      "La langue du dictionnaire est invalide.",
    );
  }

  if (input.varietyId !== null) {
    validateUuid(input.varietyId, "La variété");
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new PublishedDictionaryServiceError(
      "validation",
      "La taille de page doit être comprise entre 1 et 50.",
    );
  }

  if (!Number.isInteger(offset) || offset < 0) {
    throw new PublishedDictionaryServiceError(
      "validation",
      "La position de recherche est invalide.",
    );
  }

  const client = getClient();

  try {
    const { data, error } = await client.rpc(
      "search_published_linguistic_entries",
      {
        p_query: query,
        p_locale_code: input.localeCode,
        p_language_code: input.languageCode,
        p_variety_id: input.varietyId,
        p_limit: limit,
        p_offset: offset,
      },
    );

    if (error) {
      throw mapPublishedDictionaryError(error);
    }

    const entries = parsePublishedDictionarySearchResponse(data);

    if (entries.length > limit) {
      throw new PublishedDictionaryValidationError(
        "search",
        "received more rows than the requested limit",
      );
    }

    for (const entry of entries) {
      if (
        input.languageCode !== null &&
        entry.languageCode !== input.languageCode
      ) {
        throw new PublishedDictionaryValidationError(
          "search.language_code",
          "received a row outside the requested language",
        );
      }

      if (input.varietyId !== null && entry.varietyId !== input.varietyId) {
        throw new PublishedDictionaryValidationError(
          "search.variety_id",
          "received a row outside the requested variety",
        );
      }
    }

    return entries;
  } catch (error) {
    if (error instanceof PublishedDictionaryValidationError) {
      throw invalidResponse();
    }

    throw mapPublishedDictionaryError(error);
  }
}

export async function getPublishedLexemeEntry(
  lexemeId: string,
  localeCode: string,
): Promise<PublishedLexemeEntry | null> {
  validateUuid(lexemeId, "L’entrée");
  validateLocaleCode(localeCode);

  const client = getClient();

  try {
    const { data, error } = await client.rpc("get_published_lexeme_entry", {
      p_lexeme_id: lexemeId,
      p_locale_code: localeCode,
    });

    if (error) {
      throw mapPublishedDictionaryError(error);
    }

    const entry = parseNullablePublishedLexemeEntryResponse(data);

    if (entry === null) {
      return null;
    }

    if (
      entry.lexemeId !== lexemeId ||
      entry.localeCode.toLocaleLowerCase() !== localeCode.toLocaleLowerCase()
    ) {
      throw new PublishedDictionaryValidationError(
        "entry",
        "received a document for a different lexeme or locale",
      );
    }

    return entry;
  } catch (error) {
    if (error instanceof PublishedDictionaryValidationError) {
      throw invalidResponse();
    }

    throw mapPublishedDictionaryError(error);
  }
}
