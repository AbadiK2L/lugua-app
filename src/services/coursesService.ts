import { supabase } from "@/src/lib/supabase";
import type {
  ClassCourseAssignmentInsertRow,
  CreateTeacherCourseDraftInput,
  TeacherClassCourseAssignment,
  TeacherCourseDraft,
  TeacherCourseInsertRow,
  TeacherCourseUpdateRow,
  UpdateTeacherCourseDraftInput,
} from "@/src/types/courses";
import {
  mapClassCourseAssignmentRow,
  mapTeacherCourseRow,
} from "@/src/types/courses";

const COURSE_COLUMNS =
  "id, teacher_id, origin, title, description, language, variety, level, objectives, source_chapter_id, selected_concept_ids, status, created_at, updated_at";
const ASSIGNMENT_COLUMNS = "class_id, course_id, assigned_at";
const TITLE_MAX_LENGTH = 160;
const LANGUAGE_MAX_LENGTH = 80;
const CONFIGURATION_ERROR = "Configuration Supabase manquante.";
const SESSION_EXPIRED_ERROR =
  "Ta session a expiré. Connecte-toi de nouveau.";
const TEACHER_ACCESS_ERROR =
  "Accès professeur requis pour cette action.";
const COURSE_NOT_FOUND_ERROR = "Cours introuvable.";
const ASSIGNMENT_ACCESS_ERROR =
  "Cette classe ou ce cours n’est pas autorisé pour ce compte.";
const INVALID_TITLE_ERROR =
  "Le titre doit contenir entre 1 et 160 caractères.";
const NETWORK_ERROR =
  "Connexion réseau impossible. Vérifie ta connexion puis réessaie.";
const GENERIC_ERROR =
  "L’action n’a pas abouti. Vérifie ta connexion puis réessaie.";

export class CoursesServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CoursesServiceError";
  }
}

type SupabaseErrorLike = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
  status?: number;
};

type CreateTeacherCourseServiceInput = CreateTeacherCourseDraftInput & {
  teacherId: string;
};

function getClient() {
  if (!supabase) {
    throw new CoursesServiceError(CONFIGURATION_ERROR);
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
    throw new CoursesServiceError(INVALID_TITLE_ERROR);
  }

  return normalized;
}

function normalizeRequiredText(
  value: string,
  label: string,
  maxLength: number,
) {
  const normalized = value.trim();

  if (!normalized || [...normalized].length > maxLength) {
    throw new CoursesServiceError(
      `${label} doit contenir entre 1 et ${maxLength} caractères.`,
    );
  }

  return normalized;
}

function normalizeNullableText(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeTextArray(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean);
}

function mapSupabaseCoursesError(error: SupabaseErrorLike) {
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

  if (
    message.includes("teacher_courses_title_check") ||
    (code === "23514" && message.includes("title"))
  ) {
    return INVALID_TITLE_ERROR;
  }

  if (
    status === 404 ||
    code === "pgrst116" ||
    message.includes("course not found") ||
    message.includes("cours introuvable")
  ) {
    return COURSE_NOT_FOUND_ERROR;
  }

  if (
    code === "23505" ||
    message.includes("class_course_assignments_pkey") ||
    message.includes("duplicate")
  ) {
    return "Ce cours est déjà attribué à cette classe.";
  }

  if (
    status === 403 ||
    code === "42501" ||
    message.includes("row-level security") ||
    message.includes("row level security") ||
    message.includes("permission denied") ||
    message.includes("not authorized")
  ) {
    return ASSIGNMENT_ACCESS_ERROR;
  }

  if (
    message.includes("teacher") ||
    message.includes("professeur") ||
    message.includes("role teacher")
  ) {
    return TEACHER_ACCESS_ERROR;
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
    throw new CoursesServiceError(mapSupabaseCoursesError(error));
  }
}

export function getCoursesServiceErrorMessage(error: unknown) {
  if (error instanceof CoursesServiceError) {
    return error.message;
  }

  if (!isErrorLike(error)) {
    return GENERIC_ERROR;
  }

  return mapSupabaseCoursesError(error);
}

export async function listTeacherCourses(
  teacherId: string,
): Promise<TeacherCourseDraft[]> {
  const client = getClient();
  const { data, error } = await client
    .from("teacher_courses")
    .select(COURSE_COLUMNS)
    .eq("teacher_id", teacherId)
    .order("updated_at", { ascending: false });

  throwIfError(error);

  return (data ?? []).map((row) => mapTeacherCourseRow(row));
}

export async function getTeacherCourse(
  courseId: string,
): Promise<TeacherCourseDraft> {
  const client = getClient();
  const { data, error } = await client
    .from("teacher_courses")
    .select(COURSE_COLUMNS)
    .eq("id", courseId)
    .single();

  throwIfError(error);

  if (!data) {
    throw new CoursesServiceError(COURSE_NOT_FOUND_ERROR);
  }

  return mapTeacherCourseRow(data);
}

export async function createTeacherCourse(
  input: CreateTeacherCourseServiceInput,
): Promise<TeacherCourseDraft> {
  const client = getClient();
  const payload: TeacherCourseInsertRow = {
    teacher_id: input.teacherId,
    origin: input.origin,
    title: normalizeTitle(input.title),
    description: input.description.trim(),
    language: normalizeRequiredText(
      input.language,
      "La langue",
      LANGUAGE_MAX_LENGTH,
    ),
    variety: normalizeRequiredText(
      input.variety,
      "La variété",
      LANGUAGE_MAX_LENGTH,
    ),
    level: input.level ?? null,
    objectives: normalizeTextArray(input.objectives),
    source_chapter_id: normalizeNullableText(input.sourceChapterId),
    selected_concept_ids: normalizeTextArray(input.selectedConceptIds),
    status: "draft",
  };
  const { data, error } = await client
    .from("teacher_courses")
    .insert(payload)
    .select(COURSE_COLUMNS)
    .single();

  throwIfError(error);

  if (!data) {
    throw new CoursesServiceError(
      "Le cours n’a pas pu être enregistré.",
    );
  }

  return mapTeacherCourseRow(data);
}

export async function updateTeacherCourse(
  courseId: string,
  updates: UpdateTeacherCourseDraftInput,
): Promise<TeacherCourseDraft> {
  const client = getClient();
  const payload: TeacherCourseUpdateRow = {};

  if (updates.origin !== undefined) {
    payload.origin = updates.origin;
  }
  if (updates.title !== undefined) {
    payload.title = normalizeTitle(updates.title);
  }
  if (updates.description !== undefined) {
    payload.description = updates.description.trim();
  }
  if (updates.language !== undefined) {
    payload.language = normalizeRequiredText(
      updates.language,
      "La langue",
      LANGUAGE_MAX_LENGTH,
    );
  }
  if (updates.variety !== undefined) {
    payload.variety = normalizeRequiredText(
      updates.variety,
      "La variété",
      LANGUAGE_MAX_LENGTH,
    );
  }
  if (hasOwn(updates, "level")) {
    payload.level = updates.level ?? null;
  }
  if (updates.objectives !== undefined) {
    payload.objectives = normalizeTextArray(updates.objectives);
  }
  if (hasOwn(updates, "sourceChapterId")) {
    payload.source_chapter_id = normalizeNullableText(
      updates.sourceChapterId,
    );
  }
  if (updates.selectedConceptIds !== undefined) {
    payload.selected_concept_ids = normalizeTextArray(
      updates.selectedConceptIds,
    );
  }

  if (Object.keys(payload).length === 0) {
    return getTeacherCourse(courseId);
  }

  const { data, error } = await client
    .from("teacher_courses")
    .update(payload)
    .eq("id", courseId)
    .select(COURSE_COLUMNS)
    .single();

  throwIfError(error);

  if (!data) {
    throw new CoursesServiceError(COURSE_NOT_FOUND_ERROR);
  }

  return mapTeacherCourseRow(data);
}

export async function deleteTeacherCourse(courseId: string): Promise<void> {
  const client = getClient();
  const { data, error } = await client
    .from("teacher_courses")
    .delete()
    .eq("id", courseId)
    .select("id")
    .maybeSingle();

  throwIfError(error);

  if (!data) {
    throw new CoursesServiceError(COURSE_NOT_FOUND_ERROR);
  }
}

export async function listTeacherClassCourseAssignments(): Promise<
  TeacherClassCourseAssignment[]
> {
  const client = getClient();
  const { data, error } = await client
    .from("class_course_assignments")
    .select(ASSIGNMENT_COLUMNS)
    .order("assigned_at", { ascending: true });

  throwIfError(error);

  return (data ?? []).map((row) => mapClassCourseAssignmentRow(row));
}

export async function assignTeacherCourseToClass(
  classId: string,
  courseId: string,
): Promise<TeacherClassCourseAssignment> {
  const client = getClient();
  const payload: ClassCourseAssignmentInsertRow = {
    class_id: classId,
    course_id: courseId,
  };
  const { data, error } = await client
    .from("class_course_assignments")
    .insert(payload)
    .select(ASSIGNMENT_COLUMNS)
    .single();

  throwIfError(error);

  if (!data) {
    throw new CoursesServiceError(ASSIGNMENT_ACCESS_ERROR);
  }

  return mapClassCourseAssignmentRow(data);
}

export async function unassignTeacherCourseFromClass(
  classId: string,
  courseId: string,
): Promise<void> {
  const client = getClient();
  const { data, error } = await client
    .from("class_course_assignments")
    .delete()
    .eq("class_id", classId)
    .eq("course_id", courseId)
    .select(ASSIGNMENT_COLUMNS)
    .maybeSingle();

  throwIfError(error);

  if (!data) {
    throw new CoursesServiceError(ASSIGNMENT_ACCESS_ERROR);
  }
}
