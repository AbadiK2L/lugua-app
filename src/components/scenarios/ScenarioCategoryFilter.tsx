import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import type { ScenarioCategory } from "@/src/types/scenarios";

type ScenarioCategoryFilterProps = {
  value: ScenarioCategory;
  onChange: (category: ScenarioCategory) => void;
};

export const scenarioCategoryLabels: Record<ScenarioCategory, string> = {
  all: "Tous",
  daily_life: "Quotidien",
  travel: "Voyage",
  family: "Famille",
  commerce: "Commerce",
};

const categories: ScenarioCategory[] = [
  "all",
  "daily_life",
  "travel",
  "family",
  "commerce",
];

export function ScenarioCategoryFilter({
  value,
  onChange,
}: ScenarioCategoryFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      accessibilityLabel="Filtrer les scénarios par catégorie"
    >
      {categories.map((category) => {
        const isActive = value === category;

        return (
          <Pressable
            key={category}
            accessibilityRole="radio"
            accessibilityLabel={scenarioCategoryLabels[category]}
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(category)}
            style={({ pressed }) => [
              styles.filter,
              isActive && styles.activeFilter,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {scenarioCategoryLabels[category]}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 8,
    paddingRight: 8,
  },
  filter: {
    minHeight: 44,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 12,
    backgroundColor: HOME_COLORS.surface,
    paddingHorizontal: 14,
  },
  activeFilter: {
    borderColor: HOME_COLORS.accent,
    backgroundColor: HOME_COLORS.accentSoft,
  },
  label: {
    color: HOME_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "800",
  },
  activeLabel: {
    color: HOME_COLORS.accent,
  },
  pressed: {
    opacity: 0.78,
  },
});
