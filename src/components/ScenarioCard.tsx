import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { Scenario } from "@/src/data/scenarios";

type ScenarioCardProps = {
  scenario: Scenario;
  onPress?: (scenario: Scenario) => void;
};

export function ScenarioCard({ scenario, onPress }: ScenarioCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      disabled={!onPress}
      style={styles.card}
      onPress={() => onPress?.(scenario)}
    >
      <View style={[styles.accent, { backgroundColor: scenario.accentColor }]} />

      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.title}>{scenario.title}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{scenario.level}</Text>
          </View>
        </View>

        <Text style={styles.description}>{scenario.description}</Text>
        <Text style={styles.meta}>
          {scenario.turns.length} répliques · {scenario.dialect}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 118,
    flexDirection: "row",
    overflow: "hidden",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1f2937",
    backgroundColor: "#111827",
  },
  accent: {
    width: 7,
  },
  body: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  title: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "900",
  },
  badge: {
    borderRadius: 999,
    backgroundColor: "#172033",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    color: "#93c5fd",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  description: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  meta: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
  },
});
