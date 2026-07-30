import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import { TeacherAssignmentActionDialog } from "@/src/components/teacher/assignments/TeacherAssignmentActionDialog";
import { TeacherAssignmentSettingsSection } from "@/src/components/teacher/assignments/TeacherAssignmentSettingsSection";
import { TeacherAssignmentSubmissionsSection } from "@/src/components/teacher/assignments/TeacherAssignmentSubmissionsSection";
import { TeacherAssignmentSummaryCard } from "@/src/components/teacher/assignments/TeacherAssignmentSummaryCard";
import { getSingleParam } from "@/src/components/teacher/assignments/assignmentUtils";
import { TeacherScreenShell } from "@/src/components/teacher/TeacherScreenShell";
import { useTeacherAssignments } from "@/src/contexts/TeacherAssignmentsContext";
import { useTeacherClasses } from "@/src/contexts/TeacherClassesContext";
import { useTeacherCourseDrafts } from "@/src/contexts/TeacherCourseDraftsContext";
import type { PublishAssignmentFailureReason } from "@/src/types/teacher";

type AssignmentDetailParams = {
  assignmentId?: string | string[];
};

type PendingAction = "publish" | "delete" | "close" | "reopen";

type ActionFeedback = {
  title: string;
  description: string;
};

function getPublishFailureFeedback(
  reason: PublishAssignmentFailureReason,
): ActionFeedback {
  if (reason === "class_archived") {
    return {
      title: "Impossible de publier",
      description:
        "La classe liée est archivée. Restaure-la ou choisis une autre classe.",
    };
  }
  if (reason === "class_not_found") {
    return {
      title: "Impossible de publier",
      description: "La classe liée n’est plus disponible.",
    };
  }
  if (reason === "missing_title") {
    return {
      title: "Impossible de publier",
      description: "Ajoute un titre au devoir avant de le publier.",
    };
  }
  return {
    title: "Devoir introuvable",
    description: "Ce devoir n’est plus disponible dans cette session.",
  };
}

export default function TeacherAssignmentDetailScreen() {
  const params = useLocalSearchParams<AssignmentDetailParams>();
  const assignmentId = getSingleParam(params.assignmentId);
  const {
    getAssignmentById,
    publishAssignment,
    closeAssignment,
    reopenAssignment,
    duplicateAssignment,
    deleteAssignment,
  } = useTeacherAssignments();
  const { classes } = useTeacherClasses();
  const { drafts } = useTeacherCourseDrafts();
  const assignment = assignmentId
    ? getAssignmentById(assignmentId)
    : undefined;
  const [pendingAction, setPendingAction] = useState<PendingAction>();
  const [feedback, setFeedback] = useState<ActionFeedback>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLeavingAfterDelete, setIsLeavingAfterDelete] = useState(false);
  const actionLockRef = useRef(false);

  useEffect(() => {
    if (!pendingAction) {
      actionLockRef.current = false;
      setIsSubmitting(false);
    }
  }, [pendingAction]);

  if (isLeavingAfterDelete) {
    return (
      <TeacherScreenShell hideBottomNavigation>
        <View style={styles.notFound}>
          <Text style={styles.eyebrow}>ESPACE PROFESSEUR</Text>
          <Text style={styles.title}>Retour aux devoirs…</Text>
        </View>
      </TeacherScreenShell>
    );
  }

  if (!assignment) {
    return (
      <TeacherScreenShell hideBottomNavigation>
        <View style={styles.notFound}>
          <Text style={styles.eyebrow}>ESPACE PROFESSEUR</Text>
          <Text style={styles.title}>Devoir introuvable</Text>
          <Text style={styles.subtitle}>
            Ce devoir n’existe pas ou n’est plus disponible dans cette session.
          </Text>
          <ActionButton
            label="Retour aux devoirs"
            onPress={() => router.replace("/teacher/assignments")}
            primary
          />
        </View>
      </TeacherScreenShell>
    );
  }

  const currentAssignment = assignment;
  const teacherClass = classes.find(
    (candidate) => candidate.id === currentAssignment.classId,
  );
  const courseDraft = drafts.find(
    (draft) => draft.id === currentAssignment.courseDraftId,
  );

  function getCurrentAssignmentId() {
    const normalizedId = getSingleParam(currentAssignment.id);
    if (!normalizedId) {
      setFeedback({
        title: "Devoir introuvable",
        description: "Ce devoir n’est plus disponible dans cette session.",
      });
      return undefined;
    }
    return normalizedId;
  }

  function requestAction(action: PendingAction) {
    if (!getCurrentAssignmentId()) {
      return;
    }
    setFeedback(undefined);
    setPendingAction(action);
  }

  function duplicate() {
    const normalizedId = getCurrentAssignmentId();
    if (!normalizedId) {
      return;
    }
    const result = duplicateAssignment(normalizedId);
    if (!result) {
      setFeedback({
        title: "Devoir introuvable",
        description: "Ce devoir n’est plus disponible dans cette session.",
      });
      return;
    }

    router.replace({
      pathname: "/teacher/assignments",
      params: { status: "draft", notice: "duplicated" },
    });
  }

  function confirmPendingAction() {
    if (!pendingAction || actionLockRef.current) {
      return;
    }

    const normalizedId = getCurrentAssignmentId();
    if (!normalizedId) {
      setPendingAction(undefined);
      return;
    }

    actionLockRef.current = true;
    setIsSubmitting(true);

    if (pendingAction === "publish") {
      const result = publishAssignment(normalizedId);
      if (!result.ok) {
        setFeedback(getPublishFailureFeedback(result.reason));
      } else {
        setFeedback({
          title: "Devoir publié",
          description:
            "Le devoir est maintenant visible dans Publiés pour cette session.",
        });
      }
      setPendingAction(undefined);
      return;
    }

    if (pendingAction === "delete") {
      setIsLeavingAfterDelete(true);
      deleteAssignment(normalizedId);
      router.replace({
        pathname: "/teacher/assignments",
        params: {
          status: currentAssignment.status,
          notice: "deleted",
        },
      });
      return;
    }

    if (pendingAction === "close") {
      closeAssignment(normalizedId);
    } else {
      reopenAssignment(normalizedId);
    }
    setPendingAction(undefined);
  }

  function openEditor() {
    const normalizedId = getCurrentAssignmentId();
    if (!normalizedId) {
      return;
    }

    router.push({
      pathname: "/teacher/assignment-builder",
      params: {
        assignmentId: normalizedId,
        mode: "edit",
        returnTo: `/teacher/assignment/${normalizedId}`,
      },
    });
  }

  const pendingDialog =
    pendingAction === "publish"
      ? {
          title: "Publier ce devoir ?",
          message:
            "Il sera marqué comme publié pour cette classe pendant la session actuelle. Aucune notification réelle ne sera envoyée.",
          confirmLabel: "Publier",
          destructive: false,
        }
      : pendingAction === "delete"
        ? {
            title: "Supprimer ce devoir ?",
            message:
              "Cette action supprimera le devoir de la session actuelle.",
            confirmLabel: "Supprimer",
            destructive: true,
          }
        : pendingAction === "close"
          ? {
              title: "Clôturer ce devoir ?",
              message:
                "Il sera déplacé dans Terminés. Aucun nouveau rendu ne pourra être simulé dans cette maquette.",
              confirmLabel: "Clôturer",
              destructive: false,
            }
          : {
              title: "Rouvrir ce devoir ?",
              message: "Il redeviendra publié dans cette session.",
              confirmLabel: "Rouvrir",
              destructive: false,
            };

  return (
    <TeacherScreenShell hideBottomNavigation>
      <View style={styles.topLine}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour aux devoirs"
          onPress={() =>
            router.replace({
              pathname: "/teacher/assignments",
              params: { status: currentAssignment.status },
            })
          }
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.backText}>← Retour</Text>
        </Pressable>
        <Text style={styles.demoLabel}>Mode de démonstration</Text>
      </View>

      <TeacherAssignmentSummaryCard
        assignment={currentAssignment}
        teacherClass={teacherClass}
        courseDraft={courseDraft}
      />

      {feedback ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer le message"
          onPress={() => setFeedback(undefined)}
          style={[
            styles.feedback,
            feedback.title === "Impossible de publier" &&
              styles.errorFeedback,
          ]}
        >
          <Text style={styles.feedbackTitle}>{feedback.title}</Text>
          <Text style={styles.feedbackText}>{feedback.description}</Text>
        </Pressable>
      ) : null}

      <TeacherAssignmentSubmissionsSection
        studentCount={teacherClass?.students.length}
      />

      <TeacherAssignmentSettingsSection
        status={currentAssignment.status}
        onEdit={openEditor}
        onDuplicate={duplicate}
        onPublish={() => requestAction("publish")}
        onClose={() => requestAction("close")}
        onReopen={() => requestAction("reopen")}
        onDelete={() => requestAction("delete")}
      />

      <TeacherAssignmentActionDialog
        visible={Boolean(pendingAction)}
        title={pendingDialog.title}
        message={pendingDialog.message}
        confirmLabel={pendingDialog.confirmLabel}
        destructive={pendingDialog.destructive}
        submitting={isSubmitting}
        onCancel={() => setPendingAction(undefined)}
        onConfirm={confirmPendingAction}
      />
    </TeacherScreenShell>
  );
}

function ActionButton({
  label,
  onPress,
  primary = false,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        primary && styles.primaryButton,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.actionText,
          primary && styles.primaryActionText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topLine: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  backButton: {
    minHeight: 44,
    justifyContent: "center",
    borderRadius: 10,
    paddingHorizontal: 4,
  },
  backText: { color: HOME_COLORS.accent, fontSize: 14, fontWeight: "800" },
  demoLabel: {
    color: HOME_COLORS.textMuted,
    fontSize: 11,
    fontWeight: "800",
  },
  feedback: {
    gap: 4,
    borderWidth: 1,
    borderColor: HOME_COLORS.accent,
    borderRadius: 12,
    backgroundColor: HOME_COLORS.accentSoft,
    padding: 13,
  },
  errorFeedback: { borderColor: "#d86f7e" },
  feedbackTitle: {
    color: HOME_COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "900",
  },
  feedbackText: {
    color: HOME_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  notFound: {
    gap: 10,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 14,
    backgroundColor: HOME_COLORS.card,
    padding: 18,
  },
  eyebrow: { color: HOME_COLORS.accent, fontSize: 12, fontWeight: "900" },
  title: { color: HOME_COLORS.textPrimary, fontSize: 28, fontWeight: "900" },
  subtitle: {
    color: HOME_COLORS.textSecondary,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
  },
  actionButton: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 10,
    backgroundColor: HOME_COLORS.surface,
    paddingHorizontal: 14,
  },
  primaryButton: {
    borderColor: HOME_COLORS.accent,
    backgroundColor: HOME_COLORS.accent,
  },
  actionText: {
    color: HOME_COLORS.textPrimary,
    fontSize: 13,
    fontWeight: "900",
  },
  primaryActionText: { color: HOME_COLORS.ink },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});
