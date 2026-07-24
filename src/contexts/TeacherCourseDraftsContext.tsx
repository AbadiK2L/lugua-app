import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import type {
  CreateTeacherCourseDraftInput,
  TeacherCourseDraft,
  UpdateTeacherCourseDraftInput,
} from "@/src/types/teacher";

type TeacherCourseDraftsContextValue = {
  drafts: TeacherCourseDraft[];
  createDraft: (input: CreateTeacherCourseDraftInput) => TeacherCourseDraft;
  updateDraft: (
    draftId: string,
    updates: UpdateTeacherCourseDraftInput,
  ) => void;
  deleteDraft: (draftId: string) => void;
  getDraftById: (draftId: string) => TeacherCourseDraft | undefined;
};

const TeacherCourseDraftsContext = createContext<
  TeacherCourseDraftsContextValue | undefined
>(undefined);

function createLocalId() {
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function TeacherCourseDraftsProvider({ children }: PropsWithChildren) {
  const [drafts, setDrafts] = useState<TeacherCourseDraft[]>([]);

  const createDraft = useCallback((input: CreateTeacherCourseDraftInput) => {
    const now = new Date().toISOString();
    const draft: TeacherCourseDraft = {
      ...input,
      id: createLocalId(),
      status: "draft",
      createdAt: now,
      updatedAt: now,
    };

    setDrafts((currentDrafts) => [draft, ...currentDrafts]);
    return draft;
  }, []);

  const updateDraft = useCallback(
    (draftId: string, updates: UpdateTeacherCourseDraftInput) => {
      setDrafts((currentDrafts) =>
        currentDrafts.map((draft) =>
          draft.id === draftId
            ? { ...draft, ...updates, updatedAt: new Date().toISOString() }
            : draft,
        ),
      );
    },
    [],
  );

  const deleteDraft = useCallback((draftId: string) => {
    setDrafts((currentDrafts) =>
      currentDrafts.filter((draft) => draft.id !== draftId),
    );
  }, []);

  const getDraftById = useCallback(
    (draftId: string) => drafts.find((draft) => draft.id === draftId),
    [drafts],
  );

  const value = useMemo(
    () => ({ drafts, createDraft, updateDraft, deleteDraft, getDraftById }),
    [drafts, createDraft, updateDraft, deleteDraft, getDraftById],
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
