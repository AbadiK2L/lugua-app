import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import { TeacherAssignmentActionDialog } from "@/src/components/teacher/assignments/TeacherAssignmentActionDialog";
import { getSingleParam } from "@/src/components/teacher/assignments/assignmentUtils";
import { TeacherClassAssignmentsSection } from "@/src/components/teacher/classes/TeacherClassAssignmentsSection";
import { TeacherClassCoursesSection } from "@/src/components/teacher/classes/TeacherClassCoursesSection";
import { TeacherClassFormModal } from "@/src/components/teacher/classes/TeacherClassFormModal";
import { TeacherClassMembersSection } from "@/src/components/teacher/classes/TeacherClassMembersSection";
import { TeacherClassSettingsSection } from "@/src/components/teacher/classes/TeacherClassSettingsSection";
import { TeacherClassSummaryCard } from "@/src/components/teacher/classes/TeacherClassSummaryCard";
import { TeacherScreenShell } from "@/src/components/teacher/TeacherScreenShell";
import { useNotifications } from "@/src/contexts/NotificationsContext";
import { useTeacherAssignments } from "@/src/contexts/TeacherAssignmentsContext";
import { useTeacherClasses } from "@/src/contexts/TeacherClassesContext";
import { useTeacherCourseDrafts } from "@/src/contexts/TeacherCourseDraftsContext";
import {
  getClassJoinRequests,
  getClassRoster,
  getClassesServiceErrorMessage,
  inviteStudentToClass,
  removeStudentFromClass,
  respondToJoinRequest,
  searchStudentDirectory,
} from "@/src/services/classesService";
import type {
  ActionResult,
  ClassJoinRequest,
  ClassRosterMember,
  CreateTeacherClassInput,
  StudentDirectoryEntry,
} from "@/src/types/classes";

type ClassDetailParams = {
  classId?: string | string[];
  notice?: string | string[];
};

type Notice = {
  title: string;
  description: string;
  error?: boolean;
};

type PendingClassAction = "archive" | "restore" | "regenerate" | "delete";
type PendingJoinRequestAction = {
  request: ClassJoinRequest;
  approve: boolean;
};

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatShortDate(value?: string) {
  if (!value) {
    return "Date indisponible";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date indisponible";
  }

  return new Intl.DateTimeFormat("fr-FR").format(date);
}

export default function TeacherClassDetailScreen() {
  const params = useLocalSearchParams<ClassDetailParams>();
  const classId = getParam(params.classId);
  const { refreshNotifications } = useNotifications();
  const { assignments } = useTeacherAssignments();
  const {
    getClassById,
    updateClass,
    archiveClass,
    restoreClass,
    deleteClass,
    regenerateInviteCode,
    assignCourseDraft,
    unassignCourseDraft,
    refreshClasses,
    isLoading: isClassLoading,
    isMutating: isClassMutating,
    error: classesError,
  } = useTeacherClasses();
  const {
    drafts,
    error: coursesError,
    isLoading: isCoursesLoading,
    refreshDrafts,
  } = useTeacherCourseDrafts();
  const teacherClass = classId ? getClassById(classId) : undefined;
  const classAssignments = assignments.filter(
    (assignment) => assignment.classId === classId,
  );
  const [roster, setRoster] = useState<ClassRosterMember[]>([]);
  const [isRosterLoading, setIsRosterLoading] = useState(false);
  const [rosterError, setRosterError] = useState<string | null>(null);
  const [joinRequests, setJoinRequests] = useState<ClassJoinRequest[]>([]);
  const [isJoinRequestsLoading, setIsJoinRequestsLoading] = useState(false);
  const [joinRequestsError, setJoinRequestsError] = useState<string | null>(null);
  const [editVisible, setEditVisible] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | undefined>();
  const [pendingClassAction, setPendingClassAction] =
    useState<PendingClassAction>();
  const [pendingJoinRequestAction, setPendingJoinRequestAction] =
    useState<PendingJoinRequestAction>();
  const [isMemberMutating, setIsMemberMutating] = useState(false);
  const [isJoinRequestMutating, setIsJoinRequestMutating] = useState(false);
  const rosterRequestIdRef = useRef(0);
  const joinRequestsRequestIdRef = useRef(0);
  const memberMutationRef = useRef(false);
  const joinRequestMutationRef = useRef(false);

  const loadRoster = useCallback(async () => {
    if (!classId) {
      setRoster([]);
      setRosterError("Classe introuvable.");
      return;
    }

    const requestId = rosterRequestIdRef.current + 1;
    rosterRequestIdRef.current = requestId;
    setIsRosterLoading(true);
    setRosterError(null);

    try {
      const nextRoster = await getClassRoster(classId);

      if (rosterRequestIdRef.current === requestId) {
        setRoster(nextRoster);
      }
    } catch (caughtError) {
      if (rosterRequestIdRef.current === requestId) {
        setRoster([]);
        setRosterError(getClassesServiceErrorMessage(caughtError));
      }
    } finally {
      if (rosterRequestIdRef.current === requestId) {
        setIsRosterLoading(false);
      }
    }
  }, [classId]);

  const loadJoinRequests = useCallback(async () => {
    if (!classId) {
      setJoinRequests([]);
      setJoinRequestsError("Classe introuvable.");
      return;
    }

    const requestId = joinRequestsRequestIdRef.current + 1;
    joinRequestsRequestIdRef.current = requestId;
    setIsJoinRequestsLoading(true);
    setJoinRequestsError(null);

    try {
      const nextRequests = await getClassJoinRequests(classId);

      if (joinRequestsRequestIdRef.current === requestId) {
        setJoinRequests(nextRequests);
      }
    } catch (caughtError) {
      if (joinRequestsRequestIdRef.current === requestId) {
        setJoinRequests([]);
        setJoinRequestsError(getClassesServiceErrorMessage(caughtError));
      }
    } finally {
      if (joinRequestsRequestIdRef.current === requestId) {
        setIsJoinRequestsLoading(false);
      }
    }
  }, [classId]);

  useEffect(() => {
    if (getParam(params.notice) === "created") {
      setNotice({
        title: "Classe créée",
        description:
          "La classe est maintenant enregistrée dans ton espace.",
      });
    }
  }, [params.notice]);

  useFocusEffect(
    useCallback(() => {
      if (!classId) {
        return undefined;
      }

      void loadRoster();
      void loadJoinRequests();
      void refreshClasses();
      void refreshNotifications();
      return undefined;
    }, [classId, loadJoinRequests, loadRoster, refreshClasses, refreshNotifications]),
  );

  const refreshRosterAndCounts = useCallback(async () => {
    await Promise.all([
      loadRoster(),
      loadJoinRequests(),
      refreshClasses(),
      refreshNotifications(),
    ]);
  }, [loadJoinRequests, loadRoster, refreshClasses, refreshNotifications]);

  async function updateClassFromForm(input: CreateTeacherClassInput) {
    if (!teacherClass) {
      return;
    }

    setFormError(null);
    const result = await updateClass(teacherClass.id, input);

    if (!result.ok) {
      setFormError(result.message);
      return;
    }

    setEditVisible(false);
    setNotice({
      title: "Classe modifiée",
      description: "Les changements sont enregistrés dans ton espace.",
    });
  }

  async function confirmClassAction() {
    if (!pendingClassAction || !teacherClass || isClassMutating) {
      return;
    }

    const currentClass = teacherClass;
    const action = pendingClassAction;
    const result =
      action === "archive"
        ? await archiveClass(currentClass.id)
        : action === "restore"
          ? await restoreClass(currentClass.id)
          : action === "delete"
            ? await deleteClass(currentClass.id)
            : await regenerateInviteCode(currentClass.id);

    if (!result.ok) {
      setNotice({
        title: "Action impossible",
        description: result.message,
        error: true,
      });
      setPendingClassAction(undefined);
      return;
    }

    setPendingClassAction(undefined);

    if (action === "delete") {
      router.replace("/teacher/classes");
      return;
    }

    setNotice(
      action === "archive"
        ? {
            title: "Classe archivée",
            description:
              "Elle reste visible dans le filtre Archivées et refuse les nouvelles invitations.",
          }
        : action === "restore"
          ? {
              title: "Classe restaurée",
              description: "Tu peux de nouveau envoyer des invitations.",
            }
          : {
              title: "Code régénéré",
              description: "Le nouveau code est enregistré pour cette classe.",
            },
    );
  }

  async function confirmJoinRequestAction() {
    if (!pendingJoinRequestAction || joinRequestMutationRef.current) {
      return;
    }

    joinRequestMutationRef.current = true;
    setIsJoinRequestMutating(true);
    setNotice(undefined);

    const currentAction = pendingJoinRequestAction;

    try {
      await respondToJoinRequest(
        currentAction.request.membershipId,
        currentAction.approve,
      );
      setPendingJoinRequestAction(undefined);
      setNotice(
        currentAction.approve
          ? {
              title: "Demande acceptée",
              description: "L’élève est maintenant membre actif de la classe.",
            }
          : {
              title: "Demande refusée",
              description: "L’élève recevra la réponse dans son espace.",
            },
      );
      await refreshRosterAndCounts();
    } catch (caughtError) {
      setPendingJoinRequestAction(undefined);
      setNotice({
        title: "Action impossible",
        description: getClassesServiceErrorMessage(caughtError),
        error: true,
      });
    } finally {
      joinRequestMutationRef.current = false;
      setIsJoinRequestMutating(false);
    }
  }

  const searchStudents = useCallback(
    async (
      searchTerm: string,
    ): Promise<ActionResult<StudentDirectoryEntry[]>> => {
      try {
        const data = await searchStudentDirectory(searchTerm);
        return { ok: true, data };
      } catch (caughtError) {
        return {
          ok: false,
          message: getClassesServiceErrorMessage(caughtError),
        };
      }
    },
    [],
  );

  const inviteStudent = useCallback(
    async (studentId: string): Promise<ActionResult> => {
      if (!classId || !teacherClass) {
        return { ok: false, message: "Classe introuvable." };
      }

      if (teacherClass.status === "archived") {
        return {
          ok: false,
          message:
            "Cette classe est archivée. Restaure-la avant d’envoyer une invitation.",
        };
      }

      if (memberMutationRef.current) {
        return { ok: false, message: "Une action est déjà en cours." };
      }

      memberMutationRef.current = true;
      setIsMemberMutating(true);

      try {
        await inviteStudentToClass(classId, studentId);
        await refreshRosterAndCounts();
        return { ok: true };
      } catch (caughtError) {
        return {
          ok: false,
          message: getClassesServiceErrorMessage(caughtError),
        };
      } finally {
        memberMutationRef.current = false;
        setIsMemberMutating(false);
      }
    },
    [classId, refreshRosterAndCounts, teacherClass],
  );

  const removeMember = useCallback(
    async (studentId: string): Promise<ActionResult> => {
      if (!classId) {
        return { ok: false, message: "Classe introuvable." };
      }

      if (memberMutationRef.current) {
        return { ok: false, message: "Une action est déjà en cours." };
      }

      memberMutationRef.current = true;
      setIsMemberMutating(true);

      try {
        await removeStudentFromClass(classId, studentId);
        await refreshRosterAndCounts();
        return { ok: true };
      } catch (caughtError) {
        return {
          ok: false,
          message: getClassesServiceErrorMessage(caughtError),
        };
      } finally {
        memberMutationRef.current = false;
        setIsMemberMutating(false);
      }
    },
    [classId, refreshRosterAndCounts],
  );

  if (isClassLoading && !teacherClass) {
    return (
      <TeacherScreenShell hideBottomNavigation>
        <View style={styles.loadingCard}>
          <ActivityIndicator color={HOME_COLORS.accent} />
          <Text style={styles.loadingText}>Chargement de la classe…</Text>
        </View>
      </TeacherScreenShell>
    );
  }

  if (!teacherClass) {
    return (
      <TeacherScreenShell hideBottomNavigation>
        <View style={styles.notFound}>
          <Text style={styles.eyebrow}>ESPACE PROFESSEUR</Text>
          <Text style={styles.title}>Classe introuvable</Text>
          <Text style={styles.subtitle}>
            {classesError ??
              "Cette classe n’existe pas ou n’est plus disponible dans ton espace."}
          </Text>
          <View style={styles.headerActions}>
            <ActionButton
              label="Réessayer"
              onPress={() => {
                void refreshClasses();
              }}
            />
            <ActionButton
              label="Retour aux classes"
              onPress={() => router.replace("/teacher/classes")}
              primary
            />
          </View>
        </View>
      </TeacherScreenShell>
    );
  }

  const currentClass = teacherClass;
  const pendingJoinRequestDialog =
    pendingJoinRequestAction?.approve
      ? {
          title: "Accepter cet élève ?",
          message: "Il deviendra membre actif de la classe.",
          confirmLabel: "Accepter",
          destructive: false,
        }
      : {
          title: "Refuser cette demande ?",
          message: "L’élève recevra une notification.",
          confirmLabel: "Refuser",
          destructive: true,
        };
  const pendingDialog =
    pendingClassAction === "archive"
      ? {
          title: "Archiver cette classe ?",
          message:
            "Elle restera accessible dans le filtre Archivées et refusera les nouvelles invitations.",
          confirmLabel: "Archiver",
          destructive: false,
        }
      : pendingClassAction === "restore"
        ? {
            title: "Restaurer cette classe ?",
            message: "Elle redeviendra active.",
            confirmLabel: "Restaurer",
            destructive: false,
          }
        : pendingClassAction === "delete"
          ? {
              title: "Supprimer cette classe ?",
              message:
                "La classe sera supprimée de ton espace. Les brouillons de cours et devoirs locaux resteront disponibles mais leurs anciennes références pourront devenir indisponibles.",
              confirmLabel: "Supprimer",
              destructive: true,
            }
          : {
              title: "Régénérer le code d’invitation ?",
              message:
                "Le nouveau code remplacera l’ancien pour cette classe.",
              confirmLabel: "Régénérer",
              destructive: false,
            };

  return (
    <TeacherScreenShell
      hideBottomNavigation
      refreshing={isRosterLoading || isJoinRequestsLoading}
      onRefresh={() => {
        void refreshRosterAndCounts();
      }}
    >
      <View style={styles.topLine}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour aux classes"
          onPress={() => router.replace("/teacher/classes")}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.backText}>← Retour</Text>
        </Pressable>
        <Text style={[styles.status, currentClass.status === "archived" && styles.archivedStatus]}>
          {currentClass.status === "active" ? "Active" : "Archivée"}
        </Text>
      </View>

      {notice ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer le message de classe"
          onPress={() => setNotice(undefined)}
          style={[styles.notice, notice.error && styles.errorNotice]}
        >
          <Text style={styles.noticeTitle}>{notice.title}</Text>
          <Text style={styles.noticeText}>{notice.description}</Text>
        </Pressable>
      ) : null}

      <TeacherClassSummaryCard teacherClass={currentClass} />

      <View style={styles.syncNote}>
        <Text style={styles.syncTitle}>Synchronisation</Text>
        <Text style={styles.syncText}>
          Les informations de classe et les membres sont enregistrés. Les cours et devoirs restent encore locaux dans cette version.
        </Text>
      </View>

      <View style={styles.headerActions}>
        <ActionButton
          label="Modifier"
          disabled={isClassMutating}
          onPress={() => {
            setFormError(null);
            setEditVisible(true);
          }}
          primary
        />
        <ActionButton
          label={currentClass.status === "active" ? "Archiver" : "Restaurer"}
          disabled={isClassMutating}
          onPress={() =>
            setPendingClassAction(
              currentClass.status === "active" ? "archive" : "restore",
            )
          }
        />
      </View>

      <TeacherClassJoinRequestsSection
        requests={joinRequests}
        classArchived={currentClass.status === "archived"}
        isLoading={isJoinRequestsLoading}
        isMutating={isJoinRequestMutating}
        error={joinRequestsError}
        onRefresh={loadJoinRequests}
        onApprove={(request) =>
          setPendingJoinRequestAction({ request, approve: true })
        }
        onDecline={(request) =>
          setPendingJoinRequestAction({ request, approve: false })
        }
      />

      <TeacherClassMembersSection
        members={roster}
        classArchived={currentClass.status === "archived"}
        isLoading={isRosterLoading}
        isMutating={isMemberMutating}
        error={rosterError}
        onRefresh={loadRoster}
        onSearchStudents={searchStudents}
        onInviteStudent={inviteStudent}
        onRemoveMember={removeMember}
      />
      <TeacherClassCoursesSection
        assignedDraftIds={currentClass.assignedCourseDraftIds}
        drafts={drafts}
        isCoursesLoading={isCoursesLoading}
        coursesError={coursesError}
        onRefreshCourses={refreshDrafts}
        onAssign={(draftId) => assignCourseDraft(currentClass.id, draftId)}
        onUnassign={(draftId) => unassignCourseDraft(currentClass.id, draftId)}
        onGoToCourses={() => router.push({ pathname: "/teacher/courses", params: { mode: "my_courses" } })}
      />
      <TeacherClassAssignmentsSection
        assignments={classAssignments}
        onCreate={() =>
          router.push({
            pathname: "/teacher/assignment-builder",
            params: { classId: currentClass.id },
          })
        }
        onOpen={(assignmentId) => {
          const normalizedAssignmentId = getSingleParam(assignmentId);
          if (!normalizedAssignmentId) {
            setNotice({
              title: "Devoir introuvable",
              description:
                "Ce devoir n’est plus disponible dans cette session.",
              error: true,
            });
            return;
          }
          router.push({
            pathname: "/teacher/assignment/[assignmentId]",
            params: { assignmentId: normalizedAssignmentId },
          });
        }}
      />
      <TeacherClassSettingsSection
        teacherClass={currentClass}
        disabled={isClassMutating}
        onEdit={() => {
          setFormError(null);
          setEditVisible(true);
        }}
        onRegenerateCode={() => setPendingClassAction("regenerate")}
        onArchive={() => setPendingClassAction("archive")}
        onRestore={() => setPendingClassAction("restore")}
        onDelete={() => setPendingClassAction("delete")}
      />

      <TeacherClassFormModal
        visible={editVisible}
        mode="edit"
        initialClass={currentClass}
        submitting={isClassMutating}
        errorMessage={formError}
        onClose={() => {
          if (!isClassMutating) {
            setFormError(null);
            setEditVisible(false);
          }
        }}
        onSubmit={updateClassFromForm}
      />

      <TeacherAssignmentActionDialog
        visible={Boolean(pendingClassAction)}
        title={pendingDialog.title}
        message={pendingDialog.message}
        confirmLabel={pendingDialog.confirmLabel}
        destructive={pendingDialog.destructive}
        submitting={isClassMutating}
        onCancel={() => setPendingClassAction(undefined)}
        onConfirm={() => {
          void confirmClassAction();
        }}
      />

      <TeacherAssignmentActionDialog
        visible={Boolean(pendingJoinRequestAction)}
        title={pendingJoinRequestDialog.title}
        message={pendingJoinRequestDialog.message}
        confirmLabel={pendingJoinRequestDialog.confirmLabel}
        destructive={pendingJoinRequestDialog.destructive}
        submitting={isJoinRequestMutating}
        onCancel={() => setPendingJoinRequestAction(undefined)}
        onConfirm={() => {
          void confirmJoinRequestAction();
        }}
      />
    </TeacherScreenShell>
  );
}

function TeacherClassJoinRequestsSection({
  requests,
  classArchived,
  isLoading,
  isMutating,
  error,
  onRefresh,
  onApprove,
  onDecline,
}: {
  requests: ClassJoinRequest[];
  classArchived: boolean;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  onRefresh: () => void | Promise<void>;
  onApprove: (request: ClassJoinRequest) => void;
  onDecline: (request: ClassJoinRequest) => void;
}) {
  return (
    <View style={styles.joinRequestsSection}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Demandes de participation</Text>
          <Text style={styles.sectionMeta}>
            {requests.length} demande{requests.length === 1 ? "" : "s"} en attente
          </Text>
        </View>
        <ActionButton
          label="Actualiser"
          disabled={isLoading}
          onPress={() => {
            void onRefresh();
          }}
        />
      </View>

      {classArchived ? (
        <View style={styles.inlineNotice}>
          <Text style={styles.inlineNoticeText}>
            Restaure la classe avant d’accepter une nouvelle demande.
          </Text>
        </View>
      ) : null}

      {isLoading ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator color={HOME_COLORS.accent} />
          <Text style={styles.loadingText}>Chargement des demandes…</Text>
        </View>
      ) : error ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Demandes indisponibles</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <ActionButton
            label="Réessayer"
            disabled={isLoading}
            onPress={() => {
              void onRefresh();
            }}
          />
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Aucune demande en attente</Text>
        </View>
      ) : (
        <View style={styles.requestList}>
          {requests.map((request) => (
            <JoinRequestCard
              key={request.membershipId}
              request={request}
              disabled={classArchived || isMutating}
              onApprove={() => onApprove(request)}
              onDecline={() => onDecline(request)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function JoinRequestCard({
  request,
  disabled,
  onApprove,
  onDecline,
}: {
  request: ClassJoinRequest;
  disabled: boolean;
  onApprove: () => void;
  onDecline: () => void;
}) {
  return (
    <View style={styles.requestCard}>
      <View style={styles.requestCopy}>
        <Text style={styles.requestName} numberOfLines={2}>
          {request.displayName}
        </Text>
        <Text style={styles.requestMeta} numberOfLines={2}>
          {request.preferredLanguage} · {request.preferredVariety}
        </Text>
        {request.requestMessage ? (
          <Text style={styles.requestMessage} numberOfLines={4}>
            {request.requestMessage}
          </Text>
        ) : null}
        <Text style={styles.requestDate}>
          Demandée le {formatShortDate(request.requestedAt)}
        </Text>
      </View>
      <View style={styles.requestActions}>
        <ActionButton
          label="Accepter"
          disabled={disabled}
          onPress={onApprove}
          primary
        />
        <ActionButton
          label="Refuser"
          disabled={disabled}
          onPress={onDecline}
        />
      </View>
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  primary = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
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
        styles.actionButton,
        primary && styles.primaryButton,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.actionText, primary && styles.primaryActionText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topLine: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  backButton: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start", borderRadius: 10, paddingHorizontal: 4 },
  backText: { color: HOME_COLORS.accent, fontSize: 14, fontWeight: "800" },
  status: { color: HOME_COLORS.accent, fontSize: 12, fontWeight: "900" },
  archivedStatus: { color: HOME_COLORS.textMuted },
  notice: { gap: 4, borderWidth: 1, borderColor: HOME_COLORS.accent, borderRadius: 12, backgroundColor: HOME_COLORS.accentSoft, padding: 13 },
  errorNotice: { borderColor: "#d86f7e" },
  noticeTitle: { color: HOME_COLORS.textPrimary, fontSize: 14, fontWeight: "900" },
  noticeText: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "600", lineHeight: 19 },
  syncNote: { gap: 5, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 12, backgroundColor: HOME_COLORS.surface, padding: 13 },
  syncTitle: { color: HOME_COLORS.textPrimary, fontSize: 13, fontWeight: "900" },
  syncText: { color: HOME_COLORS.textSecondary, fontSize: 12, fontWeight: "600", lineHeight: 18 },
  headerActions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  joinRequestsSection: { gap: 12 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  sectionHeading: { minWidth: 0, flex: 1, gap: 3 },
  sectionTitle: { color: HOME_COLORS.textPrimary, fontSize: 19, fontWeight: "900" },
  sectionMeta: { color: HOME_COLORS.textMuted, fontSize: 12, fontWeight: "700" },
  inlineNotice: { gap: 4, borderWidth: 1, borderColor: HOME_COLORS.accent, borderRadius: 12, backgroundColor: HOME_COLORS.accentSoft, padding: 12 },
  inlineNoticeText: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "700", lineHeight: 19 },
  emptyState: { gap: 7, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 14, backgroundColor: HOME_COLORS.card, padding: 16 },
  emptyTitle: { color: HOME_COLORS.textPrimary, fontSize: 16, fontWeight: "900" },
  emptyText: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "600", lineHeight: 19 },
  requestList: { gap: 8 },
  requestCard: { minHeight: 86, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 12, backgroundColor: HOME_COLORS.card, padding: 13 },
  requestCopy: { minWidth: 0, flex: 1, gap: 4 },
  requestName: { color: HOME_COLORS.textPrimary, fontSize: 15, fontWeight: "900" },
  requestMeta: { color: HOME_COLORS.textSecondary, fontSize: 12, fontWeight: "700", lineHeight: 18 },
  requestMessage: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "600", lineHeight: 19 },
  requestDate: { color: HOME_COLORS.accentMuted, fontSize: 11, fontWeight: "800", lineHeight: 16 },
  requestActions: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: 6 },
  loadingCard: { minHeight: 94, alignItems: "center", justifyContent: "center", gap: 10, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 14, backgroundColor: HOME_COLORS.card, padding: 18 },
  loadingText: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "800" },
  notFound: { gap: 10, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 14, backgroundColor: HOME_COLORS.card, padding: 18 },
  eyebrow: { color: HOME_COLORS.accent, fontSize: 12, fontWeight: "900" },
  title: { color: HOME_COLORS.textPrimary, fontSize: 28, fontWeight: "900" },
  subtitle: { color: HOME_COLORS.textSecondary, fontSize: 15, fontWeight: "600", lineHeight: 22 },
  actionButton: { minHeight: 46, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 10, backgroundColor: HOME_COLORS.surface, paddingHorizontal: 14 },
  primaryButton: { borderColor: HOME_COLORS.accent, backgroundColor: HOME_COLORS.accent },
  actionText: { color: HOME_COLORS.textPrimary, fontSize: 13, fontWeight: "900" },
  primaryActionText: { color: HOME_COLORS.ink },
  disabled: { opacity: 0.48 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});
