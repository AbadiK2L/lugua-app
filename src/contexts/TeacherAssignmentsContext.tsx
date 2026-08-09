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
  closeTeacherAssignment,
  createTeacherAssignment,
  deleteTeacherAssignment,
  getAssignmentsServiceErrorMessage,
  getAssignmentsServiceFailureReason,
  listTeacherAssignments,
  publishTeacherAssignment,
  reopenTeacherAssignment,
  updateTeacherAssignment,
} from "@/src/services/assignmentsService";
import type {
  ActionResult,
  CreateTeacherAssignmentInput,
  PublishAssignmentResult,
  TeacherAssignment,
  UpdateTeacherAssignmentInput,
} from "@/src/types/teacher";

type MutationResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; error: unknown };

type TeacherAssignmentsContextValue = {
  assignments: TeacherAssignment[];
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  refreshAssignments: () => Promise<void>;
  createAssignment: (
    input: CreateTeacherAssignmentInput,
  ) => Promise<ActionResult<TeacherAssignment>>;
  updateAssignment: (
    assignmentId: string,
    updates: UpdateTeacherAssignmentInput,
  ) => Promise<ActionResult<TeacherAssignment>>;
  publishAssignment: (
    assignmentId: string,
  ) => Promise<PublishAssignmentResult>;
  closeAssignment: (
    assignmentId: string,
  ) => Promise<ActionResult<TeacherAssignment>>;
  reopenAssignment: (
    assignmentId: string,
  ) => Promise<ActionResult<TeacherAssignment>>;
  duplicateAssignment: (
    assignmentId: string,
  ) => Promise<ActionResult<TeacherAssignment>>;
  deleteAssignment: (assignmentId: string) => Promise<ActionResult>;
  getAssignmentById: (assignmentId: string) => TeacherAssignment | undefined;
};

const TeacherAssignmentsContext = createContext<
  TeacherAssignmentsContextValue | undefined
>(undefined);

const TEACHER_ACCESS_ERROR =
  "Accès professeur requis pour enregistrer un devoir.";

function replaceAssignment(
  assignments: TeacherAssignment[],
  nextAssignment: TeacherAssignment,
) {
  return assignments.map((assignment) =>
    assignment.id === nextAssignment.id ? nextAssignment : assignment,
  );
}

export function TeacherAssignmentsProvider({ children }: PropsWithChildren) {
  const { profile, user } = useAuthSession();
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedTeacherId, setLoadedTeacherId] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const assignmentsRef = useRef<TeacherAssignment[]>([]);
  const requestIdRef = useRef(0);
  const mutationEpochRef = useRef(0);
  const mutatingRef = useRef(false);
  const teacherId = profile?.role === "teacher" ? profile.id : undefined;
  const sessionUserId = user?.id;

  const setAssignmentCache = useCallback(
    (
      update:
        | TeacherAssignment[]
        | ((current: TeacherAssignment[]) => TeacherAssignment[]),
    ) => {
      const nextAssignments =
        typeof update === "function" ? update(assignmentsRef.current) : update;
      assignmentsRef.current = nextAssignments;
      setAssignments(nextAssignments);
    },
    [],
  );

  useEffect(() => {
    requestIdRef.current += 1;
    mutationEpochRef.current += 1;
    mutatingRef.current = false;
    assignmentsRef.current = [];
    setAssignments([]);
    setLoadedTeacherId(null);
    setError(null);
    setIsLoading(false);
    setIsMutating(false);
  }, [sessionUserId, teacherId]);

  const refreshAssignments = useCallback(async () => {
    if (!teacherId || !sessionUserId || teacherId !== sessionUserId) {
      requestIdRef.current += 1;
      setAssignmentCache([]);
      setLoadedTeacherId(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsLoading(true);
    setError(null);

    try {
      const loadedAssignments = await listTeacherAssignments(teacherId);

      if (requestIdRef.current !== requestId) {
        return;
      }

      setAssignmentCache(loadedAssignments);
    } catch (caughtError) {
      if (requestIdRef.current !== requestId) {
        return;
      }

      setAssignmentCache([]);
      setError(getAssignmentsServiceErrorMessage(caughtError));
    } finally {
      if (requestIdRef.current === requestId) {
        setLoadedTeacherId(teacherId);
        setIsLoading(false);
      }
    }
  }, [sessionUserId, setAssignmentCache, teacherId]);

  useEffect(() => {
    void refreshAssignments();
  }, [refreshAssignments]);

  const runMutation = useCallback(
    async <T,>(operation: () => Promise<T>): Promise<MutationResult<T>> => {
      if (mutatingRef.current) {
        const actionError = "Une action est déjà en cours.";
        return { ok: false, message: actionError, error: actionError };
      }

      const mutationEpoch = mutationEpochRef.current;
      mutatingRef.current = true;
      setIsMutating(true);
      setError(null);

      try {
        const data = await operation();

        if (mutationEpochRef.current !== mutationEpoch) {
          const sessionError =
            "Ta session a changé. Réessaie avec la session active.";
          return { ok: false, message: sessionError, error: sessionError };
        }

        return { ok: true, data };
      } catch (caughtError) {
        const message = getAssignmentsServiceErrorMessage(caughtError);

        if (mutationEpochRef.current === mutationEpoch) {
          setError(message);
        }

        return { ok: false, message, error: caughtError };
      } finally {
        if (mutationEpochRef.current === mutationEpoch) {
          mutatingRef.current = false;
          setIsMutating(false);
        }
      }
    },
    [],
  );

  const prepareConfirmedMutation = useCallback(() => {
    requestIdRef.current += 1;
    setIsLoading(false);
  }, []);

  const hasTeacherSession =
    Boolean(teacherId && sessionUserId) && teacherId === sessionUserId;

  const createAssignment = useCallback(
    async (
      input: CreateTeacherAssignmentInput,
    ): Promise<ActionResult<TeacherAssignment>> => {
      if (!hasTeacherSession || !teacherId) {
        return { ok: false, message: TEACHER_ACCESS_ERROR };
      }

      const result = await runMutation(() =>
        createTeacherAssignment({
          teacherId,
          title: input.title,
          instructions: input.instructions,
          classId: input.classId,
          courseDraftId: input.courseDraftId,
          selectedConceptIds: input.selectedConceptIds,
          dueDate: input.dueDate,
        }),
      );

      if (result.ok) {
        prepareConfirmedMutation();
        setAssignmentCache((currentAssignments) => [
          result.data,
          ...currentAssignments.filter(
            (assignment) => assignment.id !== result.data.id,
          ),
        ]);
      }

      return result;
    },
    [
      hasTeacherSession,
      prepareConfirmedMutation,
      runMutation,
      setAssignmentCache,
      teacherId,
    ],
  );

  const updateAssignment = useCallback(
    async (
      assignmentId: string,
      updates: UpdateTeacherAssignmentInput,
    ): Promise<ActionResult<TeacherAssignment>> => {
      if (!hasTeacherSession) {
        return { ok: false, message: TEACHER_ACCESS_ERROR };
      }

      const result = await runMutation(() =>
        updateTeacherAssignment(assignmentId, updates),
      );

      if (result.ok) {
        prepareConfirmedMutation();
        setAssignmentCache((currentAssignments) =>
          replaceAssignment(currentAssignments, result.data),
        );
      }

      return result;
    },
    [hasTeacherSession, prepareConfirmedMutation, runMutation, setAssignmentCache],
  );

  const publishAssignment = useCallback(
    async (assignmentId: string): Promise<PublishAssignmentResult> => {
      if (!hasTeacherSession) {
        return {
          ok: false,
          reason: "access_denied",
          message: TEACHER_ACCESS_ERROR,
        };
      }

      const cachedAssignment = assignmentsRef.current.find(
        (assignment) => assignment.id === assignmentId,
      );

      if (!cachedAssignment) {
        return {
          ok: false,
          reason: "assignment_not_found",
          message: "Devoir introuvable.",
        };
      }
      if (!cachedAssignment.title.trim()) {
        return {
          ok: false,
          reason: "missing_title",
          message: "Ajoute un titre au devoir avant de le publier.",
        };
      }

      const result = await runMutation(() =>
        publishTeacherAssignment(assignmentId),
      );

      if (!result.ok) {
        return {
          ok: false,
          reason: getAssignmentsServiceFailureReason(result.error),
          message: result.message,
        };
      }

      prepareConfirmedMutation();
      setAssignmentCache((currentAssignments) =>
        replaceAssignment(currentAssignments, result.data),
      );
      return { ok: true, data: result.data };
    },
    [hasTeacherSession, prepareConfirmedMutation, runMutation, setAssignmentCache],
  );

  const closeAssignment = useCallback(
    async (
      assignmentId: string,
    ): Promise<ActionResult<TeacherAssignment>> => {
      if (!hasTeacherSession) {
        return { ok: false, message: TEACHER_ACCESS_ERROR };
      }

      const result = await runMutation(() =>
        closeTeacherAssignment(assignmentId),
      );

      if (result.ok) {
        prepareConfirmedMutation();
        setAssignmentCache((currentAssignments) =>
          replaceAssignment(currentAssignments, result.data),
        );
      }

      return result;
    },
    [hasTeacherSession, prepareConfirmedMutation, runMutation, setAssignmentCache],
  );

  const reopenAssignment = useCallback(
    async (
      assignmentId: string,
    ): Promise<ActionResult<TeacherAssignment>> => {
      if (!hasTeacherSession) {
        return { ok: false, message: TEACHER_ACCESS_ERROR };
      }

      const result = await runMutation(() =>
        reopenTeacherAssignment(assignmentId),
      );

      if (result.ok) {
        prepareConfirmedMutation();
        setAssignmentCache((currentAssignments) =>
          replaceAssignment(currentAssignments, result.data),
        );
      }

      return result;
    },
    [hasTeacherSession, prepareConfirmedMutation, runMutation, setAssignmentCache],
  );

  const duplicateAssignment = useCallback(
    async (
      assignmentId: string,
    ): Promise<ActionResult<TeacherAssignment>> => {
      if (!hasTeacherSession || !teacherId) {
        return { ok: false, message: TEACHER_ACCESS_ERROR };
      }

      const source = assignmentsRef.current.find(
        (assignment) => assignment.id === assignmentId,
      );

      if (!source) {
        return { ok: false, message: "Devoir introuvable." };
      }

      const result = await runMutation(() =>
        createTeacherAssignment({
          teacherId,
          title: `Copie de ${source.title}`,
          instructions: source.instructions,
          classId: source.classId,
          courseDraftId: source.courseDraftId,
          selectedConceptIds: [...source.selectedConceptIds],
          dueDate: source.dueDate,
        }),
      );

      if (result.ok) {
        prepareConfirmedMutation();
        setAssignmentCache((currentAssignments) => [
          result.data,
          ...currentAssignments.filter(
            (assignment) => assignment.id !== result.data.id,
          ),
        ]);
      }

      return result;
    },
    [
      hasTeacherSession,
      prepareConfirmedMutation,
      runMutation,
      setAssignmentCache,
      teacherId,
    ],
  );

  const deleteAssignment = useCallback(
    async (assignmentId: string): Promise<ActionResult> => {
      if (!hasTeacherSession) {
        return { ok: false, message: TEACHER_ACCESS_ERROR };
      }

      const result = await runMutation(() =>
        deleteTeacherAssignment(assignmentId),
      );

      if (result.ok) {
        prepareConfirmedMutation();
        setAssignmentCache((currentAssignments) =>
          currentAssignments.filter(
            (assignment) => assignment.id !== assignmentId,
          ),
        );
        return { ok: true };
      }

      return result;
    },
    [hasTeacherSession, prepareConfirmedMutation, runMutation, setAssignmentCache],
  );

  const getAssignmentById = useCallback(
    (assignmentId: string) =>
      assignments.find((assignment) => assignment.id === assignmentId),
    [assignments],
  );

  const effectiveIsLoading =
    isLoading ||
    Boolean(
      teacherId &&
        sessionUserId === teacherId &&
        loadedTeacherId !== teacherId,
    );

  const value = useMemo(
    () => ({
      assignments,
      isLoading: effectiveIsLoading,
      isMutating,
      error,
      refreshAssignments,
      createAssignment,
      updateAssignment,
      publishAssignment,
      closeAssignment,
      reopenAssignment,
      duplicateAssignment,
      deleteAssignment,
      getAssignmentById,
    }),
    [
      assignments,
      closeAssignment,
      createAssignment,
      deleteAssignment,
      duplicateAssignment,
      effectiveIsLoading,
      error,
      getAssignmentById,
      isMutating,
      publishAssignment,
      refreshAssignments,
      reopenAssignment,
      updateAssignment,
    ],
  );

  return (
    <TeacherAssignmentsContext.Provider value={value}>
      {children}
    </TeacherAssignmentsContext.Provider>
  );
}

export function useTeacherAssignments() {
  const context = useContext(TeacherAssignmentsContext);

  if (!context) {
    throw new Error(
      "useTeacherAssignments doit être utilisé dans TeacherAssignmentsProvider",
    );
  }

  return context;
}
