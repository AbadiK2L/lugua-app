import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import { TeacherEmptyState } from "@/src/components/teacher/TeacherEmptyState";
import { TeacherScreenShell } from "@/src/components/teacher/TeacherScreenShell";

export default function TeacherClassesScreen() {
  return (
    <TeacherScreenShell>
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>ESPACE PROFESSEUR</Text>
        <Text style={styles.title}>Classes</Text>
        <Text style={styles.subtitle}>Organise tes groupes d’élèves dans un espace dédié.</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Rechercher une classe"
          placeholderTextColor={HOME_COLORS.textMuted}
          style={styles.searchInput}
          accessibilityLabel="Rechercher une classe"
        />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Créer une classe"
        onPress={() => Alert.alert("Créer une classe", "La création de classes sera disponible prochainement.")}
        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
      >
        <Text style={styles.primaryButtonText}>Créer une classe</Text>
      </Pressable>

      <TeacherEmptyState
        title="Aucune classe pour le moment"
        description="Crée une classe pour commencer à organiser tes élèves et tes futurs devoirs."
      />
    </TeacherScreenShell>
  );
}

const styles = StyleSheet.create({
  intro: { gap: 6 },
  eyebrow: { color: HOME_COLORS.accent, fontSize: 12, fontWeight: "900" },
  title: { color: HOME_COLORS.textPrimary, fontSize: 30, fontWeight: "900" },
  subtitle: { color: HOME_COLORS.textSecondary, fontSize: 15, fontWeight: "600", lineHeight: 22 },
  searchContainer: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 12,
    backgroundColor: HOME_COLORS.surface,
  },
  searchInput: { minHeight: 48, color: HOME_COLORS.textPrimary, fontSize: 14, paddingHorizontal: 14 },
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
