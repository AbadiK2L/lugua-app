import { Redirect, type Href } from "expo-router";
import type { ReactNode } from "react";

import { AuthLoadingScreen } from "@/src/components/auth/AuthLoadingScreen";
import { ProfileUnavailableScreen } from "@/src/components/auth/ProfileUnavailableScreen";
import { useAuthSession } from "@/src/contexts/AuthSessionContext";
import type { UserRole } from "@/src/types/profile";

type ProtectedRoleRouteProps = {
  allowedRole: UserRole;
  children: ReactNode;
};

export function ProtectedRoleRoute({
  allowedRole,
  children,
}: ProtectedRoleRouteProps) {
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

  if (profile.role !== allowedRole) {
    const destination = profile.role === "student" ? "/student" : "/teacher";
    return <Redirect href={destination as Href} />;
  }

  return children;
}
