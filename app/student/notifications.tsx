import { NotificationsScreenContent } from "@/src/components/notifications/NotificationsScreenContent";
import { ProfileScreenShell } from "@/src/components/profile/ProfileScreenShell";

export default function StudentNotificationsScreen() {
  return (
    <ProfileScreenShell fallbackHref="/student" title="Notifications">
      <NotificationsScreenContent />
    </ProfileScreenShell>
  );
}
