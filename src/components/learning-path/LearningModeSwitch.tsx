import { Pressable, StyleSheet, Text, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";

export type LearningMode = "learn" | "review";

type LearningModeSwitchProps = {
  value: LearningMode;
  onChange: (mode: LearningMode) => void;
};

const modes: { id: LearningMode; label: string }[] = [
  { id: "learn", label: "Apprendre" },
  { id: "review", label: "Réviser" },
];

export function LearningModeSwitch({ value, onChange }: LearningModeSwitchProps) {
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel="Mode du parcours"
      style={styles.container}
    >
      {modes.map((mode) => {
        const isActive = mode.id === value;

        return (
          <Pressable
            key={mode.id}
            accessibilityRole="tab"
            accessibilityLabel={mode.label}
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(mode.id)}
            style={({ pressed }) => [
              styles.option,
              isActive && styles.activeOption,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {mode.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 52,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 14,
    backgroundColor: HOME_COLORS.surface,
    padding: 4,
  },
  option: {
    minHeight: 44,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  activeOption: {
    borderWidth: 1,
    borderColor: HOME_COLORS.accent,
    backgroundColor: HOME_COLORS.cardActive,
  },
  label: {
    color: HOME_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "800",
  },
  activeLabel: {
    color: HOME_COLORS.textPrimary,
  },
  pressed: {
    opacity: 0.78,
  },
});
