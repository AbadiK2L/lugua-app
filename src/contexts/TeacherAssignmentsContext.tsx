import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

import { useTeacherClasses } from "@/src/contexts/TeacherClassesContext";
import type {
  CreateTeacherAssignmentInput,
  PublishAssignmentResult,
  TeacherAssignment,
  UpdateTeacherAssignmentInput,
} from "@/src/types/teacher";

type TeacherAssignmentsContextValue = {
  assignments: TeacherAssignment[];
  createAssignment: (input: CreateTeacherAssignmentInput) => TeacherAssignment;
  updateAssignment: (
    assignmentId: string,
    updates: UpdateTeacherAssignmentInput,
  ) => void;
  publishAssignment: (assignmentId: string) => PublishAssignmentResult;
  closeAssignment: (assignmentId: string) => void;
  reopenAssignment: (assignmentId: string) => void;
  duplicateAssignment: (assignmentId: string) => TeacherAssignment | undefined;
  deleteAssignment: (assignmentId: string) => void;
  getAssignmentById: (assignmentId: string) => TeacherAssignment | undefined;
};

const TeacherAssignmentsContext = createContext<
  TeacherAssignmentsContextValue | undefined
>(undefined);

function createLocalId() {
  return `assignment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function TeacherAssignmentsProvider({ children }: PropsWithChildren) {
  const { getClassById } = useTeacherClasses();
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const assignmentsRef = useRef<TeacherAssignment[]>([]);

  const createAssignment = useCallback((input: CreateTeacherAssignmentInput) => {
    const now = new Date().toISOString();
    const status = input.status ?? "draft";
    const assignment: TeacherAssignment = {
      id: createLocalId(),
      title: input.title.trim(),
      instructions: input.instructions?.trim() ?? "",
      classId: input.classId,
      courseDraftId: input.courseDraftId,
      selectedConceptIds: input.selectedConceptIds ?? [],
      dueDate: input.dueDate,
      status,
      createdAt: now,
      updatedAt: now,
      publishedAt: status === "published" ? now : undefined,
    };

    assignmentsRef.current = [assignment, ...assignmentsRef.current];
    setAssignments((currentAssignments) => [assignment, ...currentAssignments]);
    return assignment;
  }, []);

  const updateAssignment = useCallback(
    (assignmentId: string, updates: UpdateTeacherAssignmentInput) => {
      const updatedAt = new Date().toISOString();
      const updateCurrent = (currentAssignments: TeacherAssignment[]) =>
        currentAssignments.map((assignment) =>
          assignment.id === assignmentId
            ? { ...assignment, ...updates, updatedAt }
            : assignment,
        );

      assignmentsRef.current = updateCurrent(assignmentsRef.current);
      setAssignments((currentAssignments) =>
        updateCurrent(currentAssignments),
      );
    },
    [],
  );

  const publishAssignment = useCallback(
    (assignmentId: string): PublishAssignmentResult => {
      const assignment = assignmentsRef.current.find(
        (candidate) => candidate.id === assignmentId,
      );
      if (!assignment) {
        return { ok: false, reason: "assignment_not_found" };
      }
      if (!assignment.title.trim()) {
        return { ok: false, reason: "missing_title" };
      }

      const teacherClass = getClassById(assignment.classId);
      if (!teacherClass) {
        return { ok: false, reason: "class_not_found" };
      }
      if (teacherClass.status === "archived") {
        return { ok: false, reason: "class_archived" };
      }
      if (assignment.status === "published") {
        return { ok: true };
      }

      const now = new Date().toISOString();
      const publishCurrent = (currentAssignments: TeacherAssignment[]) =>
        currentAssignments.map((candidate) =>
          candidate.id === assignmentId
            ? {
                ...candidate,
                status: "published" as const,
                publishedAt: now,
                closedAt: undefined,
                updatedAt: now,
              }
            : candidate,
        );

      assignmentsRef.current = publishCurrent(assignmentsRef.current);
      setAssignments((currentAssignments) =>
        publishCurrent(currentAssignments),
      );
      return { ok: true };
    },
    [getClassById],
  );

  const closeAssignment = useCallback((assignmentId: string) => {
    const now = new Date().toISOString();
    const closeCurrent = (currentAssignments: TeacherAssignment[]) =>
      currentAssignments.map((assignment) =>
        assignment.id === assignmentId
          ? {
              ...assignment,
              status: "closed" as const,
              closedAt: now,
              updatedAt: now,
            }
          : assignment,
      );

    assignmentsRef.current = closeCurrent(assignmentsRef.current);
    setAssignments((currentAssignments) => closeCurrent(currentAssignments));
  }, []);

  const reopenAssignment = useCallback((assignmentId: string) => {
    const now = new Date().toISOString();
    const reopenCurrent = (currentAssignments: TeacherAssignment[]) =>
      currentAssignments.map((assignment) =>
        assignment.id === assignmentId
          ? {
              ...assignment,
              status: "published" as const,
              publishedAt: assignment.publishedAt ?? now,
              closedAt: undefined,
              updatedAt: now,
            }
          : assignment,
      );

    assignmentsRef.current = reopenCurrent(assignmentsRef.current);
    setAssignments((currentAssignments) => reopenCurrent(currentAssignments));
  }, []);

  const duplicateAssignment = useCallback((assignmentId: string) => {
    const source = assignmentsRef.current.find(
      (assignment) => assignment.id === assignmentId,
    );
    if (!source) {
      return undefined;
    }

    const now = new Date().toISOString();
    const duplicate: TeacherAssignment = {
      ...source,
      id: createLocalId(),
      title: `Copie de ${source.title}`,
      status: "draft",
      createdAt: now,
      updatedAt: now,
      publishedAt: undefined,
      closedAt: undefined,
    };

    assignmentsRef.current = [duplicate, ...assignmentsRef.current];
    setAssignments((currentAssignments) => [
      duplicate,
      ...currentAssignments,
    ]);
    return duplicate;
  }, []);

  const deleteAssignment = useCallback((assignmentId: string) => {
    assignmentsRef.current = assignmentsRef.current.filter(
      (assignment) => assignment.id !== assignmentId,
    );
    setAssignments((currentAssignments) =>
      currentAssignments.filter(
        (assignment) => assignment.id !== assignmentId,
      ),
    );
  }, []);

  const getAssignmentById = useCallback(
    (assignmentId: string) =>
      assignments.find((assignment) => assignment.id === assignmentId),
    [assignments],
  );

  const value = useMemo(
    () => ({
      assignments,
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
      createAssignment,
      updateAssignment,
      publishAssignment,
      closeAssignment,
      reopenAssignment,
      duplicateAssignment,
      deleteAssignment,
      getAssignmentById,
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
