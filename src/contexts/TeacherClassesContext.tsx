import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

import { useAuthSession } from "@/src/contexts/AuthSessionContext";
import {
  archiveTeacherClass as archiveTeacherClassService,
  createTeacherClass as createTeacherClassService,
  deleteTeacherClass as deleteTeacherClassService,
  getClassRoster,
  getClassesServiceErrorMessage,
  listTeacherClasses,
  regenerateClassInviteCode as regenerateClassInviteCodeService,
  restoreTeacherClass as restoreTeacherClassService,
  updateTeacherClass as updateTeacherClassService,
} from "@/src/services/classesService";
import {
  assignTeacherCourseToClass,
  CoursesServiceError,
  getCoursesServiceErrorMessage,
  listTeacherClassCourseAssignments,
  unassignTeacherCourseFromClass,
} from "@/src/services/coursesService";
import type {
  ActionResult,
  ClassRosterMember,
  CreateTeacherClassInput,
  TeacherClass,
  UpdateTeacherClassInput,
} from "@/src/types/classes";
import type { TeacherClassCourseAssignment } from "@/src/types/courses";

type MutationResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

type TeacherClassesContextValue = {
  classes: TeacherClass[];
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  refreshClasses: () => Promise<void>;
  createClass: (
    input: CreateTeacherClassInput,
  ) => Promise<ActionResult<TeacherClass>>;
  updateClass: (
    classId: string,
    updates: UpdateTeacherClassInput,
  ) => Promise<ActionResult<TeacherClass>>;
  archiveClass: (classId: string) => Promise<ActionResult>;
  restoreClass: (classId: string) => Promise<ActionResult>;
  deleteClass: (classId: string) => Promise<ActionResult>;
  regenerateInviteCode: (
    classId: string,
  ) => Promise<ActionResult<TeacherClass>>;
  getClassById: (classId: string) => TeacherClass | undefined;
  assignCourseDraft: (
    classId: string,
    draftId: string,
  ) => Promise<ActionResult>;
  unassignCourseDraft: (
    classId: string,
    draftId: string,
  ) => Promise<ActionResult>;
};

const TeacherClassesContext = createContext<
  TeacherClassesContextValue | undefined
>(undefined);

function getRosterCounts(roster: ClassRosterMember[]) {
  return {
    activeStudentCount: roster.filter((member) => member.status === "active")
      .length,
    pendingInvitationCount: roster.filter(
      (member) => member.status === "invited",
    ).length,
  };
}

function enrichClass(
  teacherClass: TeacherClass,
  assignedCourseDraftIds: string[],
  roster?: ClassRosterMember[],
) {
  const counts = roster ? getRosterCounts(roster) : teacherClass;

  return {
    ...teacherClass,
    activeStudentCount: counts.activeStudentCount,
    pendingInvitationCount: counts.pendingInvitationCount,
    assignedCourseDraftIds,
  };
}

function replaceClass(
  classes: TeacherClass[],
  nextClass: TeacherClass,
) {
  return classes.map((teacherClass) =>
    teacherClass.id === nextClass.id
      ? nextClass
      : teacherClass,
  );
}

function buildCourseAssignments(
  assignments: TeacherClassCourseAssignment[],
) {
  return assignments.reduce<Record<string, string[]>>(
    (assignmentsByClass, assignment) => {
      const courseIds = assignmentsByClass[assignment.classId] ?? [];
      assignmentsByClass[assignment.classId] = [
        ...courseIds,
        assignment.courseId,
      ];
      return assignmentsByClass;
    },
    {},
  );
}

function getContextErrorMessage(error: unknown) {
  return error instanceof CoursesServiceError
    ? getCoursesServiceErrorMessage(error)
    : getClassesServiceErrorMessage(error);
}

export function TeacherClassesProvider({ children }: PropsWithChildren) {
  const { profile, user } = useAuthSession();
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const mutatingRef = useRef(false);
  const teacherId = profile?.role === "teacher" ? profile.id : undefined;
  const sessionUserId = user?.id;

  const refreshClasses = useCallback(async () => {
    if (!teacherId || !sessionUserId || teacherId !== sessionUserId) {
      requestIdRef.current += 1;
      setClasses([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsLoading(true);
    setError(null);

    try {
      const loadedClasses = await listTeacherClasses(teacherId);
      const [rosters, assignments] = await Promise.all([
        Promise.all(
          loadedClasses.map((teacherClass) =>
            getClassRoster(teacherClass.id),
          ),
        ),
        listTeacherClassCourseAssignments(),
      ]);

      if (requestIdRef.current !== requestId) {
        return;
      }

      const assignmentsByClass = buildCourseAssignments(assignments);
      const nextClasses = loadedClasses.map((teacherClass, index) =>
        enrichClass(
          teacherClass,
          assignmentsByClass[teacherClass.id] ?? [],
          rosters[index],
        ),
      );

      setClasses(nextClasses);
    } catch (caughtError) {
      if (requestIdRef.current !== requestId) {
        return;
      }

      const message = getContextErrorMessage(caughtError);
      setClasses([]);
      setError(message);
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [sessionUserId, teacherId]);

  useEffect(() => {
    void refreshClasses();
  }, [refreshClasses]);

  const runMutation = useCallback(
    async <T,>(
      operation: () => Promise<T>,
      getErrorMessage: (error: unknown) => string =
        getClassesServiceErrorMessage,
    ): Promise<MutationResult<T>> => {
      if (mutatingRef.current) {
        return {
          ok: false,
          message: "Une action est deja en cours.",
        };
      }

      mutatingRef.current = true;
      setIsMutating(true);
      setError(null);

      try {
        const data = await operation();
        return { ok: true, data };
      } catch (caughtError) {
        const message = getErrorMessage(caughtError);
        setError(message);
        return { ok: false, message };
      } finally {
        mutatingRef.current = false;
        setIsMutating(false);
      }
    },
    [],
  );

  const createClass = useCallback(
    async (
      input: CreateTeacherClassInput,
    ): Promise<ActionResult<TeacherClass>> => {
      if (!teacherId || !sessionUserId || teacherId !== sessionUserId) {
        return {
          ok: false,
          message: "Acces professeur requis pour creer une classe.",
        };
      }

      const result = await runMutation(async () => {
        const createdClass = await createTeacherClassService({
          ...input,
          teacherId,
        });
        return enrichClass(createdClass, []);
      });

      if (result.ok && result.data) {
        setClasses((currentClasses) => [result.data, ...currentClasses]);
      }

      return result;
    },
    [runMutation, sessionUserId, teacherId],
  );

  const updateClass = useCallback(
    async (
      classId: string,
      updates: UpdateTeacherClassInput,
    ): Promise<ActionResult<TeacherClass>> => {
      const result = await runMutation(async () => {
        const updatedClass = await updateTeacherClassService(classId, updates);
        const currentClass = classes.find(
          (teacherClass) => teacherClass.id === classId,
        );

        return {
          ...updatedClass,
          activeStudentCount: currentClass?.activeStudentCount ?? 0,
          pendingInvitationCount: currentClass?.pendingInvitationCount ?? 0,
          assignedCourseDraftIds:
            currentClass?.assignedCourseDraftIds ?? [],
        };
      });

      if (result.ok && result.data) {
        setClasses((currentClasses) =>
          replaceClass(currentClasses, result.data),
        );
      }

      return result;
    },
    [classes, runMutation],
  );

  const archiveClass = useCallback(
    async (classId: string): Promise<ActionResult> => {
      const result = await runMutation(() =>
        archiveTeacherClassService(classId),
      );

      if (result.ok && result.data) {
        setClasses((currentClasses) =>
          replaceClass(currentClasses, {
            ...result.data,
            activeStudentCount:
              currentClasses.find(({ id }) => id === classId)
                ?.activeStudentCount ?? 0,
            pendingInvitationCount:
              currentClasses.find(({ id }) => id === classId)
                ?.pendingInvitationCount ?? 0,
            assignedCourseDraftIds:
              currentClasses.find(({ id }) => id === classId)
                ?.assignedCourseDraftIds ?? [],
          }),
        );
      }

      return result.ok ? { ok: true } : result;
    },
    [runMutation],
  );

  const restoreClass = useCallback(
    async (classId: string): Promise<ActionResult> => {
      const result = await runMutation(() =>
        restoreTeacherClassService(classId),
      );

      if (result.ok && result.data) {
        setClasses((currentClasses) =>
          replaceClass(currentClasses, {
            ...result.data,
            activeStudentCount:
              currentClasses.find(({ id }) => id === classId)
                ?.activeStudentCount ?? 0,
            pendingInvitationCount:
              currentClasses.find(({ id }) => id === classId)
                ?.pendingInvitationCount ?? 0,
            assignedCourseDraftIds:
              currentClasses.find(({ id }) => id === classId)
                ?.assignedCourseDraftIds ?? [],
          }),
        );
      }

      return result.ok ? { ok: true } : result;
    },
    [runMutation],
  );

  const deleteClass = useCallback(
    async (classId: string): Promise<ActionResult> => {
      const result = await runMutation(() => deleteTeacherClassService(classId));

      if (result.ok) {
        setClasses((currentClasses) =>
          currentClasses.filter((teacherClass) => teacherClass.id !== classId),
        );
      }

      return result.ok ? { ok: true } : result;
    },
    [runMutation],
  );

  const regenerateInviteCode = useCallback(
    async (
      classId: string,
    ): Promise<ActionResult<TeacherClass>> => {
      const result = await runMutation(async () => {
        const updatedClass = await regenerateClassInviteCodeService(classId);
        const currentClass = classes.find(
          (teacherClass) => teacherClass.id === classId,
        );

        return {
          ...updatedClass,
          activeStudentCount: currentClass?.activeStudentCount ?? 0,
          pendingInvitationCount: currentClass?.pendingInvitationCount ?? 0,
          assignedCourseDraftIds:
            currentClass?.assignedCourseDraftIds ?? [],
        };
      });

      if (result.ok && result.data) {
        setClasses((currentClasses) =>
          replaceClass(currentClasses, result.data),
        );
      }

      return result;
    },
    [classes, runMutation],
  );

  const getClassById = useCallback(
    (classId: string) =>
      classes.find((teacherClass) => teacherClass.id === classId),
    [classes],
  );

  const assignCourseDraft = useCallback(
    async (classId: string, draftId: string): Promise<ActionResult> => {
      const teacherClass = classes.find(({ id }) => id === classId);

      if (!teacherClass) {
        return { ok: false, message: "Classe introuvable." };
      }
      if (teacherClass.assignedCourseDraftIds.includes(draftId)) {
        return { ok: true };
      }

      const result = await runMutation(
        () => assignTeacherCourseToClass(classId, draftId),
        getCoursesServiceErrorMessage,
      );

      if (result.ok) {
        setClasses((currentClasses) =>
          currentClasses.map((currentClass) =>
            currentClass.id === classId &&
            !currentClass.assignedCourseDraftIds.includes(draftId)
              ? {
                  ...currentClass,
                  assignedCourseDraftIds: [
                    ...currentClass.assignedCourseDraftIds,
                    draftId,
                  ],
                }
              : currentClass,
          ),
        );
        return { ok: true };
      }

      return result;
    },
    [classes, runMutation],
  );

  const unassignCourseDraft = useCallback(
    async (classId: string, draftId: string): Promise<ActionResult> => {
      const teacherClass = classes.find(({ id }) => id === classId);

      if (!teacherClass) {
        return { ok: false, message: "Classe introuvable." };
      }
      if (!teacherClass.assignedCourseDraftIds.includes(draftId)) {
        return { ok: true };
      }

      const result = await runMutation(
        () => unassignTeacherCourseFromClass(classId, draftId),
        getCoursesServiceErrorMessage,
      );

      if (result.ok) {
        setClasses((currentClasses) =>
          currentClasses.map((currentClass) =>
            currentClass.id === classId
              ? {
                  ...currentClass,
                  assignedCourseDraftIds:
                    currentClass.assignedCourseDraftIds.filter(
                      (assignedDraftId) => assignedDraftId !== draftId,
                    ),
                }
              : currentClass,
          ),
        );
        return { ok: true };
      }

      return result;
    },
    [classes, runMutation],
  );

  const value = useMemo(
    () => ({
      classes,
      isLoading,
      isMutating,
      error,
      refreshClasses,
      createClass,
      updateClass,
      archiveClass,
      restoreClass,
      deleteClass,
      regenerateInviteCode,
      getClassById,
      assignCourseDraft,
      unassignCourseDraft,
    }),
    [
      archiveClass,
      assignCourseDraft,
      classes,
      createClass,
      deleteClass,
      error,
      getClassById,
      isLoading,
      isMutating,
      refreshClasses,
      regenerateInviteCode,
      restoreClass,
      unassignCourseDraft,
      updateClass,
    ],
  );

  return (
    <TeacherClassesContext.Provider value={value}>
      {children}
    </TeacherClassesContext.Provider>
  );
}

export function useTeacherClasses() {
  const context = useContext(TeacherClassesContext);

  if (!context) {
    throw new Error(
      "useTeacherClasses doit etre utilise dans TeacherClassesProvider",
    );
  }

  return context;
}
