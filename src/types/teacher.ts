import type { CEFRLevel } from "@/src/types/learning";

export type TeacherCourseOrigin = "lugua_program" | "teacher_created";

export type TeacherCourseDraft = {
  origin: TeacherCourseOrigin;
  title: string;
  description: string;
  languageId: string;
  variety: string;
  level: CEFRLevel | "";
  objective: string;
  conceptIds: string[];
  status: "draft";
};
