import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import { TeacherClassCard } from "@/src/components/teacher/classes/TeacherClassCard";
import {
  TeacherClassesFilterBar,
  type TeacherClassesFilter,
} from "@/src/components/teacher/classes/TeacherClassesFilterBar";
import { TeacherClassFormModal } from "@/src/components/teacher/classes/TeacherClassFormModal";
import { TeacherEmptyState } from "@/src/components/teacher/TeacherEmptyState";
import { TeacherScreenShell } from "@/src/components/teacher/TeacherScreenShell";
import { useTeacherClasses } from "@/src/contexts/TeacherClassesContext";
import { useTeacherCourseDrafts } from "@/src/contexts/TeacherCourseDraftsContext";
import type { CreateTeacherClassInput } from "@/src/types/teacher";

type ClassesParams = { create?: string | string[] };

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function TeacherClassesScreen() {
  const params = useLocalSearchParams<ClassesParams>();
  const { classes, createClass } = useTeacherClasses();
  const { drafts } = useTeacherCourseDrafts();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TeacherClassesFilter>("all");
  const [createVisible, setCreateVisible] = useState(getParam(params.create) === "1");

  useEffect(() => {
    if (getParam(params.create) === "1") {
      setCreateVisible(true);
    }
  }, [params.create]);

  const filteredClasses = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    return classes.filter((teacherClass) => {
      const matchesFilter = filter === "all" || teacherClass.status === filter;
      const assignedDraftTitles = teacherClass.assignedCourseDraftIds
        .map((draftId) => drafts.find((draft) => draft.id === draftId)?.title ?? "")
        .join(" ");
      const studentNames = teacherClass.students.map((student) => student.displayName).join(" ");
      const searchableText = [
        teacherClass.name,
        teacherClass.description,
        teacherClass.level ?? "",
        teacherClass.variety,
        studentNames,
        assignedDraftTitles,
      ].join(" ").toLocaleLowerCase();

      return matchesFilter && (!query || searchableText.includes(query));
    });
  }, [classes, drafts, filter, search]);

  function handleCreate(input: CreateTeacherClassInput) {
    const teacherClass = createClass(input);
    setCreateVisible(false);
    router.push({
      pathname: "/teacher/class/[classId]",
      params: { classId: teacherClass.id, notice: "created" },
    });
  }

  return (
    <TeacherScreenShell>
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>ESPACE PROFESSEUR</Text>
        <Text style={styles.title}>Mes classes</Text>
        <Text style={styles.subtitle}>
          Organise tes groupes d’élèves et attribue-leur des cours.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Créer une classe"
          accessibilityHint="Ouvre le formulaire de création"
          onPress={() => setCreateVisible(true)}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.primaryButtonText}>Créer une classe</Text>
        </Pressable>
      </View>

      <Text style={styles.demoNote}>
        Données locales · Les classes et élèves créés ici seront supprimés au redémarrage complet de l’application.
      </Text>

      <TeacherClassesFilterBar
        search={search}
        filter={filter}
        onSearchChange={setSearch}
        onFilterChange={setFilter}
      />

      {classes.length === 0 ? (
        <TeacherEmptyState
          title="Aucune classe créée"
          description="Crée ta première classe pour organiser tes élèves et leur attribuer des cours."
        />
      ) : filteredClasses.length === 0 ? (
        <View style={styles.filteredEmpty}>
          <Text style={styles.filteredTitle}>Aucune classe trouvée</Text>
          <Text style={styles.filteredText}>Essaie une autre recherche ou un autre filtre.</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Réinitialiser la recherche et le filtre"
            onPress={() => {
              setSearch("");
              setFilter("all");
            }}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryButtonText}>Réinitialiser</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.list}>
          {filteredClasses.map((teacherClass) => (
            <TeacherClassCard
              key={teacherClass.id}
              teacherClass={teacherClass}
              onOpen={() => router.push({ pathname: "/teacher/class/[classId]", params: { classId: teacherClass.id } })}
            />
          ))}
        </View>
      )}

      <TeacherClassFormModal
        visible={createVisible}
        mode="create"
        onClose={() => setCreateVisible(false)}
        onSubmit={handleCreate}
      />
    </TeacherScreenShell>
  );
}

const styles = StyleSheet.create({
  intro: { gap: 7 },
  eyebrow: { color: HOME_COLORS.accent, fontSize: 12, fontWeight: "900" },
  title: { color: HOME_COLORS.textPrimary, fontSize: 30, fontWeight: "900" },
  subtitle: { color: HOME_COLORS.textSecondary, fontSize: 15, fontWeight: "600", lineHeight: 22 },
  primaryButton: { minHeight: 48, alignItems: "center", justifyContent: "center", alignSelf: "flex-start", borderRadius: 10, backgroundColor: HOME_COLORS.accent, paddingHorizontal: 16 },
  primaryButtonText: { color: HOME_COLORS.ink, fontSize: 14, fontWeight: "900" },
  demoNote: { color: HOME_COLORS.textMuted, fontSize: 12, fontWeight: "700", lineHeight: 18 },
  list: { gap: 12 },
  filteredEmpty: { gap: 8, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 14, backgroundColor: HOME_COLORS.card, padding: 18 },
  filteredTitle: { color: HOME_COLORS.textPrimary, fontSize: 17, fontWeight: "900" },
  filteredText: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "600", lineHeight: 19 },
  secondaryButton: { minHeight: 46, alignItems: "center", justifyContent: "center", alignSelf: "flex-start", borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 10, backgroundColor: HOME_COLORS.surface, paddingHorizontal: 14 },
  secondaryButtonText: { color: HOME_COLORS.textPrimary, fontSize: 13, fontWeight: "900" },
  pressed: { opacity: 0.78 },
});
