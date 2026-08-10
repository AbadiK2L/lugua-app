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
import { StudentClassAssignmentCard } from "@/src/components/student/classes/StudentClassAssignmentCard";
import { StudentClassCourseCard } from "@/src/components/student/classes/StudentClassCourseCard";
import {
  getClassesServiceErrorMessage,
  getMyClassMemberships,
} from "@/src/services/classesService";
import {
  getMyClassAssignments,
  getMyClassCourses,
  getStudentLearningServiceErrorMessage,
  StudentLearningServiceError,
} from "@/src/services/studentLearningService";
import type { StudentClassMembership } from "@/src/types/classes";
import type {
  StudentClassAssignment,
  StudentClassCourse,
} from "@/src/types/studentLearning";

type StudentClassDetailParams = {
  classId?: string | string[];
};

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getLoadErrorMessage(error: unknown) {
  return error instanceof StudentLearningServiceError
    ? getStudentLearningServiceErrorMessage(error)
    : getClassesServiceErrorMessage(error);
}

export default function StudentClassDetailScreen() {
  const params = useLocalSearchParams<StudentClassDetailParams>();
  const classId = getParam(params.classId);
  const [membership, setMembership] =
    useState<StudentClassMembership>();
  const [courses, setCourses] = useState<StudentClassCourse[]>([]);
  const [assignments, setAssignments] = useState<
    StudentClassAssignment[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const loadClass = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsLoading(true);
    setHasLoaded(false);
    setError(null);
    setMembership(undefined);
    setCourses([]);
    setAssignments([]);

    if (!classId) {
      setHasLoaded(true);
      setIsLoading(false);
      return;
    }

    try {
      const [memberships, nextCourses, nextAssignments] = await Promise.all([
        getMyClassMemberships(),
        getMyClassCourses(classId),
        getMyClassAssignments(classId),
      ]);

      if (requestIdRef.current !== requestId) {
        return;
      }

      const activeMembership = memberships.find(
        (candidate) =>
          candidate.classId === classId &&
          candidate.membershipStatus === "active",
      );

      setMembership(activeMembership);
      setCourses(activeMembership ? nextCourses : []);
      setAssignments(activeMembership ? nextAssignments : []);
    } catch (caughtError) {
      if (requestIdRef.current !== requestId) {
        return;
      }

      setMembership(undefined);
      setCourses([]);
      setAssignments([]);
      setError(getLoadErrorMessage(caughtError));
    } finally {
      if (requestIdRef.current === requestId) {
        setHasLoaded(true);
        setIsLoading(false);
      }
    }
  }, [classId]);

  useFocusEffect(
    useCallback(() => {
      void loadClass();

      return () => {
        requestIdRef.current += 1;
      };
    }, [loadClass]),
  );

  if (!hasLoaded) {
    return (
      <ProfileScreenShell fallbackHref="/student" title="Classe">
        <LoadingState />
      </ProfileScreenShell>
    );
  }

  if (error) {
    return (
      <ProfileScreenShell fallbackHref="/student" title="Classe">
        <StateCard
          title="Contenu indisponible"
          text={error}
          onRetry={() => {
            void loadClass();
          }}
        />
      </ProfileScreenShell>
    );
  }

  if (!membership) {
    return (
      <ProfileScreenShell fallbackHref="/student" title="Classe">
        <StateCard
          title="Classe indisponible"
          text="Tu n’as pas accès au contenu de cette classe."
        />
      </ProfileScreenShell>
    );
  }

  const publishedAssignments = assignments.filter(
    (assignment) => assignment.status === "published",
  );
  const closedAssignments = assignments.filter(
    (assignment) => assignment.status === "closed",
  );

  return (
    <ProfileScreenShell fallbackHref="/student" title="Classe">
      <View style={styles.summary}>
        <View style={styles.summaryTopRow}>
          <View style={styles.summaryHeading}>
            <Text style={styles.eyebrow}>ESPACE DE CLASSE</Text>
            <Text style={styles.className}>{membership.className}</Text>
          </View>
          <RefreshButton
            loading={isLoading}
            onPress={() => {
              void loadClass();
            }}
          />
        </View>
        <Text style={styles.meta}>
          {membership.teacherName} · {membership.language} ·{" "}
          {membership.variety} · {membership.level ?? "Niveau non défini"}
        </Text>
        {membership.classDescription ? (
          <Text style={styles.description}>
            {membership.classDescription}
          </Text>
        ) : null}
      </View>

      <View style={styles.section}>
        <SectionHeader title="Cours" count={courses.length} />
        {courses.length === 0 ? (
          <EmptyState
            title="Aucun cours attribué"
            text="Les cours partagés par ton professeur apparaîtront ici."
          />
        ) : (
          <View style={styles.list}>
            {courses.map((course) => (
              <StudentClassCourseCard key={course.id} course={course} />
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <SectionHeader title="Devoirs" count={assignments.length} />
        {assignments.length === 0 ? (
          <EmptyState
            title="Aucun devoir disponible"
            text="Les devoirs publiés ou clôturés apparaîtront ici."
          />
        ) : (
          <View style={styles.assignmentGroups}>
            {publishedAssignments.length > 0 ? (
              <AssignmentGroup
                title="À faire"
                assignments={publishedAssignments}
                courses={courses}
              />
            ) : null}
            {closedAssignments.length > 0 ? (
              <AssignmentGroup
                title="Clôturés"
                assignments={closedAssignments}
                courses={courses}
              />
            ) : null}
          </View>
        )}
      </View>
    </ProfileScreenShell>
  );
}

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.count}>{count}</Text>
    </View>
  );
}

function AssignmentGroup({
  title,
  assignments,
  courses,
}: {
  title: string;
  assignments: StudentClassAssignment[];
  courses: StudentClassCourse[];
}) {
  return (
    <View style={styles.assignmentGroup}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupTitle}>{title}</Text>
        <Text style={styles.groupCount}>{assignments.length}</Text>
      </View>
      <View style={styles.list}>
        {assignments.map((assignment) => (
          <StudentClassAssignmentCard
            key={assignment.id}
            assignment={assignment}
            course={courses.find((course) => course.id === assignment.courseId)}
          />
        ))}
      </View>
    </View>
  );
}

function LoadingState() {
  return (
    <View style={styles.stateCard}>
      <ActivityIndicator color={HOME_COLORS.accent} />
      <Text style={styles.stateTitle}>Chargement de la classe…</Text>
      <Text style={styles.stateText}>
        Les cours et devoirs sont en cours de récupération.
      </Text>
    </View>
  );
}

function StateCard({
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
      <View style={styles.stateActions}>
        {onRetry ? (
          <ActionButton label="Réessayer" onPress={onRetry} primary />
        ) : null}
        <ActionButton
          label="Retour aux classes"
          onPress={() => router.replace("/student/classes")}
        />
      </View>
    </View>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
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
      accessibilityLabel="Actualiser le contenu de la classe"
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
      style={({ pressed }) => [
        styles.actionButton,
        primary && styles.primaryAction,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.actionLabel,
          primary && styles.primaryActionLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  summary: { gap: 8 },
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
  },
  className: {
    color: HOME_COLORS.textPrimary,
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 36,
  },
  meta: {
    color: HOME_COLORS.accentMuted,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 18,
  },
  description: {
    maxWidth: 680,
    color: HOME_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
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
  count: {
    color: HOME_COLORS.accentMuted,
    fontSize: 12,
    fontWeight: "900",
  },
  list: { gap: 8 },
  assignmentGroups: { gap: 14 },
  assignmentGroup: { gap: 8 },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  groupTitle: {
    color: HOME_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "900",
  },
  groupCount: {
    color: HOME_COLORS.textMuted,
    fontSize: 11,
    fontWeight: "900",
  },
  stateCard: {
    gap: 9,
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
    maxWidth: 620,
    color: HOME_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  stateActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingTop: 3,
  },
  actionButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 9,
    backgroundColor: HOME_COLORS.surface,
    paddingHorizontal: 12,
  },
  primaryAction: {
    borderColor: HOME_COLORS.accent,
    backgroundColor: HOME_COLORS.accent,
  },
  actionLabel: {
    color: HOME_COLORS.textPrimary,
    fontSize: 12,
    fontWeight: "900",
  },
  primaryActionLabel: { color: HOME_COLORS.ink },
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
  },
  emptyText: {
    color: HOME_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  disabled: { opacity: 0.48 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});
