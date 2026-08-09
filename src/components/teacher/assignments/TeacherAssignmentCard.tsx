import { Pressable, StyleSheet, Text, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import {
  formatDueDate,
  formatLocalDate,
  getAssignmentStatusLabel,
} from "@/src/components/teacher/assignments/assignmentUtils";
import type {
  TeacherAssignment,
  TeacherClass,
  TeacherCourseDraft,
} from "@/src/types/teacher";

type TeacherAssignmentCardProps = {
  assignment: TeacherAssignment;
  teacherClass?: TeacherClass;
  courseDraft?: TeacherCourseDraft;
  onOpen: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onPublish: () => void;
  onClose: () => void;
  onReopen: () => void;
  onDelete: () => void;
  disabled?: boolean;
};

export function TeacherAssignmentCard({
  assignment,
  teacherClass,
  courseDraft,
  onOpen,
  onEdit,
  onDuplicate,
  onPublish,
  onClose,
  onReopen,
  onDelete,
  disabled = false,
}: TeacherAssignmentCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={styles.title} numberOfLines={2}>{assignment.title}</Text>
          <Text style={styles.context} numberOfLines={2}>
            {teacherClass?.name ?? "Classe indisponible"} · {assignment.courseDraftId ? courseDraft?.title ?? "Cours indisponible" : "Devoir libre"}
          </Text>
        </View>
        <Text style={styles.status}>{getAssignmentStatusLabel(assignment.status)}</Text>
      </View>

      {assignment.instructions ? <Text style={styles.instructions} numberOfLines={2}>{assignment.instructions}</Text> : null}

      <View style={styles.metaRow}>
        <Text style={styles.meta}>{formatDueDate(assignment.dueDate)}</Text>
        <Text style={styles.meta}>{assignment.selectedConceptIds.length} notion{assignment.selectedConceptIds.length === 1 ? "" : "s"}</Text>
        <Text style={styles.meta}>Modifié le {formatLocalDate(assignment.updatedAt)}</Text>
      </View>

      <View style={styles.actions}>
        <CardAction label="Ouvrir" onPress={onOpen} primary disabled={disabled} />
        {assignment.status === "draft" ? <CardAction label="Modifier" onPress={onEdit} disabled={disabled} /> : null}
        <CardAction label="Dupliquer" onPress={onDuplicate} disabled={disabled} />
        {assignment.status === "draft" ? <CardAction label="Publier" onPress={onPublish} disabled={disabled} /> : null}
        {assignment.status === "published" ? <CardAction label="Clôturer" onPress={onClose} disabled={disabled} /> : null}
        {assignment.status === "closed" ? <CardAction label="Rouvrir" onPress={onReopen} disabled={disabled} /> : null}
        <CardAction label="Supprimer" onPress={onDelete} destructive disabled={disabled} />
      </View>
    </View>
  );
}

function CardAction({ label, onPress, primary = false, destructive = false, disabled = false }: { label: string; onPress: () => void; primary?: boolean; destructive?: boolean; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.action, primary && styles.primaryAction, destructive && styles.destructiveAction, disabled && styles.disabled, pressed && styles.pressed]}
    >
      <Text style={[styles.actionText, primary && styles.primaryActionText, destructive && styles.destructiveActionText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 14, backgroundColor: HOME_COLORS.card, padding: 16 },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  copy: { minWidth: 0, flex: 1, gap: 4 },
  title: { color: HOME_COLORS.textPrimary, fontSize: 18, fontWeight: "900" },
  context: { color: HOME_COLORS.accentMuted, fontSize: 12, fontWeight: "800", lineHeight: 18 },
  status: { maxWidth: 112, color: HOME_COLORS.accent, fontSize: 11, fontWeight: "900", textAlign: "right" },
  instructions: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "600", lineHeight: 19 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  meta: { color: HOME_COLORS.textMuted, fontSize: 11, fontWeight: "700" },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  action: { minHeight: 44, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 9, backgroundColor: HOME_COLORS.surface, paddingHorizontal: 10 },
  primaryAction: { borderColor: HOME_COLORS.accent, backgroundColor: HOME_COLORS.accent },
  destructiveAction: { borderColor: "#8e4654" },
  actionText: { color: HOME_COLORS.textPrimary, fontSize: 11, fontWeight: "800" },
  primaryActionText: { color: HOME_COLORS.ink },
  destructiveActionText: { color: "#ffb4c0" },
  disabled: { opacity: 0.48 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});
