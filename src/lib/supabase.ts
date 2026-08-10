import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";
import { Platform } from "react-native";

import type {
  ClassInsertRow,
  ClassJoinRequestRow,
  ClassMemberRow,
  ClassRosterMemberRow,
  ClassRow,
  ClassUpdateRow,
  DiscoverableClassRow,
  StudentClassInvitationRow,
  StudentClassMembershipRow,
  StudentDirectoryEntryRow,
} from "@/src/types/classes";
import type {
  TeacherAssignmentInsertRow,
  TeacherAssignmentRow,
  TeacherAssignmentUpdateRow,
} from "@/src/types/assignments";
import type {
  ClassCourseAssignmentInsertRow,
  ClassCourseAssignmentRow,
  TeacherCourseInsertRow,
  TeacherCourseRow,
  TeacherCourseUpdateRow,
} from "@/src/types/courses";
import type { LuguaNotificationRow } from "@/src/types/notifications";
import type { ProfileRow } from "@/src/types/profile";
import type {
  StudentClassAssignmentRow,
  StudentClassCourseRow,
} from "@/src/types/studentLearning";

type ProfileUpdate = Partial<
  Pick<ProfileRow, "display_name" | "preferred_variety" | "updated_at">
>;

type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileRow;
        Update: ProfileUpdate;
        Relationships: [];
      };
      classes: {
        Row: ClassRow;
        Insert: ClassInsertRow;
        Update: ClassUpdateRow;
        Relationships: [];
      };
      class_members: {
        Row: ClassMemberRow;
        Insert: never;
        Update: never;
        Relationships: [];
      };
      teacher_courses: {
        Row: TeacherCourseRow;
        Insert: TeacherCourseInsertRow;
        Update: TeacherCourseUpdateRow;
        Relationships: [];
      };
      class_course_assignments: {
        Row: ClassCourseAssignmentRow;
        Insert: ClassCourseAssignmentInsertRow;
        Update: never;
        Relationships: [];
      };
      teacher_assignments: {
        Row: TeacherAssignmentRow;
        Insert: TeacherAssignmentInsertRow;
        Update: TeacherAssignmentUpdateRow;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      search_student_directory: {
        Args: { search_term: string; result_limit: number };
        Returns: StudentDirectoryEntryRow[];
      };
      get_class_roster: {
        Args: { target_class_id: string };
        Returns: ClassRosterMemberRow[];
      };
      invite_student_to_class: {
        Args: { target_class_id: string; target_student_id: string };
        Returns: undefined;
      };
      remove_student_from_class: {
        Args: { target_class_id: string; target_student_id: string };
        Returns: undefined;
      };
      regenerate_class_invite_code: {
        Args: { target_class_id: string };
        Returns: undefined;
      };
      list_discoverable_classes: {
        Args: { search_term: string; result_limit: number };
        Returns: DiscoverableClassRow[];
      };
      request_to_join_class: {
        Args: { target_class_id: string; message: string | null };
        Returns: undefined;
      };
      get_class_join_requests: {
        Args: { target_class_id: string };
        Returns: ClassJoinRequestRow[];
      };
      respond_to_join_request: {
        Args: { membership_id: string; approve_request: boolean };
        Returns: undefined;
      };
      get_my_class_invitations: {
        Args: Record<string, never>;
        Returns: StudentClassInvitationRow[];
      };
      get_my_class_memberships: {
        Args: Record<string, never>;
        Returns: StudentClassMembershipRow[];
      };
      get_my_class_courses: {
        Args: { target_class_id: string };
        Returns: StudentClassCourseRow[];
      };
      get_my_class_assignments: {
        Args: { target_class_id: string };
        Returns: StudentClassAssignmentRow[];
      };
      respond_to_class_invitation: {
        Args: { membership_id: string; accept_invitation: boolean };
        Returns: undefined;
      };
      get_my_notifications: {
        Args: { result_limit: number; unread_only: boolean };
        Returns: LuguaNotificationRow[];
      };
      mark_notification_read: {
        Args: { target_notification_id: string };
        Returns: undefined;
      };
      mark_all_notifications_read: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      publish_teacher_assignment: {
        Args: { target_assignment_id: string };
        Returns: TeacherAssignmentRow;
      };
      close_teacher_assignment: {
        Args: { target_assignment_id: string };
        Returns: TeacherAssignmentRow;
      };
      reopen_teacher_assignment: {
        Args: { target_assignment_id: string };
        Returns: TeacherAssignmentRow;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? "";
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";

export const isSupabaseConfigured =
  supabaseUrl.length > 0 && supabasePublishableKey.length > 0;

export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabasePublishableKey, {
      auth: {
        ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        lock: processLock,
      },
    })
  : null;
