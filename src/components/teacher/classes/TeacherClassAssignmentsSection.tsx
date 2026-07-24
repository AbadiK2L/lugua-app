import { Pressable, StyleSheet, Text, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";

export function TeacherClassAssignmentsSection({ onCreate }: { onCreate: () => void }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Devoirs</Text>
      <View style={styles.card}>
        <Text style={styles.title}>Aucun devoir attribué</Text>
        <Text style={styles.text}>La création de devoirs à partir des cours sera ajoutée prochainement.</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Créer un devoir" onPress={onCreate} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <Text style={styles.buttonText}>Créer un devoir</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 10 },
  sectionTitle: { color: HOME_COLORS.textPrimary, fontSize: 19, fontWeight: "900" },
  card: { gap: 8, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 14, backgroundColor: HOME_COLORS.card, padding: 16 },
  title: { color: HOME_COLORS.textPrimary, fontSize: 16, fontWeight: "900" },
  text: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "600", lineHeight: 19 },
  button: { minHeight: 46, alignItems: "center", justifyContent: "center", alignSelf: "flex-start", borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 10, backgroundColor: HOME_COLORS.surface, paddingHorizontal: 14 },
  buttonText: { color: HOME_COLORS.textPrimary, fontSize: 13, fontWeight: "900" },
  pressed: { opacity: 0.78 },
});
