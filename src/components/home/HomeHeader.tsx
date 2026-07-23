import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { HOME_COLORS } from "@/src/components/home/homeColors";
import {
  LanguageSelector,
  type LanguageSelectionId,
} from "@/src/components/home/LanguageSelector";

type HomeHeaderProps = {
  language: LanguageSelectionId;
  onLanguageChange: (language: LanguageSelectionId) => void;
  onOpenLesson: () => void;
};

export function HomeHeader({
  language,
  onLanguageChange,
  onOpenLesson,
}: HomeHeaderProps) {
  return (
    <View style={styles.container}>
      <LanguageSelector value={language} onChange={onLanguageChange} />

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Statistiques"
          accessibilityHint="Affiche la disponibilité des statistiques"
          onPress={() =>
            Alert.alert("Statistiques", "Cette section sera disponible prochainement.")
          }
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        >
          <IconSymbol name="chart.bar.fill" size={17} color={HOME_COLORS.accent} />
          <Text style={styles.actionText}>Statistiques</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Leçon en cours"
          accessibilityHint="Ouvre la prochaine leçon disponible"
          onPress={onOpenLesson}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        >
          <IconSymbol name="book.fill" size={17} color={HOME_COLORS.textSecondary} />
          <Text style={styles.actionText}>Leçon</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  actions: {
    flexDirection: "row",
    gap: 5,
    flexShrink: 0,
  },
  iconButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 12,
    backgroundColor: HOME_COLORS.surface,
    paddingHorizontal: 6,
  },
  actionText: {
    color: HOME_COLORS.textSecondary,
    fontSize: 10,
    fontWeight: "800",
  },
  pressed: {
    backgroundColor: HOME_COLORS.surfaceRaised,
    opacity: 0.82,
  },
});
