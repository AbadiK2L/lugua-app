import type { CEFRLevel } from "@/src/types/learning";
import type { TeacherCourseOrigin } from "@/src/types/courses";

export type StudentClassCourseRow = {
  course_id: string;
  class_id: string;
  origin: TeacherCourseOrigin;
  title: string;
  description: string;
  language: string;
  variety: string;
  level: CEFRLevel | null;
  objectives: string[];
  source_chapter_id: string | null;
  selected_concept_ids: string[];
  assigned_at: string;
};

export type StudentClassCourse = {
  id: string;
  classId: string;
  origin: TeacherCourseOrigin;
  title: string;
  description: string;
  language: string;
  variety: string;
  level?: CEFRLevel;
  objectives: string[];
  sourceChapterId?: string;
  selectedConceptIds: string[];
  assignedAt: string;
};

export type StudentClassAssignmentStatus = "published" | "closed";

export type StudentClassAssignmentRow = {
  assignment_id: string;
  class_id: string;
  course_id: string | null;
  title: string;
  instructions: string;
  selected_concept_ids: string[];
  due_date: string | null;
  status: StudentClassAssignmentStatus;
  published_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type StudentClassAssignment = {
  id: string;
  classId: string;
  courseId?: string;
  title: string;
  instructions: string;
  selectedConceptIds: string[];
  dueDate?: string;
  status: StudentClassAssignmentStatus;
  publishedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export function mapStudentClassCourseRow(
  row: StudentClassCourseRow,
): StudentClassCourse {
  return {
    id: row.course_id,
    classId: row.class_id,
    origin: row.origin,
    title: row.title,
    description: row.description,
    language: row.language,
    variety: row.variety,
    level: row.level ?? undefined,
    objectives: [...row.objectives],
    sourceChapterId: row.source_chapter_id ?? undefined,
    selectedConceptIds: [...row.selected_concept_ids],
    assignedAt: row.assigned_at,
  };
}

export function mapStudentClassAssignmentRow(
  row: StudentClassAssignmentRow,
): StudentClassAssignment {
  return {
    id: row.assignment_id,
    classId: row.class_id,
    courseId: row.course_id ?? undefined,
    title: row.title,
    instructions: row.instructions,
    selectedConceptIds: [...row.selected_concept_ids],
    dueDate: row.due_date ?? undefined,
    status: row.status,
    publishedAt: row.published_at ?? undefined,
    closedAt: row.closed_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
