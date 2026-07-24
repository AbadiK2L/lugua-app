import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import type { UserRole } from "@/src/types/profile";

type ProfileRolePreviewSwitchProps = {
  value: UserRole;
  onChange: (role: UserRole) => void;
};

const roleLabels: Record<UserRole, string> = {
  student: "Élève",
  teacher: "Professeur",
};

const roles: UserRole[] = ["student", "teacher"];

export function ProfileRolePreviewSwitch({
  value,
  onChange,
}: ProfileRolePreviewSwitchProps) {
  const [focusedRole, setFocusedRole] = useState<UserRole | null>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Aperçu du rôle</Text>
      <View
        accessibilityRole="tablist"
        accessibilityLabel="Aperçu des profils"
        style={styles.switch}
      >
        {roles.map((role) => {
          const isSelected = role === value;

          return (
            <Pressable
              key={role}
              accessibilityRole="tab"
              accessibilityLabel={roleLabels[role]}
              accessibilityHint={`Affiche l’aperçu du profil ${roleLabels[role].toLowerCase()}`}
              accessibilityState={{ selected: isSelected }}
              onPress={() => onChange(role)}
              onFocus={() => setFocusedRole(role)}
              onBlur={() => setFocusedRole(null)}
              style={({ pressed }) => [
                styles.option,
                isSelected && styles.selectedOption,
                focusedRole === role && styles.focusedOption,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.optionText, isSelected && styles.selectedText]}>
                {roleLabels[role]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 7,
  },
  label: {
    color: HOME_COLORS.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },
  switch: {
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
    paddingHorizontal: 12,
  },
  selectedOption: {
    backgroundColor: HOME_COLORS.accent,
  },
  focusedOption: {
    borderWidth: 2,
    borderColor: HOME_COLORS.textPrimary,
  },
  optionText: {
    color: HOME_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "900",
  },
  selectedText: {
    color: HOME_COLORS.ink,
  },
  pressed: {
    opacity: 0.8,
  },
});
