import { StyleSheet, Text, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import {
  formatDueDate,
  formatLocalDate,
  getAssignmentStatusLabel,
  getConceptTitle,
} from "@/src/components/teacher/assignments/assignmentUtils";
import type {
  TeacherAssignment,
  TeacherClass,
  TeacherCourseDraft,
} from "@/src/types/teacher";

export function TeacherAssignmentSummaryCard({
  assignment,
  teacherClass,
  courseDraft,
}: {
  assignment: TeacherAssignment;
  teacherClass?: TeacherClass;
  courseDraft?: TeacherCourseDraft;
}) {
  const classUnavailable = !teacherClass;
  const courseUnavailable = Boolean(
    assignment.courseDraftId && !courseDraft,
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>
            {getAssignmentStatusLabel(assignment.status).toUpperCase()}
          </Text>
          <Text style={styles.title}>{assignment.title}</Text>
        </View>
        <Text style={styles.status}>
          {getAssignmentStatusLabel(assignment.status)}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Classe</Text>
        <Text
          style={[
            styles.primaryText,
            classUnavailable && styles.unavailableText,
          ]}
        >
          {teacherClass?.name ?? "Classe indisponible"}
        </Text>
        {teacherClass ? (
          <Text style={styles.secondaryText}>
            {teacherClass.level ?? "Niveau non défini"} ·{" "}
            {teacherClass.variety} · {teacherClass.activeStudentCount} élève
            {teacherClass.activeStudentCount === 1 ? "" : "s"} actif
            {teacherClass.activeStudentCount === 1 ? "" : "s"}
          </Text>
        ) : (
          <Text style={styles.secondaryText}>
            Cette classe a été supprimée de la session.
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cours</Text>
        <Text
          style={[
            styles.primaryText,
            courseUnavailable && styles.unavailableText,
          ]}
        >
          {assignment.courseDraftId
            ? courseDraft?.title ?? "Cours indisponible"
            : "Devoir libre"}
        </Text>
        {courseDraft ? (
          <Text style={styles.secondaryText}>
            {courseDraft.origin === "lugua_program"
              ? "Programme Lugua"
              : "Créé par le professeur"}{" "}
            · {courseDraft.level ?? "Niveau non défini"} ·{" "}
            {courseDraft.variety}
          </Text>
        ) : courseUnavailable ? (
          <Text style={styles.secondaryText}>
            Le brouillon de cours lié a été supprimé de la session.
          </Text>
        ) : (
          <Text style={styles.secondaryText}>Aucun cours associé</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notions</Text>
        {assignment.selectedConceptIds.length > 0 ? (
          <View style={styles.concepts}>
            {assignment.selectedConceptIds.map((conceptId) => (
              <Text key={conceptId} style={styles.secondaryText}>
                · {getConceptTitle(conceptId) ?? "Notion indisponible"}
              </Text>
            ))}
          </View>
        ) : (
          <Text style={styles.secondaryText}>Aucune notion liée</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Consignes</Text>
        <Text style={styles.secondaryText}>
          {assignment.instructions || "Aucune consigne ajoutée"}
        </Text>
      </View>

      <View style={styles.dates}>
        <DateRow label="Date limite" value={formatDueDate(assignment.dueDate)} />
        <DateRow
          label="Créé le"
          value={formatLocalDate(assignment.createdAt)}
        />
        {assignment.publishedAt ? (
          <DateRow
            label="Publié le"
            value={formatLocalDate(assignment.publishedAt)}
          />
        ) : null}
        {assignment.closedAt ? (
          <DateRow
            label="Clôturé le"
            value={formatLocalDate(assignment.closedAt)}
          />
        ) : null}
      </View>
    </View>
  );
}

function DateRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.dateRow}>
      <Text style={styles.dateLabel}>{label}</Text>
      <Text style={styles.dateValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 14,
    backgroundColor: HOME_COLORS.card,
    padding: 17,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  headerCopy: { minWidth: 0, flex: 1, gap: 5 },
  eyebrow: { color: HOME_COLORS.accent, fontSize: 11, fontWeight: "900" },
  title: {
    color: HOME_COLORS.textPrimary,
    fontSize: 24,
    fontWeight: "900",
  },
  status: {
    maxWidth: 128,
    color: HOME_COLORS.accentMuted,
    fontSize: 11,
    fontWeight: "900",
    textAlign: "right",
  },
  section: {
    gap: 5,
    borderTopWidth: 1,
    borderTopColor: HOME_COLORS.border,
    paddingTop: 12,
  },
  sectionTitle: {
    color: HOME_COLORS.textMuted,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  primaryText: {
    color: HOME_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "900",
  },
  unavailableText: { color: "#ffb4c0" },
  secondaryText: {
    color: HOME_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  concepts: { gap: 3 },
  dates: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 10,
    backgroundColor: HOME_COLORS.surface,
  },
  dateRow: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: HOME_COLORS.border,
    paddingHorizontal: 12,
  },
  dateLabel: {
    color: HOME_COLORS.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  dateValue: {
    minWidth: 0,
    flex: 1,
    color: HOME_COLORS.textPrimary,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "right",
  },
});
