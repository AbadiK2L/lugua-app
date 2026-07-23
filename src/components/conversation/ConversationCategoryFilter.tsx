import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import type { ConversationVideoFilter } from "@/src/types/conversation";

type ConversationCategoryFilterProps = {
  value: ConversationVideoFilter;
  onChange: (category: ConversationVideoFilter) => void;
};

export const conversationCategoryLabels: Record<ConversationVideoFilter, string> = {
  all: "Toutes",
  interview: "Interviews",
  daily_life: "Vie quotidienne",
  culture: "Culture",
  story: "Histoires",
};

const categories: ConversationVideoFilter[] = [
  "all",
  "interview",
  "daily_life",
  "culture",
  "story",
];

export function ConversationCategoryFilter({
  value,
  onChange,
}: ConversationCategoryFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      accessibilityLabel="Filtrer les vidéos par catégorie"
    >
      {categories.map((category) => {
        const isActive = category === value;

        return (
          <Pressable
            key={category}
            accessibilityRole="radio"
            accessibilityLabel={conversationCategoryLabels[category]}
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(category)}
            style={({ pressed }) => [
              styles.filter,
              isActive && styles.activeFilter,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {conversationCategoryLabels[category]}
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
