import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";

type AuthButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "text";
  disabled?: boolean;
  busy?: boolean;
  accessibilityHint?: string;
};

export function AuthButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  busy = false,
  accessibilityHint,
}: AuthButtonProps) {
  const isDisabled = disabled || busy;
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy }}
      disabled={isDisabled}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "text" && styles.textButton,
        focused && styles.focused,
        isDisabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === "primary" && styles.primaryLabel,
          variant === "text" && styles.textLabel,
        ]}
      >
        {busy ? "Traitement…" : label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 12,
    paddingHorizontal: 18,
  },
  primary: {
    backgroundColor: HOME_COLORS.accent,
  },
  secondary: {
    borderColor: HOME_COLORS.border,
    backgroundColor: HOME_COLORS.surface,
  },
  textButton: {
    backgroundColor: "transparent",
  },
  label: {
    color: HOME_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
  },
  primaryLabel: {
    color: HOME_COLORS.ink,
  },
  textLabel: {
    color: HOME_COLORS.accentMuted,
  },
  focused: {
    borderWidth: 2,
    borderColor: HOME_COLORS.textPrimary,
  },
  disabled: {
    opacity: 0.48,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
});
