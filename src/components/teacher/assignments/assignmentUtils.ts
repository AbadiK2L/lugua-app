import { luguaProgramConcepts } from "@/src/components/teacher/courses/luguaProgram";
import type { TeacherAssignmentStatus } from "@/src/types/teacher";

export type DueDateParseResult = {
  isoDate?: string;
  error?: string;
  warning?: string;
};

export function getSingleParam(
  value: string | string[] | undefined,
): string | undefined {
  const singleValue = Array.isArray(value) ? value[0] : value;
  const normalizedValue = singleValue?.trim();
  return normalizedValue || undefined;
}

export function parseDueDate(value: string): DueDateParseResult {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return {};
  }

  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmedValue);
  if (!match) {
    return { error: "Utilise le format JJ/MM/AAAA." };
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return { error: "Cette date n’existe pas." };
  }

  const today = new Date();
  const todayUtc = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    12,
  );

  return {
    isoDate: date.toISOString(),
    warning:
      date.getTime() < todayUtc
        ? "Cette date est passée. Tu peux tout de même continuer."
        : undefined,
  };
}

export function formatDueDate(isoDate?: string) {
  if (!isoDate) {
    return "Aucune date limite";
  }

  const date = new Date(isoDate);
  return Number.isNaN(date.getTime())
    ? "Date indisponible"
    : new Intl.DateTimeFormat("fr-FR").format(date);
}

export function formatLocalDate(isoDate?: string) {
  if (!isoDate) {
    return "—";
  }

  const date = new Date(isoDate);
  return Number.isNaN(date.getTime())
    ? "Date indisponible"
    : new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

export function getAssignmentStatusLabel(status: TeacherAssignmentStatus) {
  if (status === "draft") {
    return "Brouillon local";
  }
  if (status === "published") {
    return "Publié localement";
  }
  return "Clôturé pour cette session";
}

export function getConceptTitle(conceptId: string) {
  return luguaProgramConcepts.find((concept) => concept.id === conceptId)?.title;
}
