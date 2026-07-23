import { Pressable, StyleSheet, Text, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { HOME_COLORS } from "@/src/components/home/homeColors";
import { scenarioCategoryLabels } from "@/src/components/scenarios/ScenarioCategoryFilter";
import type { ScenarioCardData } from "@/src/types/scenarios";

type ScenarioCardProps = {
  scenario: ScenarioCardData;
  onPress?: () => void;
};

export function ScenarioCard({ scenario, onPress }: ScenarioCardProps) {
  const isAvailable = scenario.availability === "available" && Boolean(onPress);
  const statusLabel = scenario.availability === "available" ? "Disponible" : "Bientôt";

  return (
    <View style={[styles.card, !isAvailable && styles.unavailableCard]}>
      <View style={styles.headerRow}>
        <View style={styles.iconBox}>
          <IconSymbol name="bubble.left.fill" size={21} color={HOME_COLORS.accent} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.status}>{statusLabel}</Text>
          <Text style={styles.title}>{scenario.title}</Text>
          <Text style={styles.description}>{scenario.description}</Text>
        </View>
      </View>

      <View style={styles.metadata}>
        <Text style={styles.concepts}>{scenario.conceptLabels.join(" · ")}</Text>
        <Text style={styles.details}>
          {scenario.level} · {scenarioCategoryLabels[scenario.category]}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${scenario.title}. ${scenario.level}. ${statusLabel}`}
        accessibilityState={{ disabled: !isAvailable }}
        disabled={!isAvailable}
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          !isAvailable && styles.disabledButton,
          pressed && isAvailable && styles.pressed,
        ]}
      >
        <Text style={[styles.buttonText, !isAvailable && styles.disabledButtonText]}>
          {isAvailable ? "Commencer" : "Bientôt"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 16,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 18,
    backgroundColor: HOME_COLORS.card,
    padding: 16,
  },
  unavailableCard: {
    opacity: 0.68,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconBox: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: HOME_COLORS.accentSoft,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  status: {
    color: HOME_COLORS.accent,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  title: {
    color: HOME_COLORS.textPrimary,
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 27,
  },
  description: {
    color: HOME_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
  },
  metadata: {
    gap: 4,
  },
  concepts: {
    color: HOME_COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  details: {
    color: HOME_COLORS.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  button: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: HOME_COLORS.accent,
    paddingHorizontal: 16,
  },
  disabledButton: {
    backgroundColor: HOME_COLORS.surfaceRaised,
  },
  buttonText: {
    color: HOME_COLORS.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  disabledButtonText: {
    color: HOME_COLORS.textMuted,
  },
  pressed: {
    backgroundColor: HOME_COLORS.accentPressed,
  },
});
