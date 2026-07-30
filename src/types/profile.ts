export type UserRole = "student" | "teacher";

export type ProfileRow = {
  id: string;
  display_name: string;
  role: UserRole;
  preferred_language: string;
  preferred_variety: string;
  created_at: string;
  updated_at: string;
};

export type UserProfile = {
  id: string;
  displayName: string;
  role: UserRole;
  preferredLanguage: string;
  preferredVariety: string;
  createdAt: string;
  updatedAt: string;
};

export function isUserRole(value: string): value is UserRole {
  return value === "student" || value === "teacher";
}

export function mapProfileRow(row: ProfileRow): UserProfile {
  if (!isUserRole(row.role)) {
    throw new Error("Le profil Lugua contient un rôle invalide.");
  }

  return {
    id: row.id,
    displayName: row.display_name,
    role: row.role,
    preferredLanguage: row.preferred_language,
    preferredVariety: row.preferred_variety,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type ProfileSharedActions = {
  onEditProfile: () => void;
  onSignOut: () => void;
  onOpenNotifications: () => void;
  onOpenAbout: () => void;
  onOpenSources: () => void;
  onOpenPrivacy: () => void;
};

export type StudentProfileActions = ProfileSharedActions & {
  onOpenLessons: () => void;
  onOpenAssignments: () => void;
  onOpenAiTraining: () => void;
  onOpenSavedWords: () => void;
  onOpenAudioSettings: () => void;
};

export type TeacherProfileActions = ProfileSharedActions & {
  onOpenClasses: () => void;
  onOpenStudents: () => void;
  onCreateAssignment: () => void;
  onOpenAssignments: () => void;
  onOpenContent: () => void;
  onOpenStudentTracking: () => void;
  onSendAnnouncement: () => void;
  onAddResource: () => void;
};
