import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import type {
  CreateTeacherClassInput,
  CreateTeacherStudentInput,
  TeacherClass,
  TeacherStudent,
  UpdateTeacherClassInput,
  UpdateTeacherStudentInput,
} from "@/src/types/teacher";

type TeacherClassesContextValue = {
  classes: TeacherClass[];
  createClass: (input: CreateTeacherClassInput) => TeacherClass;
  updateClass: (classId: string, updates: UpdateTeacherClassInput) => void;
  archiveClass: (classId: string) => void;
  restoreClass: (classId: string) => void;
  deleteClass: (classId: string) => void;
  getClassById: (classId: string) => TeacherClass | undefined;
  addStudent: (
    classId: string,
    input: CreateTeacherStudentInput,
  ) => TeacherStudent;
  updateStudent: (
    classId: string,
    studentId: string,
    updates: UpdateTeacherStudentInput,
  ) => void;
  removeStudent: (classId: string, studentId: string) => void;
  regenerateInviteCode: (classId: string) => string;
  assignCourseDraft: (classId: string, draftId: string) => void;
  unassignCourseDraft: (classId: string, draftId: string) => void;
};

const TeacherClassesContext = createContext<
  TeacherClassesContextValue | undefined
>(undefined);

const INVITE_CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function createLocalId(prefix: "class" | "student") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createInviteCode() {
  let suffix = "";

  for (let index = 0; index < 6; index += 1) {
    const characterIndex = Math.floor(Math.random() * INVITE_CHARACTERS.length);
    suffix += INVITE_CHARACTERS[characterIndex];
  }

  return `LUGUA-${suffix}`;
}

function updateClassById(
  classes: TeacherClass[],
  classId: string,
  updater: (teacherClass: TeacherClass) => TeacherClass,
) {
  return classes.map((teacherClass) =>
    teacherClass.id === classId ? updater(teacherClass) : teacherClass,
  );
}

export function TeacherClassesProvider({ children }: PropsWithChildren) {
  const [classes, setClasses] = useState<TeacherClass[]>([]);

  const createClass = useCallback((input: CreateTeacherClassInput) => {
    const now = new Date().toISOString();
    const teacherClass: TeacherClass = {
      id: createLocalId("class"),
      name: input.name.trim(),
      description: input.description?.trim() ?? "",
      level: input.level,
      language: input.language,
      variety: input.variety,
      status: "active",
      inviteCode: createInviteCode(),
      students: [],
      assignedCourseDraftIds: [],
      createdAt: now,
      updatedAt: now,
    };

    setClasses((currentClasses) => [teacherClass, ...currentClasses]);
    return teacherClass;
  }, []);

  const updateClass = useCallback(
    (classId: string, updates: UpdateTeacherClassInput) => {
      setClasses((currentClasses) =>
        updateClassById(currentClasses, classId, (teacherClass) => ({
          ...teacherClass,
          ...updates,
          updatedAt: new Date().toISOString(),
        })),
      );
    },
    [],
  );

  const archiveClass = useCallback((classId: string) => {
    setClasses((currentClasses) =>
      updateClassById(currentClasses, classId, (teacherClass) => ({
        ...teacherClass,
        status: "archived",
        updatedAt: new Date().toISOString(),
      })),
    );
  }, []);

  const restoreClass = useCallback((classId: string) => {
    setClasses((currentClasses) =>
      updateClassById(currentClasses, classId, (teacherClass) => ({
        ...teacherClass,
        status: "active",
        updatedAt: new Date().toISOString(),
      })),
    );
  }, []);

  const deleteClass = useCallback((classId: string) => {
    setClasses((currentClasses) =>
      currentClasses.filter((teacherClass) => teacherClass.id !== classId),
    );
  }, []);

  const getClassById = useCallback(
    (classId: string) => classes.find((teacherClass) => teacherClass.id === classId),
    [classes],
  );

  const addStudent = useCallback(
    (classId: string, input: CreateTeacherStudentInput) => {
      const student: TeacherStudent = {
        id: createLocalId("student"),
        displayName: input.displayName.trim(),
        email: input.email?.trim() || undefined,
        status: input.status ?? "active",
        createdAt: new Date().toISOString(),
      };

      setClasses((currentClasses) =>
        updateClassById(currentClasses, classId, (teacherClass) => ({
          ...teacherClass,
          students: [...teacherClass.students, student],
          updatedAt: new Date().toISOString(),
        })),
      );
      return student;
    },
    [],
  );

  const updateStudent = useCallback(
    (
      classId: string,
      studentId: string,
      updates: UpdateTeacherStudentInput,
    ) => {
      setClasses((currentClasses) =>
        updateClassById(currentClasses, classId, (teacherClass) => ({
          ...teacherClass,
          students: teacherClass.students.map((student) =>
            student.id === studentId ? { ...student, ...updates } : student,
          ),
          updatedAt: new Date().toISOString(),
        })),
      );
    },
    [],
  );

  const removeStudent = useCallback((classId: string, studentId: string) => {
    setClasses((currentClasses) =>
      updateClassById(currentClasses, classId, (teacherClass) => ({
        ...teacherClass,
        students: teacherClass.students.filter((student) => student.id !== studentId),
        updatedAt: new Date().toISOString(),
      })),
    );
  }, []);

  const regenerateInviteCode = useCallback((classId: string) => {
    const inviteCode = createInviteCode();
    setClasses((currentClasses) =>
      updateClassById(currentClasses, classId, (teacherClass) => ({
        ...teacherClass,
        inviteCode,
        updatedAt: new Date().toISOString(),
      })),
    );
    return inviteCode;
  }, []);

  const assignCourseDraft = useCallback((classId: string, draftId: string) => {
    setClasses((currentClasses) =>
      updateClassById(currentClasses, classId, (teacherClass) => ({
        ...teacherClass,
        assignedCourseDraftIds: teacherClass.assignedCourseDraftIds.includes(draftId)
          ? teacherClass.assignedCourseDraftIds
          : [...teacherClass.assignedCourseDraftIds, draftId],
        updatedAt: new Date().toISOString(),
      })),
    );
  }, []);

  const unassignCourseDraft = useCallback((classId: string, draftId: string) => {
    setClasses((currentClasses) =>
      updateClassById(currentClasses, classId, (teacherClass) => ({
        ...teacherClass,
        assignedCourseDraftIds: teacherClass.assignedCourseDraftIds.filter(
          (assignedDraftId) => assignedDraftId !== draftId,
        ),
        updatedAt: new Date().toISOString(),
      })),
    );
  }, []);

  const value = useMemo(
    () => ({
      classes,
      createClass,
      updateClass,
      archiveClass,
      restoreClass,
      deleteClass,
      getClassById,
      addStudent,
      updateStudent,
      removeStudent,
      regenerateInviteCode,
      assignCourseDraft,
      unassignCourseDraft,
    }),
    [
      classes,
      createClass,
      updateClass,
      archiveClass,
      restoreClass,
      deleteClass,
      getClassById,
      addStudent,
      updateStudent,
      removeStudent,
      regenerateInviteCode,
      assignCourseDraft,
      unassignCourseDraft,
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
      "useTeacherClasses doit être utilisé dans TeacherClassesProvider",
    );
  }

  return context;
}
