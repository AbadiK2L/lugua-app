import { supabase } from "@/src/lib/supabase";
import type {
  ClassInsertRow,
  ClassJoinRequest,
  ClassRosterMember,
  ClassUpdateRow,
  CreateTeacherClassInput,
  DiscoverableClass,
  StudentClassInvitation,
  StudentClassMembership,
  StudentDirectoryEntry,
  TeacherClass,
  UpdateTeacherClassInput,
} from "@/src/types/classes";
import {
  mapClassJoinRequestRow,
  mapClassRosterMemberRow,
  mapClassRow,
  mapDiscoverableClassRow,
  mapStudentClassInvitationRow,
  mapStudentClassMembershipRow,
  mapStudentDirectoryEntryRow,
} from "@/src/types/classes";

const CLASS_COLUMNS =
  "id, teacher_id, name, description, language, variety, level, status, visibility, invite_code, created_at, updated_at";
const CONFIGURATION_ERROR = "Configuration Supabase manquante.";
const SESSION_EXPIRED_ERROR = "Ta session a expire. Connecte-toi de nouveau.";

export class ClassesServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClassesServiceError";
  }
}

type SupabaseErrorLike = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
  status?: number;
};

type CreateTeacherClassServiceInput = CreateTeacherClassInput & {
  teacherId: string;
};

function getClient() {
  if (!supabase) {
    throw new ClassesServiceError(CONFIGURATION_ERROR);
  }

  return supabase;
}

function normalizeNullableText(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeRequiredText(value: string) {
  return value.trim();
}

function isErrorLike(error: unknown): error is SupabaseErrorLike {
  return typeof error === "object" && error !== null;
}

export function getClassesServiceErrorMessage(error: unknown) {
  if (error instanceof ClassesServiceError) {
    return error.message;
  }

  if (!isErrorLike(error)) {
    return "Une erreur inattendue est survenue. Reessaie dans un instant.";
  }

  return mapSupabaseClassesError(error);
}

function mapSupabaseClassesError(error: SupabaseErrorLike) {
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
    status === 403 ||
    message.includes("teacher") ||
    message.includes("professeur") ||
    message.includes("role teacher") ||
    message.includes("access denied") ||
    message.includes("permission denied")
  ) {
    return "Acces professeur requis pour cette action.";
  }

  if (
    message.includes("student not found") ||
    message.includes("eleve introuvable") ||
    message.includes("élève introuvable")
  ) {
    return "Eleve introuvable.";
  }

  if (
    message.includes("invitation not found") ||
    message.includes("membership not found") ||
    message.includes("join request not found") ||
    message.includes("request not found") ||
    message.includes("invitation introuvable")
  ) {
    return "Invitation ou demande introuvable.";
  }

  if (
    status === 404 ||
    code === "pgrst116" ||
    message.includes("class not found") ||
    message.includes("classe introuvable") ||
    message.includes("not found")
  ) {
    return "Classe introuvable.";
  }

  if (
    message.includes("archived") ||
    message.includes("archivee") ||
    message.includes("archivée")
  ) {
    return "Cette classe est archivee. Restaure-la avant d'envoyer une invitation.";
  }

  if (
    message.includes("private") ||
    message.includes("visibility") ||
    message.includes("discover")
  ) {
    return "Cette classe n'est pas disponible dans l'annuaire.";
  }

  if (
    message.includes("student") ||
    message.includes("eleve") ||
    message.includes("élève") ||
    message.includes("student role") ||
    message.includes("role student")
  ) {
    return "Acces eleve requis pour cette action.";
  }

  if (
    code === "23505" ||
    message.includes("already") ||
    message.includes("duplicate") ||
    message.includes("deja") ||
    message.includes("déjà")
  ) {
    return "Une invitation, une demande ou une inscription existe deja pour cette classe.";
  }

  if (
    message.includes("failed to fetch") ||
    message.includes("network request failed") ||
    message.includes("networkerror") ||
    message.includes("fetch")
  ) {
    return "Connexion reseau impossible. Verifie ta connexion puis reessaie.";
  }

  return "L'action n'a pas abouti. Verifie ta connexion puis reessaie.";
}

function throwIfError(error: SupabaseErrorLike | null) {
  if (error) {
    throw new ClassesServiceError(mapSupabaseClassesError(error));
  }
}

export async function listTeacherClasses(
  teacherId: string,
): Promise<TeacherClass[]> {
  const client = getClient();
  const { data, error } = await client
    .from("classes")
    .select(CLASS_COLUMNS)
    .eq("teacher_id", teacherId)
    .order("updated_at", { ascending: false });

  throwIfError(error);

  return (data ?? []).map((row) => mapClassRow(row));
}

export async function getTeacherClass(
  classId: string,
): Promise<TeacherClass> {
  const client = getClient();
  const { data, error } = await client
    .from("classes")
    .select(CLASS_COLUMNS)
    .eq("id", classId)
    .single();

  throwIfError(error);

  if (!data) {
    throw new ClassesServiceError("Classe introuvable.");
  }

  return mapClassRow(data);
}

export async function createTeacherClass(
  input: CreateTeacherClassServiceInput,
): Promise<TeacherClass> {
  const client = getClient();
  const name = normalizeRequiredText(input.name);

  if (!name) {
    throw new ClassesServiceError("Ajoute un nom a la classe.");
  }

  const payload: ClassInsertRow = {
    teacher_id: input.teacherId,
    name,
    description: input.description?.trim() ?? "",
    language: normalizeRequiredText(input.language),
    variety: normalizeRequiredText(input.variety),
    level: normalizeNullableText(input.level),
    status: "active",
    visibility: input.visibility ?? "public",
  };

  const { data, error } = await client
    .from("classes")
    .insert(payload)
    .select(CLASS_COLUMNS)
    .single();

  throwIfError(error);

  if (!data) {
    throw new ClassesServiceError("La classe n'a pas pu etre creee.");
  }

  return mapClassRow(data);
}

export async function updateTeacherClass(
  classId: string,
  updates: UpdateTeacherClassInput,
): Promise<TeacherClass> {
  const client = getClient();
  const payload: ClassUpdateRow = {};

  if (updates.name !== undefined) {
    const name = normalizeRequiredText(updates.name);
    if (!name) {
      throw new ClassesServiceError("Ajoute un nom a la classe.");
    }
    payload.name = name;
  }

  if (updates.description !== undefined) {
    payload.description = updates.description.trim();
  }

  if (updates.language !== undefined) {
    payload.language = normalizeRequiredText(updates.language);
  }

  if (updates.variety !== undefined) {
    payload.variety = normalizeRequiredText(updates.variety);
  }

  if (updates.level !== undefined) {
    payload.level = normalizeNullableText(updates.level);
  }

  if (updates.status !== undefined) {
    payload.status = updates.status;
  }

  if (updates.visibility !== undefined) {
    payload.visibility = updates.visibility;
  }

  if (Object.keys(payload).length === 0) {
    return getTeacherClass(classId);
  }

  const { data, error } = await client
    .from("classes")
    .update(payload)
    .eq("id", classId)
    .select(CLASS_COLUMNS)
    .single();

  throwIfError(error);

  if (!data) {
    throw new ClassesServiceError("La classe n'a pas pu etre mise a jour.");
  }

  return mapClassRow(data);
}

export function archiveTeacherClass(classId: string) {
  return updateTeacherClass(classId, { status: "archived" });
}

export function restoreTeacherClass(classId: string) {
  return updateTeacherClass(classId, { status: "active" });
}

export async function deleteTeacherClass(classId: string): Promise<void> {
  const client = getClient();
  const { error } = await client.from("classes").delete().eq("id", classId);

  throwIfError(error);
}

export async function regenerateClassInviteCode(
  classId: string,
): Promise<TeacherClass> {
  const client = getClient();
  const { error } = await client.rpc("regenerate_class_invite_code", {
    target_class_id: classId,
  });

  throwIfError(error);

  return getTeacherClass(classId);
}

export async function searchStudentDirectory(
  searchTerm: string,
): Promise<StudentDirectoryEntry[]> {
  const client = getClient();
  const { data, error } = await client.rpc("search_student_directory", {
    search_term: searchTerm.trim(),
    result_limit: 50,
  });

  throwIfError(error);

  return (data ?? []).map((row) => mapStudentDirectoryEntryRow(row));
}

export async function getClassRoster(
  classId: string,
): Promise<ClassRosterMember[]> {
  const client = getClient();
  const { data, error } = await client.rpc("get_class_roster", {
    target_class_id: classId,
  });

  throwIfError(error);

  return (data ?? []).map((row) => mapClassRosterMemberRow(row));
}

export async function listDiscoverableClasses(
  searchTerm = "",
): Promise<DiscoverableClass[]> {
  const client = getClient();
  const { data, error } = await client.rpc("list_discoverable_classes", {
    search_term: searchTerm.trim(),
    result_limit: 50,
  });

  throwIfError(error);

  return (data ?? []).map((row) => mapDiscoverableClassRow(row));
}

export async function requestToJoinClass(
  classId: string,
  message?: string,
): Promise<void> {
  const client = getClient();
  const normalizedMessage = message?.trim() ?? "";

  if (normalizedMessage.length > 240) {
    throw new ClassesServiceError(
      "Le message doit contenir 240 caracteres maximum.",
    );
  }

  const { error } = await client.rpc("request_to_join_class", {
    target_class_id: classId,
    message: normalizedMessage.length > 0 ? normalizedMessage : null,
  });

  throwIfError(error);
}

export async function getClassJoinRequests(
  classId: string,
): Promise<ClassJoinRequest[]> {
  const client = getClient();
  const { data, error } = await client.rpc("get_class_join_requests", {
    target_class_id: classId,
  });

  throwIfError(error);

  return (data ?? []).map((row) => mapClassJoinRequestRow(row));
}

export async function respondToJoinRequest(
  membershipId: string,
  approve: boolean,
): Promise<void> {
  const client = getClient();
  const { error } = await client.rpc("respond_to_join_request", {
    membership_id: membershipId,
    approve_request: approve,
  });

  throwIfError(error);
}

export async function inviteStudentToClass(
  classId: string,
  studentId: string,
): Promise<void> {
  const client = getClient();
  const { error } = await client.rpc("invite_student_to_class", {
    target_class_id: classId,
    target_student_id: studentId,
  });

  throwIfError(error);
}

export async function removeStudentFromClass(
  classId: string,
  studentId: string,
): Promise<void> {
  const client = getClient();
  const { error } = await client.rpc("remove_student_from_class", {
    target_class_id: classId,
    target_student_id: studentId,
  });

  throwIfError(error);
}

export async function getMyClassInvitations(): Promise<
  StudentClassInvitation[]
> {
  const client = getClient();
  const { data, error } = await client.rpc("get_my_class_invitations");

  throwIfError(error);

  return (data ?? []).map((row) => mapStudentClassInvitationRow(row));
}

export async function getMyClassMemberships(): Promise<
  StudentClassMembership[]
> {
  const client = getClient();
  const { data, error } = await client.rpc("get_my_class_memberships");

  throwIfError(error);

  return (data ?? []).map((row) => mapStudentClassMembershipRow(row));
}

export async function respondToClassInvitation(
  membershipId: string,
  accept: boolean,
): Promise<void> {
  const client = getClient();
  const { error } = await client.rpc("respond_to_class_invitation", {
    membership_id: membershipId,
    accept_invitation: accept,
  });

  throwIfError(error);
}
