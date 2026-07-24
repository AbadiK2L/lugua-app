import { StyleSheet, Text, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";

export type ProfileProgressRow = {
  label: string;
  value: string;
};

type ProfileProgressCardProps = {
  rows: ProfileProgressRow[];
};

export function ProfileProgressCard({ rows }: ProfileProgressCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Progression</Text>
      <View style={styles.rows}>
        {rows.map((row, index) => (
          <View
            key={row.label}
            style={[styles.row, index === rows.length - 1 && styles.lastRow]}
          >
            <Text style={styles.label}>{row.label}</Text>
            <Text style={[styles.value, index === 0 && styles.primaryValue]}>
              {row.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 16,
    backgroundColor: HOME_COLORS.card,
    padding: 18,
  },
  title: {
    color: HOME_COLORS.textPrimary,
    fontSize: 19,
    fontWeight: "900",
  },
  rows: {
    borderTopWidth: 1,
    borderTopColor: HOME_COLORS.border,
  },
  row: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: HOME_COLORS.border,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  label: {
    flex: 1,
    color: HOME_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  value: {
    color: HOME_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "900",
    textAlign: "right",
  },
  primaryValue: {
    color: HOME_COLORS.accent,
  },
});
