import { StyleSheet, Text, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import type { StudentClassCourse } from "@/src/types/studentLearning";

export function StudentClassCourseCard({
  course,
}: {
  course: StudentClassCourse;
}) {
  const originLabel =
    course.origin === "lugua_program"
      ? "Programme Lugua"
      : "Cours du professeur";
  const levelLabel = course.level ?? "Niveau non défini";

  return (
    <View
      accessible
      accessibilityLabel={`${course.title}, ${originLabel}, ${course.language}, ${course.variety}, ${levelLabel}`}
      style={styles.card}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{course.title}</Text>
        <Text style={styles.origin}>{originLabel}</Text>
      </View>

      {course.description ? (
        <Text style={styles.description}>{course.description}</Text>
      ) : null}

      <Text style={styles.meta}>
        {course.language} · {course.variety} · {levelLabel}
      </Text>

      {course.objectives.length > 0 ? (
        <View style={styles.objectives}>
          <Text style={styles.objectivesTitle}>Objectifs</Text>
          {course.objectives.map((objective, index) => (
            <View key={`${objective}-${index}`} style={styles.objectiveRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.objectiveText}>{objective}</Text>
            </View>
          ))}
        </View>
      ) : null}
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
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 22,
  },
  origin: {
    maxWidth: 132,
    color: HOME_COLORS.accentMuted,
    fontSize: 11,
    fontWeight: "900",
    lineHeight: 16,
    textAlign: "right",
  },
  description: {
    color: HOME_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  meta: {
    color: HOME_COLORS.textMuted,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 18,
  },
  objectives: {
    gap: 6,
    paddingTop: 2,
  },
  objectivesTitle: {
    color: HOME_COLORS.textPrimary,
    fontSize: 12,
    fontWeight: "900",
  },
  objectiveRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
  },
  bullet: {
    color: HOME_COLORS.accent,
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 19,
  },
  objectiveText: {
    minWidth: 0,
    flex: 1,
    color: HOME_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
});
