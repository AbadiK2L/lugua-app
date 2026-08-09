import type { CEFRLevel } from "@/src/types/learning";

export type TeacherCourseOrigin = "lugua_program" | "teacher_created";

export type TeacherCourseDraftStatus = "draft";

export type TeacherCourseRow = {
  id: string;
  teacher_id: string;
  origin: TeacherCourseOrigin;
  title: string;
  description: string;
  language: string;
  variety: string;
  level: CEFRLevel | null;
  objectives: string[];
  source_chapter_id: string | null;
  selected_concept_ids: string[];
  status: TeacherCourseDraftStatus;
  created_at: string;
  updated_at: string;
};

export type TeacherCourseInsertRow = {
  teacher_id: string;
  origin: TeacherCourseOrigin;
  title: string;
  description: string;
  language: string;
  variety: string;
  level: CEFRLevel | null;
  objectives: string[];
  source_chapter_id: string | null;
  selected_concept_ids: string[];
  status?: TeacherCourseDraftStatus;
};

export type TeacherCourseUpdateRow = Partial<
  Pick<
    TeacherCourseRow,
    | "origin"
    | "title"
    | "description"
    | "language"
    | "variety"
    | "level"
    | "objectives"
    | "source_chapter_id"
    | "selected_concept_ids"
  >
>;

export type ClassCourseAssignmentRow = {
  class_id: string;
  course_id: string;
  assigned_at: string;
};

export type ClassCourseAssignmentInsertRow = Pick<
  ClassCourseAssignmentRow,
  "class_id" | "course_id"
>;

export type TeacherCourseDraft = {
  id: string;
  teacherId: string;
  origin: TeacherCourseOrigin;
  title: string;
  description: string;
  language: string;
  variety: string;
  level?: CEFRLevel;
  objectives: string[];
  sourceChapterId?: string;
  selectedConceptIds: string[];
  status: TeacherCourseDraftStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateTeacherCourseDraftInput = Omit<
  TeacherCourseDraft,
  "id" | "teacherId" | "createdAt" | "updatedAt" | "status"
>;

export type UpdateTeacherCourseDraftInput = Partial<
  Omit<
    TeacherCourseDraft,
    "id" | "teacherId" | "createdAt" | "updatedAt" | "status"
  >
>;

export type TeacherClassCourseAssignment = {
  classId: string;
  courseId: string;
  assignedAt: string;
};

export function mapTeacherCourseRow(
  row: TeacherCourseRow,
): TeacherCourseDraft {
  return {
    id: row.id,
    teacherId: row.teacher_id,
    origin: row.origin,
    title: row.title,
    description: row.description,
    language: row.language,
    variety: row.variety,
    level: row.level ?? undefined,
    objectives: [...row.objectives],
    sourceChapterId: row.source_chapter_id ?? undefined,
    selectedConceptIds: [...row.selected_concept_ids],
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapClassCourseAssignmentRow(
  row: ClassCourseAssignmentRow,
): TeacherClassCourseAssignment {
  return {
    classId: row.class_id,
    courseId: row.course_id,
    assignedAt: row.assigned_at,
  };
}
