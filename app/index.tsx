import { Redirect, type Href } from "expo-router";

import { AuthLoadingScreen } from "@/src/components/auth/AuthLoadingScreen";
import { ProfileUnavailableScreen } from "@/src/components/auth/ProfileUnavailableScreen";
import { useAuthSession } from "@/src/contexts/AuthSessionContext";

export default function EntryRedirect() {
  const {
    session,
    profile,
    isLoading,
    isRefreshingProfile,
    isSubmitting,
    refreshProfile,
    signOut,
  } = useAuthSession();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (!session) {
    return <Redirect href="/auth/welcome" />;
  }

  if (!profile) {
    return (
      <ProfileUnavailableScreen
        isRetrying={isRefreshingProfile}
        isSigningOut={isSubmitting}
        onRetry={() => {
          void refreshProfile();
        }}
        onSignOut={() => {
          void signOut();
        }}
      />
    );
  }

  if (profile.role === "student") {
    return <Redirect href={"/student" as Href} />;
  }

  if (profile.role === "teacher") {
    return <Redirect href={"/teacher" as Href} />;
  }

  return null;
}
