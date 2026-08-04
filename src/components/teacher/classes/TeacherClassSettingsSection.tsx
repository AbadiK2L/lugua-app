import { Pressable, StyleSheet, Text, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import type { TeacherClass } from "@/src/types/teacher";

type TeacherClassSettingsSectionProps = {
  teacherClass: TeacherClass;
  onEdit: () => void;
  onRegenerateCode: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
  disabled?: boolean;
};

export function TeacherClassSettingsSection({
  teacherClass,
  onEdit,
  onRegenerateCode,
  onArchive,
  onRestore,
  onDelete,
  disabled = false,
}: TeacherClassSettingsSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Paramètres</Text>
      <View style={styles.settingsCard}>
        <SettingButton label="Modifier la classe" disabled={disabled} onPress={onEdit} />
        <SettingButton label="Régénérer le code" disabled={disabled} onPress={onRegenerateCode} />
        <SettingButton
          label={teacherClass.status === "active" ? "Archiver la classe" : "Restaurer la classe"}
          disabled={disabled}
          onPress={teacherClass.status === "active" ? onArchive : onRestore}
        />
        <SettingButton label="Supprimer la classe" disabled={disabled} onPress={onDelete} destructive />
      </View>
    </View>
  );
}

function SettingButton({ label, onPress, destructive = false, disabled = false }: { label: string; onPress: () => void; destructive?: boolean; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingButton,
        destructive && styles.destructiveButton,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.settingText, destructive && styles.destructiveText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  sectionTitle: { color: HOME_COLORS.textPrimary, fontSize: 19, fontWeight: "900" },
  settingsCard: { gap: 6, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 14, backgroundColor: HOME_COLORS.surface, padding: 10 },
  settingButton: { minHeight: 46, justifyContent: "center", borderRadius: 9, paddingHorizontal: 10 },
  settingText: { color: HOME_COLORS.textPrimary, fontSize: 13, fontWeight: "800" },
  destructiveButton: { backgroundColor: "rgba(142, 70, 84, 0.12)" },
  destructiveText: { color: "#ffb4c0" },
  heading: { gap: 4 },
  disabled: { opacity: 0.48 },
  pressed: { backgroundColor: HOME_COLORS.surfaceRaised, opacity: 0.82 },
});
