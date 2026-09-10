import type { PublishedDictionarySearchEntry } from "../types/publishedDictionary";

export type PublishedDictionarySearchErrorKind =
  | "auth"
  | "configuration"
  | "invalid_response"
  | "network"
  | "server"
  | "validation";

export type PublishedDictionarySearchStatus =
  | "empty"
  | "error"
  | "idle"
  | "loading"
  | "ready"
  | "scope_unavailable"
  | "session_unavailable"
  | "validation_error";

export type PublishedDictionarySearchState = {
  requestId: number;
  query: string;
  status: PublishedDictionarySearchStatus;
  entries: PublishedDictionarySearchEntry[];
  nextOffset: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  errorKind: PublishedDictionarySearchErrorKind | null;
  errorMessage: string | null;
  paginationError: string | null;
};

export type PublishedDictionarySearchAction =
  | {
      type: "reset";
      requestId: number;
      status:
        | "idle"
        | "scope_unavailable"
        | "session_unavailable"
        | "validation_error";
      query?: string;
      errorMessage?: string;
    }
  | { type: "first_started"; requestId: number; query: string }
  | {
      type: "first_succeeded";
      requestId: number;
      entries: PublishedDictionarySearchEntry[];
      pageSize: number;
    }
  | {
      type: "first_failed";
      requestId: number;
      errorKind: PublishedDictionarySearchErrorKind;
      errorMessage: string;
    }
  | { type: "next_started"; requestId: number }
  | {
      type: "next_succeeded";
      requestId: number;
      entries: PublishedDictionarySearchEntry[];
      requestedOffset: number;
      pageSize: number;
    }
  | {
      type: "next_failed";
      requestId: number;
      errorMessage: string;
    };

export const initialPublishedDictionarySearchState: PublishedDictionarySearchState = {
  requestId: 0,
  query: "",
  status: "idle",
  entries: [],
  nextOffset: 0,
  hasMore: false,
  isLoadingMore: false,
  errorKind: null,
  errorMessage: null,
  paginationError: null,
};

export function getPublishedDictionarySearchEntryKey(
  entry: PublishedDictionarySearchEntry,
): string {
  return [
    entry.lexemeId,
    entry.lexemeRevisionId,
    entry.formId,
    entry.formRevisionId,
    entry.varietyId ?? "no-variety",
  ].join(":");
}

export function mergePublishedDictionarySearchEntries(
  current: PublishedDictionarySearchEntry[],
  incoming: PublishedDictionarySearchEntry[],
): PublishedDictionarySearchEntry[] {
  const knownKeys = new Set(current.map(getPublishedDictionarySearchEntryKey));
  const merged = [...current];

  for (const entry of incoming) {
    const key = getPublishedDictionarySearchEntryKey(entry);

    if (!knownKeys.has(key)) {
      knownKeys.add(key);
      merged.push(entry);
    }
  }

  return merged;
}

export function publishedDictionarySearchReducer(
  state: PublishedDictionarySearchState,
  action: PublishedDictionarySearchAction,
): PublishedDictionarySearchState {
  if (action.type === "reset") {
    return {
      ...initialPublishedDictionarySearchState,
      requestId: action.requestId,
      query: action.query ?? "",
      status: action.status,
      errorMessage: action.errorMessage ?? null,
    };
  }

  if (action.type === "first_started") {
    return {
      ...initialPublishedDictionarySearchState,
      requestId: action.requestId,
      query: action.query,
      status: "loading",
    };
  }

  if (action.requestId !== state.requestId) {
    return state;
  }

  switch (action.type) {
    case "first_succeeded":
      return {
        ...state,
        status: action.entries.length === 0 ? "empty" : "ready",
        entries: action.entries,
        nextOffset: action.entries.length,
        hasMore: action.entries.length === action.pageSize,
        isLoadingMore: false,
        errorKind: null,
        errorMessage: null,
        paginationError: null,
      };
    case "first_failed":
      return {
        ...state,
        status: "error",
        entries: [],
        nextOffset: 0,
        hasMore: false,
        isLoadingMore: false,
        errorKind: action.errorKind,
        errorMessage: action.errorMessage,
        paginationError: null,
      };
    case "next_started":
      if (state.status !== "ready" || state.isLoadingMore || !state.hasMore) {
        return state;
      }

      return {
        ...state,
        isLoadingMore: true,
        paginationError: null,
      };
    case "next_succeeded":
      return {
        ...state,
        entries: mergePublishedDictionarySearchEntries(
          state.entries,
          action.entries,
        ),
        nextOffset: action.requestedOffset + action.entries.length,
        hasMore: action.entries.length === action.pageSize,
        isLoadingMore: false,
        paginationError: null,
      };
    case "next_failed":
      return {
        ...state,
        isLoadingMore: false,
        paginationError: action.errorMessage,
      };
    default:
      return state;
  }
}
