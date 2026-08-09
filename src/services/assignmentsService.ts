import { supabase } from "@/src/lib/supabase";
import type {
  CreateTeacherAssignmentInput,
  PublishAssignmentFailureReason,
  TeacherAssignment,
  TeacherAssignmentInsertRow,
  TeacherAssignmentUpdateRow,
  UpdateTeacherAssignmentInput,
} from "@/src/types/assignments";
import { mapTeacherAssignmentRow } from "@/src/types/assignments";

const ASSIGNMENT_COLUMNS =
  "id, teacher_id, class_id, course_id, title, instructions, selected_concept_ids, due_date, status, created_at, updated_at, published_at, closed_at";
const TITLE_MAX_LENGTH = 160;
const CONFIGURATION_ERROR = "Configuration Supabase manquante.";
const SESSION_EXPIRED_ERROR =
  "Ta session a expiré. Connecte-toi de nouveau.";
const TEACHER_ACCESS_ERROR =
  "Accès professeur requis pour cette action.";
const ASSIGNMENT_NOT_FOUND_ERROR = "Devoir introuvable.";
const CLASS_NOT_FOUND_ERROR = "Classe introuvable.";
const CLASS_ARCHIVED_ERROR =
  "La classe liée est archivée. Restaure-la ou choisis une autre classe.";
const COURSE_NOT_FOUND_ERROR = "Cours introuvable.";
const ACCESS_DENIED_ERROR =
  "Tu n’as pas accès à ce devoir, cette classe ou ce cours.";
const INVALID_STATUS_ERROR =
  "L’état actuel du devoir ne permet pas cette action.";
const INVALID_TITLE_ERROR =
  "Le titre doit contenir entre 1 et 160 caractères.";
const NETWORK_ERROR =
  "Connexion réseau impossible. Vérifie ta connexion puis réessaie.";
const GENERIC_ERROR =
  "L’action n’a pas abouti. Vérifie ta connexion puis réessaie.";

type SupabaseErrorLike = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
  status?: number;
};

type CreateTeacherAssignmentServiceInput = Omit<
  CreateTeacherAssignmentInput,
  "status"
> & {
  teacherId: string;
};

type MappedAssignmentsError = {
  message: string;
  reason: PublishAssignmentFailureReason;
};

export class AssignmentsServiceError extends Error {
  reason: PublishAssignmentFailureReason;

  constructor(
    message: string,
    reason: PublishAssignmentFailureReason = "unknown_error",
  ) {
    super(message);
    this.name = "AssignmentsServiceError";
    this.reason = reason;
  }
}

function getClient() {
  if (!supabase) {
    throw new AssignmentsServiceError(CONFIGURATION_ERROR, "access_denied");
  }

  return supabase;
}

function isErrorLike(error: unknown): error is SupabaseErrorLike {
  return typeof error === "object" && error !== null;
}

function hasOwn<T extends object>(value: T, key: PropertyKey) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function normalizeTitle(value: string) {
  const normalized = value.trim();

  if (!normalized || [...normalized].length > TITLE_MAX_LENGTH) {
    throw new AssignmentsServiceError(INVALID_TITLE_ERROR, "missing_title");
  }

  return normalized;
}

function normalizeInstructions(value?: string) {
  return value?.trim() ?? "";
}

function normalizeOptionalId(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeTextArray(values?: string[]) {
  return [...new Set((values ?? []).map((value) => value.trim()).filter(Boolean))];
}

function mapSupabaseAssignmentsError(
  error: SupabaseErrorLike,
): MappedAssignmentsError {
  const message =
    `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();
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
    return { message: SESSION_EXPIRED_ERROR, reason: "access_denied" };
  }

  if (
    message.includes("teacher_assignments_title_check") ||
    (code === "23514" && message.includes("title")) ||
    message.includes("title") && message.includes("invalid")
  ) {
    return { message: INVALID_TITLE_ERROR, reason: "missing_title" };
  }

  if (
    status === 404 ||
    code === "pgrst116" ||
    message.includes("assignment not found") ||
    message.includes("devoir introuvable")
  ) {
    return {
      message: ASSIGNMENT_NOT_FOUND_ERROR,
      reason: "assignment_not_found",
    };
  }

  if (message.includes("class archived")) {
    return { message: CLASS_ARCHIVED_ERROR, reason: "class_archived" };
  }

  if (message.includes("class not found")) {
    return { message: CLASS_NOT_FOUND_ERROR, reason: "class_not_found" };
  }

  if (message.includes("course not found")) {
    return { message: COURSE_NOT_FOUND_ERROR, reason: "unknown_error" };
  }

  if (message.includes("invalid assignment status")) {
    return { message: INVALID_STATUS_ERROR, reason: "invalid_status" };
  }

  if (
    status === 403 ||
    code === "42501" ||
    message.includes("access denied") ||
    message.includes("permission denied") ||
    message.includes("row-level security") ||
    message.includes("row level security") ||
    message.includes("not authorized")
  ) {
    return { message: ACCESS_DENIED_ERROR, reason: "access_denied" };
  }

  if (
    message.includes("teacher access required") ||
    message.includes("role teacher") ||
    message.includes("professeur requis")
  ) {
    return { message: TEACHER_ACCESS_ERROR, reason: "access_denied" };
  }

  if (
    message.includes("failed to fetch") ||
    message.includes("network request failed") ||
    message.includes("networkerror") ||
    message.includes("fetch")
  ) {
    return { message: NETWORK_ERROR, reason: "network_error" };
  }

  return { message: GENERIC_ERROR, reason: "unknown_error" };
}

function throwIfError(error: SupabaseErrorLike | null) {
  if (!error) {
    return;
  }

  const mappedError = mapSupabaseAssignmentsError(error);
  throw new AssignmentsServiceError(mappedError.message, mappedError.reason);
}

export function getAssignmentsServiceErrorMessage(error: unknown) {
  if (error instanceof AssignmentsServiceError) {
    return error.message;
  }

  if (!isErrorLike(error)) {
    return GENERIC_ERROR;
  }

  return mapSupabaseAssignmentsError(error).message;
}

export function getAssignmentsServiceFailureReason(
  error: unknown,
): PublishAssignmentFailureReason {
  if (error instanceof AssignmentsServiceError) {
    return error.reason;
  }

  if (!isErrorLike(error)) {
    return "unknown_error";
  }

  return mapSupabaseAssignmentsError(error).reason;
}

export async function listTeacherAssignments(
  teacherId: string,
): Promise<TeacherAssignment[]> {
  const client = getClient();
  const { data, error } = await client
    .from("teacher_assignments")
    .select(ASSIGNMENT_COLUMNS)
    .eq("teacher_id", teacherId)
    .order("updated_at", { ascending: false });

  throwIfError(error);

  return (data ?? []).map((row) => mapTeacherAssignmentRow(row));
}

export async function getTeacherAssignment(
  assignmentId: string,
): Promise<TeacherAssignment> {
  const client = getClient();
  const { data, error } = await client
    .from("teacher_assignments")
    .select(ASSIGNMENT_COLUMNS)
    .eq("id", assignmentId)
    .single();

  throwIfError(error);

  if (!data) {
    throw new AssignmentsServiceError(
      ASSIGNMENT_NOT_FOUND_ERROR,
      "assignment_not_found",
    );
  }

  return mapTeacherAssignmentRow(data);
}

export async function createTeacherAssignment(
  input: CreateTeacherAssignmentServiceInput,
): Promise<TeacherAssignment> {
  const client = getClient();
  const payload: TeacherAssignmentInsertRow = {
    teacher_id: input.teacherId,
    class_id: input.classId,
    course_id: normalizeOptionalId(input.courseDraftId),
    title: normalizeTitle(input.title),
    instructions: normalizeInstructions(input.instructions),
    selected_concept_ids: normalizeTextArray(input.selectedConceptIds),
    due_date: input.dueDate ?? null,
    status: "draft",
  };
  const { data, error } = await client
    .from("teacher_assignments")
    .insert(payload)
    .select(ASSIGNMENT_COLUMNS)
    .single();

  throwIfError(error);

  if (!data) {
    throw new AssignmentsServiceError(GENERIC_ERROR);
  }

  return mapTeacherAssignmentRow(data);
}

export async function updateTeacherAssignment(
  assignmentId: string,
  updates: UpdateTeacherAssignmentInput,
): Promise<TeacherAssignment> {
  const client = getClient();
  const payload: TeacherAssignmentUpdateRow = {};

  if (updates.title !== undefined) {
    payload.title = normalizeTitle(updates.title);
  }
  if (updates.instructions !== undefined) {
    payload.instructions = normalizeInstructions(updates.instructions);
  }
  if (updates.classId !== undefined) {
    payload.class_id = updates.classId;
  }
  if (hasOwn(updates, "courseDraftId")) {
    payload.course_id = normalizeOptionalId(updates.courseDraftId);
  }
  if (updates.selectedConceptIds !== undefined) {
    payload.selected_concept_ids = normalizeTextArray(
      updates.selectedConceptIds,
    );
  }
  if (hasOwn(updates, "dueDate")) {
    payload.due_date = updates.dueDate ?? null;
  }

  if (Object.keys(payload).length === 0) {
    return getTeacherAssignment(assignmentId);
  }

  const { data, error } = await client
    .from("teacher_assignments")
    .update(payload)
    .eq("id", assignmentId)
    .select(ASSIGNMENT_COLUMNS)
    .single();

  throwIfError(error);

  if (!data) {
    throw new AssignmentsServiceError(
      ASSIGNMENT_NOT_FOUND_ERROR,
      "assignment_not_found",
    );
  }

  return mapTeacherAssignmentRow(data);
}

export async function deleteTeacherAssignment(
  assignmentId: string,
): Promise<void> {
  const client = getClient();
  const { data, error } = await client
    .from("teacher_assignments")
    .delete()
    .eq("id", assignmentId)
    .select("id")
    .maybeSingle();

  throwIfError(error);

  if (!data) {
    throw new AssignmentsServiceError(
      ASSIGNMENT_NOT_FOUND_ERROR,
      "assignment_not_found",
    );
  }
}

async function runAssignmentTransition(
  functionName:
    | "publish_teacher_assignment"
    | "close_teacher_assignment"
    | "reopen_teacher_assignment",
  assignmentId: string,
): Promise<TeacherAssignment> {
  const client = getClient();
  const { data, error } = await client.rpc(functionName, {
    target_assignment_id: assignmentId,
  });

  throwIfError(error);

  if (!data) {
    throw new AssignmentsServiceError(
      ASSIGNMENT_NOT_FOUND_ERROR,
      "assignment_not_found",
    );
  }

  return mapTeacherAssignmentRow(data);
}

export function publishTeacherAssignment(assignmentId: string) {
  return runAssignmentTransition("publish_teacher_assignment", assignmentId);
}

export function closeTeacherAssignment(assignmentId: string) {
  return runAssignmentTransition("close_teacher_assignment", assignmentId);
}

export function reopenTeacherAssignment(assignmentId: string) {
  return runAssignmentTransition("reopen_teacher_assignment", assignmentId);
}
