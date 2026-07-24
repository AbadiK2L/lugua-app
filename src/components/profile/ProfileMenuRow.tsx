import { useState, type ComponentProps, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { HOME_COLORS } from "@/src/components/home/homeColors";

type IconName = ComponentProps<typeof IconSymbol>["name"];

type ProfileMenuRowProps = {
  icon: IconName;
  label: string;
  value?: string;
  onPress?: () => void;
  accessibilityHint?: string;
  trailing?: ReactNode;
  isLast?: boolean;
};

export function ProfileMenuRow({
  icon,
  label,
  value,
  onPress,
  accessibilityHint,
  trailing,
  isLast = false,
}: ProfileMenuRowProps) {
  const [isFocused, setIsFocused] = useState(false);
  const content = (
    <>
      <View style={styles.iconBox}>
        <IconSymbol name={icon} size={20} color={HOME_COLORS.accent} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.label} numberOfLines={2}>
          {label}
        </Text>
        {value ? (
          <Text style={styles.value} numberOfLines={2}>
            {value}
          </Text>
        ) : null}
      </View>
      {trailing}
      {!trailing && onPress ? (
        <IconSymbol name="chevron.right" size={20} color={HOME_COLORS.textMuted} />
      ) : null}
    </>
  );
  const accessibilityLabel = [label, value].filter(Boolean).join(", ");

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: false }}
        onPress={onPress}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={({ pressed }) => [
          styles.row,
          isLast && styles.lastRow,
          isFocused && styles.focused,
          pressed && styles.pressed,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View
      accessible={!trailing}
      accessibilityLabel={trailing ? undefined : accessibilityLabel}
      style={[styles.row, isLast && styles.lastRow]}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: HOME_COLORS.border,
    paddingHorizontal: 14,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  iconBox: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    backgroundColor: HOME_COLORS.surfaceRaised,
  },
  copy: {
    minWidth: 0,
    flex: 1,
    gap: 2,
  },
  label: {
    color: HOME_COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  value: {
    color: HOME_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  pressed: {
    backgroundColor: HOME_COLORS.surfaceRaised,
  },
  focused: {
    backgroundColor: HOME_COLORS.accentSoft,
  },
});
