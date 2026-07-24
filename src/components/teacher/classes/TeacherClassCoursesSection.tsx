import { useMemo, useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import type { TeacherCourseDraft } from "@/src/types/teacher";

type TeacherClassCoursesSectionProps = {
  assignedDraftIds: string[];
  drafts: TeacherCourseDraft[];
  onAssign: (draftId: string) => void;
  onUnassign: (draftId: string) => void;
  onGoToCourses: () => void;
};

export function TeacherClassCoursesSection({
  assignedDraftIds,
  drafts,
  onAssign,
  onUnassign,
  onGoToCourses,
}: TeacherClassCoursesSectionProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [notice, setNotice] = useState<string | undefined>();
  const assignedDrafts = assignedDraftIds
    .map((draftId) => drafts.find((draft) => draft.id === draftId))
    .filter((draft): draft is TeacherCourseDraft => Boolean(draft));
  const missingDraftIds = assignedDraftIds.filter(
    (draftId) => !drafts.some((draft) => draft.id === draftId),
  );
  const availableDrafts = useMemo(
    () => drafts.filter((draft) => !assignedDraftIds.includes(draft.id)),
    [assignedDraftIds, drafts],
  );

  function assign(draftId: string) {
    onAssign(draftId);
    setModalVisible(false);
    setNotice("Cours attribué · Le brouillon est désormais lié à cette classe pendant la session.");
  }

  function confirmUnassign(draftId: string, title: string) {
    Alert.alert(
      "Retirer ce cours de la classe ?",
      `${title} restera disponible dans Mes cours.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Retirer",
          style: "destructive",
          onPress: () => {
            onUnassign(draftId);
            setNotice("Attribution retirée · Le brouillon reste disponible dans Mes cours.");
          },
        },
      ],
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.heading}>
          <Text style={styles.sectionTitle}>Cours attribués</Text>
          <Text style={styles.sectionMeta}>{assignedDraftIds.length} attribution{assignedDraftIds.length === 1 ? "" : "s"}</Text>
        </View>
        <ActionButton label="Attribuer un cours" onPress={() => setModalVisible(true)} primary />
      </View>

      {notice ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Fermer le message de cours" onPress={() => setNotice(undefined)} style={styles.notice}>
          <Text style={styles.noticeText}>{notice}</Text>
        </Pressable>
      ) : null}

      {assignedDrafts.length === 0 && missingDraftIds.length === 0 ? (
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
              onRemove={() => confirmUnassign(draft.id, draft.title)}
            />
          ))}
          {missingDraftIds.map((draftId) => (
            <View key={draftId} style={styles.missingCard}>
              <View style={styles.heading}>
                <Text style={styles.missingTitle}>Cours indisponible</Text>
                <Text style={styles.missingText}>Ce brouillon a été supprimé de la session.</Text>
              </View>
              <SmallButton label="Retirer la référence" onPress={() => onUnassign(draftId)} destructive />
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
                <Text style={styles.eyebrow}>ATTRIBUTION LOCALE</Text>
                <Text style={styles.modalTitle}>Attribuer un cours</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Fermer" onPress={() => setModalVisible(false)} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>
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
                  <Pressable key={draft.id} accessibilityRole="button" accessibilityLabel={`Attribuer ${draft.title}`} accessibilityHint="Lie ce brouillon à la classe" onPress={() => assign(draft.id)} style={({ pressed }) => [styles.option, pressed && styles.pressed]}>
                    <View style={styles.heading}>
                      <Text style={styles.optionTitle}>{draft.title}</Text>
                      <Text style={styles.optionMeta}>{draft.origin === "lugua_program" ? "Adapté du programme Lugua" : "Créé par le professeur"}</Text>
                      <Text style={styles.optionMeta}>{draft.level ?? "Niveau non défini"} · {draft.variety} · Brouillon local</Text>
                    </View>
                    <Text style={styles.optionAction}>Attribuer</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function AssignedDraftCard({ draft, onRemove }: { draft: TeacherCourseDraft; onRemove: () => void }) {
  return (
    <View style={styles.assignedCard}>
      <View style={styles.heading}>
        <Text style={styles.optionTitle}>{draft.title}</Text>
        <Text style={styles.optionMeta}>{draft.origin === "lugua_program" ? "Adapté du programme Lugua" : "Créé par le professeur"}</Text>
        <Text style={styles.optionMeta}>{draft.level ?? "Niveau non défini"} · {draft.variety} · Brouillon local</Text>
      </View>
      <SmallButton label="Retirer" onPress={onRemove} destructive />
    </View>
  );
}

function ActionButton({ label, onPress, primary = false }: { label: string; onPress: () => void; primary?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.actionButton, primary && styles.primaryButton, pressed && styles.pressed]}>
      <Text style={[styles.actionText, primary && styles.primaryActionText]}>{label}</Text>
    </Pressable>
  );
}

function SmallButton({ label, onPress, destructive = false }: { label: string; onPress: () => void; destructive?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.smallButton, destructive && styles.destructiveButton, pressed && styles.pressed]}>
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
  pressed: { opacity: 0.78 },
});
