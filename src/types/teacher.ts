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
export type {
  CreateTeacherCourseDraftInput,
  TeacherClassCourseAssignment,
  TeacherCourseDraft,
  TeacherCourseDraftStatus,
  TeacherCourseOrigin,
  UpdateTeacherCourseDraftInput,
} from "@/src/types/courses";

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
