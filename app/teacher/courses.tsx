import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import { TeacherEmptyState } from "@/src/components/teacher/TeacherEmptyState";
import { TeacherScreenShell } from "@/src/components/teacher/TeacherScreenShell";
import { TeacherSegmentedControl } from "@/src/components/teacher/TeacherSegmentedControl";
import { shikomoriQuestionsA1Path } from "@/src/data/curriculum";

const { chapter, language, level } = shikomoriQuestionsA1Path;
const concepts = chapter.blocks.flatMap((block) => block.concepts);

export default function TeacherCoursesScreen() {
  const [view, setView] = useState("program");

  return (
    <TeacherScreenShell>
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>ESPACE PROFESSEUR</Text>
        <Text style={styles.title}>Cours</Text>
        <Text style={styles.subtitle}>Pars d’un programme validé ou prépare ton propre brouillon local.</Text>
      </View>

      <TeacherSegmentedControl
        value={view}
        onChange={setView}
        options={[
          { id: "program", label: "Programme Lugua" },
          { id: "mine", label: "Mes cours" },
        ]}
      />

      {view === "program" ? <ProgramPreview /> : <MyCourses />}
    </TeacherScreenShell>
  );
}

function ProgramPreview() {
  return (
    <View style={styles.section}>
      <View style={styles.programCard}>
        <Text style={styles.cardEyebrow}>PROGRAMME LUGUA</Text>
        <Text style={styles.cardTitle}>Poser une question</Text>
        <Text style={styles.cardMeta}>
          {language.name} · {level.level} · {chapter.title}
        </Text>
        <Text style={styles.cardDescription}>
          Les notions de ce programme viennent du curriculum local et restent consultables sans publication.
        </Text>
        <View style={styles.conceptList}>
          {concepts.map((concept, index) => (
            <View key={concept.id} style={styles.conceptRow}>
              <Text style={styles.conceptIndex}>{String(index + 1).padStart(2, "0")}</Text>
              <Text style={styles.conceptTitle}>{concept.title}</Text>
            </View>
          ))}
        </View>
        <View style={styles.buttonRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Consulter le programme Lugua"
            onPress={() =>
              Alert.alert(
                "Programme Lugua",
                `${concepts.length} notions locales sont disponibles dans le chapitre ${chapter.title}.`,
              )
            }
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryButtonText}>Consulter</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Utiliser le programme Lugua"
            onPress={() => router.push("/teacher/course-builder?origin=lugua_program")}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryButtonText}>Utiliser ce programme</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function MyCourses() {
  return (
    <View style={styles.section}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Créer un cours"
        onPress={() => router.push("/teacher/course-builder")}
        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
      >
        <Text style={styles.primaryButtonText}>Créer un cours</Text>
      </Pressable>
      <TeacherEmptyState
        title="Aucun cours pour le moment"
        description="Les brouillons locaux que tu prépareras apparaîtront ici après une future sauvegarde."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  intro: { gap: 6 },
  eyebrow: { color: HOME_COLORS.accent, fontSize: 12, fontWeight: "900" },
  title: { color: HOME_COLORS.textPrimary, fontSize: 30, fontWeight: "900" },
  subtitle: { color: HOME_COLORS.textSecondary, fontSize: 15, fontWeight: "600", lineHeight: 22 },
  section: { gap: 12 },
  programCard: {
    gap: 12,
    borderWidth: 1,
    borderColor: HOME_COLORS.accent,
    borderRadius: 16,
    backgroundColor: HOME_COLORS.card,
    padding: 16,
  },
  cardEyebrow: { color: HOME_COLORS.accent, fontSize: 11, fontWeight: "900", letterSpacing: 0.7 },
  cardTitle: { color: HOME_COLORS.textPrimary, fontSize: 22, fontWeight: "900" },
  cardMeta: { color: HOME_COLORS.accentMuted, fontSize: 13, fontWeight: "800" },
  cardDescription: { color: HOME_COLORS.textSecondary, fontSize: 14, fontWeight: "600", lineHeight: 21 },
  conceptList: { gap: 4, borderTopWidth: 1, borderTopColor: HOME_COLORS.border, paddingTop: 8 },
  conceptRow: { minHeight: 38, flexDirection: "row", alignItems: "center", gap: 12 },
  conceptIndex: { width: 24, color: HOME_COLORS.textMuted, fontSize: 12, fontWeight: "800" },
  conceptTitle: { flex: 1, color: HOME_COLORS.textPrimary, fontSize: 14, fontWeight: "800" },
  buttonRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  primaryButton: { minHeight: 46, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: HOME_COLORS.accent, paddingHorizontal: 14 },
  primaryButtonText: { color: HOME_COLORS.ink, fontSize: 13, fontWeight: "900" },
  secondaryButton: { minHeight: 46, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 10, backgroundColor: HOME_COLORS.surface, paddingHorizontal: 14 },
  secondaryButtonText: { color: HOME_COLORS.textPrimary, fontSize: 13, fontWeight: "900" },
  pressed: { opacity: 0.8 },
});
