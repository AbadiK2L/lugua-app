import { supabase } from "@/src/lib/supabase";
import type {
  StudentClassAssignment,
  StudentClassCourse,
} from "@/src/types/studentLearning";
import {
  mapStudentClassAssignmentRow,
  mapStudentClassCourseRow,
} from "@/src/types/studentLearning";

const CONFIGURATION_ERROR = "Configuration Supabase manquante.";
const ACCESS_ERROR = "Tu n’as pas accès au contenu de cette classe.";
const STUDENT_ACCESS_ERROR = "Accès élève requis.";
const SESSION_EXPIRED_ERROR =
  "Ta session a expiré. Connecte-toi de nouveau.";
const NETWORK_ERROR =
  "Connexion réseau impossible. Vérifie ta connexion puis réessaie.";
const GENERIC_ERROR =
  "Le contenu de cette classe est indisponible. Réessaie dans un instant.";

export class StudentLearningServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StudentLearningServiceError";
  }
}

type SupabaseErrorLike = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
  status?: number;
};

function getClient() {
  if (!supabase) {
    throw new StudentLearningServiceError(CONFIGURATION_ERROR);
  }

  return supabase;
}

function isErrorLike(error: unknown): error is SupabaseErrorLike {
  return typeof error === "object" && error !== null;
}

function mapSupabaseStudentLearningError(error: SupabaseErrorLike) {
  const message = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();
  const code = error.code?.toLowerCase() ?? "";
  const status = error.status;

  if (
    status === 401 ||
    code.includes("jwt") ||
    message.includes("jwt") ||
    message.includes("session") ||
    message.includes("not authenticated") ||
    message.includes("auth.uid")
  ) {
    return SESSION_EXPIRED_ERROR;
  }

  if (message.includes("active_class_membership_required")) {
    return ACCESS_ERROR;
  }

  if (
    message.includes("student_access_required") ||
    message.includes("student role") ||
    message.includes("role student")
  ) {
    return STUDENT_ACCESS_ERROR;
  }

  if (
    status === 403 ||
    code === "42501" ||
    message.includes("permission denied") ||
    message.includes("row-level security") ||
    message.includes("row level security")
  ) {
    return ACCESS_ERROR;
  }

  if (
    message.includes("failed to fetch") ||
    message.includes("network request failed") ||
    message.includes("networkerror") ||
    message.includes("fetch")
  ) {
    return NETWORK_ERROR;
  }

  return GENERIC_ERROR;
}

function throwIfError(error: SupabaseErrorLike | null) {
  if (error) {
    throw new StudentLearningServiceError(
      mapSupabaseStudentLearningError(error),
    );
  }
}

export function getStudentLearningServiceErrorMessage(error: unknown) {
  if (error instanceof StudentLearningServiceError) {
    return error.message;
  }

  if (!isErrorLike(error)) {
    return GENERIC_ERROR;
  }

  return mapSupabaseStudentLearningError(error);
}

export async function getMyClassCourses(
  classId: string,
): Promise<StudentClassCourse[]> {
  const client = getClient();
  const { data, error } = await client.rpc("get_my_class_courses", {
    target_class_id: classId,
  });

  throwIfError(error);

  return (data ?? []).map((row) => mapStudentClassCourseRow(row));
}

export async function getMyClassAssignments(
  classId: string,
): Promise<StudentClassAssignment[]> {
  const client = getClient();
  const { data, error } = await client.rpc("get_my_class_assignments", {
    target_class_id: classId,
  });

  throwIfError(error);

  return (data ?? []).map((row) => mapStudentClassAssignmentRow(row));
}
