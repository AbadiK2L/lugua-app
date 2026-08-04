import { NotificationsScreenContent } from "@/src/components/notifications/NotificationsScreenContent";
import { ProfileScreenShell } from "@/src/components/profile/ProfileScreenShell";

export default function TeacherNotificationsScreen() {
  return (
    <ProfileScreenShell fallbackHref="/teacher" title="Notifications">
      <NotificationsScreenContent />
    </ProfileScreenShell>
  );
}
