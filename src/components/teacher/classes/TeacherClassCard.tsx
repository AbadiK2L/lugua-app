import { Pressable, StyleSheet, Text, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import type { TeacherClass } from "@/src/types/teacher";

type TeacherClassCardProps = {
  teacherClass: TeacherClass;
  onOpen: () => void;
};

export function TeacherClassCard({ teacherClass, onOpen }: TeacherClassCardProps) {
  const statusLabel = teacherClass.status === "active" ? "Active" : "Archivée";
  const codePreview = `${teacherClass.inviteCode.slice(0, 6)}••••`;
  const accessibilityLabel = `${teacherClass.name}, ${statusLabel}, ${teacherClass.activeStudentCount} élève(s) actif(s), ${teacherClass.pendingInvitationCount} invitation(s), ${teacherClass.assignedCourseDraftIds.length} cours attribué(s)`;

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      style={[styles.card, teacherClass.status === "archived" && styles.archivedCard]}
    >
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={styles.title} numberOfLines={2}>{teacherClass.name}</Text>
          {teacherClass.description ? (
            <Text style={styles.description} numberOfLines={2}>{teacherClass.description}</Text>
          ) : null}
        </View>
        <Text style={[styles.status, teacherClass.status === "archived" && styles.archivedStatus]}>
          {statusLabel}
        </Text>
      </View>

      <Text style={styles.meta}>
        {teacherClass.level ?? "Niveau non défini"} · {teacherClass.variety} ·{" "}
        {teacherClass.visibility === "public" ? "Publique" : "Privée"}
      </Text>

      <View style={styles.stats}>
        <Stat label="Élèves actifs" value={String(teacherClass.activeStudentCount)} />
        <Stat label="Invitations" value={String(teacherClass.pendingInvitationCount)} />
        <Stat label="Cours attribués" value={String(teacherClass.assignedCourseDraftIds.length)} />
        <Stat label="Code" value={codePreview} />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ouvrir ${teacherClass.name}`}
        accessibilityHint="Ouvre le détail de cette classe"
        onPress={onOpen}
        style={({ pressed }) => [styles.openButton, pressed && styles.pressed]}
      >
        <Text style={styles.openButtonText}>Ouvrir</Text>
      </Pressable>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 11, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 16, backgroundColor: HOME_COLORS.card, padding: 16 },
  archivedCard: { opacity: 0.78 },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  copy: { flex: 1, gap: 5 },
  title: { color: HOME_COLORS.textPrimary, fontSize: 18, fontWeight: "900" },
  description: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "600", lineHeight: 19 },
  status: { color: HOME_COLORS.accent, fontSize: 12, fontWeight: "900", textAlign: "right" },
  archivedStatus: { color: HOME_COLORS.textMuted },
  meta: { color: HOME_COLORS.accentMuted, fontSize: 13, fontWeight: "800" },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  stat: { minWidth: 82, flexGrow: 1, borderRadius: 10, backgroundColor: HOME_COLORS.surface, padding: 10 },
  statValue: { color: HOME_COLORS.textPrimary, fontSize: 15, fontWeight: "900" },
  statLabel: { color: HOME_COLORS.textMuted, fontSize: 11, fontWeight: "700", lineHeight: 16 },
  openButton: { minHeight: 46, alignItems: "center", justifyContent: "center", alignSelf: "flex-start", borderRadius: 10, backgroundColor: HOME_COLORS.accent, paddingHorizontal: 16 },
  openButtonText: { color: HOME_COLORS.ink, fontSize: 13, fontWeight: "900" },
  pressed: { opacity: 0.78 },
});
