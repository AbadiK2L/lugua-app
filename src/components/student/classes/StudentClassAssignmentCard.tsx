import { StyleSheet, Text, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import type {
  StudentClassAssignment,
  StudentClassCourse,
} from "@/src/types/studentLearning";

function formatDueDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Date indisponible"
    : new Intl.DateTimeFormat("fr-FR").format(date);
}

export function StudentClassAssignmentCard({
  assignment,
  course,
}: {
  assignment: StudentClassAssignment;
  course?: StudentClassCourse;
}) {
  const statusLabel =
    assignment.status === "published" ? "Publié" : "Clôturé";

  return (
    <View
      accessible
      accessibilityLabel={`${assignment.title}, ${statusLabel}`}
      style={styles.card}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{assignment.title}</Text>
        <Text
          style={[
            styles.status,
            assignment.status === "closed" && styles.closedStatus,
          ]}
        >
          {statusLabel}
        </Text>
      </View>

      {assignment.instructions ? (
        <Text style={styles.instructions}>{assignment.instructions}</Text>
      ) : null}

      <View style={styles.details}>
        {assignment.dueDate ? (
          <Text style={styles.detail}>
            Échéance : {formatDueDate(assignment.dueDate)}
          </Text>
        ) : null}
        {course ? (
          <Text style={styles.course}>Cours : {course.title}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 9,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 14,
    backgroundColor: HOME_COLORS.card,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  title: {
    minWidth: 0,
    flex: 1,
    color: HOME_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 21,
  },
  status: {
    maxWidth: 92,
    color: HOME_COLORS.accentMuted,
    fontSize: 11,
    fontWeight: "900",
    lineHeight: 16,
    textAlign: "right",
  },
  closedStatus: {
    color: HOME_COLORS.textSecondary,
  },
  instructions: {
    color: HOME_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  details: {
    gap: 4,
  },
  detail: {
    color: HOME_COLORS.textMuted,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 18,
  },
  course: {
    color: HOME_COLORS.accentMuted,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 18,
  },
});
