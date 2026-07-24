import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import { getFirstInteractiveConcept, luguaProgramChapter } from "@/src/components/teacher/courses/luguaProgram";
import { LuguaProgramSection } from "@/src/components/teacher/courses/LuguaProgramSection";
import {
  TeacherCoursesModeSwitch,
  type TeacherCoursesMode,
} from "@/src/components/teacher/courses/TeacherCoursesModeSwitch";
import { TeacherDraftCoursesSection } from "@/src/components/teacher/courses/TeacherDraftCoursesSection";
import { TeacherScreenShell } from "@/src/components/teacher/TeacherScreenShell";
import { useTeacherCourseDrafts } from "@/src/contexts/TeacherCourseDraftsContext";
import type { TeacherCourseDraft } from "@/src/types/teacher";

type CoursesParams = {
  mode?: string | string[];
  notice?: string | string[];
};

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function TeacherCoursesScreen() {
  const params = useLocalSearchParams<CoursesParams>();
  const { drafts, createDraft, deleteDraft } = useTeacherCourseDrafts();
  const requestedMode = getParam(params.mode) === "my_courses" ? "my_courses" : "lugua_program";
  const [mode, setMode] = useState<TeacherCoursesMode>(requestedMode);
  const [noticeVisible, setNoticeVisible] = useState(getParam(params.notice) === "saved");

  useEffect(() => {
    setMode(requestedMode);
    if (getParam(params.notice) === "saved") {
      setNoticeVisible(true);
    }
  }, [params.mode, params.notice, requestedMode]);

  function openBuilder(origin: "lugua_program" | "teacher_created") {
    if (origin === "lugua_program") {
      router.push({
        pathname: "/teacher/course-builder",
        params: { origin, chapterId: luguaProgramChapter.id },
      });
      return;
    }

    router.push({ pathname: "/teacher/course-builder", params: { origin } });
  }

  function consultProgram() {
    const firstConcept = getFirstInteractiveConcept();

    if (!firstConcept) {
      Alert.alert("Programme indisponible", "Aucune leçon interactive n’est disponible pour le moment.");
      return;
    }

    router.push({ pathname: "/lesson/[conceptId]", params: { conceptId: firstConcept.id } });
  }

  function duplicateDraft(draft: TeacherCourseDraft) {
    createDraft({
      ...draft,
      title: `Copie de ${draft.title}`,
    });
    setMode("my_courses");
    Alert.alert("Cours dupliqué", "Une copie locale a été ajoutée à Mes cours.");
  }

  function confirmDelete(draft: TeacherCourseDraft) {
    Alert.alert(
      "Supprimer ce brouillon ?",
      `« ${draft.title} » sera retiré de cette session.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => deleteDraft(draft.id),
        },
      ],
    );
  }

  return (
    <TeacherScreenShell>
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>ESPACE PROFESSEUR</Text>
        <Text style={styles.title}>Cours</Text>
        <Text style={styles.subtitle}>
          Utilise le programme Lugua ou construis tes propres cours.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Créer un cours"
          onPress={() => openBuilder("teacher_created")}
          style={({ pressed }) => [styles.createButton, pressed && styles.pressed]}
        >
          <Text style={styles.createButtonText}>Créer un cours</Text>
        </Pressable>
      </View>

      {noticeVisible ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer la confirmation d’enregistrement"
          onPress={() => setNoticeVisible(false)}
          style={styles.notice}
        >
          <Text style={styles.noticeTitle}>Cours ajouté</Text>
          <Text style={styles.noticeText}>
            Le brouillon est disponible dans Mes cours pour cette session.
          </Text>
        </Pressable>
      ) : null}

      <TeacherCoursesModeSwitch value={mode} onChange={setMode} />

      {mode === "lugua_program" ? (
        <LuguaProgramSection
          onConsult={consultProgram}
          onUseAsBase={() => openBuilder("lugua_program")}
        />
      ) : (
        <TeacherDraftCoursesSection
          drafts={drafts}
          onCreateFromZero={() => openBuilder("teacher_created")}
          onUseProgram={() => openBuilder("lugua_program")}
          onOpen={(draft) =>
            router.push({
              pathname: "/teacher/course-builder",
              params: { draftId: draft.id, preview: "1" },
            })
          }
          onEdit={(draft) =>
            router.push({ pathname: "/teacher/course-builder", params: { draftId: draft.id } })
          }
          onDuplicate={duplicateDraft}
          onDelete={confirmDelete}
        />
      )}
    </TeacherScreenShell>
  );
}

const styles = StyleSheet.create({
  intro: { gap: 7 },
  eyebrow: { color: HOME_COLORS.accent, fontSize: 12, fontWeight: "900" },
  title: { color: HOME_COLORS.textPrimary, fontSize: 30, fontWeight: "900" },
  subtitle: { color: HOME_COLORS.textSecondary, fontSize: 15, fontWeight: "600", lineHeight: 22 },
  createButton: { minHeight: 48, alignItems: "center", justifyContent: "center", alignSelf: "flex-start", borderRadius: 10, backgroundColor: HOME_COLORS.accent, paddingHorizontal: 16 },
  createButtonText: { color: HOME_COLORS.ink, fontSize: 14, fontWeight: "900" },
  notice: { gap: 4, borderWidth: 1, borderColor: HOME_COLORS.accent, borderRadius: 12, backgroundColor: HOME_COLORS.accentSoft, padding: 13 },
  noticeTitle: { color: HOME_COLORS.textPrimary, fontSize: 14, fontWeight: "900" },
  noticeText: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "600", lineHeight: 19 },
  pressed: { opacity: 0.8 },
});
