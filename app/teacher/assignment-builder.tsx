import { router, useLocalSearchParams, type Href } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import { TeacherAssignmentActionDialog } from "@/src/components/teacher/assignments/TeacherAssignmentActionDialog";
import {
  formatDueDate,
  getConceptTitle,
  getSingleParam,
  parseDueDate,
} from "@/src/components/teacher/assignments/assignmentUtils";
import { TeacherScreenShell } from "@/src/components/teacher/TeacherScreenShell";
import { useTeacherAssignments } from "@/src/contexts/TeacherAssignmentsContext";
import { useTeacherClasses } from "@/src/contexts/TeacherClassesContext";
import { useTeacherCourseDrafts } from "@/src/contexts/TeacherCourseDraftsContext";
import type {
  TeacherAssignment,
  TeacherClass,
  TeacherCourseDraft,
} from "@/src/types/teacher";

type AssignmentBuilderParams = {
  assignmentId?: string | string[];
  classId?: string | string[];
  courseDraftId?: string | string[];
  mode?: string | string[];
  returnTo?: string | string[];
};

type BuilderStep = "class" | "content" | "information" | "preview";
type InitialStatus = "draft" | "published";

const steps: { id: BuilderStep; label: string }[] = [
  { id: "class", label: "Classe" },
  { id: "content", label: "Contenu" },
  { id: "information", label: "Informations" },
  { id: "preview", label: "Aperçu" },
];

function formatDateInput(isoDate?: string) {
  if (!isoDate) {
    return "";
  }

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-FR").format(date);
}

function getSafeReturnTo(value: string | string[] | undefined) {
  const returnTo = getSingleParam(value);
  if (
    !returnTo?.startsWith("/teacher/") ||
    returnTo.startsWith("/teacher/assignment-builder")
  ) {
    return undefined;
  }
  return returnTo;
}

export default function TeacherAssignmentBuilderScreen() {
  const params = useLocalSearchParams<AssignmentBuilderParams>();
  const {
    createAssignment,
    updateAssignment,
    publishAssignment,
    getAssignmentById,
  } = useTeacherAssignments();
  const { classes } = useTeacherClasses();
  const { drafts } = useTeacherCourseDrafts();
  const assignmentId = getSingleParam(params.assignmentId);
  const returnTo = getSafeReturnTo(params.returnTo);
  const isEditMode = getSingleParam(params.mode) === "edit";
  const existingAssignment = assignmentId
    ? getAssignmentById(assignmentId)
    : undefined;
  const activeClasses = useMemo(
    () => classes.filter((teacherClass) => teacherClass.status === "active"),
    [classes],
  );
  const requestedClassId =
    existingAssignment?.classId ?? getSingleParam(params.classId);
  const initialClassId = activeClasses.some(
    (teacherClass) => teacherClass.id === requestedClassId,
  )
    ? requestedClassId ?? ""
    : "";
  const requestedCourseDraftId =
    existingAssignment?.courseDraftId ?? getSingleParam(params.courseDraftId);
  const initialCourseDraft = drafts.find(
    (draft) => draft.id === requestedCourseDraftId,
  );
  const [step, setStep] = useState<BuilderStep>("class");
  const [selectedClassId, setSelectedClassId] = useState(initialClassId);
  const [contentMode, setContentMode] = useState<"free" | "course">(
    requestedCourseDraftId ? "course" : "free",
  );
  const [courseDraftId, setCourseDraftId] = useState(
    initialCourseDraft?.id ?? requestedCourseDraftId ?? "",
  );
  const [selectedConceptIds, setSelectedConceptIds] = useState(
    existingAssignment?.selectedConceptIds ??
      initialCourseDraft?.selectedConceptIds ??
      [],
  );
  const [title, setTitle] = useState(
    existingAssignment?.title ?? initialCourseDraft?.title ?? "",
  );
  const [instructions, setInstructions] = useState(
    existingAssignment?.instructions ?? "",
  );
  const [dueDateInput, setDueDateInput] = useState(
    formatDateInput(existingAssignment?.dueDate),
  );
  const [initialStatus, setInitialStatus] = useState<InitialStatus>("draft");
  const [error, setError] = useState<string | undefined>();
  const [dateWarning, setDateWarning] = useState<string | undefined>();
  const [isDirty, setIsDirty] = useState(false);
  const [exitDialogVisible, setExitDialogVisible] = useState(false);

  const selectedClass = activeClasses.find(
    (teacherClass) => teacherClass.id === selectedClassId,
  );
  const selectedCourse = drafts.find((draft) => draft.id === courseDraftId);
  const orderedDrafts = useMemo(() => {
    const selectedClassForOrder = activeClasses.find(
      (teacherClass) => teacherClass.id === selectedClassId,
    );

    return [...drafts].sort((first, second) => {
      const firstAssigned =
        selectedClassForOrder?.assignedCourseDraftIds.includes(first.id) ??
        false;
      const secondAssigned =
        selectedClassForOrder?.assignedCourseDraftIds.includes(second.id) ??
        false;

      if (firstAssigned === secondAssigned) {
        return second.updatedAt.localeCompare(first.updatedAt);
      }
      return firstAssigned ? -1 : 1;
    });
  }, [activeClasses, drafts, selectedClassId]);
  const availableConceptIds =
    selectedCourse?.origin === "lugua_program"
      ? selectedCourse.selectedConceptIds
      : [];
  const parsedDate = parseDueDate(dueDateInput);
  const currentStepIndex = steps.findIndex((candidate) => candidate.id === step);

  if (assignmentId && !existingAssignment) {
    return (
      <TeacherScreenShell hideBottomNavigation>
        <NotFoundState
          title="Devoir introuvable"
          description="Ce devoir n’existe pas ou n’est plus disponible dans cette session."
        />
      </TeacherScreenShell>
    );
  }

  if (existingAssignment && existingAssignment.status !== "draft") {
    return (
      <TeacherScreenShell hideBottomNavigation>
        <NotFoundState
          title="Modification indisponible"
          description="Seuls les brouillons peuvent être modifiés librement dans cette maquette."
          assignment={existingAssignment}
        />
      </TeacherScreenShell>
    );
  }

  function markDirty() {
    setIsDirty(true);
    setError(undefined);
  }

  function chooseClass(classId: string) {
    markDirty();
    setSelectedClassId(classId);
  }

  function chooseFreeAssignment() {
    markDirty();
    setContentMode("free");
    setCourseDraftId("");
    setSelectedConceptIds([]);
  }

  function chooseCourse(draft: TeacherCourseDraft) {
    markDirty();
    setContentMode("course");
    setCourseDraftId(draft.id);
    setSelectedConceptIds(draft.selectedConceptIds);
    if (!title.trim()) {
      setTitle(draft.title);
    }
  }

  function toggleConcept(conceptId: string) {
    markDirty();
    setSelectedConceptIds((current) =>
      current.includes(conceptId)
        ? current.filter((candidate) => candidate !== conceptId)
        : [...current, conceptId],
    );
  }

  function goToNextStep() {
    if (step === "class") {
      if (!selectedClass) {
        setError("Choisis une classe.");
        return;
      }
      setStep("content");
      setError(undefined);
      return;
    }

    if (step === "content") {
      if (
        contentMode === "course" &&
        selectedCourse &&
        availableConceptIds.length > 0 &&
        selectedConceptIds.length === 0
      ) {
        setError("Sélectionne au moins une notion.");
        return;
      }
      setStep("information");
      setError(undefined);
      return;
    }

    if (step === "information") {
      if (!title.trim()) {
        setError("Ajoute un titre au devoir.");
        return;
      }
      if (parsedDate.error) {
        setError(parsedDate.error);
        return;
      }
      if (initialStatus === "published" && !selectedClass) {
        setError("Choisis une classe active avant de publier.");
        return;
      }
      setDateWarning(parsedDate.warning);
      setStep("preview");
      setError(undefined);
    }
  }

  function navigateBack() {
    if (returnTo) {
      router.replace(returnTo as Href);
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/teacher/assignments");
  }

  function handleRequestExit() {
    if (currentStepIndex > 0) {
      setError(undefined);
      setStep(steps[currentStepIndex - 1].id);
      return;
    }

    if (isDirty) {
      setExitDialogVisible(true);
      return;
    }

    navigateBack();
  }

  function saveAssignment() {
    if (!selectedClass) {
      setStep("class");
      setError("Choisis une classe.");
      return;
    }
    if (!title.trim()) {
      setStep("information");
      setError("Ajoute un titre au devoir.");
      return;
    }
    if (
      contentMode === "course" &&
      selectedCourse &&
      availableConceptIds.length > 0 &&
      selectedConceptIds.length === 0
    ) {
      setStep("content");
      setError("Sélectionne au moins une notion.");
      return;
    }
    if (parsedDate.error) {
      setStep("information");
      setError(parsedDate.error);
      return;
    }

    const input = {
      title: title.trim(),
      instructions: instructions.trim(),
      classId: selectedClass.id,
      courseDraftId:
        contentMode === "course" ? courseDraftId || undefined : undefined,
      selectedConceptIds:
        contentMode === "course" ? selectedConceptIds : [],
      dueDate: parsedDate.isoDate,
    };

    if (existingAssignment) {
      updateAssignment(existingAssignment.id, input);
      if (initialStatus === "published") {
        const publishResult = publishAssignment(existingAssignment.id);
        if (!publishResult.ok) {
          setError(
            publishResult.reason === "class_archived"
              ? "La classe liée est archivée. Restaure-la ou choisis une autre classe."
              : publishResult.reason === "class_not_found"
                ? "La classe liée n’est plus disponible."
                : publishResult.reason === "missing_title"
                  ? "Ajoute un titre au devoir."
                  : "Ce devoir n’est plus disponible dans cette session.",
          );
          setStep(
            publishResult.reason === "missing_title"
              ? "information"
              : "class",
          );
          return;
        }
      }
    } else {
      createAssignment({ ...input, status: initialStatus });
    }

    router.replace({
      pathname: "/teacher/assignments",
      params: {
        status: initialStatus,
        notice: existingAssignment
          ? initialStatus === "published"
            ? "published_created"
            : "draft_updated"
          : initialStatus === "published"
            ? "published_created"
            : "draft_created",
      },
    });
  }

  return (
    <TeacherScreenShell hideBottomNavigation>
      <View style={styles.topLine}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour"
          onPress={handleRequestExit}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.backText}>← Retour</Text>
        </Pressable>
        <Text style={styles.stepCounter}>
          Étape {currentStepIndex + 1} sur {steps.length}
        </Text>
      </View>

      <View style={styles.progress} accessibilityRole="tablist">
        {steps.map((item, index) => {
          const active = item.id === step;
          const completed = index < currentStepIndex;
          return (
            <View
              key={item.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={[
                styles.progressItem,
                (active || completed) && styles.progressItemActive,
              ]}
            >
              <Text
                style={[
                  styles.progressText,
                  (active || completed) && styles.progressTextActive,
                ]}
              >
                {index + 1}. {item.label}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.intro}>
        <Text style={styles.eyebrow}>CONSTRUCTEUR LOCAL</Text>
        <Text style={styles.title}>
          {existingAssignment ? "Modifier le devoir" : "Créer un devoir"}
        </Text>
        <Text style={styles.subtitle}>
          Les données restent uniquement dans cette session de démonstration.
        </Text>
      </View>

      {step === "class" ? (
        <ClassStep
          classes={activeClasses}
          selectedClassId={selectedClassId}
          onSelect={chooseClass}
        />
      ) : null}

      {step === "content" ? (
        <ContentStep
          drafts={orderedDrafts}
          selectedClass={selectedClass}
          contentMode={contentMode}
          selectedCourseId={courseDraftId}
          courseReferenceMissing={
            contentMode === "course" &&
            Boolean(courseDraftId) &&
            !selectedCourse
          }
          availableConceptIds={availableConceptIds}
          selectedConceptIds={selectedConceptIds}
          onChooseFree={chooseFreeAssignment}
          onChooseCourse={chooseCourse}
          onToggleConcept={toggleConcept}
          onSelectAll={() => {
            markDirty();
            setSelectedConceptIds(availableConceptIds);
          }}
          onClearConcepts={() => {
            markDirty();
            setSelectedConceptIds([]);
          }}
        />
      ) : null}

      {step === "information" ? (
        <InformationStep
          title={title}
          instructions={instructions}
          dueDateInput={dueDateInput}
          initialStatus={initialStatus}
          dateWarning={parsedDate.warning}
          onTitleChange={(value) => {
            markDirty();
            setTitle(value);
          }}
          onInstructionsChange={(value) => {
            markDirty();
            setInstructions(value);
          }}
          onDueDateChange={(value) => {
            markDirty();
            setDueDateInput(value);
            setDateWarning(undefined);
          }}
          onStatusChange={(value) => {
            markDirty();
            setInitialStatus(value);
          }}
        />
      ) : null}

      {step === "preview" && selectedClass ? (
        <PreviewStep
          title={title}
          instructions={instructions}
          teacherClass={selectedClass}
          courseDraft={contentMode === "course" ? selectedCourse : undefined}
          hasLinkedCourse={
            contentMode === "course" && Boolean(courseDraftId)
          }
          selectedConceptIds={selectedConceptIds}
          dueDate={parsedDate.isoDate}
          initialStatus={initialStatus}
          dateWarning={dateWarning}
          onSave={saveAssignment}
        />
      ) : null}

      {error ? (
        <Text accessibilityRole="alert" style={styles.errorText}>
          {error}
        </Text>
      ) : null}

      {step !== "preview" ? (
        <View style={styles.footerActions}>
          {step !== "class" ? (
            <ActionButton label="Retour" onPress={handleRequestExit} />
          ) : null}
          <ActionButton
            label="Continuer"
            onPress={goToNextStep}
            primary
            hint="Passe à l’étape suivante"
          />
        </View>
      ) : (
        <ActionButton
          label="Modifier les informations"
          onPress={() => setStep("information")}
        />
      )}

      <TeacherAssignmentActionDialog
        visible={exitDialogVisible}
        title={
          isEditMode || existingAssignment
            ? "Quitter la modification ?"
            : "Quitter la création ?"
        }
        message="Les modifications non enregistrées seront perdues."
        cancelLabel={
          isEditMode || existingAssignment
            ? "Continuer la modification"
            : "Continuer la création"
        }
        confirmLabel="Quitter"
        destructive
        onCancel={() => setExitDialogVisible(false)}
        onConfirm={() => {
          setExitDialogVisible(false);
          navigateBack();
        }}
      />
    </TeacherScreenShell>
  );
}

function ClassStep({
  classes,
  selectedClassId,
  onSelect,
}: {
  classes: TeacherClass[];
  selectedClassId: string;
  onSelect: (classId: string) => void;
}) {
  if (classes.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.sectionTitle}>Aucune classe disponible</Text>
        <Text style={styles.bodyText}>
          Crée d’abord une classe avant d’attribuer un devoir.
        </Text>
        <ActionButton
          label="Créer une classe"
          onPress={() =>
            router.push({
              pathname: "/teacher/classes",
              params: { create: "1" },
            })
          }
          primary
        />
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>1. Choisir une classe active</Text>
      <View style={styles.cardList}>
        {classes.map((teacherClass) => {
          const selected = teacherClass.id === selectedClassId;
          return (
            <Pressable
              key={teacherClass.id}
              accessibilityRole="radio"
              accessibilityLabel={`${teacherClass.name}, ${teacherClass.level ?? "niveau non défini"}, ${teacherClass.students.length} élèves`}
              accessibilityState={{ selected }}
              onPress={() => onSelect(teacherClass.id)}
              style={({ pressed }) => [
                styles.selectionCard,
                selected && styles.selectionCardActive,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.selectionCopy}>
                <Text style={styles.selectionTitle}>{teacherClass.name}</Text>
                <Text style={styles.selectionMeta}>
                  {teacherClass.level ?? "Niveau non défini"} ·{" "}
                  {teacherClass.variety}
                </Text>
                <Text style={styles.selectionMeta}>
                  {teacherClass.students.length} élève
                  {teacherClass.students.length === 1 ? "" : "s"} ·{" "}
                  {teacherClass.assignedCourseDraftIds.length} cours attribué
                  {teacherClass.assignedCourseDraftIds.length === 1 ? "" : "s"}
                </Text>
              </View>
              <Text style={styles.selectionState}>
                {selected ? "Sélectionnée" : "Sélectionner"}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ContentStep({
  drafts,
  selectedClass,
  contentMode,
  selectedCourseId,
  courseReferenceMissing,
  availableConceptIds,
  selectedConceptIds,
  onChooseFree,
  onChooseCourse,
  onToggleConcept,
  onSelectAll,
  onClearConcepts,
}: {
  drafts: TeacherCourseDraft[];
  selectedClass?: TeacherClass;
  contentMode: "free" | "course";
  selectedCourseId: string;
  courseReferenceMissing: boolean;
  availableConceptIds: string[];
  selectedConceptIds: string[];
  onChooseFree: () => void;
  onChooseCourse: (draft: TeacherCourseDraft) => void;
  onToggleConcept: (conceptId: string) => void;
  onSelectAll: () => void;
  onClearConcepts: () => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>2. Choisir le contenu</Text>
      <Pressable
        accessibilityRole="radio"
        accessibilityLabel="Créer un devoir libre"
        accessibilityState={{ selected: contentMode === "free" }}
        onPress={onChooseFree}
        style={({ pressed }) => [
          styles.selectionCard,
          contentMode === "free" && styles.selectionCardActive,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.selectionCopy}>
          <Text style={styles.selectionTitle}>Créer un devoir libre</Text>
          <Text style={styles.bodyText}>
            Ajoute des consignes sans rattacher le devoir à un cours.
          </Text>
        </View>
        <Text style={styles.selectionState}>
          {contentMode === "free" ? "Sélectionné" : "Sélectionner"}
        </Text>
      </Pressable>

      <View style={styles.subsection}>
        <Text style={styles.subsectionTitle}>À partir d’un cours</Text>
        {courseReferenceMissing ? (
          <View style={[styles.selectionCard, styles.unavailableCard]}>
            <View style={styles.selectionCopy}>
              <Text style={styles.unavailableTitle}>Cours indisponible</Text>
              <Text style={styles.bodyText}>
                Le brouillon lié a été supprimé. Choisis un autre cours ou
                conserve cette référence lors de la modification.
              </Text>
            </View>
            <Text style={styles.selectionState}>Référence conservée</Text>
          </View>
        ) : null}
        {drafts.length === 0 ? (
          <Text style={styles.bodyText}>
            Aucun brouillon de cours n’est disponible. Le devoir libre reste
            accessible.
          </Text>
        ) : (
          <View style={styles.cardList}>
            {drafts.map((draft) => {
              const selected =
                contentMode === "course" && selectedCourseId === draft.id;
              const assigned =
                selectedClass?.assignedCourseDraftIds.includes(draft.id) ??
                false;
              return (
                <Pressable
                  key={draft.id}
                  accessibilityRole="radio"
                  accessibilityLabel={`${draft.title}, ${assigned ? "déjà attribué à la classe" : "autre brouillon"}`}
                  accessibilityState={{ selected }}
                  onPress={() => onChooseCourse(draft)}
                  style={({ pressed }) => [
                    styles.selectionCard,
                    selected && styles.selectionCardActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.selectionCopy}>
                    <Text style={styles.selectionTitle}>{draft.title}</Text>
                    <Text style={styles.selectionMeta}>
                      {draft.origin === "lugua_program"
                        ? "Programme Lugua"
                        : "Créé par le professeur"}{" "}
                      · {draft.level ?? "Niveau non défini"} · {draft.variety}
                    </Text>
                    <Text style={styles.selectionMeta}>
                      Brouillon local · {draft.selectedConceptIds.length} notion
                      {draft.selectedConceptIds.length === 1 ? "" : "s"}
                      {assigned ? " · Déjà attribué à cette classe" : ""}
                    </Text>
                  </View>
                  <Text style={styles.selectionState}>
                    {selected ? "Sélectionné" : "Sélectionner"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      {contentMode === "course" && availableConceptIds.length > 0 ? (
        <View style={styles.subsection}>
          <View style={styles.conceptHeader}>
            <View style={styles.selectionCopy}>
              <Text style={styles.subsectionTitle}>Notions incluses</Text>
              <Text style={styles.bodyText}>
                Le brouillon de cours reste inchangé.
              </Text>
            </View>
            <View style={styles.compactActions}>
              <SmallButton label="Tout sélectionner" onPress={onSelectAll} />
              <SmallButton label="Tout désélectionner" onPress={onClearConcepts} />
            </View>
          </View>
          <View style={styles.conceptList}>
            {availableConceptIds.map((conceptId) => {
              const selected = selectedConceptIds.includes(conceptId);
              const conceptTitle =
                getConceptTitle(conceptId) ?? "Notion indisponible";
              return (
                <Pressable
                  key={conceptId}
                  accessibilityRole="checkbox"
                  accessibilityLabel={`${conceptTitle}, notion ${selected ? "sélectionnée" : "non sélectionnée"}`}
                  accessibilityState={{ checked: selected }}
                  onPress={() => onToggleConcept(conceptId)}
                  style={({ pressed }) => [
                    styles.conceptRow,
                    selected && styles.conceptRowActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.conceptText,
                      selected && styles.conceptTextActive,
                    ]}
                  >
                    {selected ? "✓ " : ""}
                    {conceptTitle}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function InformationStep({
  title,
  instructions,
  dueDateInput,
  initialStatus,
  dateWarning,
  onTitleChange,
  onInstructionsChange,
  onDueDateChange,
  onStatusChange,
}: {
  title: string;
  instructions: string;
  dueDateInput: string;
  initialStatus: InitialStatus;
  dateWarning?: string;
  onTitleChange: (value: string) => void;
  onInstructionsChange: (value: string) => void;
  onDueDateChange: (value: string) => void;
  onStatusChange: (value: InitialStatus) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>3. Informations du devoir</Text>
      <Field
        label="Titre du devoir"
        value={title}
        placeholder="Ex. Révision des mots interrogatifs"
        onChangeText={onTitleChange}
      />
      <Field
        label="Consignes (facultatif)"
        value={instructions}
        placeholder="Décris le travail attendu"
        onChangeText={onInstructionsChange}
        multiline
      />
      <Field
        label="Date limite (facultatif)"
        value={dueDateInput}
        placeholder="JJ/MM/AAAA"
        onChangeText={onDueDateChange}
        inputMode="numeric"
      />
      {dateWarning ? (
        <Text accessibilityRole="alert" style={styles.warningText}>
          {dateWarning}
        </Text>
      ) : null}

      <View style={styles.subsection}>
        <Text style={styles.subsectionTitle}>Statut initial</Text>
        <ChoiceButton
          label="Enregistrer comme brouillon"
          description="Le devoir restera modifiable dans Brouillons."
          selected={initialStatus === "draft"}
          onPress={() => onStatusChange("draft")}
        />
        <ChoiceButton
          label="Publier maintenant"
          description="Publication locale uniquement, sans notification réelle."
          selected={initialStatus === "published"}
          onPress={() => onStatusChange("published")}
        />
      </View>
    </View>
  );
}

function PreviewStep({
  title,
  instructions,
  teacherClass,
  courseDraft,
  hasLinkedCourse,
  selectedConceptIds,
  dueDate,
  initialStatus,
  dateWarning,
  onSave,
}: {
  title: string;
  instructions: string;
  teacherClass: TeacherClass;
  courseDraft?: TeacherCourseDraft;
  hasLinkedCourse: boolean;
  selectedConceptIds: string[];
  dueDate?: string;
  initialStatus: InitialStatus;
  dateWarning?: string;
  onSave: () => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>4. Aperçu du devoir</Text>
      <View style={styles.previewCard}>
        <Text style={styles.previewEyebrow}>
          {initialStatus === "draft" ? "BROUILLON LOCAL" : "PUBLICATION LOCALE"}
        </Text>
        <Text style={styles.previewTitle}>{title.trim()}</Text>
        <PreviewRow label="Classe" value={teacherClass.name} />
        <PreviewRow
          label="Cours"
          value={
            courseDraft?.title ??
            (hasLinkedCourse ? "Cours indisponible" : "Devoir libre")
          }
        />
        <PreviewRow
          label="Origine"
          value={
            courseDraft
              ? courseDraft.origin === "lugua_program"
                ? "Programme Lugua"
                : "Créé par le professeur"
              : hasLinkedCourse
                ? "Référence indisponible"
                : "Sans cours associé"
          }
        />
        <PreviewRow
          label="Date limite"
          value={formatDueDate(dueDate)}
        />
        <PreviewRow
          label="Élèves dans la classe"
          value={String(teacherClass.students.length)}
        />
        <PreviewRow
          label="Statut prévu"
          value={
            initialStatus === "draft"
              ? "Brouillon local"
              : "Publié localement"
          }
        />

        <View style={styles.previewSection}>
          <Text style={styles.previewLabel}>Notions</Text>
          {selectedConceptIds.length > 0 ? (
            selectedConceptIds.map((conceptId) => (
              <Text key={conceptId} style={styles.previewBody}>
                · {getConceptTitle(conceptId) ?? "Notion indisponible"}
              </Text>
            ))
          ) : (
            <Text style={styles.previewBody}>Aucune notion liée</Text>
          )}
        </View>

        <View style={styles.previewSection}>
          <Text style={styles.previewLabel}>Consignes</Text>
          <Text style={styles.previewBody}>
            {instructions.trim() || "Aucune consigne ajoutée"}
          </Text>
        </View>
      </View>

      {dateWarning ? (
        <Text accessibilityRole="alert" style={styles.warningText}>
          {dateWarning}
        </Text>
      ) : null}

      <View style={styles.demoCard}>
        <Text style={styles.demoCardTitle}>Mode de démonstration</Text>
        <Text style={styles.demoCardText}>
          Ce devoir est conservé uniquement pendant cette session de
          démonstration.
        </Text>
        {initialStatus === "published" ? (
          <Text style={styles.demoCardText}>
            Le devoir sera marqué comme publié localement, sans notification
            réelle.
          </Text>
        ) : null}
      </View>

      <ActionButton
        label={
          initialStatus === "draft"
            ? "Ajouter aux brouillons"
            : "Publier le devoir"
        }
        hint={
          initialStatus === "draft"
            ? "Enregistre ce devoir localement comme brouillon"
            : "Marque ce devoir comme publié localement"
        }
        onPress={onSave}
        primary
      />
    </View>
  );
}

function Field({
  label,
  inputMode,
  ...inputProps
}: {
  label: string;
  value: string;
  placeholder: string;
  multiline?: boolean;
  inputMode?: "numeric";
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={HOME_COLORS.textMuted}
        inputMode={inputMode}
        style={[
          styles.input,
          inputProps.multiline && styles.multilineInput,
        ]}
        textAlignVertical={inputProps.multiline ? "top" : "center"}
        {...inputProps}
      />
    </View>
  );
}

function ChoiceButton({
  label,
  description,
  selected,
  onPress,
}: {
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choice,
        selected && styles.choiceActive,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.choiceTitle, selected && styles.choiceTitleActive]}>
        {label}
      </Text>
      <Text style={styles.bodyText}>{description}</Text>
    </Pressable>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.previewRow}>
      <Text style={styles.previewLabel}>{label}</Text>
      <Text style={styles.previewValue}>{value}</Text>
    </View>
  );
}

function SmallButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.smallButton,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.smallButtonText}>{label}</Text>
    </Pressable>
  );
}

function ActionButton({
  label,
  hint,
  onPress,
  primary = false,
}: {
  label: string;
  hint?: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        primary && styles.primaryButton,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.actionButtonText,
          primary && styles.primaryButtonText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function NotFoundState({
  title,
  description,
  assignment,
}: {
  title: string;
  description: string;
  assignment?: TeacherAssignment;
}) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.eyebrow}>CONSTRUCTEUR LOCAL</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.bodyText}>{description}</Text>
      <ActionButton
        label={assignment ? "Voir le devoir" : "Retour aux devoirs"}
        onPress={() =>
          assignment
            ? router.replace({
                pathname: "/teacher/assignment/[assignmentId]",
                params: { assignmentId: assignment.id },
              })
            : router.replace("/teacher/assignments")
        }
        primary
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topLine: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  backButton: {
    minHeight: 44,
    justifyContent: "center",
    borderRadius: 10,
    paddingHorizontal: 4,
  },
  backText: { color: HOME_COLORS.accent, fontSize: 14, fontWeight: "800" },
  stepCounter: {
    color: HOME_COLORS.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },
  progress: {
    flexDirection: "row",
    gap: 4,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 12,
    backgroundColor: HOME_COLORS.surface,
    padding: 4,
  },
  progressItem: {
    minWidth: 0,
    minHeight: 44,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  progressItemActive: { backgroundColor: HOME_COLORS.accentSoft },
  progressText: {
    color: HOME_COLORS.textMuted,
    fontSize: 10,
    fontWeight: "800",
    lineHeight: 12,
    textAlign: "center",
  },
  progressTextActive: { color: HOME_COLORS.accent },
  intro: { gap: 6 },
  eyebrow: { color: HOME_COLORS.accent, fontSize: 12, fontWeight: "900" },
  title: { color: HOME_COLORS.textPrimary, fontSize: 28, fontWeight: "900" },
  subtitle: {
    color: HOME_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
  },
  section: { gap: 12 },
  sectionTitle: {
    color: HOME_COLORS.textPrimary,
    fontSize: 19,
    fontWeight: "900",
  },
  subsection: { gap: 9, marginTop: 4 },
  subsectionTitle: {
    color: HOME_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "900",
  },
  cardList: { gap: 8 },
  selectionCard: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 12,
    backgroundColor: HOME_COLORS.card,
    padding: 14,
  },
  selectionCardActive: {
    borderColor: HOME_COLORS.accent,
    backgroundColor: HOME_COLORS.accentSoft,
  },
  unavailableCard: { borderColor: "#8e4654" },
  unavailableTitle: {
    color: "#ffb4c0",
    fontSize: 15,
    fontWeight: "900",
  },
  selectionCopy: { minWidth: 0, flex: 1, gap: 4 },
  selectionTitle: {
    color: HOME_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "900",
  },
  selectionMeta: {
    color: HOME_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
  },
  selectionState: {
    maxWidth: 92,
    color: HOME_COLORS.accent,
    fontSize: 11,
    fontWeight: "900",
    textAlign: "right",
  },
  bodyText: {
    color: HOME_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  emptyCard: {
    gap: 10,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 14,
    backgroundColor: HOME_COLORS.card,
    padding: 18,
  },
  conceptHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  compactActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 6,
  },
  smallButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 9,
    backgroundColor: HOME_COLORS.surface,
    paddingHorizontal: 10,
  },
  smallButtonText: {
    color: HOME_COLORS.textPrimary,
    fontSize: 11,
    fontWeight: "800",
  },
  conceptList: { gap: 6 },
  conceptRow: {
    minHeight: 46,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 10,
    backgroundColor: HOME_COLORS.surface,
    paddingHorizontal: 12,
  },
  conceptRowActive: {
    borderColor: HOME_COLORS.accent,
    backgroundColor: HOME_COLORS.accentSoft,
  },
  conceptText: {
    color: HOME_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  conceptTextActive: { color: HOME_COLORS.accentMuted },
  field: { gap: 6 },
  fieldLabel: {
    color: HOME_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "800",
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 10,
    backgroundColor: HOME_COLORS.surface,
    color: HOME_COLORS.textPrimary,
    fontSize: 14,
    paddingHorizontal: 13,
  },
  multilineInput: {
    minHeight: 112,
    paddingTop: 12,
    paddingBottom: 12,
  },
  choice: {
    minHeight: 68,
    gap: 4,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 11,
    backgroundColor: HOME_COLORS.surface,
    padding: 13,
  },
  choiceActive: {
    borderColor: HOME_COLORS.accent,
    backgroundColor: HOME_COLORS.accentSoft,
  },
  choiceTitle: {
    color: HOME_COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "900",
  },
  choiceTitleActive: { color: HOME_COLORS.accentMuted },
  warningText: {
    color: HOME_COLORS.accentMuted,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 18,
  },
  errorText: {
    color: "#ffb4c0",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 19,
  },
  previewCard: {
    gap: 10,
    borderWidth: 1,
    borderColor: HOME_COLORS.accent,
    borderRadius: 14,
    backgroundColor: HOME_COLORS.card,
    padding: 16,
  },
  previewEyebrow: {
    color: HOME_COLORS.accent,
    fontSize: 11,
    fontWeight: "900",
  },
  previewTitle: {
    color: HOME_COLORS.textPrimary,
    fontSize: 21,
    fontWeight: "900",
  },
  previewRow: {
    minHeight: 32,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14,
  },
  previewLabel: {
    color: HOME_COLORS.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },
  previewValue: {
    minWidth: 0,
    flex: 1,
    color: HOME_COLORS.textPrimary,
    fontSize: 13,
    fontWeight: "800",
    textAlign: "right",
  },
  previewSection: {
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: HOME_COLORS.border,
    paddingTop: 10,
  },
  previewBody: {
    color: HOME_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  demoCard: {
    gap: 5,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 12,
    backgroundColor: HOME_COLORS.surface,
    padding: 13,
  },
  demoCardTitle: {
    color: HOME_COLORS.textPrimary,
    fontSize: 13,
    fontWeight: "900",
  },
  demoCardText: {
    color: HOME_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
  },
  footerActions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  actionButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 10,
    backgroundColor: HOME_COLORS.surface,
    paddingHorizontal: 16,
  },
  primaryButton: {
    borderColor: HOME_COLORS.accent,
    backgroundColor: HOME_COLORS.accent,
  },
  actionButtonText: {
    color: HOME_COLORS.textPrimary,
    fontSize: 13,
    fontWeight: "900",
  },
  primaryButtonText: { color: HOME_COLORS.ink },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});
