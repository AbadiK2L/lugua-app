import { StyleSheet, Text, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";

export function TeacherEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 16,
    backgroundColor: HOME_COLORS.card,
    padding: 18,
  },
  title: {
    color: HOME_COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "900",
  },
  description: {
    color: HOME_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
  },
});
