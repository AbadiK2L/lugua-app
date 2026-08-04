export type ClassStatus = "active" | "archived";

export type ClassVisibility = "public" | "private";

export type MembershipStatus = "invited" | "requested" | "active" | "declined";

export type ClassRow = {
  id: string;
  teacher_id: string;
  name: string;
  description: string;
  language: string;
  variety: string;
  level: string | null;
  status: ClassStatus;
  visibility: ClassVisibility;
  invite_code: string;
  created_at: string;
  updated_at: string;
};

export type ClassInsertRow = {
  teacher_id: string;
  name: string;
  description: string;
  language: string;
  variety: string;
  level?: string | null;
  status?: ClassStatus;
  visibility?: ClassVisibility;
};

export type ClassUpdateRow = Partial<
  Pick<
    ClassRow,
    "name" | "description" | "language" | "variety" | "level" | "status" | "visibility"
  >
>;

export type ClassMemberRow = {
  id: string;
  class_id: string;
  student_id: string;
  status: MembershipStatus;
  invited_at: string;
  requested_at: string | null;
  request_message: string | null;
  responded_at: string | null;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
};

export type StudentDirectoryEntryRow = {
  profile_id: string;
  display_name: string;
  preferred_language: string;
  preferred_variety: string;
};

export type ClassRosterMemberRow = {
  membership_id: string;
  student_id: string;
  display_name: string;
  preferred_language: string;
  preferred_variety: string;
  status: MembershipStatus;
  invited_at: string;
  requested_at?: string | null;
  request_message?: string | null;
  responded_at: string | null;
  joined_at: string | null;
};

export type StudentClassInvitationRow = {
  membership_id: string;
  class_id: string;
  class_name: string;
  class_description: string;
  language: string;
  variety: string;
  level: string | null;
  teacher_id: string;
  status: "invited" | "active";
  invited_at: string;
  responded_at: string | null;
  joined_at: string | null;
};

export type StudentClassMembershipRow = {
  membership_id: string;
  class_id: string;
  class_name: string;
  class_description: string;
  language: string;
  variety: string;
  level: string | null;
  teacher_id: string;
  teacher_name: string;
  membership_status: "invited" | "requested" | "active";
  invited_at: string | null;
  requested_at: string | null;
  responded_at: string | null;
  joined_at: string | null;
};

export type DiscoverableClassRow = {
  class_id: string;
  class_name: string;
  class_description: string;
  language: string;
  variety: string;
  level: string | null;
  teacher_id: string;
  teacher_name: string;
  active_member_count: number;
  membership_status: "invited" | "requested" | "active" | null;
  created_at: string;
};

export type ClassJoinRequestRow = {
  membership_id: string;
  student_id: string;
  display_name: string;
  preferred_language: string;
  preferred_variety: string;
  request_message: string | null;
  requested_at: string;
};

export type TeacherClass = {
  id: string;
  teacherId: string;
  name: string;
  description: string;
  language: string;
  variety: string;
  level?: string;
  status: ClassStatus;
  visibility: ClassVisibility;
  inviteCode: string;
  activeStudentCount: number;
  pendingInvitationCount: number;
  assignedCourseDraftIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type StudentDirectoryEntry = {
  profileId: string;
  displayName: string;
  preferredLanguage: string;
  preferredVariety: string;
};

export type ClassRosterMember = {
  membershipId: string;
  studentId: string;
  displayName: string;
  preferredLanguage: string;
  preferredVariety: string;
  status: MembershipStatus;
  invitedAt: string;
  requestedAt?: string;
  requestMessage?: string;
  respondedAt?: string;
  joinedAt?: string;
};

export type StudentClassInvitation = {
  membershipId: string;
  classId: string;
  className: string;
  classDescription: string;
  language: string;
  variety: string;
  level?: string;
  teacherId: string;
  status: "invited" | "active";
  invitedAt: string;
  respondedAt?: string;
  joinedAt?: string;
};

export type StudentClassMembership = {
  membershipId: string;
  classId: string;
  className: string;
  classDescription: string;
  language: string;
  variety: string;
  level?: string;
  teacherId: string;
  teacherName: string;
  membershipStatus: "invited" | "requested" | "active";
  invitedAt?: string;
  requestedAt?: string;
  respondedAt?: string;
  joinedAt?: string;
};

export type DiscoverableClass = {
  id: string;
  name: string;
  description: string;
  language: string;
  variety: string;
  level?: string;
  teacherId: string;
  teacherName: string;
  activeMemberCount: number;
  membershipStatus?: "invited" | "requested" | "active";
  createdAt: string;
};

export type ClassJoinRequest = {
  membershipId: string;
  studentId: string;
  displayName: string;
  preferredLanguage: string;
  preferredVariety: string;
  requestMessage?: string;
  requestedAt: string;
};

export type CreateTeacherClassInput = {
  name: string;
  description?: string;
  level?: string;
  language: string;
  variety: string;
  visibility?: ClassVisibility;
};

export type UpdateTeacherClassInput = Partial<
  Pick<
    TeacherClass,
    "name" | "description" | "level" | "language" | "variety" | "status" | "visibility"
  >
>;

type ActionSuccess<T> = [T] extends [undefined]
  ? { ok: true; data?: undefined }
  : { ok: true; data: T };

export type ActionResult<T = undefined> =
  | ActionSuccess<T>
  | { ok: false; message: string };

export function mapClassRow(
  row: ClassRow,
  options: {
    activeStudentCount?: number;
    pendingInvitationCount?: number;
    assignedCourseDraftIds?: string[];
  } = {},
): TeacherClass {
  return {
    id: row.id,
    teacherId: row.teacher_id,
    name: row.name,
    description: row.description,
    language: row.language,
    variety: row.variety,
    level: row.level ?? undefined,
    status: row.status,
    visibility: row.visibility,
    inviteCode: row.invite_code,
    activeStudentCount: options.activeStudentCount ?? 0,
    pendingInvitationCount: options.pendingInvitationCount ?? 0,
    assignedCourseDraftIds: options.assignedCourseDraftIds ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapStudentDirectoryEntryRow(
  row: StudentDirectoryEntryRow,
): StudentDirectoryEntry {
  return {
    profileId: row.profile_id,
    displayName: row.display_name,
    preferredLanguage: row.preferred_language,
    preferredVariety: row.preferred_variety,
  };
}

export function mapClassRosterMemberRow(
  row: ClassRosterMemberRow,
): ClassRosterMember {
  return {
    membershipId: row.membership_id,
    studentId: row.student_id,
    displayName: row.display_name,
    preferredLanguage: row.preferred_language,
    preferredVariety: row.preferred_variety,
    status: row.status,
    invitedAt: row.invited_at,
    requestedAt: row.requested_at ?? undefined,
    requestMessage: row.request_message ?? undefined,
    respondedAt: row.responded_at ?? undefined,
    joinedAt: row.joined_at ?? undefined,
  };
}

export function mapStudentClassMembershipRow(
  row: StudentClassMembershipRow,
): StudentClassMembership {
  return {
    membershipId: row.membership_id,
    classId: row.class_id,
    className: row.class_name,
    classDescription: row.class_description,
    language: row.language,
    variety: row.variety,
    level: row.level ?? undefined,
    teacherId: row.teacher_id,
    teacherName: row.teacher_name,
    membershipStatus: row.membership_status,
    invitedAt: row.invited_at ?? undefined,
    requestedAt: row.requested_at ?? undefined,
    respondedAt: row.responded_at ?? undefined,
    joinedAt: row.joined_at ?? undefined,
  };
}

export function mapDiscoverableClassRow(
  row: DiscoverableClassRow,
): DiscoverableClass {
  return {
    id: row.class_id,
    name: row.class_name,
    description: row.class_description,
    language: row.language,
    variety: row.variety,
    level: row.level ?? undefined,
    teacherId: row.teacher_id,
    teacherName: row.teacher_name,
    activeMemberCount: row.active_member_count,
    membershipStatus: row.membership_status ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapClassJoinRequestRow(
  row: ClassJoinRequestRow,
): ClassJoinRequest {
  return {
    membershipId: row.membership_id,
    studentId: row.student_id,
    displayName: row.display_name,
    preferredLanguage: row.preferred_language,
    preferredVariety: row.preferred_variety,
    requestMessage: row.request_message ?? undefined,
    requestedAt: row.requested_at,
  };
}
export function mapStudentClassInvitationRow(
  row: StudentClassInvitationRow,
): StudentClassInvitation {
  return {
    membershipId: row.membership_id,
    classId: row.class_id,
    className: row.class_name,
    classDescription: row.class_description,
    language: row.language,
    variety: row.variety,
    level: row.level ?? undefined,
    teacherId: row.teacher_id,
    status: row.status,
    invitedAt: row.invited_at,
    respondedAt: row.responded_at ?? undefined,
    joinedAt: row.joined_at ?? undefined,
  };
}
