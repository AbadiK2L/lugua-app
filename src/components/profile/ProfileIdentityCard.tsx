import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { HOME_COLORS } from "@/src/components/home/homeColors";

type ProfileIdentityCardProps = {
  languageLabel: string;
  onEdit: () => void;
};

export function ProfileIdentityCard({
  languageLabel,
  onEdit,
}: ProfileIdentityCardProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.identity}>
        <View style={styles.avatar}>
          <IconSymbol name="person.fill" size={34} color={HOME_COLORS.accent} />
        </View>
        <Text style={styles.title}>Mon profil</Text>
        <Text style={styles.subtitle}>Élève · {languageLabel}</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Modifier le profil"
        accessibilityHint="Affiche la disponibilité de la modification du profil"
        onPress={onEdit}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={({ pressed }) => [
          styles.editButton,
          isFocused && styles.focused,
          pressed && styles.pressed,
        ]}
      >
        <IconSymbol name="pencil" size={17} color={HOME_COLORS.ink} />
        <Text style={styles.editButtonText}>Modifier le profil</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 16,
    backgroundColor: HOME_COLORS.card,
    padding: 22,
  },
  identity: {
    alignItems: "center",
    gap: 6,
  },
  avatar: {
    width: 76,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: HOME_COLORS.accent,
    borderRadius: 38,
    backgroundColor: HOME_COLORS.cardActive,
    marginBottom: 4,
  },
  title: {
    color: HOME_COLORS.textPrimary,
    fontSize: 22,
    fontWeight: "900",
  },
  subtitle: {
    color: HOME_COLORS.textSecondary,
    fontSize: 15,
    fontWeight: "700",
  },
  editButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 11,
    backgroundColor: HOME_COLORS.accent,
    paddingHorizontal: 15,
  },
  editButtonText: {
    color: HOME_COLORS.ink,
    fontSize: 13,
    fontWeight: "900",
  },
  pressed: {
    backgroundColor: HOME_COLORS.accentPressed,
    opacity: 0.84,
  },
  focused: {
    borderWidth: 2,
    borderColor: HOME_COLORS.textPrimary,
  },
});
