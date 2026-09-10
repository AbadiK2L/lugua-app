export type PublishedDictionaryServiceErrorKind =
  | "auth"
  | "configuration"
  | "invalid_response"
  | "network"
  | "server"
  | "validation";

export class PublishedDictionaryServiceError extends Error {
  readonly kind: PublishedDictionaryServiceErrorKind;

  constructor(kind: PublishedDictionaryServiceErrorKind, message: string) {
    super(message);
    this.name = "PublishedDictionaryServiceError";
    this.kind = kind;
  }
}

type SupabaseErrorLike = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
  status?: number;
};

function isErrorLike(error: unknown): error is SupabaseErrorLike {
  return typeof error === "object" && error !== null;
}

export function mapPublishedDictionaryError(
  error: unknown,
): PublishedDictionaryServiceError {
  if (error instanceof PublishedDictionaryServiceError) {
    return error;
  }

  if (!isErrorLike(error)) {
    return new PublishedDictionaryServiceError(
      "server",
      "Le dictionnaire publié est momentanément indisponible.",
    );
  }

  const message =
    (error.message ?? "") +
    " " +
    (error.details ?? "") +
    " " +
    (error.hint ?? "");
  const normalizedMessage = message.toLowerCase();
  const code = error.code?.toLowerCase() ?? "";

  if (
    error.status === 401 ||
    code === "42501" ||
    code.includes("jwt") ||
    normalizedMessage.includes("jwt") ||
    normalizedMessage.includes("session") ||
    normalizedMessage.includes("authenticated non-anonymous user required")
  ) {
    return new PublishedDictionaryServiceError(
      "auth",
      "Ta session a expiré. Connecte-toi de nouveau.",
    );
  }

  if (
    normalizedMessage.includes("failed to fetch") ||
    normalizedMessage.includes("network request failed") ||
    normalizedMessage.includes("networkerror") ||
    normalizedMessage.includes("load failed") ||
    normalizedMessage.includes("fetch")
  ) {
    return new PublishedDictionaryServiceError(
      "network",
      "Connexion réseau impossible. Vérifie ta connexion puis réessaie.",
    );
  }

  return new PublishedDictionaryServiceError(
    "server",
    "Le dictionnaire publié est momentanément indisponible.",
  );
}

export function getPublishedDictionaryErrorMessage(error: unknown): string {
  return mapPublishedDictionaryError(error).message;
}
