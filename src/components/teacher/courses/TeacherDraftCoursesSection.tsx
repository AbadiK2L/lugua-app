import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import { TeacherCourseDraftCard } from "@/src/components/teacher/courses/TeacherCourseDraftCard";
import type { TeacherCourseDraft, TeacherCourseOrigin } from "@/src/types/teacher";

type DraftFilter = "all" | TeacherCourseOrigin;

type TeacherDraftCoursesSectionProps = {
  drafts: TeacherCourseDraft[];
  disabled?: boolean;
  onCreateFromZero: () => void;
  onUseProgram: () => void;
  onOpen: (draft: TeacherCourseDraft) => void;
  onEdit: (draft: TeacherCourseDraft) => void;
  onDuplicate: (draft: TeacherCourseDraft) => void;
  onDelete: (draft: TeacherCourseDraft) => void;
};

export function TeacherDraftCoursesSection({
  drafts,
  disabled = false,
  onCreateFromZero,
  onUseProgram,
  onOpen,
  onEdit,
  onDuplicate,
  onDelete,
}: TeacherDraftCoursesSectionProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<DraftFilter>("all");
  const filteredDrafts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    return drafts.filter((draft) => {
      const matchesFilter = filter === "all" || draft.origin === filter;
      const searchableText = [
        draft.title,
        draft.description,
        draft.language,
        draft.variety,
        draft.level ?? "",
        ...draft.objectives,
      ].join(" ").toLocaleLowerCase();

      return matchesFilter && (!query || searchableText.includes(query));
    });
  }, [drafts, filter, search]);

  if (drafts.length === 0) {
    return (
      <View style={styles.emptySection}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Aucun cours pour le moment</Text>
          <Text style={styles.emptyDescription}>
            Crée un cours depuis zéro ou adapte un programme Lugua.
          </Text>
        </View>
        <View style={styles.emptyActions}>
          <ActionButton label="Créer depuis zéro" onPress={onCreateFromZero} primary />
          <ActionButton label="Utiliser le programme Lugua" onPress={onUseProgram} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Rechercher dans mes cours"
        placeholderTextColor={HOME_COLORS.textMuted}
        accessibilityLabel="Rechercher dans mes cours"
        style={styles.searchInput}
      />

      {drafts.length > 1 ? (
        <View style={styles.filters} accessibilityRole="tablist">
          <FilterButton label="Tous" selected={filter === "all"} onPress={() => setFilter("all")} />
          <FilterButton label="Programme Lugua" selected={filter === "lugua_program"} onPress={() => setFilter("lugua_program")} />
          <FilterButton label="Créés depuis zéro" selected={filter === "teacher_created"} onPress={() => setFilter("teacher_created")} />
        </View>
      ) : null}

      {filteredDrafts.length > 0 ? (
        <View style={styles.list}>
          {filteredDrafts.map((draft) => (
            <TeacherCourseDraftCard
              key={draft.id}
              draft={draft}
              disabled={disabled}
              onOpen={() => onOpen(draft)}
              onEdit={() => onEdit(draft)}
              onDuplicate={() => onDuplicate(draft)}
              onDelete={() => onDelete(draft)}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Aucun cours trouvé</Text>
          <Text style={styles.emptyDescription}>Essaie une autre recherche ou un autre filtre.</Text>
        </View>
      )}
    </View>
  );
}

function FilterButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.filterButton, selected && styles.selectedFilter, pressed && styles.pressed]}
    >
      <Text style={[styles.filterText, selected && styles.selectedFilterText]}>{label}</Text>
    </Pressable>
  );
}

function ActionButton({
  label,
  onPress,
  primary = false,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.actionButton, primary && styles.primaryActionButton, pressed && styles.pressed]}
    >
      <Text style={[styles.actionButtonText, primary && styles.primaryActionButtonText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  emptySection: { gap: 12 },
  emptyState: { gap: 8, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 16, backgroundColor: HOME_COLORS.card, padding: 18 },
  emptyTitle: { color: HOME_COLORS.textPrimary, fontSize: 18, fontWeight: "900" },
  emptyDescription: { color: HOME_COLORS.textSecondary, fontSize: 14, fontWeight: "600", lineHeight: 21 },
  emptyActions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  actionButton: { minHeight: 46, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 10, backgroundColor: HOME_COLORS.surface, paddingHorizontal: 14 },
  primaryActionButton: { borderColor: HOME_COLORS.accent, backgroundColor: HOME_COLORS.accent },
  actionButtonText: { color: HOME_COLORS.textPrimary, fontSize: 13, fontWeight: "900" },
  primaryActionButtonText: { color: HOME_COLORS.ink },
  searchInput: { minHeight: 48, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 10, backgroundColor: HOME_COLORS.surface, color: HOME_COLORS.textPrimary, fontSize: 14, paddingHorizontal: 12 },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  filterButton: { minHeight: 44, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 9, backgroundColor: HOME_COLORS.surface, paddingHorizontal: 11 },
  selectedFilter: { borderColor: HOME_COLORS.accent, backgroundColor: HOME_COLORS.accentSoft },
  filterText: { color: HOME_COLORS.textSecondary, fontSize: 12, fontWeight: "800" },
  selectedFilterText: { color: HOME_COLORS.accent },
  list: { gap: 12 },
  pressed: { opacity: 0.78 },
});
