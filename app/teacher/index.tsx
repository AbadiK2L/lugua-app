import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import { TeacherEmptyState } from "@/src/components/teacher/TeacherEmptyState";
import { TeacherScreenShell } from "@/src/components/teacher/TeacherScreenShell";
import { useTeacherAssignments } from "@/src/contexts/TeacherAssignmentsContext";
import { useTeacherClasses } from "@/src/contexts/TeacherClassesContext";
import { useTeacherCourseDrafts } from "@/src/contexts/TeacherCourseDraftsContext";

export default function TeacherDashboardScreen() {
  const { assignments } = useTeacherAssignments();
  const { classes } = useTeacherClasses();
  const { drafts } = useTeacherCourseDrafts();
  const activeClasses = classes.filter((teacherClass) => teacherClass.status === "active");
  const studentCount = classes.reduce(
    (total, teacherClass) => total + teacherClass.students.length,
    0,
  );
  const publishedAssignmentCount = assignments.filter(
    (assignment) => assignment.status === "published",
  ).length;

  return (
    <TeacherScreenShell>
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>ESPACE PROFESSEUR</Text>
        <Text style={styles.title}>Tableau de bord</Text>
        <Text style={styles.subtitle}>
          Prépare tes contenus et retrouve rapidement tes espaces de travail.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vue d’ensemble</Text>
        <View style={styles.overview}>
          <OverviewRow label="Classes actives" value={String(activeClasses.length)} />
          <OverviewRow label="Élèves" value={String(studentCount)} />
          <OverviewRow
            label="Brouillons de cours"
            value={drafts.length ? String(drafts.length) : "Aucun"}
          />
          <OverviewRow
            label="Devoirs publiés"
            value={String(publishedAssignmentCount)}
            isLast
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.actions}>
          <QuickAction
            label="Créer une classe"
            onPress={() => router.push({ pathname: "/teacher/classes", params: { create: "1" } })}
          />
          <QuickAction
            label="Créer un cours"
            onPress={() => router.push("/teacher/course-builder")}
          />
          <QuickAction
            label="Créer un devoir"
            onPress={() => router.push("/teacher/assignment-builder")}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activité récente</Text>
        <TeacherEmptyState
          title="Aucune activité pour le moment"
          description="Les activités de tes classes et de tes cours apparaîtront ici lorsqu’elles existeront."
        />
      </View>
    </TeacherScreenShell>
  );
}

function OverviewRow({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.overviewRow, !isLast && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function QuickAction({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}
    >
      <Text style={styles.quickActionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  intro: { gap: 6 },
  eyebrow: { color: HOME_COLORS.accent, fontSize: 12, fontWeight: "900" },
  title: { color: HOME_COLORS.textPrimary, fontSize: 30, fontWeight: "900" },
  subtitle: {
    color: HOME_COLORS.textSecondary,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
  },
  section: { gap: 10 },
  sectionTitle: { color: HOME_COLORS.textPrimary, fontSize: 18, fontWeight: "900" },
  overview: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 16,
    backgroundColor: HOME_COLORS.card,
  },
  overviewRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 16,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: HOME_COLORS.border },
  rowLabel: { color: HOME_COLORS.textSecondary, fontSize: 14, fontWeight: "700" },
  rowValue: { color: HOME_COLORS.textPrimary, fontSize: 14, fontWeight: "800" },
  actions: { gap: 10 },
  quickAction: {
    minHeight: 50,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 12,
    backgroundColor: HOME_COLORS.surface,
    paddingHorizontal: 16,
  },
  quickActionLabel: { color: HOME_COLORS.textPrimary, fontSize: 14, fontWeight: "800" },
  pressed: { backgroundColor: HOME_COLORS.surfaceRaised, opacity: 0.82 },
});
