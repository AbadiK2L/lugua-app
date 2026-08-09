import { Pressable, StyleSheet, Text, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import type { TeacherCourseDraft } from "@/src/types/teacher";

type TeacherCourseDraftCardProps = {
  draft: TeacherCourseDraft;
  disabled?: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

export function TeacherCourseDraftCard({
  draft,
  disabled = false,
  onOpen,
  onEdit,
  onDuplicate,
  onDelete,
}: TeacherCourseDraftCardProps) {
  const originLabel =
    draft.origin === "lugua_program"
      ? "Adapté du programme Lugua"
      : "Cours créé par le professeur";
  const levelLabel = draft.level ?? "Niveau non défini";
  const modifiedDate = new Date(draft.updatedAt).toLocaleDateString("fr-FR");
  const accessibilityLabel = `${draft.title}, ${originLabel}, ${levelLabel}, brouillon`;

  return (
    <View accessible accessibilityLabel={accessibilityLabel} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={styles.title} numberOfLines={2}>{draft.title}</Text>
          <Text style={styles.origin}>{originLabel}</Text>
        </View>
        <Text style={styles.status}>Brouillon</Text>
      </View>

      {draft.description ? (
        <Text style={styles.description} numberOfLines={2}>{draft.description}</Text>
      ) : null}

      <View style={styles.metaRow}>
        <Text style={styles.meta}>{levelLabel}</Text>
        <Text style={styles.meta}>{draft.variety}</Text>
        {draft.origin === "lugua_program" ? (
          <Text style={styles.meta}>{draft.selectedConceptIds.length} notions</Text>
        ) : null}
        <Text style={styles.meta}>{draft.objectives.length} objectif(s)</Text>
      </View>
      <Text style={styles.date}>Modifié le {modifiedDate}</Text>

      <View style={styles.actions}>
        <DraftAction label="Ouvrir" onPress={onOpen} disabled={disabled} primary />
        <DraftAction label="Modifier" onPress={onEdit} disabled={disabled} />
        <DraftAction label="Dupliquer" onPress={onDuplicate} disabled={disabled} />
        <DraftAction label="Supprimer" onPress={onDelete} disabled={disabled} destructive />
      </View>
    </View>
  );
}

function DraftAction({
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
        styles.action,
        primary && styles.primaryAction,
        destructive && styles.destructiveAction,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[
        styles.actionText,
        primary && styles.primaryActionText,
        destructive && styles.destructiveActionText,
      ]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 14, backgroundColor: HOME_COLORS.card, padding: 16 },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  copy: { flex: 1, gap: 4 },
  title: { color: HOME_COLORS.textPrimary, fontSize: 18, fontWeight: "900" },
  origin: { color: HOME_COLORS.accentMuted, fontSize: 12, fontWeight: "800" },
  status: { color: HOME_COLORS.accent, fontSize: 11, fontWeight: "900", textAlign: "right" },
  description: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "600", lineHeight: 19 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  meta: { color: HOME_COLORS.textMuted, fontSize: 12, fontWeight: "800" },
  date: { color: HOME_COLORS.textMuted, fontSize: 11, fontWeight: "600" },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 6, paddingTop: 2 },
  action: { minHeight: 44, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 9, backgroundColor: HOME_COLORS.surface, paddingHorizontal: 11 },
  primaryAction: { borderColor: HOME_COLORS.accent, backgroundColor: HOME_COLORS.accent },
  destructiveAction: { borderColor: "#8e4654" },
  actionText: { color: HOME_COLORS.textPrimary, fontSize: 12, fontWeight: "800" },
  primaryActionText: { color: HOME_COLORS.ink },
  destructiveActionText: { color: "#ffb4c0" },
  disabled: { opacity: 0.48 },
  pressed: { opacity: 0.78 },
});
