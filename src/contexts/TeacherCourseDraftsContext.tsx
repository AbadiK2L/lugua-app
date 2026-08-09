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
  createTeacherCourse,
  deleteTeacherCourse,
  getCoursesServiceErrorMessage,
  listTeacherCourses,
  updateTeacherCourse,
} from "@/src/services/coursesService";
import type { ActionResult } from "@/src/types/classes";
import type {
  CreateTeacherCourseDraftInput,
  TeacherCourseDraft,
  UpdateTeacherCourseDraftInput,
} from "@/src/types/teacher";

type MutationResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

type TeacherCourseDraftsContextValue = {
  drafts: TeacherCourseDraft[];
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  refreshDrafts: () => Promise<void>;
  createDraft: (
    input: CreateTeacherCourseDraftInput,
  ) => Promise<ActionResult<TeacherCourseDraft>>;
  updateDraft: (
    draftId: string,
    updates: UpdateTeacherCourseDraftInput,
  ) => Promise<ActionResult<TeacherCourseDraft>>;
  deleteDraft: (draftId: string) => Promise<ActionResult>;
  getDraftById: (draftId: string) => TeacherCourseDraft | undefined;
};

const TeacherCourseDraftsContext = createContext<
  TeacherCourseDraftsContextValue | undefined
>(undefined);

export function TeacherCourseDraftsProvider({ children }: PropsWithChildren) {
  const { profile, user } = useAuthSession();
  const [drafts, setDrafts] = useState<TeacherCourseDraft[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedTeacherId, setLoadedTeacherId] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const mutationEpochRef = useRef(0);
  const mutatingRef = useRef(false);
  const teacherId = profile?.role === "teacher" ? profile.id : undefined;
  const sessionUserId = user?.id;

  useEffect(() => {
    requestIdRef.current += 1;
    mutationEpochRef.current += 1;
    mutatingRef.current = false;
    setDrafts([]);
    setLoadedTeacherId(null);
    setError(null);
    setIsLoading(false);
    setIsMutating(false);
  }, [sessionUserId, teacherId]);

  const refreshDrafts = useCallback(async () => {
    if (!teacherId || !sessionUserId || teacherId !== sessionUserId) {
      requestIdRef.current += 1;
      setDrafts([]);
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
      const loadedDrafts = await listTeacherCourses(teacherId);

      if (requestIdRef.current !== requestId) {
        return;
      }

      setDrafts(loadedDrafts);
    } catch (caughtError) {
      if (requestIdRef.current !== requestId) {
        return;
      }

      setDrafts([]);
      setError(getCoursesServiceErrorMessage(caughtError));
    } finally {
      if (requestIdRef.current === requestId) {
        setLoadedTeacherId(teacherId);
        setIsLoading(false);
      }
    }
  }, [sessionUserId, teacherId]);

  useEffect(() => {
    void refreshDrafts();
  }, [refreshDrafts]);

  const runMutation = useCallback(
    async <T,>(operation: () => Promise<T>): Promise<MutationResult<T>> => {
      if (mutatingRef.current) {
        return {
          ok: false,
          message: "Une action est déjà en cours.",
        };
      }

      const mutationEpoch = mutationEpochRef.current;
      mutatingRef.current = true;
      setIsMutating(true);
      setError(null);

      try {
        const data = await operation();

        if (mutationEpochRef.current !== mutationEpoch) {
          return {
            ok: false,
            message: "Ta session a changé. Réessaie avec la session active.",
          };
        }

        return { ok: true, data };
      } catch (caughtError) {
        const message = getCoursesServiceErrorMessage(caughtError);

        if (mutationEpochRef.current === mutationEpoch) {
          setError(message);
        }

        return { ok: false, message };
      } finally {
        if (mutationEpochRef.current === mutationEpoch) {
          mutatingRef.current = false;
          setIsMutating(false);
        }
      }
    },
    [],
  );

  const createDraft = useCallback(
    async (
      input: CreateTeacherCourseDraftInput,
    ): Promise<ActionResult<TeacherCourseDraft>> => {
      if (!teacherId || !sessionUserId || teacherId !== sessionUserId) {
        return {
          ok: false,
          message: "Accès professeur requis pour enregistrer un cours.",
        };
      }

      const result = await runMutation(() =>
        createTeacherCourse({ ...input, teacherId }),
      );

      if (result.ok) {
        setDrafts((currentDrafts) => [
          result.data,
          ...currentDrafts.filter((draft) => draft.id !== result.data.id),
        ]);
      }

      return result;
    },
    [runMutation, sessionUserId, teacherId],
  );

  const updateDraft = useCallback(
    async (
      draftId: string,
      updates: UpdateTeacherCourseDraftInput,
    ): Promise<ActionResult<TeacherCourseDraft>> => {
      const result = await runMutation(() =>
        updateTeacherCourse(draftId, updates),
      );

      if (result.ok) {
        setDrafts((currentDrafts) =>
          currentDrafts.map((draft) =>
            draft.id === draftId ? result.data : draft,
          ),
        );
      }

      return result;
    },
    [runMutation],
  );

  const deleteDraft = useCallback(
    async (draftId: string): Promise<ActionResult> => {
      const result = await runMutation(() => deleteTeacherCourse(draftId));

      if (result.ok) {
        setDrafts((currentDrafts) =>
          currentDrafts.filter((draft) => draft.id !== draftId),
        );
        return { ok: true };
      }

      return result;
    },
    [runMutation],
  );

  const getDraftById = useCallback(
    (draftId: string) => drafts.find((draft) => draft.id === draftId),
    [drafts],
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
      drafts,
      isLoading: effectiveIsLoading,
      isMutating,
      error,
      refreshDrafts,
      createDraft,
      updateDraft,
      deleteDraft,
      getDraftById,
    }),
    [
      createDraft,
      deleteDraft,
      drafts,
      error,
      getDraftById,
      effectiveIsLoading,
      isMutating,
      refreshDrafts,
      updateDraft,
    ],
  );

  return (
    <TeacherCourseDraftsContext.Provider value={value}>
      {children}
    </TeacherCourseDraftsContext.Provider>
  );
}

export function useTeacherCourseDrafts() {
  const context = useContext(TeacherCourseDraftsContext);

  if (!context) {
    throw new Error(
      "useTeacherCourseDrafts doit être utilisé dans TeacherCourseDraftsProvider",
    );
  }

  return context;
}
