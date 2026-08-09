import { StyleSheet, Text, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";

export function TeacherAssignmentSubmissionsSection({
  studentCount,
}: {
  studentCount?: number;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Rendus des élèves</Text>
      <View style={styles.card}>
        <Text style={styles.title}>Aucun rendu disponible</Text>
        <Text style={styles.text}>
          Aucun rendu réel n’est encore enregistré. La remise et la correction
          des travaux seront ajoutées dans une prochaine étape.
        </Text>
        <Text style={styles.context}>
          {studentCount === undefined
            ? "Élèves dans la classe : indisponible"
            : `Élèves dans la classe : ${studentCount}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 10 },
  sectionTitle: {
    color: HOME_COLORS.textPrimary,
    fontSize: 19,
    fontWeight: "900",
  },
  card: {
    gap: 7,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 14,
    backgroundColor: HOME_COLORS.card,
    padding: 16,
  },
  title: {
    color: HOME_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "900",
  },
  text: {
    color: HOME_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  context: {
    color: HOME_COLORS.accentMuted,
    fontSize: 12,
    fontWeight: "800",
  },
});
