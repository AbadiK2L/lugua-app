import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import { ProfileScreenShell } from "@/src/components/profile/ProfileScreenShell";
import { StudentCourseConceptCard } from "@/src/components/student/classes/StudentCourseConceptCard";
import { resolveCourseConcepts } from "@/src/data/curriculum";
import {
  getMyClassCourses,
  getStudentLearningServiceErrorMessage,
} from "@/src/services/studentLearningService";
import type { StudentClassCourse } from "@/src/types/studentLearning";

type StudentCourseDetailParams = {
  classId?: string | string[];
  courseId?: string | string[];
};

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function StudentCourseDetailScreen() {
  const params = useLocalSearchParams<StudentCourseDetailParams>();
  const classId = getParam(params.classId);
  const courseId = getParam(params.courseId);
  const [course, setCourse] = useState<StudentClassCourse>();
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const loadCourse = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsLoading(true);
    setError(null);

    if (!classId || !courseId) {
      setCourse(undefined);
      setHasLoaded(true);
      setIsLoading(false);
      return;
    }

    try {
      const courses = await getMyClassCourses(classId);

      if (requestIdRef.current !== requestId) {
        return;
      }

      setCourse(courses.find((candidate) => candidate.id === courseId));
    } catch (caughtError) {
      if (requestIdRef.current !== requestId) {
        return;
      }

      setCourse(undefined);
      setError(getStudentLearningServiceErrorMessage(caughtError));
    } finally {
      if (requestIdRef.current === requestId) {
        setHasLoaded(true);
        setIsLoading(false);
      }
    }
  }, [classId, courseId]);

  useFocusEffect(
    useCallback(() => {
      void loadCourse();

      return () => {
        requestIdRef.current += 1;
      };
    }, [loadCourse]),
  );

  if (!hasLoaded) {
    return (
      <ProfileScreenShell fallbackHref="/student" title="Cours">
        <LoadingState />
      </ProfileScreenShell>
    );
  }

  if (error) {
    return (
      <ProfileScreenShell fallbackHref="/student" title="Cours">
        <CourseState
          title="Cours indisponible"
          text={error}
          onRetry={() => {
            void loadCourse();
          }}
        />
      </ProfileScreenShell>
    );
  }

  if (!course || !classId || !courseId) {
    return (
      <ProfileScreenShell fallbackHref="/student" title="Cours">
        <CourseState
          title="Cours indisponible"
          text="Tu n’as pas accès à ce cours ou il n’est plus disponible."
        />
      </ProfileScreenShell>
    );
  }

  const resolution = resolveCourseConcepts({
    sourceChapterId: course.sourceChapterId,
    selectedConceptIds: course.selectedConceptIds,
  });
  const originLabel =
    course.origin === "lugua_program"
      ? "Programme Lugua"
      : "Cours du professeur";
  const unavailableLabel = `${resolution.unavailableCount} activité${
    resolution.unavailableCount === 1 ? " sélectionnée n’est" : "s sélectionnées ne sont"
  } pas disponible${resolution.unavailableCount === 1 ? "" : "s"} dans cette version.`;

  function openLesson(conceptId: string) {
    router.push({
      pathname: "/lesson/[conceptId]",
      params: {
        conceptId,
        classId,
        courseId,
      },
    });
  }

  return (
    <ProfileScreenShell fallbackHref="/student" title="Cours">
      <View style={styles.summary}>
        <View style={styles.summaryTopRow}>
          <View style={styles.summaryHeading}>
            <Text style={styles.eyebrow}>{originLabel}</Text>
            <Text style={styles.title}>{course.title}</Text>
          </View>
          <RefreshButton
            loading={isLoading}
            onPress={() => {
              void loadCourse();
            }}
          />
        </View>

        {course.description ? (
          <Text style={styles.description}>{course.description}</Text>
        ) : null}

        <Text style={styles.meta}>
          {course.language} · {course.variety} · {course.level ?? "Niveau non défini"}
        </Text>
      </View>

      {course.objectives.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Objectifs</Text>
          <View style={styles.objectives}>
            {course.objectives.map((objective, index) => (
              <View key={`${objective}-${index}`} style={styles.objectiveRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.objectiveText}>{objective}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Activités</Text>
          <Text style={styles.sectionCount}>
            {resolution.available.length} disponible{resolution.available.length === 1 ? "" : "s"}
          </Text>
        </View>

        {resolution.unavailableCount > 0 ? (
          <View accessibilityRole="alert" style={styles.notice}>
            <Text style={styles.noticeText}>{unavailableLabel}</Text>
          </View>
        ) : null}

        {resolution.resolved.length > 0 ? (
          <View style={styles.conceptList}>
            {resolution.resolved.map((concept) => (
              <StudentCourseConceptCard
                key={concept.id}
                concept={concept}
                onPress={() => openLesson(concept.id)}
              />
            ))}
          </View>
        ) : null}

        {resolution.available.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              Aucune activité interactive disponible pour ce cours.
            </Text>
            <Text style={styles.emptyText}>
              Tu peux consulter les informations et les objectifs partagés par ton professeur.
            </Text>
          </View>
        ) : null}
      </View>
    </ProfileScreenShell>
  );
}

function LoadingState() {
  return (
    <View style={styles.stateCard}>
      <ActivityIndicator color={HOME_COLORS.accent} />
      <Text style={styles.stateTitle}>Chargement du cours…</Text>
      <Text style={styles.stateText}>Le contenu du cours est en cours de récupération.</Text>
    </View>
  );
}

function CourseState({
  title,
  text,
  onRetry,
}: {
  title: string;
  text: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.stateCard}>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateText}>{text}</Text>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Réessayer le chargement du cours"
          onPress={onRetry}
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.retryLabel}>Réessayer</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function RefreshButton({
  loading,
  onPress,
}: {
  loading: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Actualiser le cours"
      accessibilityState={{ disabled: loading }}
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.refreshButton,
        loading && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={HOME_COLORS.accent} />
      ) : null}
      <Text style={styles.refreshLabel}>
        {loading ? "Actualisation…" : "Actualiser"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  summary: { gap: 10 },
  summaryTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  summaryHeading: {
    minWidth: 0,
    flex: 1,
    gap: 5,
  },
  eyebrow: {
    color: HOME_COLORS.accent,
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 17,
  },
  title: {
    color: HOME_COLORS.textPrimary,
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 36,
  },
  description: {
    maxWidth: 680,
    color: HOME_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
  },
  meta: {
    color: HOME_COLORS.accentMuted,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 18,
  },
  refreshButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 9,
    backgroundColor: HOME_COLORS.surface,
    paddingHorizontal: 11,
  },
  refreshLabel: {
    color: HOME_COLORS.textPrimary,
    fontSize: 11,
    fontWeight: "900",
  },
  section: { gap: 10 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: {
    color: HOME_COLORS.textPrimary,
    fontSize: 19,
    fontWeight: "900",
  },
  sectionCount: {
    color: HOME_COLORS.accentMuted,
    fontSize: 12,
    fontWeight: "900",
  },
  objectives: {
    gap: 8,
    borderLeftWidth: 2,
    borderLeftColor: HOME_COLORS.accent,
    paddingLeft: 14,
  },
  objectiveRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  bullet: {
    color: HOME_COLORS.accent,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 20,
  },
  objectiveText: {
    minWidth: 0,
    flex: 1,
    color: HOME_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  conceptList: { gap: 8 },
  notice: {
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 10,
    backgroundColor: HOME_COLORS.surface,
    padding: 12,
  },
  noticeText: {
    color: HOME_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
  },
  emptyState: {
    gap: 7,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 14,
    backgroundColor: HOME_COLORS.card,
    padding: 16,
  },
  emptyTitle: {
    color: HOME_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 21,
  },
  emptyText: {
    color: HOME_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  stateCard: {
    gap: 10,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 14,
    backgroundColor: HOME_COLORS.card,
    padding: 18,
  },
  stateTitle: {
    color: HOME_COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "900",
  },
  stateText: {
    color: HOME_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  retryButton: {
    minHeight: 44,
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    backgroundColor: HOME_COLORS.accent,
    paddingHorizontal: 14,
  },
  retryLabel: {
    color: HOME_COLORS.ink,
    fontSize: 12,
    fontWeight: "900",
  },
  disabled: { opacity: 0.48 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});
