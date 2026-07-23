import { router } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { LanguageSelector } from "@/src/components/home/LanguageSelector";
import { HOME_COLORS } from "@/src/components/home/homeColors";
import { useLanguageSelection } from "@/src/contexts/LanguageSelectionContext";

export type LuguaAppHeaderProps = {
  onPressCurrentLesson: () => void;
};

export function LuguaAppHeader({ onPressCurrentLesson }: LuguaAppHeaderProps) {
  const { selectedLanguage, setSelectedLanguage } = useLanguageSelection();
  const { width } = useWindowDimensions();
  const showLabels = width >= 520;

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ouvrir le profil élève"
        onPress={() => router.push("/(tabs)/profile")}
        style={({ pressed }) => [styles.profileButton, pressed && styles.pressed]}
      >
        <IconSymbol name="person.fill" size={20} color={HOME_COLORS.accent} />
        {showLabels ? <Text style={styles.profileLabel}>Profil</Text> : null}
      </Pressable>

      <LanguageSelector
        value={selectedLanguage}
        onChange={setSelectedLanguage}
      />

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Statistiques"
          accessibilityHint="Affiche la disponibilité des statistiques"
          onPress={() =>
            Alert.alert("Statistiques", "Cette section sera disponible prochainement.")
          }
          style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
        >
          <IconSymbol name="chart.bar.fill" size={18} color={HOME_COLORS.accent} />
          {showLabels ? <Text style={styles.actionLabel}>Statistiques</Text> : null}
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ouvrir la prochaine leçon"
          accessibilityHint="Ouvre la première leçon disponible"
          onPress={onPressCurrentLesson}
          style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
        >
          <IconSymbol name="book.fill" size={18} color={HOME_COLORS.textSecondary} />
          {showLabels ? <Text style={styles.actionLabel}>Leçon</Text> : null}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  profileButton: {
    minWidth: 44,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 12,
    backgroundColor: HOME_COLORS.surface,
    paddingHorizontal: 8,
  },
  profileLabel: {
    color: HOME_COLORS.textPrimary,
    fontSize: 12,
    fontWeight: "800",
  },
  actions: {
    flexShrink: 0,
    flexDirection: "row",
    gap: 6,
    marginLeft: "auto",
  },
  actionButton: {
    minWidth: 44,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 12,
    backgroundColor: HOME_COLORS.surface,
    paddingHorizontal: 8,
  },
  actionLabel: {
    color: HOME_COLORS.textSecondary,
    fontSize: 11,
    fontWeight: "800",
  },
  pressed: {
    backgroundColor: HOME_COLORS.surfaceRaised,
    opacity: 0.82,
  },
});
