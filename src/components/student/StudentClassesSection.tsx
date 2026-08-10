import { useFocusEffect } from "@react-navigation/native";
import { router, type Href } from "expo-router";
import { useCallback, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { HOME_COLORS } from "@/src/components/home/homeColors";
import { TeacherAssignmentActionDialog } from "@/src/components/teacher/assignments/TeacherAssignmentActionDialog";
import {
  getClassesServiceErrorMessage,
  getMyClassMemberships,
  respondToClassInvitation,
} from "@/src/services/classesService";
import type { StudentClassMembership } from "@/src/types/classes";

type Notice = {
  title: string;
  description?: string;
  error?: boolean;
};

type PendingResponse = {
  invitation: StudentClassMembership;
  accept: boolean;
};

function formatDate(value?: string) {
  if (!value) {
    return "Date indisponible";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date indisponible";
  }

  return new Intl.DateTimeFormat("fr-FR").format(date);
}

export function StudentClassesSection() {
  const [classes, setClasses] = useState<StudentClassMembership[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [pendingResponse, setPendingResponse] = useState<PendingResponse>();
  const requestIdRef = useRef(0);
  const mutationRef = useRef(false);
  const invitations = classes.filter((item) => item.membershipStatus === "invited");
  const requestedClasses = classes.filter((item) => item.membershipStatus === "requested");
  const joinedClasses = classes.filter((item) => item.membershipStatus === "active");

  const loadClasses = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsLoading(true);
    setError(null);

    try {
      const nextClasses = await getMyClassMemberships();

      if (requestIdRef.current === requestId) {
        setClasses(nextClasses);
      }
    } catch (caughtError) {
      if (requestIdRef.current === requestId) {
        setError(getClassesServiceErrorMessage(caughtError));
      }
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadClasses();
      return undefined;
    }, [loadClasses]),
  );

  async function confirmResponse() {
    if (!pendingResponse || mutationRef.current) {
      return;
    }

    mutationRef.current = true;
    setIsMutating(true);
    setNotice(null);

    try {
      await respondToClassInvitation(
        pendingResponse.invitation.membershipId,
        pendingResponse.accept,
      );
      setNotice(
        pendingResponse.accept
          ? {
              title: "Classe rejointe",
              description: "La classe apparaît maintenant dans Mes classes.",
            }
          : {
              title: "Invitation refusée",
            },
      );
      setPendingResponse(undefined);
      await loadClasses();
    } catch (caughtError) {
      setNotice({
        title: "Action impossible",
        description: getClassesServiceErrorMessage(caughtError),
        error: true,
      });
      setPendingResponse(undefined);
    } finally {
      mutationRef.current = false;
      setIsMutating(false);
    }
  }

  const dialog =
    pendingResponse?.accept
      ? {
          title: "Rejoindre cette classe ?",
          message:
            "Tu auras accès aux cours et devoirs partagés dans cette classe.",
          confirmLabel: "Accepter",
          destructive: false,
        }
      : {
          title: "Refuser cette invitation ?",
          message: "Elle disparaîtra de tes invitations.",
          confirmLabel: "Refuser",
          destructive: true,
        };

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <Text style={styles.title}>Mes classes</Text>
          <Text style={styles.subtitle}>
            Invitations, demandes et classes enregistrées dans ton espace.
          </Text>
        </View>
        <SmallButton
          label="Actualiser"
          disabled={isLoading || isMutating}
          onPress={() => {
            void loadClasses();
          }}
        />
      </View>

      {notice ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer le message Mes classes"
          onPress={() => setNotice(null)}
          style={[styles.notice, notice.error && styles.errorNotice]}
        >
          <Text style={styles.noticeTitle}>{notice.title}</Text>
          {notice.description ? (
            <Text style={styles.noticeText}>{notice.description}</Text>
          ) : null}
        </Pressable>
      ) : null}

      {isLoading && classes.length === 0 ? (
        <View style={styles.stateCard}>
          <ActivityIndicator color={HOME_COLORS.accent} />
          <Text style={styles.stateText}>Chargement des classes…</Text>
        </View>
      ) : error ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>Mes classes indisponibles</Text>
          <Text style={styles.stateText}>{error}</Text>
          <SmallButton
            label="Réessayer"
            disabled={isLoading}
            onPress={() => {
              void loadClasses();
            }}
          />
        </View>
      ) : classes.length === 0 ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>Aucune classe rejointe</Text>
          <Text style={styles.stateText}>
            Les invitations envoyées par un professeur apparaîtront ici.
          </Text>
        </View>
      ) : (
        <View style={styles.groups}>
          {invitations.length > 0 ? (
            <ClassGroup title="Invitations">
              {invitations.map((invitation) => (
                <InvitationCard
                  key={invitation.membershipId}
                  invitation={invitation}
                  disabled={isMutating}
                  onAccept={() => setPendingResponse({ invitation, accept: true })}
                  onDecline={() =>
                    setPendingResponse({ invitation, accept: false })
                  }
                />
              ))}
            </ClassGroup>
          ) : null}

          {requestedClasses.length > 0 ? (
            <ClassGroup title="Demandes envoyées">
              {requestedClasses.slice(0, 2).map((requestedClass) => (
                <RequestedClassCard
                  key={requestedClass.membershipId}
                  requestedClass={requestedClass}
                />
              ))}
            </ClassGroup>
          ) : null}

          <ClassGroup title="Classes rejointes">
            {joinedClasses.length === 0 ? (
              <View style={styles.compactEmpty}>
                <Text style={styles.stateTitle}>Aucune classe rejointe</Text>
                <Text style={styles.stateText}>
                  Les invitations acceptées apparaîtront ici.
                </Text>
              </View>
            ) : (
              joinedClasses.map((joinedClass) => (
                <JoinedClassCard
                  key={joinedClass.membershipId}
                  joinedClass={joinedClass}
                />
              ))
            )}
          </ClassGroup>
        </View>
      )}

      <SmallButton
        label="Voir toutes les classes"
        onPress={() => router.push("/student/classes")}
        primary
      />

      <TeacherAssignmentActionDialog
        visible={Boolean(pendingResponse)}
        title={dialog.title}
        message={dialog.message}
        confirmLabel={dialog.confirmLabel}
        destructive={dialog.destructive}
        submitting={isMutating}
        onCancel={() => setPendingResponse(undefined)}
        onConfirm={() => {
          void confirmResponse();
        }}
      />
    </View>
  );
}

function ClassGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.list}>{children}</View>
    </View>
  );
}

function InvitationCard({
  invitation,
  disabled,
  onAccept,
  onDecline,
}: {
  invitation: StudentClassMembership;
  disabled: boolean;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <View style={styles.classCard}>
      <ClassCopy invitation={invitation} />
      <Text style={styles.meta}>Invitée le {formatDate(invitation.invitedAt)}</Text>
      <View style={styles.actions}>
        <SmallButton label="Accepter" disabled={disabled} onPress={onAccept} primary />
        <SmallButton label="Refuser" disabled={disabled} onPress={onDecline} destructive />
      </View>
    </View>
  );
}

function RequestedClassCard({
  requestedClass,
}: {
  requestedClass: StudentClassMembership;
}) {
  return (
    <View style={styles.classCard}>
      <ClassCopy invitation={requestedClass} />
      <Text style={styles.meta}>
        En attente de validation · demandée le {formatDate(requestedClass.requestedAt)}
      </Text>
    </View>
  );
}

function JoinedClassCard({
  joinedClass,
}: {
  joinedClass: StudentClassMembership;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ouvrir la classe ${joinedClass.className}`}
      onPress={() =>
        router.push(`/student/class/${joinedClass.classId}` as Href)
      }
      style={({ pressed }) => [styles.classCard, pressed && styles.pressed]}
    >
      <ClassCopy invitation={joinedClass} />
      <Text style={styles.meta}>
        Rejointe le {formatDate(joinedClass.joinedAt ?? joinedClass.respondedAt)}
      </Text>
      <View style={styles.openRow}>
        <Text style={styles.openLabel}>Voir la classe</Text>
        <IconSymbol
          name="chevron.right"
          size={18}
          color={HOME_COLORS.accent}
        />
      </View>
    </Pressable>
  );
}

function ClassCopy({ invitation }: { invitation: StudentClassMembership }) {
  return (
    <View style={styles.heading}>
      <Text style={styles.className} numberOfLines={2}>
        {invitation.className}
      </Text>
      {invitation.classDescription ? (
        <Text style={styles.classDescription} numberOfLines={3}>
          {invitation.classDescription}
        </Text>
      ) : null}
      <Text style={styles.meta}>
        {invitation.teacherName} · {invitation.language} · {invitation.variety} ·{" "}
        {invitation.level ?? "Niveau non défini"}
      </Text>
    </View>
  );
}

function SmallButton({
  label,
  onPress,
  primary = false,
  destructive = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
  destructive?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.smallButton,
        primary && styles.primaryButton,
        destructive && styles.destructiveButton,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.smallButtonText,
          primary && styles.primaryButtonText,
          destructive && styles.destructiveText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  heading: { minWidth: 0, flex: 1, gap: 4 },
  title: { color: HOME_COLORS.textPrimary, fontSize: 19, fontWeight: "900" },
  subtitle: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "600", lineHeight: 19 },
  notice: { gap: 4, borderWidth: 1, borderColor: HOME_COLORS.accent, borderRadius: 12, backgroundColor: HOME_COLORS.accentSoft, padding: 13 },
  errorNotice: { borderColor: "#d86f7e" },
  noticeTitle: { color: HOME_COLORS.textPrimary, fontSize: 14, fontWeight: "900" },
  noticeText: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "600", lineHeight: 19 },
  stateCard: { gap: 8, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 14, backgroundColor: HOME_COLORS.card, padding: 16 },
  stateTitle: { color: HOME_COLORS.textPrimary, fontSize: 15, fontWeight: "900" },
  stateText: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "600", lineHeight: 19 },
  groups: { gap: 14 },
  group: { gap: 8 },
  groupTitle: { color: HOME_COLORS.textPrimary, fontSize: 15, fontWeight: "900" },
  list: { gap: 8 },
  compactEmpty: { gap: 6, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 12, backgroundColor: HOME_COLORS.surface, padding: 13 },
  classCard: { gap: 8, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 14, backgroundColor: HOME_COLORS.card, padding: 15 },
  className: { color: HOME_COLORS.textPrimary, fontSize: 16, fontWeight: "900" },
  classDescription: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "600", lineHeight: 19 },
  meta: { color: HOME_COLORS.accentMuted, fontSize: 12, fontWeight: "800", lineHeight: 18 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  openRow: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 3, paddingTop: 2 },
  openLabel: { color: HOME_COLORS.accent, fontSize: 12, fontWeight: "900" },
  smallButton: { minHeight: 44, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 9, backgroundColor: HOME_COLORS.surface, paddingHorizontal: 11 },
  primaryButton: { borderColor: HOME_COLORS.accent, backgroundColor: HOME_COLORS.accent },
  destructiveButton: { borderColor: "#8e4654" },
  smallButtonText: { color: HOME_COLORS.textPrimary, fontSize: 11, fontWeight: "900" },
  primaryButtonText: { color: HOME_COLORS.ink },
  destructiveText: { color: "#ffb4c0" },
  disabled: { opacity: 0.48 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});
