import { useEffect } from "react";
import { router, type Href } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import { useSessionPreview } from "@/src/contexts/SessionPreviewContext";
import type { UserRole } from "@/src/types/profile";

const roles: {
  role: UserRole;
  label: string;
  description: string;
}[] = [
  {
    role: "student",
    label: "Continuer comme Élève",
    description: "Explorer le parcours, le dictionnaire et les scénarios.",
  },
  {
    role: "teacher",
    label: "Continuer comme Professeur",
    description: "Préparer des cours et suivre les contenus pédagogiques.",
  },
];

export default function WelcomeScreen() {
  const { role, selectRole } = useSessionPreview();

  useEffect(() => {
    if (role === "student") {
      router.replace("/student" as Href);
    }

    if (role === "teacher") {
      router.replace("/teacher" as Href);
    }
  }, [role]);

  function continueAs(role: UserRole) {
    selectRole(role);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>LUGUA</Text>
          <Text style={styles.title}>Choisis ton espace</Text>
          <Text style={styles.subtitle}>
            Cette maquette te permet d’explorer les deux parcours sans créer de compte.
          </Text>
        </View>

        <View style={styles.options}>
          <Text style={styles.sectionLabel}>CONTINUER COMME</Text>
          {roles.map((option) => (
            <Pressable
              key={option.role}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityHint={option.description}
              onPress={() => continueAs(option.role)}
              style={({ pressed }) => [styles.option, pressed && styles.pressed]}
            >
              <View style={styles.optionCopy}>
                <Text style={styles.optionLabel}>{option.label}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <Text style={styles.arrow} aria-hidden>
                →
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.note}>
          Aperçu local : aucun compte ni enregistrement de session n’est utilisé.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: HOME_COLORS.navy,
  },
  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    justifyContent: "center",
    gap: 40,
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  hero: {
    gap: 10,
  },
  eyebrow: {
    color: HOME_COLORS.accent,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  title: {
    color: HOME_COLORS.textPrimary,
    fontSize: 34,
    fontWeight: "900",
  },
  subtitle: {
    maxWidth: 560,
    color: HOME_COLORS.textSecondary,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  },
  options: {
    gap: 12,
  },
  sectionLabel: {
    color: HOME_COLORS.textMuted,
    fontSize: 12,
    fontWeight: "900",
  },
  option: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 16,
    backgroundColor: HOME_COLORS.card,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  optionCopy: {
    flex: 1,
    gap: 4,
  },
  optionLabel: {
    color: HOME_COLORS.textPrimary,
    fontSize: 17,
    fontWeight: "900",
  },
  optionDescription: {
    color: HOME_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  arrow: {
    color: HOME_COLORS.accent,
    fontSize: 24,
    fontWeight: "800",
  },
  note: {
    color: HOME_COLORS.textMuted,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
  },
  pressed: {
    backgroundColor: HOME_COLORS.surfaceRaised,
    opacity: 0.84,
  },
});
