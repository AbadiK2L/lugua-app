import { Pressable, StyleSheet, Text, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import {
  formatDueDate,
  getAssignmentStatusLabel,
} from "@/src/components/teacher/assignments/assignmentUtils";
import type { TeacherAssignment } from "@/src/types/teacher";

export function TeacherClassAssignmentsSection({
  assignments,
  onCreate,
  onOpen,
}: {
  assignments: TeacherAssignment[];
  onCreate: () => void;
  onOpen: (assignmentId: string) => void;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Devoirs</Text>
        <Text style={styles.count}>
          {assignments.length} devoir{assignments.length === 1 ? "" : "s"}
        </Text>
      </View>

      {assignments.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.title}>Aucun devoir attribué</Text>
          <Text style={styles.text}>
            Crée un devoir libre ou rattache un brouillon de cours à cette
            classe.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {assignments.map((assignment) => (
            <Pressable
              key={assignment.id}
              accessibilityRole="button"
              accessibilityLabel={`Ouvrir le devoir ${assignment.title}`}
              onPress={() => onOpen(assignment.id)}
              style={({ pressed }) => [
                styles.assignmentRow,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.assignmentCopy}>
                <Text style={styles.assignmentTitle} numberOfLines={2}>
                  {assignment.title}
                </Text>
                <Text style={styles.assignmentMeta}>
                  {formatDueDate(assignment.dueDate)} ·{" "}
                  {assignment.selectedConceptIds.length} notion
                  {assignment.selectedConceptIds.length === 1 ? "" : "s"}
                </Text>
              </View>
              <Text style={styles.status}>
                {getAssignmentStatusLabel(assignment.status)}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Créer un devoir pour cette classe"
        accessibilityHint="Ouvre le constructeur avec cette classe présélectionnée"
        onPress={onCreate}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.buttonText}>Créer un devoir</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 10 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: {
    color: HOME_COLORS.textPrimary,
    fontSize: 19,
    fontWeight: "900",
  },
  count: {
    color: HOME_COLORS.accentMuted,
    fontSize: 12,
    fontWeight: "800",
  },
  card: {
    gap: 8,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 14,
    backgroundColor: HOME_COLORS.card,
    padding: 16,
  },
  title: {
    color: HOME_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "900",
  },
  text: {
    color: HOME_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  list: { gap: 7 },
  assignmentRow: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 11,
    backgroundColor: HOME_COLORS.card,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  assignmentCopy: { minWidth: 0, flex: 1, gap: 4 },
  assignmentTitle: {
    color: HOME_COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "900",
  },
  assignmentMeta: {
    color: HOME_COLORS.textMuted,
    fontSize: 11,
    fontWeight: "700",
  },
  status: {
    maxWidth: 104,
    color: HOME_COLORS.accentMuted,
    fontSize: 10,
    fontWeight: "900",
    textAlign: "right",
  },
  button: {
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
  buttonText: {
    color: HOME_COLORS.textPrimary,
    fontSize: 13,
    fontWeight: "900",
  },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});
