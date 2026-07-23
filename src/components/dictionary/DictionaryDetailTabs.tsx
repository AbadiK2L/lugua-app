import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

import { DICTIONARY_COLORS } from "@/src/components/dictionary/dictionaryColors";
import type { DictionaryDetailTab } from "@/src/types/dictionary";

type DictionaryDetailTabsProps = {
  activeTab: DictionaryDetailTab;
  onChange: (tab: DictionaryDetailTab) => void;
};

const tabs: { id: DictionaryDetailTab; label: string }[] = [
  { id: "definitions", label: "Définitions" },
  { id: "synonyms", label: "Synonymes" },
  { id: "conjugation", label: "Conjugaison" },
  { id: "etymology", label: "Étymologie" },
  { id: "map", label: "Cartographie" },
];

export function DictionaryDetailTabs({
  activeTab,
  onChange,
}: DictionaryDetailTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      style={styles.container}
      accessibilityLabel="Sections de la fiche"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(tab.id)}
            style={({ pressed }) => [
              styles.tab,
              isActive && styles.activeTab,
              pressed && styles.pressed,
            ]}
          >
            <Text
              numberOfLines={1}
              style={[styles.label, isActive && styles.activeLabel]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    minHeight: 48,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: DICTIONARY_COLORS.border,
  },
  content: {
    minHeight: 48,
    alignItems: "stretch",
    gap: 4,
    paddingHorizontal: 2,
  },
  tab: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    paddingHorizontal: 12,
  },
  activeTab: {
    borderBottomColor: DICTIONARY_COLORS.accent,
  },
  label: {
    color: DICTIONARY_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
  },
  activeLabel: {
    color: DICTIONARY_COLORS.accent,
  },
  pressed: {
    opacity: 0.72,
  },
});
