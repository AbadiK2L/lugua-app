import { Pressable, StyleSheet, Text, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";

export type TeacherSegment = {
  id: string;
  label: string;
};

type TeacherSegmentedControlProps = {
  options: TeacherSegment[];
  value: string;
  onChange: (value: string) => void;
};

export function TeacherSegmentedControl({
  options,
  value,
  onChange,
}: TeacherSegmentedControlProps) {
  return (
    <View style={styles.container} accessibilityRole="tablist">
      {options.map((option) => {
        const selected = option.id === value;

        return (
          <Pressable
            key={option.id}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            onPress={() => onChange(option.id)}
            style={({ pressed }) => [
              styles.option,
              selected && styles.selected,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.label, selected && styles.selectedLabel]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 48,
    flexDirection: "row",
    gap: 4,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 12,
    backgroundColor: HOME_COLORS.surface,
    padding: 4,
  },
  option: {
    minHeight: 38,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  selected: {
    backgroundColor: HOME_COLORS.accent,
  },
  label: {
    color: HOME_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  selectedLabel: {
    color: HOME_COLORS.ink,
  },
  pressed: {
    opacity: 0.8,
  },
});
