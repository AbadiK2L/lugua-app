import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";

export type TeacherCoursesMode = "lugua_program" | "my_courses";

type TeacherCoursesModeSwitchProps = {
  value: TeacherCoursesMode;
  onChange: (value: TeacherCoursesMode) => void;
};

const options: { id: TeacherCoursesMode; label: string }[] = [
  { id: "lugua_program", label: "Programme Lugua" },
  { id: "my_courses", label: "Mes cours" },
];

export function TeacherCoursesModeSwitch({
  value,
  onChange,
}: TeacherCoursesModeSwitchProps) {
  const [focusedOption, setFocusedOption] = useState<TeacherCoursesMode | null>(
    null,
  );

  return (
    <View style={styles.container} accessibilityRole="tablist">
      {options.map((option) => {
        const selected = option.id === value;
        const focused = focusedOption === option.id;

        return (
          <Pressable
            key={option.id}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(option.id)}
            onFocus={() => setFocusedOption(option.id)}
            onBlur={() => setFocusedOption(null)}
            style={({ pressed }) => [
              styles.option,
              selected && styles.selected,
              focused && styles.focused,
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
    minHeight: 52,
    flexDirection: "row",
    gap: 4,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 12,
    backgroundColor: HOME_COLORS.surface,
    padding: 4,
  },
  option: {
    minHeight: 44,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  selected: {
    backgroundColor: HOME_COLORS.accent,
  },
  focused: {
    borderWidth: 2,
    borderColor: HOME_COLORS.accent,
  },
  label: {
    color: HOME_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },
  selectedLabel: {
    color: HOME_COLORS.ink,
  },
  pressed: {
    opacity: 0.78,
  },
});
