import { StyleSheet, Text, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import { ProfileScreenShell } from "@/src/components/profile/ProfileScreenShell";
import { shikomoriQuestionsA1Path } from "@/src/data/curriculum";
import { dictionaryEntries } from "@/src/data/dictionary";

const NO_DATA = "Pas encore assez de données";
const { chapter, language, level } = shikomoriQuestionsA1Path;
const conceptCount = chapter.blocks.reduce(
  (total, block) => total + block.concepts.length,
  0,
);
const availableLessonCount = dictionaryEntries.filter(
  (entry) => entry.lessonAvailable,
).length;
const availableExerciseTypes = new Set(
  chapter.blocks.flatMap((block) =>
    block.concepts.flatMap((concept) =>
      Object.entries(concept.lessonConfig?.exercises ?? {})
        .filter(([, enabled]) => enabled)
        .map(([exerciseType]) => exerciseType),
    ),
  ),
).size;

const personalStats = [
  { label: "Progression", value: NO_DATA },
  { label: "XP", value: NO_DATA },
  { label: "Série", value: NO_DATA },
  { label: "Leçons terminées", value: NO_DATA },
  { label: "Exercices ou quiz réalisés", value: NO_DATA },
  { label: "Réussite moyenne", value: NO_DATA },
];

const availableStats = [
  { label: "Niveau actuel", value: level.level },
  { label: "Langue", value: language.name },
  { label: "Notions disponibles", value: String(conceptCount) },
  { label: "Leçons prêtes", value: String(availableLessonCount) },
  { label: "Types d’exercices disponibles", value: String(availableExerciseTypes) },
];

export default function StudentStatisticsScreen() {
  return (
    <ProfileScreenShell fallbackHref="/student" title="Statistiques">
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>ESPACE ÉLÈVE</Text>
        <Text style={styles.title}>Statistiques</Text>
        <Text style={styles.subtitle}>
          Les résultats personnels apparaîtront ici lorsque les leçons et quiz seront enregistrés.
        </Text>
      </View>

      <View style={styles.grid}>
        {personalStats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} muted />
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Parcours disponible</Text>
        <View style={styles.rows}>
          {availableStats.map((stat, index) => (
            <View
              key={stat.label}
              style={[styles.row, index === availableStats.length - 1 && styles.lastRow]}
            >
              <Text style={styles.rowLabel}>{stat.label}</Text>
              <Text style={styles.rowValue}>{stat.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </ProfileScreenShell>
  );
}

function StatCard({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, muted && styles.mutedValue]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  intro: { gap: 6 },
  eyebrow: { color: HOME_COLORS.accent, fontSize: 12, fontWeight: "900" },
  title: { color: HOME_COLORS.textPrimary, fontSize: 30, fontWeight: "900" },
  subtitle: {
    color: HOME_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statCard: {
    minWidth: 160,
    minHeight: 88,
    flexGrow: 1,
    flexBasis: "48%",
    justifyContent: "space-between",
    gap: 10,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 14,
    backgroundColor: HOME_COLORS.card,
    padding: 14,
  },
  statLabel: {
    color: HOME_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 18,
  },
  statValue: {
    color: HOME_COLORS.textPrimary,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 22,
  },
  mutedValue: {
    color: HOME_COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: HOME_COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "900",
  },
  rows: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 14,
    backgroundColor: HOME_COLORS.surface,
  },
  row: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: HOME_COLORS.border,
    paddingHorizontal: 14,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    minWidth: 0,
    flex: 1,
    color: HOME_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },
  rowValue: {
    color: HOME_COLORS.accentMuted,
    fontSize: 14,
    fontWeight: "900",
    textAlign: "right",
  },
});
