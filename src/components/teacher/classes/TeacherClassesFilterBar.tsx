import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";

export type TeacherClassesFilter = "all" | "active" | "archived";

type TeacherClassesFilterBarProps = {
  search: string;
  filter: TeacherClassesFilter;
  onSearchChange: (value: string) => void;
  onFilterChange: (filter: TeacherClassesFilter) => void;
};

const filters: { id: TeacherClassesFilter; label: string }[] = [
  { id: "all", label: "Toutes" },
  { id: "active", label: "Actives" },
  { id: "archived", label: "Archivées" },
];

export function TeacherClassesFilterBar({
  search,
  filter,
  onSearchChange,
  onFilterChange,
}: TeacherClassesFilterBarProps) {
  const [focusedFilter, setFocusedFilter] = useState<TeacherClassesFilter | null>(null);

  return (
    <View style={styles.container}>
      <TextInput
        value={search}
        onChangeText={onSearchChange}
        placeholder="Rechercher une classe"
        placeholderTextColor={HOME_COLORS.textMuted}
        accessibilityLabel="Rechercher une classe"
        style={styles.searchInput}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map((option) => {
          const selected = filter === option.id;
          const focused = focusedFilter === option.id;

          return (
            <Pressable
              key={option.id}
              accessibilityRole="tab"
              accessibilityLabel={option.label}
              accessibilityState={{ selected }}
              onPress={() => onFilterChange(option.id)}
              onFocus={() => setFocusedFilter(option.id)}
              onBlur={() => setFocusedFilter(null)}
              style={({ pressed }) => [
                styles.filter,
                selected && styles.selectedFilter,
                focused && styles.focusedFilter,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.filterText, selected && styles.selectedFilterText]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  searchInput: { minHeight: 48, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 12, backgroundColor: HOME_COLORS.surface, color: HOME_COLORS.textPrimary, fontSize: 14, paddingHorizontal: 14 },
  filterContent: { gap: 6, paddingRight: 4 },
  filter: { minHeight: 44, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 10, backgroundColor: HOME_COLORS.surface, paddingHorizontal: 13 },
  selectedFilter: { borderColor: HOME_COLORS.accent, backgroundColor: HOME_COLORS.accentSoft },
  focusedFilter: { borderWidth: 2, borderColor: HOME_COLORS.accent },
  filterText: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "800" },
  selectedFilterText: { color: HOME_COLORS.accent },
  pressed: { opacity: 0.78 },
});
