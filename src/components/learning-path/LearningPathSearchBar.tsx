import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { HOME_COLORS } from "@/src/components/home/homeColors";

type LearningPathSearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  onClear: () => void;
};

export function LearningPathSearchBar({
  value,
  onChangeText,
  onClear,
}: LearningPathSearchBarProps) {
  return (
    <View style={styles.container}>
      <IconSymbol name="magnifyingglass" size={21} color={HOME_COLORS.accent} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Rechercher un chapitre ou une notion"
        placeholderTextColor={HOME_COLORS.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel="Rechercher un chapitre ou une notion"
        style={styles.input}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Effacer la recherche"
          onPress={onClear}
          style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}
        >
          <IconSymbol name="xmark" size={19} color={HOME_COLORS.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 14,
    backgroundColor: HOME_COLORS.surface,
    paddingLeft: 16,
    paddingRight: 6,
  },
  input: {
    flex: 1,
    minHeight: 44,
    color: HOME_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  clearButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  pressed: {
    backgroundColor: HOME_COLORS.cardActive,
  },
});
