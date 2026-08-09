import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import { TeacherAssignmentActionDialog } from "@/src/components/teacher/assignments/TeacherAssignmentActionDialog";
import type { ActionResult } from "@/src/types/classes";
import type { TeacherCourseDraft } from "@/src/types/teacher";

type TeacherClassCoursesSectionProps = {
  assignedDraftIds: string[];
  drafts: TeacherCourseDraft[];
  isCoursesLoading: boolean;
  coursesError: string | null;
  onRefreshCourses: () => Promise<void>;
  onAssign: (draftId: string) => Promise<ActionResult>;
  onUnassign: (draftId: string) => Promise<ActionResult>;
  onGoToCourses: () => void;
};

export function TeacherClassCoursesSection({
  assignedDraftIds,
  drafts,
  isCoursesLoading,
  coursesError,
  onRefreshCourses,
  onAssign,
  onUnassign,
  onGoToCourses,
}: TeacherClassCoursesSectionProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [notice, setNotice] = useState<string | undefined>();
  const [actionError, setActionError] = useState<string | undefined>();
  const [isMutating, setIsMutating] = useState(false);
  const [pendingUnassign, setPendingUnassign] = useState<TeacherCourseDraft>();
  const assignedDrafts = assignedDraftIds
    .map((draftId) => drafts.find((draft) => draft.id === draftId))
    .filter((draft): draft is TeacherCourseDraft => Boolean(draft));
  const missingDraftIds = isCoursesLoading || coursesError
    ? []
    : assignedDraftIds.filter(
        (draftId) => !drafts.some((draft) => draft.id === draftId),
      );
  const availableDrafts = useMemo(
    () => drafts.filter((draft) => !assignedDraftIds.includes(draft.id)),
    [assignedDraftIds, drafts],
  );

  async function assign(draftId: string) {
    if (isMutating) {
      return;
    }

    setIsMutating(true);
    setActionError(undefined);
    setNotice(undefined);

    try {
      const result = await onAssign(draftId);

      if (!result.ok) {
        setActionError(result.message);
        return;
      }

      setModalVisible(false);
      setNotice("Cours attribué · Le cours est désormais lié à cette classe.");
    } finally {
      setIsMutating(false);
    }
  }

  async function unassign(draftId: string) {
    if (isMutating) {
      return false;
    }

    setIsMutating(true);
    setActionError(undefined);
    setNotice(undefined);

    try {
      const result = await onUnassign(draftId);

      if (!result.ok) {
        setActionError(result.message);
        return false;
      }

      setNotice("Attribution retirée · Le cours reste disponible dans Mes cours.");
      return true;
    } finally {
      setIsMutating(false);
    }
  }

  async function confirmUnassign() {
    if (!pendingUnassign) {
      return;
    }

    const removed = await unassign(pendingUnassign.id);
    if (removed) {
      setPendingUnassign(undefined);
      return;
    }

    setPendingUnassign(undefined);
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.heading}>
          <Text style={styles.sectionTitle}>Cours attribués</Text>
          <Text style={styles.sectionMeta}>{assignedDraftIds.length} attribution{assignedDraftIds.length === 1 ? "" : "s"}</Text>
        </View>
        <ActionButton label="Attribuer un cours" disabled={isCoursesLoading || isMutating} onPress={() => { setActionError(undefined); setModalVisible(true); }} primary />
      </View>

      {notice ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Fermer le message de cours" onPress={() => setNotice(undefined)} style={styles.notice}>
          <Text style={styles.noticeText}>{notice}</Text>
        </Pressable>
      ) : null}

      {actionError && !modalVisible && !pendingUnassign ? (
        <View accessibilityRole="alert" style={styles.errorNotice}>
          <Text style={styles.errorNoticeTitle}>Action impossible</Text>
          <Text style={styles.errorNoticeText}>{actionError}</Text>
        </View>
      ) : null}

      {coursesError && drafts.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Réessayer le chargement des cours"
          disabled={isCoursesLoading}
          onPress={() => {
            void onRefreshCourses();
          }}
          style={[styles.notice, isCoursesLoading && styles.disabled]}
        >
          <Text style={styles.noticeText}>{coursesError}</Text>
        </Pressable>
      ) : null}

      {isCoursesLoading && drafts.length === 0 ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color={HOME_COLORS.accent} />
          <Text style={styles.mutedText}>Chargement des cours…</Text>
        </View>
      ) : coursesError && drafts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Cours indisponibles</Text>
          <Text style={styles.emptyText}>{coursesError}</Text>
          <ActionButton
            label={isCoursesLoading ? "Chargement…" : "Réessayer"}
            disabled={isCoursesLoading}
            onPress={() => {
              void onRefreshCourses();
            }}
          />
        </View>
      ) : assignedDrafts.length === 0 && missingDraftIds.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Aucun cours attribué</Text>
          <Text style={styles.emptyText}>Attribue un brouillon créé dans l’espace Cours.</Text>
          {drafts.length === 0 ? <Text style={styles.mutedText}>Aucun brouillon disponible. Crée d’abord un cours dans l’onglet Cours.</Text> : null}
        </View>
      ) : (
        <View style={styles.list}>
          {assignedDrafts.map((draft) => (
            <AssignedDraftCard
              key={draft.id}
              draft={draft}
              disabled={isMutating}
              onRemove={() => setPendingUnassign(draft)}
            />
          ))}
          {missingDraftIds.map((draftId) => (
            <View key={draftId} style={styles.missingCard}>
              <View style={styles.heading}>
                <Text style={styles.missingTitle}>Cours indisponible</Text>
                <Text style={styles.missingText}>Ce cours n’est plus disponible.</Text>
              </View>
              <SmallButton label="Retirer la référence" disabled={isMutating} onPress={() => { void unassign(draftId); }} destructive />
            </View>
          ))}
        </View>
      )}

      <Pressable accessibilityRole="button" accessibilityLabel="Ouvrir Mes cours" onPress={onGoToCourses} style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}>
        <Text style={styles.linkText}>Gérer les brouillons dans Mes cours</Text>
      </Pressable>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)} accessibilityViewIsModal>
        <View style={styles.modalRoot}>
          <Pressable accessibilityRole="button" accessibilityLabel="Fermer la liste des cours" onPress={() => setModalVisible(false)} style={StyleSheet.absoluteFillObject} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.heading}>
                <Text style={styles.eyebrow}>ATTRIBUTION DE COURS</Text>
                <Text style={styles.modalTitle}>Attribuer un cours</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Fermer" onPress={() => setModalVisible(false)} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>
            {actionError ? (
              <View accessibilityRole="alert" style={styles.errorNotice}>
                <Text style={styles.errorNoticeTitle}>Attribution impossible</Text>
                <Text style={styles.errorNoticeText}>{actionError}</Text>
              </View>
            ) : null}
            {availableDrafts.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Aucun brouillon disponible</Text>
                <Text style={styles.emptyText}>Crée d’abord un cours dans l’onglet Cours.</Text>
                <ActionButton
                  label="Aller aux cours"
                  onPress={() => {
                    setModalVisible(false);
                    onGoToCourses();
                  }}
                  primary
                />
              </View>
            ) : (
              <View style={styles.modalList}>
                {availableDrafts.map((draft) => (
                  <Pressable key={draft.id} accessibilityRole="button" accessibilityLabel={`Attribuer ${draft.title}`} accessibilityHint="Lie ce cours à la classe" accessibilityState={{ disabled: isMutating }} disabled={isMutating} onPress={() => { void assign(draft.id); }} style={({ pressed }) => [styles.option, isMutating && styles.disabled, pressed && styles.pressed]}>
                    <View style={styles.heading}>
                      <Text style={styles.optionTitle}>{draft.title}</Text>
                      <Text style={styles.optionMeta}>{draft.origin === "lugua_program" ? "Adapté du programme Lugua" : "Créé par le professeur"}</Text>
                      <Text style={styles.optionMeta}>{draft.level ?? "Niveau non défini"} · {draft.variety} · Brouillon</Text>
                    </View>
                    <Text style={styles.optionAction}>Attribuer</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>
      </Modal>
      <TeacherAssignmentActionDialog
        visible={Boolean(pendingUnassign)}
        title="Retirer ce cours de la classe ?"
        message={`${pendingUnassign?.title ?? "Ce brouillon"} restera disponible dans Mes cours.`}
        confirmLabel="Retirer"
        destructive
        onCancel={() => setPendingUnassign(undefined)}
        submitting={isMutating}
        onConfirm={() => {
          void confirmUnassign();
        }}
      />
    </View>
  );
}

function AssignedDraftCard({ draft, onRemove, disabled }: { draft: TeacherCourseDraft; onRemove: () => void; disabled: boolean }) {
  return (
    <View style={styles.assignedCard}>
      <View style={styles.heading}>
        <Text style={styles.optionTitle}>{draft.title}</Text>
        <Text style={styles.optionMeta}>{draft.origin === "lugua_program" ? "Adapté du programme Lugua" : "Créé par le professeur"}</Text>
        <Text style={styles.optionMeta}>{draft.level ?? "Niveau non défini"} · {draft.variety} · Brouillon</Text>
      </View>
      <SmallButton label="Retirer" disabled={disabled} onPress={onRemove} destructive />
    </View>
  );
}

function ActionButton({ label, onPress, primary = false, disabled = false }: { label: string; onPress: () => void; primary?: boolean; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.actionButton, primary && styles.primaryButton, disabled && styles.disabled, pressed && styles.pressed]}>
      <Text style={[styles.actionText, primary && styles.primaryActionText]}>{label}</Text>
    </Pressable>
  );
}

function SmallButton({ label, onPress, destructive = false, disabled = false }: { label: string; onPress: () => void; destructive?: boolean; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.smallButton, destructive && styles.destructiveButton, disabled && styles.disabled, pressed && styles.pressed]}>
      <Text style={[styles.smallButtonText, destructive && styles.destructiveText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  heading: { flex: 1, gap: 3 },
  sectionTitle: { color: HOME_COLORS.textPrimary, fontSize: 19, fontWeight: "900" },
  sectionMeta: { color: HOME_COLORS.textMuted, fontSize: 12, fontWeight: "700" },
  eyebrow: { color: HOME_COLORS.accent, fontSize: 11, fontWeight: "900", letterSpacing: 0.6 },
  emptyState: { gap: 7, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 14, backgroundColor: HOME_COLORS.card, padding: 16 },
  emptyTitle: { color: HOME_COLORS.textPrimary, fontSize: 16, fontWeight: "900" },
  emptyText: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "600", lineHeight: 19 },
  mutedText: { color: HOME_COLORS.textMuted, fontSize: 12, fontWeight: "700", lineHeight: 18 },
  notice: { borderWidth: 1, borderColor: HOME_COLORS.accent, borderRadius: 10, backgroundColor: HOME_COLORS.accentSoft, padding: 12 },
  noticeText: { color: HOME_COLORS.textPrimary, fontSize: 12, fontWeight: "800", lineHeight: 18 },
  errorNotice: { gap: 3, borderWidth: 1, borderColor: "#8e4654", borderRadius: 10, backgroundColor: HOME_COLORS.surface, padding: 12 },
  errorNoticeTitle: { color: "#ffb4c0", fontSize: 13, fontWeight: "900" },
  errorNoticeText: { color: HOME_COLORS.textSecondary, fontSize: 12, fontWeight: "700", lineHeight: 18 },
  loadingState: { minHeight: 90, alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 14, backgroundColor: HOME_COLORS.card, padding: 16 },
  list: { gap: 8 },
  assignedCard: { minHeight: 72, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 12, backgroundColor: HOME_COLORS.surface, padding: 12 },
  missingCard: { minHeight: 72, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: "#8e4654", borderRadius: 12, backgroundColor: HOME_COLORS.surface, padding: 12 },
  missingTitle: { color: "#ffb4c0", fontSize: 15, fontWeight: "900" },
  missingText: { color: HOME_COLORS.textSecondary, fontSize: 12, fontWeight: "600" },
  optionTitle: { color: HOME_COLORS.textPrimary, fontSize: 15, fontWeight: "900" },
  optionMeta: { color: HOME_COLORS.textSecondary, fontSize: 12, fontWeight: "700", lineHeight: 18 },
  optionAction: { color: HOME_COLORS.accent, fontSize: 12, fontWeight: "900" },
  linkButton: { minHeight: 44, alignSelf: "flex-start", justifyContent: "center" },
  linkText: { color: HOME_COLORS.accent, fontSize: 13, fontWeight: "800" },
  modalRoot: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(7, 17, 31, 0.84)", padding: 16 },
  modalCard: { width: "100%", maxWidth: 560, maxHeight: "88%", gap: 12, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 18, backgroundColor: HOME_COLORS.card, padding: 18 },
  modalHeader: { minHeight: 48, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  modalTitle: { color: HOME_COLORS.textPrimary, fontSize: 21, fontWeight: "900" },
  closeButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  closeText: { color: HOME_COLORS.textSecondary, fontSize: 28, lineHeight: 30 },
  modalList: { gap: 8 },
  option: { minHeight: 72, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 12, backgroundColor: HOME_COLORS.surface, padding: 12 },
  actionButton: { minHeight: 46, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 10, backgroundColor: HOME_COLORS.surface, paddingHorizontal: 14 },
  primaryButton: { borderColor: HOME_COLORS.accent, backgroundColor: HOME_COLORS.accent },
  actionText: { color: HOME_COLORS.textPrimary, fontSize: 13, fontWeight: "900" },
  primaryActionText: { color: HOME_COLORS.ink },
  smallButton: { minHeight: 44, justifyContent: "center", borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 9, paddingHorizontal: 10 },
  destructiveButton: { borderColor: "#8e4654" },
  smallButtonText: { color: HOME_COLORS.textPrimary, fontSize: 11, fontWeight: "800" },
  destructiveText: { color: "#ffb4c0" },
  disabled: { opacity: 0.48 },
  pressed: { opacity: 0.78 },
});
