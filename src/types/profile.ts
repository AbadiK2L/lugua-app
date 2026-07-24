export type UserRole = "student" | "teacher";

export type ProfileSharedActions = {
  onEditProfile: () => void;
  onExitDemo: () => void;
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
