import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import { TeacherEmptyState } from "@/src/components/teacher/TeacherEmptyState";
import { TeacherScreenShell } from "@/src/components/teacher/TeacherScreenShell";
import { TeacherSegmentedControl } from "@/src/components/teacher/TeacherSegmentedControl";

const assignmentStates = {
  drafts: {
    title: "Aucun devoir brouillon",
    description: "Les devoirs que tu commenceras à préparer apparaîtront ici.",
  },
  published: {
    title: "Aucun devoir publié",
    description: "Les devoirs attribués à une classe apparaîtront ici.",
  },
  completed: {
    title: "Aucun devoir terminé",
    description: "Les devoirs terminés par les élèves apparaîtront ici.",
  },
} as const;

export default function TeacherAssignmentsScreen() {
  const [state, setState] = useState("drafts");
  const emptyState = assignmentStates[state as keyof typeof assignmentStates];

  return (
    <TeacherScreenShell>
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>ESPACE PROFESSEUR</Text>
        <Text style={styles.title}>Devoirs</Text>
        <Text style={styles.subtitle}>Prépare et suis les travaux envoyés à tes élèves.</Text>
      </View>

      <TeacherSegmentedControl
        value={state}
        onChange={setState}
        options={[
          { id: "drafts", label: "Brouillons" },
          { id: "published", label: "Publiés" },
          { id: "completed", label: "Terminés" },
        ]}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Créer un devoir"
        onPress={() => Alert.alert("Créer un devoir", "La création de devoirs sera disponible prochainement.")}
        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
      >
        <Text style={styles.primaryButtonText}>Créer un devoir</Text>
      </Pressable>

      <TeacherEmptyState {...emptyState} />
    </TeacherScreenShell>
  );
}

const styles = StyleSheet.create({
  intro: { gap: 6 },
  eyebrow: { color: HOME_COLORS.accent, fontSize: 12, fontWeight: "900" },
  title: { color: HOME_COLORS.textPrimary, fontSize: 30, fontWeight: "900" },
  subtitle: { color: HOME_COLORS.textSecondary, fontSize: 15, fontWeight: "600", lineHeight: 22 },
  primaryButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    borderRadius: 10,
    backgroundColor: HOME_COLORS.accent,
    paddingHorizontal: 16,
  },
  primaryButtonText: { color: HOME_COLORS.ink, fontSize: 14, fontWeight: "900" },
  pressed: { opacity: 0.8 },
});
