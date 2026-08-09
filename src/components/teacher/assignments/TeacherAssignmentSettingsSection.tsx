import { Pressable, StyleSheet, Text, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import type { TeacherAssignmentStatus } from "@/src/types/teacher";

export function TeacherAssignmentSettingsSection({
  status,
  onEdit,
  onDuplicate,
  onPublish,
  onClose,
  onReopen,
  onDelete,
  disabled = false,
}: {
  status: TeacherAssignmentStatus;
  onEdit: () => void;
  onDuplicate: () => void;
  onPublish: () => void;
  onClose: () => void;
  onReopen: () => void;
  onDelete: () => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Actions</Text>
      <View style={styles.actions}>
        {status === "draft" ? (
          <Action
            label="Modifier"
            hint="Ouvre ce brouillon dans le constructeur"
            onPress={onEdit}
            primary
            disabled={disabled}
          />
        ) : null}
        <Action
          label="Dupliquer"
          hint="Crée une copie dans Brouillons"
          onPress={onDuplicate}
          disabled={disabled}
        />
        {status === "draft" ? (
          <Action
            label="Publier"
            hint="Place ce devoir dans Publiés"
            onPress={onPublish}
            disabled={disabled}
          />
        ) : null}
        {status === "published" ? (
          <Action
            label="Clôturer"
            hint="Déplace ce devoir dans Terminés"
            onPress={onClose}
            disabled={disabled}
          />
        ) : null}
        {status === "closed" ? (
          <Action
            label="Rouvrir"
            hint="Replace ce devoir dans Publiés"
            onPress={onReopen}
            disabled={disabled}
          />
        ) : null}
        <Action
          label="Supprimer"
          hint="Supprime définitivement ce devoir"
          onPress={onDelete}
          destructive
          disabled={disabled}
        />
      </View>
    </View>
  );
}

function Action({
  label,
  hint,
  onPress,
  primary = false,
  destructive = false,
  disabled = false,
}: {
  label: string;
  hint: string;
  onPress: () => void;
  primary?: boolean;
  destructive?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        primary && styles.primaryAction,
        destructive && styles.destructiveAction,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.actionText,
          primary && styles.primaryActionText,
          destructive && styles.destructiveText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { gap: 10 },
  sectionTitle: {
    color: HOME_COLORS.textPrimary,
    fontSize: 19,
    fontWeight: "900",
  },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  action: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 10,
    backgroundColor: HOME_COLORS.surface,
    paddingHorizontal: 14,
  },
  primaryAction: {
    borderColor: HOME_COLORS.accent,
    backgroundColor: HOME_COLORS.accent,
  },
  destructiveAction: { borderColor: "#8e4654" },
  actionText: {
    color: HOME_COLORS.textPrimary,
    fontSize: 13,
    fontWeight: "900",
  },
  primaryActionText: { color: HOME_COLORS.ink },
  destructiveText: { color: "#ffb4c0" },
  disabled: { opacity: 0.48 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});
