import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import type { TeacherAssignmentStatus } from "@/src/types/teacher";

const options: { id: TeacherAssignmentStatus; label: string }[] = [
  { id: "draft", label: "Brouillons" },
  { id: "published", label: "Publiés" },
  { id: "closed", label: "Terminés" },
];

export function TeacherAssignmentsModeSwitch({
  value,
  onChange,
}: {
  value: TeacherAssignmentStatus;
  onChange: (value: TeacherAssignmentStatus) => void;
}) {
  const [focused, setFocused] = useState<TeacherAssignmentStatus | null>(null);

  return (
    <View style={styles.container} accessibilityRole="tablist">
      {options.map((option) => {
        const selected = value === option.id;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(option.id)}
            onFocus={() => setFocused(option.id)}
            onBlur={() => setFocused(null)}
            style={({ pressed }) => [
              styles.option,
              selected && styles.selected,
              focused === option.id && styles.focused,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.label, selected && styles.selectedLabel]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { minHeight: 52, flexDirection: "row", gap: 4, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 12, backgroundColor: HOME_COLORS.surface, padding: 4 },
  option: { minHeight: 44, flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 8, paddingHorizontal: 7 },
  selected: { backgroundColor: HOME_COLORS.accent },
  focused: { borderWidth: 2, borderColor: HOME_COLORS.accent },
  label: { color: HOME_COLORS.textSecondary, fontSize: 12, fontWeight: "800", textAlign: "center" },
  selectedLabel: { color: HOME_COLORS.ink },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});
