import type { CEFRLevel } from "@/src/types/learning";
export type {
  ActionResult,
  ClassJoinRequest,
  ClassRosterMember,
  ClassStatus,
  ClassVisibility,
  CreateTeacherClassInput,
  DiscoverableClass,
  MembershipStatus,
  StudentClassInvitation,
  StudentClassMembership,
  StudentDirectoryEntry,
  TeacherClass,
  UpdateTeacherClassInput,
} from "@/src/types/classes";

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

export type TeacherAssignmentStatus = "draft" | "published" | "closed";

export type PublishAssignmentFailureReason =
  | "assignment_not_found"
  | "class_not_found"
  | "class_archived"
  | "missing_title";

export type PublishAssignmentResult =
  | { ok: true }
  | { ok: false; reason: PublishAssignmentFailureReason };

export type TeacherAssignment = {
  id: string;
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
