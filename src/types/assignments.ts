export type TeacherAssignmentStatus = "draft" | "published" | "closed";

export type PublishAssignmentFailureReason =
  | "assignment_not_found"
  | "class_not_found"
  | "class_archived"
  | "missing_title"
  | "invalid_status"
  | "access_denied"
  | "network_error"
  | "unknown_error";

export type TeacherAssignmentRow = {
  id: string;
  teacher_id: string;
  class_id: string;
  course_id: string | null;
  title: string;
  instructions: string;
  selected_concept_ids: string[];
  due_date: string | null;
  status: TeacherAssignmentStatus;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  closed_at: string | null;
};

export type TeacherAssignmentInsertRow = {
  teacher_id: string;
  class_id: string;
  course_id: string | null;
  title: string;
  instructions: string;
  selected_concept_ids: string[];
  due_date: string | null;
  status?: "draft";
};

export type TeacherAssignmentUpdateRow = Partial<
  Pick<
    TeacherAssignmentRow,
    | "title"
    | "instructions"
    | "class_id"
    | "course_id"
    | "selected_concept_ids"
    | "due_date"
  >
>;

export type TeacherAssignment = {
  id: string;
  teacherId: string;
  title: string;
  instructions: string;
  classId: string;
  courseDraftId?: string;
  selectedConceptIds: string[];
  dueDate?: string;
  status: TeacherAssignmentStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  closedAt?: string;
};

export type CreateTeacherAssignmentInput = {
  title: string;
  instructions?: string;
  classId: string;
  courseDraftId?: string;
  selectedConceptIds?: string[];
  dueDate?: string;
  status?: "draft" | "published";
};

export type UpdateTeacherAssignmentInput = Partial<
  Pick<
    TeacherAssignment,
    | "title"
    | "instructions"
    | "classId"
    | "courseDraftId"
    | "selectedConceptIds"
    | "dueDate"
  >
>;

export type PublishAssignmentResult =
  | { ok: true; data: TeacherAssignment }
  | {
      ok: false;
      reason: PublishAssignmentFailureReason;
      message: string;
    };

export function mapTeacherAssignmentRow(
  row: TeacherAssignmentRow,
): TeacherAssignment {
  return {
    id: row.id,
    teacherId: row.teacher_id,
    title: row.title,
    instructions: row.instructions,
    classId: row.class_id,
    courseDraftId: row.course_id ?? undefined,
    selectedConceptIds: [...row.selected_concept_ids],
    dueDate: row.due_date ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at ?? undefined,
    closedAt: row.closed_at ?? undefined,
  };
}
