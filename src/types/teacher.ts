import type { CEFRLevel } from "@/src/types/learning";

export type TeacherCourseOrigin = "lugua_program" | "teacher_created";

export type TeacherCourseDraftStatus = "draft";

export type TeacherCourseDraft = {
  id: string;
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
  "id" | "createdAt" | "updatedAt" | "status"
>;

export type UpdateTeacherCourseDraftInput = Partial<
  Omit<
    TeacherCourseDraft,
    "id" | "createdAt" | "updatedAt" | "status"
  >
>;
