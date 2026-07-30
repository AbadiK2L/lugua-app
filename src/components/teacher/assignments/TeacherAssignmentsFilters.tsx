import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import type { TeacherClass } from "@/src/types/teacher";

export type AssignmentDueFilter = "all" | "with_due_date" | "without_due_date";

export function TeacherAssignmentsFilters({
  search,
  classId,
  dueFilter,
  classes,
  onSearchChange,
  onClassChange,
  onDueFilterChange,
}: {
  search: string;
  classId: string;
  dueFilter: AssignmentDueFilter;
  classes: TeacherClass[];
  onSearchChange: (value: string) => void;
  onClassChange: (value: string) => void;
  onDueFilterChange: (value: AssignmentDueFilter) => void;
}) {
  return (
    <View style={styles.container}>
      <TextInput
        accessibilityLabel="Rechercher un devoir"
        value={search}
        onChangeText={onSearchChange}
        placeholder="Rechercher un devoir"
        placeholderTextColor={HOME_COLORS.textMuted}
        style={styles.searchInput}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <FilterButton label="Toutes les classes" selected={classId === "all"} onPress={() => onClassChange("all")} />
        {classes.map((teacherClass) => (
          <FilterButton key={teacherClass.id} label={teacherClass.name} selected={classId === teacherClass.id} onPress={() => onClassChange(teacherClass.id)} />
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <FilterButton label="Toutes les dates" selected={dueFilter === "all"} onPress={() => onDueFilterChange("all")} />
        <FilterButton label="Avec date limite" selected={dueFilter === "with_due_date"} onPress={() => onDueFilterChange("with_due_date")} />
        <FilterButton label="Sans date limite" selected={dueFilter === "without_due_date"} onPress={() => onDueFilterChange("without_due_date")} />
      </ScrollView>
    </View>
  );
}

function FilterButton({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.filter, selected && styles.selectedFilter, pressed && styles.pressed]}
    >
      <Text style={[styles.filterText, selected && styles.selectedFilterText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  searchInput: { minHeight: 48, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 11, backgroundColor: HOME_COLORS.surface, color: HOME_COLORS.textPrimary, fontSize: 14, paddingHorizontal: 13 },
  row: { gap: 6, paddingRight: 4 },
  filter: { minHeight: 44, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 10, backgroundColor: HOME_COLORS.surface, paddingHorizontal: 12 },
  selectedFilter: { borderColor: HOME_COLORS.accent, backgroundColor: HOME_COLORS.accentSoft },
  filterText: { color: HOME_COLORS.textSecondary, fontSize: 12, fontWeight: "800" },
  selectedFilterText: { color: HOME_COLORS.accent },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});
