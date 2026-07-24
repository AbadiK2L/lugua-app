import { StyleSheet, Text, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import type { TeacherClass } from "@/src/types/teacher";

export function TeacherClassSummaryCard({ teacherClass }: { teacherClass: TeacherClass }) {
  const createdDate = new Date(teacherClass.createdAt).toLocaleDateString("fr-FR");

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>RÉSUMÉ DE LA CLASSE</Text>
          <Text style={styles.title}>{teacherClass.name}</Text>
        </View>
        <Text style={[styles.status, teacherClass.status === "archived" && styles.archivedStatus]}>
          {teacherClass.status === "active" ? "Active" : "Archivée"}
        </Text>
      </View>
      {teacherClass.description ? <Text style={styles.description}>{teacherClass.description}</Text> : null}
      <View style={styles.grid}>
        <Detail label="Langue" value={teacherClass.language} />
        <Detail label="Variété" value={teacherClass.variety} />
        <Detail label="Niveau" value={teacherClass.level ?? "Non défini"} />
        <Detail label="Élèves" value={String(teacherClass.students.length)} />
        <Detail label="Cours attribués" value={String(teacherClass.assignedCourseDraftIds.length)} />
        <Detail label="Créée le" value={createdDate} />
      </View>
      <View style={styles.inviteBlock}>
        <Text style={styles.inviteLabel}>Code de démonstration</Text>
        <Text selectable style={styles.inviteCode}>{teacherClass.inviteCode}</Text>
        <Text style={styles.inviteNote}>
          Ce code ne permet pas encore à un élève de rejoindre réellement la classe.
        </Text>
      </View>
    </View>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12, borderWidth: 1, borderColor: HOME_COLORS.accent, borderRadius: 16, backgroundColor: HOME_COLORS.card, padding: 18 },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  copy: { flex: 1, gap: 5 },
  eyebrow: { color: HOME_COLORS.accent, fontSize: 11, fontWeight: "900", letterSpacing: 0.6 },
  title: { color: HOME_COLORS.textPrimary, fontSize: 22, fontWeight: "900" },
  status: { color: HOME_COLORS.accent, fontSize: 12, fontWeight: "900" },
  archivedStatus: { color: HOME_COLORS.textMuted },
  description: { color: HOME_COLORS.textSecondary, fontSize: 14, fontWeight: "600", lineHeight: 21 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  detail: { minWidth: 130, flexGrow: 1, borderRadius: 10, backgroundColor: HOME_COLORS.surface, padding: 11 },
  detailLabel: { color: HOME_COLORS.textMuted, fontSize: 11, fontWeight: "700" },
  detailValue: { color: HOME_COLORS.textPrimary, fontSize: 14, fontWeight: "900", marginTop: 3 },
  inviteBlock: { gap: 4, borderTopWidth: 1, borderTopColor: HOME_COLORS.border, paddingTop: 12 },
  inviteLabel: { color: HOME_COLORS.textSecondary, fontSize: 12, fontWeight: "800" },
  inviteCode: { color: HOME_COLORS.accent, fontSize: 22, fontWeight: "900", letterSpacing: 1 },
  inviteNote: { color: HOME_COLORS.textMuted, fontSize: 12, fontWeight: "600", lineHeight: 18 },
});
