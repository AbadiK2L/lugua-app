import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import { TeacherAssignmentActionDialog } from "@/src/components/teacher/assignments/TeacherAssignmentActionDialog";
import {
  type AssignmentDueFilter,
  TeacherAssignmentsFilters,
} from "@/src/components/teacher/assignments/TeacherAssignmentsFilters";
import { TeacherAssignmentCard } from "@/src/components/teacher/assignments/TeacherAssignmentCard";
import { TeacherAssignmentsModeSwitch } from "@/src/components/teacher/assignments/TeacherAssignmentsModeSwitch";
import {
  getConceptTitle,
  getSingleParam,
} from "@/src/components/teacher/assignments/assignmentUtils";
import { TeacherScreenShell } from "@/src/components/teacher/TeacherScreenShell";
import { useTeacherAssignments } from "@/src/contexts/TeacherAssignmentsContext";
import { useTeacherClasses } from "@/src/contexts/TeacherClassesContext";
import { useTeacherCourseDrafts } from "@/src/contexts/TeacherCourseDraftsContext";
import type {
  PublishAssignmentFailureReason,
  TeacherAssignment,
  TeacherAssignmentStatus,
} from "@/src/types/teacher";

type AssignmentsParams = {
  status?: string | string[];
  notice?: string | string[];
};

const emptyStates: Record<
  TeacherAssignmentStatus,
  { title: string; description: string }
> = {
  draft: {
    title: "Aucun brouillon",
    description: "Crée un devoir à partir d’un cours ou d’un groupe de notions.",
  },
  published: {
    title: "Aucun devoir publié",
    description: "Les devoirs publiés pour tes classes apparaîtront ici.",
  },
  closed: {
    title: "Aucun devoir terminé",
    description: "Les devoirs clôturés apparaîtront ici.",
  },
};

const noticeMessages: Record<string, { title: string; description: string }> = {
  draft_created: {
    title: "Brouillon créé",
    description: "Le devoir est enregistré dans Brouillons.",
  },
  published_created: {
    title: "Devoir publié",
    description: "Le devoir est maintenant dans Publiés.",
  },
  published_success: {
    title: "Devoir publié",
    description: "Le devoir est maintenant dans Publiés.",
  },
  draft_updated: {
    title: "Brouillon modifié",
    description: "Les changements sont enregistrés.",
  },
  duplicated: {
    title: "Devoir dupliqué",
    description: "Une copie a été ajoutée dans Brouillons.",
  },
  deleted: {
    title: "Devoir supprimé",
    description: "Le devoir a été supprimé.",
  },
  closed: {
    title: "Devoir clôturé",
    description: "Le devoir est maintenant dans Terminés.",
  },
  reopened: {
    title: "Devoir rouvert",
    description: "Le devoir est de nouveau dans Publiés.",
  },
};

type PendingAction = {
  type: "publish" | "delete" | "close" | "reopen";
  assignmentId: string;
};

type ActionFeedback = {
  title: string;
  description: string;
};

function getRequestedStatus(
  value: string | string[] | undefined,
): TeacherAssignmentStatus {
  const status = getSingleParam(value);
  return status === "published" || status === "closed" ? status : "draft";
}

function getPublishFailureFeedback(
  reason: PublishAssignmentFailureReason,
  message: string,
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
  if (reason === "assignment_not_found") {
    return {
      title: "Devoir introuvable",
      description: "Ce devoir n’est plus disponible.",
    };
  }
  return {
    title: "Action impossible",
    description: message,
  };
}

export default function TeacherAssignmentsScreen() {
  const params = useLocalSearchParams<AssignmentsParams>();
  const {
    assignments,
    publishAssignment,
    closeAssignment,
    reopenAssignment,
    duplicateAssignment,
    deleteAssignment,
    isLoading,
    isMutating,
    error,
    refreshAssignments,
  } = useTeacherAssignments();
  const { classes } = useTeacherClasses();
  const { drafts } = useTeacherCourseDrafts();
  const [status, setStatus] = useState<TeacherAssignmentStatus>(() =>
    getRequestedStatus(params.status),
  );
  const [search, setSearch] = useState("");
  const [classId, setClassId] = useState("all");
  const [dueFilter, setDueFilter] = useState<AssignmentDueFilter>("all");
  const [notice, setNotice] = useState(() => getSingleParam(params.notice));
  const [actionFeedback, setActionFeedback] = useState<ActionFeedback>();
  const [pendingAction, setPendingAction] = useState<PendingAction>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const actionLockRef = useRef(false);

  useEffect(() => {
    setStatus(getRequestedStatus(params.status));
    setNotice(getSingleParam(params.notice));
  }, [params.notice, params.status]);

  useEffect(() => {
    if (!pendingAction) {
      actionLockRef.current = false;
      setIsSubmitting(false);
    }
  }, [pendingAction]);

  const statusAssignments = useMemo(
    () => assignments.filter((assignment) => assignment.status === status),
    [assignments, status],
  );

  const filteredAssignments = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    return statusAssignments.filter((assignment) => {
      const teacherClass = classes.find(
        (candidate) => candidate.id === assignment.classId,
      );
      const courseDraft = drafts.find(
        (draft) => draft.id === assignment.courseDraftId,
      );
      const searchableText = [
        assignment.title,
        assignment.instructions,
        teacherClass?.name ?? "",
        teacherClass?.level ?? "",
        teacherClass?.variety ?? "",
        courseDraft?.title ?? "",
        courseDraft?.level ?? "",
        courseDraft?.variety ?? "",
        ...assignment.selectedConceptIds.map(
          (conceptId) => getConceptTitle(conceptId) ?? conceptId,
        ),
      ]
        .join(" ")
        .toLocaleLowerCase();
      const matchesClass =
        classId === "all" || assignment.classId === classId;
      const matchesDate =
        dueFilter === "all" ||
        (dueFilter === "with_due_date" && Boolean(assignment.dueDate)) ||
        (dueFilter === "without_due_date" && !assignment.dueDate);

      return (
        matchesClass &&
        matchesDate &&
        (!query || searchableText.includes(query))
      );
    });
  }, [classId, classes, drafts, dueFilter, search, statusAssignments]);

  function resetFilters() {
    setSearch("");
    setClassId("all");
    setDueFilter("all");
  }

  function openBuilder() {
    router.push("/teacher/assignment-builder");
  }

  function getValidAssignmentId(value: string | string[] | undefined) {
    const assignmentId = getSingleParam(value);
    if (
      !assignmentId ||
      !assignments.some((assignment) => assignment.id === assignmentId)
    ) {
      setActionFeedback({
        title: "Devoir introuvable",
        description: "Ce devoir n’est plus disponible.",
      });
      return undefined;
    }
    return assignmentId;
  }

  function openAssignment(
    assignment: TeacherAssignment,
    mode: "open" | "edit",
  ) {
    const assignmentId = getValidAssignmentId(assignment.id);
    if (!assignmentId) {
      return;
    }

    if (mode === "edit") {
      router.push({
        pathname: "/teacher/assignment-builder",
        params: {
          assignmentId,
          mode: "edit",
          returnTo: `/teacher/assignments?status=${status}`,
        },
      });
      return;
    }

    router.push({
      pathname: "/teacher/assignment/[assignmentId]",
      params: { assignmentId },
    });
  }

  async function duplicate(assignment: TeacherAssignment) {
    if (actionLockRef.current || isMutating) {
      return;
    }

    const assignmentId = getValidAssignmentId(assignment.id);
    if (!assignmentId) {
      return;
    }

    actionLockRef.current = true;
    setActionFeedback(undefined);

    try {
      const duplicateResult = await duplicateAssignment(assignmentId);
      if (!duplicateResult.ok) {
        setActionFeedback({
          title: "Duplication impossible",
          description: duplicateResult.message,
        });
        return;
      }

      setStatus("draft");
      setNotice("duplicated");
    } finally {
      actionLockRef.current = false;
    }
  }

  function requestAction(
    type: PendingAction["type"],
    assignment: TeacherAssignment,
  ) {
    const assignmentId = getValidAssignmentId(assignment.id);
    if (!assignmentId) {
      return;
    }
    setActionFeedback(undefined);
    setPendingAction({ type, assignmentId });
  }

  async function confirmPendingAction() {
    if (!pendingAction || actionLockRef.current) {
      return;
    }

    const assignmentId = getValidAssignmentId(pendingAction.assignmentId);
    if (!assignmentId) {
      setPendingAction(undefined);
      return;
    }

    actionLockRef.current = true;
    setIsSubmitting(true);

    try {
      if (pendingAction.type === "publish") {
        const result = await publishAssignment(assignmentId);
        if (!result.ok) {
          setActionFeedback(
            getPublishFailureFeedback(result.reason, result.message),
          );
        } else {
          setStatus("published");
          setNotice("published_success");
        }
      } else if (pendingAction.type === "delete") {
        const result = await deleteAssignment(assignmentId);
        if (!result.ok) {
          setActionFeedback({
            title: "Suppression impossible",
            description: result.message,
          });
        } else {
          setNotice("deleted");
        }
      } else if (pendingAction.type === "close") {
        const result = await closeAssignment(assignmentId);
        if (!result.ok) {
          setActionFeedback({
            title: "Clôture impossible",
            description: result.message,
          });
        } else {
          setStatus("closed");
          setNotice("closed");
        }
      } else {
        const result = await reopenAssignment(assignmentId);
        if (!result.ok) {
          setActionFeedback({
            title: "Réouverture impossible",
            description: result.message,
          });
        } else {
          setStatus("published");
          setNotice("reopened");
        }
      }
    } finally {
      setPendingAction(undefined);
    }
  }

  const noticeMessage = notice ? noticeMessages[notice] : undefined;
  const emptyState = emptyStates[status];
  const filtersActive =
    Boolean(search.trim()) || classId !== "all" || dueFilter !== "all";
  const pendingDialog =
    pendingAction?.type === "publish"
      ? {
          title: "Publier ce devoir ?",
          message: "Il sera enregistré dans Publiés pour cette classe.",
          confirmLabel: "Publier",
          destructive: false,
        }
      : pendingAction?.type === "delete"
        ? {
            title: "Supprimer ce devoir ?",
            message: "Cette action supprimera définitivement le devoir.",
            confirmLabel: "Supprimer",
            destructive: true,
          }
        : pendingAction?.type === "close"
          ? {
              title: "Clôturer ce devoir ?",
              message:
                "Il sera déplacé dans Terminés. Aucun rendu réel n’est encore géré.",
              confirmLabel: "Clôturer",
              destructive: false,
            }
          : {
              title: "Rouvrir ce devoir ?",
              message: "Il redeviendra publié.",
              confirmLabel: "Rouvrir",
              destructive: false,
            };

  if (isLoading && assignments.length === 0) {
    return (
      <TeacherScreenShell>
        <View style={styles.emptyState}>
          <ActivityIndicator color={HOME_COLORS.accent} />
          <Text style={styles.emptyTitle}>Chargement des devoirs…</Text>
          <Text style={styles.emptyText}>
            Tes devoirs enregistrés sont en cours de chargement.
          </Text>
        </View>
      </TeacherScreenShell>
    );
  }

  if (error && assignments.length === 0) {
    return (
      <TeacherScreenShell>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Chargement impossible</Text>
          <Text accessibilityRole="alert" style={styles.emptyText}>
            {error}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Réessayer le chargement"
            onPress={() => {
              void refreshAssignments();
            }}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>Réessayer</Text>
          </Pressable>
        </View>
      </TeacherScreenShell>
    );
  }

  return (
    <TeacherScreenShell
      refreshing={isLoading && assignments.length > 0}
      onRefresh={() => {
        void refreshAssignments();
      }}
    >
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>ESPACE PROFESSEUR</Text>
        <Text style={styles.title}>Devoirs</Text>
        <Text style={styles.subtitle}>
          Crée et attribue des activités à tes classes.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Créer un devoir"
          accessibilityHint="Ouvre le constructeur de devoir"
          accessibilityState={{ disabled: isMutating }}
          disabled={isMutating}
          onPress={openBuilder}
          style={({ pressed }) => [
            styles.primaryButton,
            isMutating && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>Créer un devoir</Text>
        </Pressable>
      </View>

      {isMutating ? (
        <Text accessibilityRole="alert" style={styles.demoNote}>
          Mise à jour du devoir…
        </Text>
      ) : null}

      {noticeMessage ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer le message"
          onPress={() => setNotice(undefined)}
          style={styles.notice}
        >
          <Text style={styles.noticeTitle}>{noticeMessage.title}</Text>
          <Text style={styles.noticeText}>{noticeMessage.description}</Text>
        </Pressable>
      ) : null}

      {actionFeedback ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer le message d’erreur"
          onPress={() => setActionFeedback(undefined)}
          style={[styles.notice, styles.errorNotice]}
        >
          <Text style={styles.noticeTitle}>{actionFeedback.title}</Text>
          <Text style={styles.noticeText}>{actionFeedback.description}</Text>
        </Pressable>
      ) : null}

      <TeacherAssignmentsModeSwitch
        value={status}
        onChange={(nextStatus) => {
          setStatus(nextStatus);
          setNotice(undefined);
        }}
      />

      {assignments.length > 0 ? (
        <TeacherAssignmentsFilters
          search={search}
          classId={classId}
          dueFilter={dueFilter}
          classes={classes}
          onSearchChange={setSearch}
          onClassChange={setClassId}
          onDueFilterChange={setDueFilter}
        />
      ) : null}

      {statusAssignments.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{emptyState.title}</Text>
          <Text style={styles.emptyText}>{emptyState.description}</Text>
          {status === "draft" ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Créer un devoir"
              onPress={openBuilder}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>Créer un devoir</Text>
            </Pressable>
          ) : null}
        </View>
      ) : filteredAssignments.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Aucun devoir trouvé</Text>
          <Text style={styles.emptyText}>
            Essaie une autre recherche ou un autre filtre.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Réinitialiser la recherche et les filtres"
            disabled={!filtersActive}
            onPress={resetFilters}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>Réinitialiser</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.list}>
          {filteredAssignments.map((assignment) => (
            <TeacherAssignmentCard
              key={assignment.id}
              assignment={assignment}
              teacherClass={classes.find(
                (candidate) => candidate.id === assignment.classId,
              )}
              courseDraft={drafts.find(
                (draft) => draft.id === assignment.courseDraftId,
              )}
              onOpen={() => openAssignment(assignment, "open")}
              onEdit={() => openAssignment(assignment, "edit")}
              onDuplicate={() => duplicate(assignment)}
              onPublish={() => requestAction("publish", assignment)}
              onClose={() => requestAction("close", assignment)}
              onReopen={() => requestAction("reopen", assignment)}
              onDelete={() => requestAction("delete", assignment)}
              disabled={isMutating || isSubmitting}
            />
          ))}
        </View>
      )}

      <TeacherAssignmentActionDialog
        visible={Boolean(pendingAction)}
        title={pendingDialog.title}
        message={pendingDialog.message}
        confirmLabel={pendingDialog.confirmLabel}
        destructive={pendingDialog.destructive}
        submitting={isSubmitting || isMutating}
        onCancel={() => setPendingAction(undefined)}
        onConfirm={confirmPendingAction}
      />
    </TeacherScreenShell>
  );
}

const styles = StyleSheet.create({
  intro: { gap: 7 },
  eyebrow: { color: HOME_COLORS.accent, fontSize: 12, fontWeight: "900" },
  title: { color: HOME_COLORS.textPrimary, fontSize: 30, fontWeight: "900" },
  subtitle: {
    color: HOME_COLORS.textSecondary,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
  },
  primaryButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    borderRadius: 10,
    backgroundColor: HOME_COLORS.accent,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: HOME_COLORS.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  demoNote: {
    color: HOME_COLORS.textMuted,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
  },
  notice: {
    gap: 4,
    borderWidth: 1,
    borderColor: HOME_COLORS.accent,
    borderRadius: 12,
    backgroundColor: HOME_COLORS.accentSoft,
    padding: 13,
  },
  noticeTitle: {
    color: HOME_COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "900",
  },
  noticeText: {
    color: HOME_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  errorNotice: { borderColor: "#d86f7e" },
  emptyState: {
    gap: 8,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 14,
    backgroundColor: HOME_COLORS.card,
    padding: 18,
  },
  emptyTitle: {
    color: HOME_COLORS.textPrimary,
    fontSize: 17,
    fontWeight: "900",
  },
  emptyText: {
    color: HOME_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  secondaryButton: {
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
  secondaryButtonText: {
    color: HOME_COLORS.textPrimary,
    fontSize: 13,
    fontWeight: "900",
  },
  list: { gap: 12 },
  disabled: { opacity: 0.48 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});
