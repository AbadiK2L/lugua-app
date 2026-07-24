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

export type TeacherClassStatus = "active" | "archived";

export type TeacherStudentStatus = "active" | "invited";

export type TeacherStudent = {
  id: string;
  displayName: string;
  email?: string;
  status: TeacherStudentStatus;
  createdAt: string;
};

export type TeacherClass = {
  id: string;
  name: string;
  description: string;
  level?: string;
  language: string;
  variety: string;
  status: TeacherClassStatus;
  inviteCode: string;
  students: TeacherStudent[];
  assignedCourseDraftIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreateTeacherClassInput = {
  name: string;
  description?: string;
  level?: string;
  language: string;
  variety: string;
};

export type UpdateTeacherClassInput = Partial<
  Pick<TeacherClass, "name" | "description" | "level" | "language" | "variety">
>;

export type CreateTeacherStudentInput = {
  displayName: string;
  email?: string;
  status?: TeacherStudentStatus;
};

export type UpdateTeacherStudentInput = Partial<
  Pick<TeacherStudent, "displayName" | "email" | "status">
>;
