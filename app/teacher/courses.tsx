import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import { getFirstInteractiveConcept, luguaProgramChapter } from "@/src/components/teacher/courses/luguaProgram";
import { LuguaProgramSection } from "@/src/components/teacher/courses/LuguaProgramSection";
import {
  TeacherCoursesModeSwitch,
  type TeacherCoursesMode,
} from "@/src/components/teacher/courses/TeacherCoursesModeSwitch";
import { TeacherDraftCoursesSection } from "@/src/components/teacher/courses/TeacherDraftCoursesSection";
import { TeacherScreenShell } from "@/src/components/teacher/TeacherScreenShell";
import { useTeacherAssignments } from "@/src/contexts/TeacherAssignmentsContext";
import { useTeacherClasses } from "@/src/contexts/TeacherClassesContext";
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
  const {
    drafts,
    createDraft,
    deleteDraft,
    error,
    isLoading,
    isMutating,
    refreshDrafts,
  } = useTeacherCourseDrafts();
  const { refreshAssignments } = useTeacherAssignments();
  const { refreshClasses } = useTeacherClasses();
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

  async function duplicateDraft(draft: TeacherCourseDraft) {
    const result = await createDraft({
      origin: draft.origin,
      title: `Copie de ${draft.title}`,
      description: draft.description,
      language: draft.language,
      variety: draft.variety,
      level: draft.level,
      objectives: [...draft.objectives],
      sourceChapterId: draft.sourceChapterId,
      selectedConceptIds: [...draft.selectedConceptIds],
    });

    if (!result.ok) {
      Alert.alert("Duplication impossible", result.message);
      return;
    }

    setMode("my_courses");
    Alert.alert(
      "Cours dupliqué",
      "Le nouveau cours est enregistré dans Mes cours.",
    );
  }

  async function removeDraft(draft: TeacherCourseDraft) {
    const result = await deleteDraft(draft.id);

    if (!result.ok) {
      Alert.alert("Suppression impossible", result.message);
      return;
    }

    await Promise.all([refreshClasses(), refreshAssignments()]);
    Alert.alert("Cours supprimé", "Le cours a été retiré de Mes cours.");
  }

  function confirmDelete(draft: TeacherCourseDraft) {
    Alert.alert(
      "Supprimer ce brouillon ?",
      `« ${draft.title} » sera supprimé de Mes cours et retiré des classes associées.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            void removeDraft(draft);
          },
        },
      ],
    );
  }

  return (
    <TeacherScreenShell
      refreshing={isLoading && drafts.length > 0}
      onRefresh={() => {
        void refreshDrafts();
      }}
    >
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
          <Text style={styles.noticeTitle}>Cours enregistré</Text>
          <Text style={styles.noticeText}>
            Le cours est disponible dans Mes cours.
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
        <>
          {error && drafts.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Réessayer le chargement des cours"
              disabled={isLoading}
              onPress={() => {
                void refreshDrafts();
              }}
              style={[styles.notice, isLoading && styles.disabled]}
            >
              <Text style={styles.noticeTitle}>Actualisation incomplète</Text>
              <Text style={styles.noticeText}>{error}</Text>
            </Pressable>
          ) : null}

          {isLoading && drafts.length === 0 ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator color={HOME_COLORS.accent} />
              <Text style={styles.loadingText}>Chargement des cours…</Text>
            </View>
          ) : error && drafts.length === 0 ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>Cours indisponibles</Text>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Réessayer le chargement des cours"
                accessibilityState={{ disabled: isLoading }}
                disabled={isLoading}
                onPress={() => {
                  void refreshDrafts();
                }}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  isLoading && styles.disabled,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.secondaryButtonText}>
                  {isLoading ? "Chargement…" : "Réessayer"}
                </Text>
              </Pressable>
            </View>
          ) : (
            <TeacherDraftCoursesSection
              drafts={drafts}
              disabled={isMutating}
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
              onDuplicate={(draft) => {
                void duplicateDraft(draft);
              }}
              onDelete={confirmDelete}
            />
          )}
        </>
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
  loadingCard: { minHeight: 94, alignItems: "center", justifyContent: "center", gap: 10, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 14, backgroundColor: HOME_COLORS.card, padding: 18 },
  loadingText: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "800" },
  errorCard: { gap: 8, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 14, backgroundColor: HOME_COLORS.card, padding: 18 },
  errorTitle: { color: HOME_COLORS.textPrimary, fontSize: 17, fontWeight: "900" },
  errorText: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "600", lineHeight: 19 },
  secondaryButton: { minHeight: 46, alignItems: "center", justifyContent: "center", alignSelf: "flex-start", borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 10, backgroundColor: HOME_COLORS.surface, paddingHorizontal: 14 },
  secondaryButtonText: { color: HOME_COLORS.textPrimary, fontSize: 13, fontWeight: "900" },
  disabled: { opacity: 0.48 },
  pressed: { opacity: 0.8 },
});
