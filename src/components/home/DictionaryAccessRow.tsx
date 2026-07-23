import { Pressable, StyleSheet, Text } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { HOME_COLORS } from "@/src/components/home/homeColors";

type DictionaryAccessRowProps = {
  onPress: () => void;
};

export function DictionaryAccessRow({ onPress }: DictionaryAccessRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Rechercher dans le dictionnaire"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <IconSymbol name="magnifyingglass" size={21} color={HOME_COLORS.accent} />
      <Text style={styles.label}>Rechercher dans le dictionnaire</Text>
      <IconSymbol name="chevron.right" size={20} color="#94a3b8" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 14,
    backgroundColor: HOME_COLORS.surface,
    paddingHorizontal: 16,
  },
  label: {
    flex: 1,
    color: HOME_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  pressed: {
    backgroundColor: HOME_COLORS.surfaceRaised,
  },
});
