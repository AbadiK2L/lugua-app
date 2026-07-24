import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { languageOptions } from "@/src/components/home/LanguageSelector";
import { HOME_COLORS } from "@/src/components/home/homeColors";
import {
  getLuguaConceptSummary,
  luguaProgramChapter,
  luguaProgramConcepts,
  luguaProgramLanguage,
  luguaProgramSkill,
} from "@/src/components/teacher/courses/luguaProgram";
import { TeacherScreenShell } from "@/src/components/teacher/TeacherScreenShell";
import { useTeacherCourseDrafts } from "@/src/contexts/TeacherCourseDraftsContext";
import type { CEFRLevel } from "@/src/types/learning";
import type { TeacherCourseOrigin } from "@/src/types/teacher";

type BuilderParams = {
  origin?: string | string[];
  chapterId?: string | string[];
  draftId?: string | string[];
  preview?: string | string[];
};

type BuilderStep = "start" | "info" | "content" | "preview";

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const levelOptions: (CEFRLevel | undefined)[] = ["A1", "A2", "B1", "B2", undefined];

export default function TeacherCourseBuilderScreen() {
  const params = useLocalSearchParams<BuilderParams>();
  const { createDraft, updateDraft, getDraftById } = useTeacherCourseDrafts();
  const draftId = getParam(params.draftId);
  const existingDraft = draftId ? getDraftById(draftId) : undefined;
  const requestedOrigin = getParam(params.origin);
  const initialOrigin: TeacherCourseOrigin =
    existingDraft?.origin ??
    (requestedOrigin === "lugua_program" ? "lugua_program" : "teacher_created");
  const requestedChapterId =
    getParam(params.chapterId) ?? existingDraft?.sourceChapterId;
  const invalidProgramChapter =
    initialOrigin === "lugua_program" &&
    Boolean(requestedChapterId && requestedChapterId !== luguaProgramChapter.id);
  const initialConceptIds =
    existingDraft?.selectedConceptIds ??
    (initialOrigin === "lugua_program"
      ? luguaProgramConcepts.map((concept) => concept.id)
      : []);
  const initialStep: BuilderStep = existingDraft
    ? getParam(params.preview) === "1"
      ? "preview"
      : "info"
    : "start";

  const [step, setStep] = useState<BuilderStep>(initialStep);
  const [origin, setOrigin] = useState<TeacherCourseOrigin>(initialOrigin);
  const [title, setTitle] = useState(
    existingDraft?.title ??
      (initialOrigin === "lugua_program" ? luguaProgramChapter.title : ""),
  );
  const [description, setDescription] = useState(existingDraft?.description ?? "");
  const [variety, setVariety] = useState(
    existingDraft?.variety ?? languageOptions[0].detail,
  );
  const [level, setLevel] = useState<CEFRLevel | undefined>(
    existingDraft?.level ??
      (initialOrigin === "lugua_program" ? luguaProgramChapter.level : undefined),
  );
  const [objectives, setObjectives] = useState<string[]>(existingDraft?.objectives ?? []);
  const [objectiveInput, setObjectiveInput] = useState("");
  const [selectedConceptIds, setSelectedConceptIds] = useState<string[]>(initialConceptIds);
  const [error, setError] = useState<string | undefined>();
  const [isDirty, setIsDirty] = useState(false);

  if (invalidProgramChapter) {
    return (
      <TeacherScreenShell hideBottomNavigation>
        <View style={styles.errorState}>
          <Text style={styles.eyebrow}>CONSTRUCTEUR LOCAL</Text>
          <Text style={styles.title}>Chapitre indisponible</Text>
          <Text style={styles.subtitle}>
            Ce chapitre du programme Lugua n’est pas disponible dans cette session.
          </Text>
          <ActionButton label="Retour aux cours" onPress={() => router.replace("/teacher/courses")} primary />
        </View>
      </TeacherScreenShell>
    );
  }

  const isProgram = origin === "lugua_program";
  const isReadOnlyPreview = Boolean(
    existingDraft &&
      getParam(params.preview) === "1" &&
      step === "preview" &&
      !isDirty,
  );
  const selectedConcepts = luguaProgramConcepts.filter((concept) =>
    selectedConceptIds.includes(concept.id),
  );

  function markDirty() {
    setIsDirty(true);
    setError(undefined);
  }

  function chooseOrigin(nextOrigin: TeacherCourseOrigin) {
    setOrigin(nextOrigin);
    setIsDirty(false);
    setError(undefined);
    if (nextOrigin === "lugua_program") {
      setTitle(luguaProgramChapter.title);
      setLevel(luguaProgramChapter.level);
      setSelectedConceptIds(luguaProgramConcepts.map((concept) => concept.id));
    } else {
      setTitle("");
      setLevel(undefined);
      setSelectedConceptIds([]);
    }
  }

  function toggleConcept(conceptId: string) {
    markDirty();
    setSelectedConceptIds((current) =>
      current.includes(conceptId)
        ? current.filter((id) => id !== conceptId)
        : [...current, conceptId],
    );
  }

  function selectAllConcepts() {
    markDirty();
    setSelectedConceptIds(luguaProgramConcepts.map((concept) => concept.id));
  }

  function clearConcepts() {
    markDirty();
    setSelectedConceptIds([]);
  }

  function addObjective() {
    const value = objectiveInput.trim();
    if (!value) {
      setError("Ajoute un objectif ou laisse cette section vide.");
      return;
    }

    markDirty();
    setObjectives((current) => [...current, value]);
    setObjectiveInput("");
  }

  function updateObjective(index: number, value: string) {
    markDirty();
    setObjectives((current) =>
      current.map((objective, objectiveIndex) =>
        objectiveIndex === index ? value : objective,
      ),
    );
  }

  function removeObjective(index: number) {
    markDirty();
    setObjectives((current) => current.filter((_, objectiveIndex) => objectiveIndex !== index));
  }

  function continueFromInfo() {
    if (!title.trim()) {
      setError("Ajoute un titre au cours.");
      return;
    }

    setError(undefined);
    setStep("content");
  }

  function continueFromContent() {
    if (isProgram && selectedConceptIds.length === 0) {
      setError("Sélectionne au moins une notion.");
      return;
    }

    setError(undefined);
    setStep("preview");
  }

  function goBackStep() {
    setError(undefined);
    if (step === "preview") {
      setStep("content");
    } else if (step === "content") {
      setStep("info");
    } else if (step === "info") {
      setStep("start");
    } else {
      leaveBuilder();
    }
  }

  function leaveBuilder() {
    if (!isDirty) {
      router.replace("/teacher/courses");
      return;
    }

    Alert.alert(
      "Quitter la création ?",
      "Les modifications non enregistrées resteront uniquement dans ce formulaire.",
      [
        { text: "Continuer la création", style: "cancel" },
        { text: "Quitter", style: "destructive", onPress: () => router.replace("/teacher/courses") },
      ],
    );
  }

  function buildDraftInput() {
    return {
      origin,
      title: title.trim(),
      description: description.trim(),
      language: luguaProgramLanguage.name,
      variety,
      level,
      objectives: objectives.map((objective) => objective.trim()).filter(Boolean),
      sourceChapterId: isProgram ? luguaProgramChapter.id : undefined,
      selectedConceptIds: isProgram ? selectedConceptIds : [],
    };
  }

  function saveDraft() {
    if (!title.trim()) {
      setStep("info");
      setError("Ajoute un titre au cours.");
      return;
    }
    if (isProgram && selectedConceptIds.length === 0) {
      setStep("content");
      setError("Sélectionne au moins une notion.");
      return;
    }

    const input = buildDraftInput();
    if (draftId && existingDraft) {
      updateDraft(draftId, input);
    } else {
      createDraft(input);
    }

    router.replace({
      pathname: "/teacher/courses",
      params: { mode: "my_courses", notice: "saved" },
    });
  }

  return (
    <TeacherScreenShell hideBottomNavigation>
      <View style={styles.topLine}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour aux cours"
          onPress={leaveBuilder}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.backLabel}>← Cours</Text>
        </Pressable>
        <Text style={styles.stepLabel}>Étape {step === "start" ? "1" : step === "info" ? "2" : step === "content" ? "3" : "4"} sur 4</Text>
      </View>

      <View style={styles.intro}>
        <Text style={styles.eyebrow}>CONSTRUCTEUR LOCAL</Text>
        <Text style={styles.title}>{step === "preview" ? "Aperçu du cours" : "Créer un cours"}</Text>
        <Text style={styles.subtitle}>
          Prépare un brouillon local. Aucune publication, classe ou donnée distante n’est créée.
        </Text>
      </View>

      {step === "start" ? (
        <StartStep
          origin={origin}
          chapterTitle={luguaProgramChapter.title}
          onChoose={chooseOrigin}
          onContinue={() => setStep("info")}
        />
      ) : null}

      {step === "info" ? (
        <InfoStep
          origin={origin}
          title={title}
          description={description}
          variety={variety}
          level={level}
          objectives={objectives}
          objectiveInput={objectiveInput}
          onChooseOrigin={chooseOrigin}
          onTitleChange={(value) => { markDirty(); setTitle(value); }}
          onDescriptionChange={(value) => { markDirty(); setDescription(value); }}
          onVarietyChange={(value) => { markDirty(); setVariety(value); }}
          onLevelChange={(value) => { markDirty(); setLevel(value); }}
          onObjectiveInputChange={setObjectiveInput}
          onAddObjective={addObjective}
          onUpdateObjective={updateObjective}
          onRemoveObjective={removeObjective}
          onContinue={continueFromInfo}
        />
      ) : null}

      {step === "content" ? (
        <ContentStep
          isProgram={isProgram}
          selectedConceptIds={selectedConceptIds}
          onToggle={toggleConcept}
          onSelectAll={selectAllConcepts}
          onClear={clearConcepts}
          onContinue={continueFromContent}
        />
      ) : null}

      {step === "preview" ? (
        <PreviewStep
          origin={origin}
          title={title}
          description={description}
          variety={variety}
          level={level}
          objectives={objectives}
          selectedConcepts={selectedConcepts}
          isReadOnly={isReadOnlyPreview}
          onEdit={() => setStep("info")}
          onSave={saveDraft}
        />
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {step !== "start" && !isReadOnlyPreview ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Étape précédente"
          onPress={goBackStep}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryButtonText}>Retour</Text>
        </Pressable>
      ) : null}
    </TeacherScreenShell>
  );
}

function StartStep({
  origin,
  chapterTitle,
  onChoose,
  onContinue,
}: {
  origin: TeacherCourseOrigin;
  chapterTitle: string;
  onChoose: (origin: TeacherCourseOrigin) => void;
  onContinue: () => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>1. Choisir un point de départ</Text>
      <View style={styles.startGrid}>
        <StartCard
          selected={origin === "lugua_program"}
          title="Utiliser le programme Lugua"
          description={`Pars du chapitre réel ${chapterTitle} et de ses notions disponibles.`}
          onPress={() => onChoose("lugua_program")}
        />
        <StartCard
          selected={origin === "teacher_created"}
          title="Partir de zéro"
          description="Construis un brouillon vide, sans contenu linguistique inventé."
          onPress={() => onChoose("teacher_created")}
        />
      </View>
      <ActionButton label="Continuer" onPress={onContinue} primary />
    </View>
  );
}

function StartCard({
  selected,
  title,
  description,
  onPress,
}: {
  selected: boolean;
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [styles.startCard, selected && styles.selectedCard, pressed && styles.pressed]}
    >
      <Text style={styles.startCardTitle}>{title}</Text>
      <Text style={styles.startCardDescription}>{description}</Text>
      <Text style={styles.radioText}>{selected ? "Sélectionné" : "Sélectionner"}</Text>
    </Pressable>
  );
}

function InfoStep({
  origin,
  title,
  description,
  variety,
  level,
  objectives,
  objectiveInput,
  onChooseOrigin,
  onTitleChange,
  onDescriptionChange,
  onVarietyChange,
  onLevelChange,
  onObjectiveInputChange,
  onAddObjective,
  onUpdateObjective,
  onRemoveObjective,
  onContinue,
}: {
  origin: TeacherCourseOrigin;
  title: string;
  description: string;
  variety: string;
  level?: CEFRLevel;
  objectives: string[];
  objectiveInput: string;
  onChooseOrigin: (origin: TeacherCourseOrigin) => void;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onVarietyChange: (value: string) => void;
  onLevelChange: (value: CEFRLevel | undefined) => void;
  onObjectiveInputChange: (value: string) => void;
  onAddObjective: () => void;
  onUpdateObjective: (index: number, value: string) => void;
  onRemoveObjective: (index: number) => void;
  onContinue: () => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>2. Informations du cours</Text>
      <View style={styles.originSwitch}>
        <ChoiceButton label="Programme Lugua" selected={origin === "lugua_program"} onPress={() => onChooseOrigin("lugua_program")} />
        <ChoiceButton label="Partir de zéro" selected={origin === "teacher_created"} onPress={() => onChooseOrigin("teacher_created")} />
      </View>
      {origin === "lugua_program" ? (
        <View style={styles.referenceCard}>
          <Text style={styles.referenceTitle}>Programme Lugua</Text>
          <Text style={styles.referenceText}>{luguaProgramChapter.level} · {luguaProgramSkill.title} · {luguaProgramChapter.title}</Text>
          <Text style={styles.referenceText}>Le titre est proposé depuis le chapitre réel du curriculum.</Text>
        </View>
      ) : null}
      <Field label="Titre" value={title} onChangeText={onTitleChange} placeholder="Titre du cours" />
      <Field label="Description (facultatif)" value={description} onChangeText={onDescriptionChange} placeholder="Description du cours" multiline />

      <View style={styles.field}>
        <Text style={styles.label}>Langue enseignée</Text>
        <View style={styles.staticValue}><Text style={styles.staticValueText}>{luguaProgramLanguage.name}</Text></View>
      </View>
      <ChoiceSection label="Variété" options={languageOptions.map((option) => ({ value: option.detail, label: `${option.label} · ${option.detail}` }))} selected={variety} onChange={onVarietyChange} />
      <ChoiceSection label="Niveau (facultatif)" options={levelOptions.map((option) => ({ value: option ?? "", label: option ?? "Non défini" }))} selected={level ?? ""} onChange={(value) => onLevelChange((value || undefined) as CEFRLevel | undefined)} />

      <View style={styles.objectiveSection}>
        <Text style={styles.label}>Objectifs (facultatif)</Text>
        {objectives.map((objective, index) => (
          <View key={`${index}-${objective}`} style={styles.objectiveRow}>
            <TextInput
              accessibilityLabel={`Objectif ${index + 1}`}
              value={objective}
              onChangeText={(value) => onUpdateObjective(index, value)}
              placeholder="Objectif pédagogique"
              placeholderTextColor={HOME_COLORS.textMuted}
              style={[styles.input, styles.objectiveInput]}
            />
            <Pressable accessibilityRole="button" accessibilityLabel={`Supprimer l’objectif ${index + 1}`} onPress={() => onRemoveObjective(index)} style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}>
              <Text style={styles.removeButtonText}>Supprimer</Text>
            </Pressable>
          </View>
        ))}
        <View style={styles.addObjectiveRow}>
          <TextInput
            accessibilityLabel="Nouvel objectif"
            value={objectiveInput}
            onChangeText={onObjectiveInputChange}
            placeholder="Ajouter un objectif"
            placeholderTextColor={HOME_COLORS.textMuted}
            style={[styles.input, styles.newObjectiveInput]}
          />
          <ActionButton label="Ajouter" onPress={onAddObjective} />
        </View>
      </View>
      <ActionButton label="Continuer" onPress={onContinue} primary />
    </View>
  );
}

function ContentStep({
  isProgram,
  selectedConceptIds,
  onToggle,
  onSelectAll,
  onClear,
  onContinue,
}: {
  isProgram: boolean;
  selectedConceptIds: string[];
  onToggle: (conceptId: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
  onContinue: () => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>3. Contenu du cours</Text>
      {isProgram ? (
        <>
          <Text style={styles.helper}>Sélectionne les notions du chapitre réel à proposer dans ce brouillon.</Text>
          <View style={styles.inlineActions}>
            <ActionButton label="Tout sélectionner" onPress={onSelectAll} />
            <ActionButton label="Tout désélectionner" onPress={onClear} />
          </View>
          <View style={styles.conceptList}>
            {luguaProgramConcepts.map((concept) => {
              const selected = selectedConceptIds.includes(concept.id);
              return (
                <Pressable
                  key={concept.id}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={concept.title}
                  onPress={() => onToggle(concept.id)}
                  style={({ pressed }) => [styles.conceptRow, pressed && styles.pressed]}
                >
                  <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                    {selected ? <Text style={styles.checkmark}>✓</Text> : null}
                  </View>
                  <View style={styles.conceptCopy}>
                    <Text style={styles.conceptTitle}>{concept.title}</Text>
                    <Text style={styles.conceptSummary}>{getLuguaConceptSummary(concept)}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : (
        <View style={styles.emptyContent}>
          <Text style={styles.emptyContentTitle}>Contenu à préparer</Text>
          <Text style={styles.helper}>Les contenus d’un cours créé depuis zéro seront ajoutés dans une prochaine étape.</Text>
        </View>
      )}
      <ActionButton label="Prévisualiser" onPress={onContinue} primary />
    </View>
  );
}

function PreviewStep({
  origin,
  title,
  description,
  variety,
  level,
  objectives,
  selectedConcepts,
  isReadOnly,
  onEdit,
  onSave,
}: {
  origin: TeacherCourseOrigin;
  title: string;
  description: string;
  variety: string;
  level?: CEFRLevel;
  objectives: string[];
  selectedConcepts: typeof luguaProgramConcepts;
  isReadOnly: boolean;
  onEdit: () => void;
  onSave: () => void;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.previewCard}>
        <Text style={styles.previewEyebrow}>APERÇU LOCAL</Text>
        <Text style={styles.previewTitle}>{title}</Text>
        <Text style={styles.previewOrigin}>
          {origin === "lugua_program" ? "Adapté du programme Lugua" : "Cours créé par le professeur"}
        </Text>
        {description ? <Text style={styles.previewText}>{description}</Text> : null}
        <MetaRow label="Langue" value={`${luguaProgramLanguage.name} · ${variety}`} />
        <MetaRow label="Niveau" value={level ?? "Non défini"} />
        <MetaRow label="Statut" value="Brouillon local" />

        <View style={styles.previewBlock}>
          <Text style={styles.previewBlockTitle}>Objectifs</Text>
          {objectives.length ? objectives.map((objective, index) => <Text key={`${objective}-${index}`} style={styles.previewListItem}>• {objective}</Text>) : <Text style={styles.previewMuted}>Aucun objectif ajouté.</Text>}
        </View>

        {origin === "lugua_program" ? (
          <View style={styles.previewBlock}>
            <Text style={styles.previewBlockTitle}>Notions sélectionnées ({selectedConcepts.length})</Text>
            {selectedConcepts.map((concept) => <Text key={concept.id} style={styles.previewListItem}>{concept.title}</Text>)}
          </View>
        ) : null}

        <Text style={styles.previewNote}>
          Ce brouillon est conservé uniquement pendant cette session de démonstration.
        </Text>
      </View>
      <View style={styles.inlineActions}>
        {isReadOnly ? <ActionButton label="Modifier" onPress={onEdit} primary /> : <ActionButton label="Ajouter à Mes cours" onPress={onSave} primary />}
        {isReadOnly ? null : <ActionButton label="Modifier" onPress={onEdit} />}
      </View>
    </View>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.metaRow}><Text style={styles.metaLabel}>{label}</Text><Text style={styles.metaValue}>{value}</Text></View>;
}

function ChoiceSection({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.choiceList}>
        {options.map((option) => <ChoiceButton key={option.value} label={option.label} selected={option.value === selected} onPress={() => onChange(option.value)} />)}
      </View>
    </View>
  );
}

function ChoiceButton({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.choiceButton, selected && styles.selectedChoice, pressed && styles.pressed]}
    >
      <Text style={[styles.choiceText, selected && styles.selectedChoiceText]}>{label}</Text>
    </Pressable>
  );
}

function ActionButton({ label, onPress, primary = false }: { label: string; onPress: () => void; primary?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.actionButton, primary && styles.primaryButton, pressed && styles.pressed]}
    >
      <Text style={[styles.actionButtonText, primary && styles.primaryButtonText]}>{label}</Text>
    </Pressable>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={HOME_COLORS.textMuted}
        multiline={multiline}
        style={[styles.input, multiline && styles.multilineInput]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topLine: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  backButton: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start", borderRadius: 10, paddingHorizontal: 4 },
  backLabel: { color: HOME_COLORS.accent, fontSize: 14, fontWeight: "800" },
  stepLabel: { color: HOME_COLORS.textMuted, fontSize: 12, fontWeight: "800" },
  intro: { gap: 6 },
  eyebrow: { color: HOME_COLORS.accent, fontSize: 12, fontWeight: "900" },
  title: { color: HOME_COLORS.textPrimary, fontSize: 30, fontWeight: "900" },
  subtitle: { color: HOME_COLORS.textSecondary, fontSize: 15, fontWeight: "600", lineHeight: 22 },
  section: { gap: 12 },
  sectionTitle: { color: HOME_COLORS.textPrimary, fontSize: 18, fontWeight: "900" },
  startGrid: { gap: 10 },
  startCard: { gap: 8, minHeight: 118, justifyContent: "center", borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 14, backgroundColor: HOME_COLORS.card, padding: 16 },
  selectedCard: { borderColor: HOME_COLORS.accent, backgroundColor: HOME_COLORS.accentSoft },
  startCardTitle: { color: HOME_COLORS.textPrimary, fontSize: 16, fontWeight: "900" },
  startCardDescription: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "600", lineHeight: 19 },
  radioText: { color: HOME_COLORS.accent, fontSize: 12, fontWeight: "900" },
  originSwitch: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  referenceCard: { gap: 5, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 12, backgroundColor: HOME_COLORS.surface, padding: 14 },
  referenceTitle: { color: HOME_COLORS.textPrimary, fontSize: 15, fontWeight: "900" },
  referenceText: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "700", lineHeight: 19 },
  field: { gap: 6 },
  label: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "800" },
  staticValue: { minHeight: 48, justifyContent: "center", borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 10, backgroundColor: HOME_COLORS.surface, paddingHorizontal: 12 },
  staticValueText: { color: HOME_COLORS.textPrimary, fontSize: 14, fontWeight: "800" },
  choiceList: { gap: 6 },
  choiceButton: { minHeight: 44, justifyContent: "center", borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 10, backgroundColor: HOME_COLORS.surface, paddingHorizontal: 12 },
  selectedChoice: { borderColor: HOME_COLORS.accent, backgroundColor: HOME_COLORS.accentSoft },
  choiceText: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "800" },
  selectedChoiceText: { color: HOME_COLORS.accent },
  input: { minHeight: 48, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 10, backgroundColor: HOME_COLORS.surface, color: HOME_COLORS.textPrimary, fontSize: 14, paddingHorizontal: 12 },
  multilineInput: { minHeight: 86, textAlignVertical: "top", paddingTop: 12 },
  objectiveSection: { gap: 8 },
  objectiveRow: { gap: 6 },
  objectiveInput: { flex: 1 },
  removeButton: { minHeight: 44, alignSelf: "flex-start", justifyContent: "center", paddingHorizontal: 4 },
  removeButtonText: { color: "#ffb4c0", fontSize: 12, fontWeight: "800" },
  addObjectiveRow: { gap: 8 },
  newObjectiveInput: { flex: 1 },
  helper: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "600", lineHeight: 20 },
  inlineActions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  conceptList: { gap: 7 },
  conceptRow: { minHeight: 58, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 10, backgroundColor: HOME_COLORS.surface, paddingHorizontal: 12, paddingVertical: 8 },
  checkbox: { width: 24, height: 24, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: HOME_COLORS.textMuted, borderRadius: 6 },
  checkboxSelected: { borderColor: HOME_COLORS.accent, backgroundColor: HOME_COLORS.accent },
  checkmark: { color: HOME_COLORS.ink, fontSize: 16, fontWeight: "900" },
  conceptCopy: { flex: 1, gap: 2 },
  conceptTitle: { color: HOME_COLORS.textPrimary, fontSize: 14, fontWeight: "800" },
  conceptSummary: { color: HOME_COLORS.textSecondary, fontSize: 12, fontWeight: "600", lineHeight: 17 },
  emptyContent: { gap: 6, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 14, backgroundColor: HOME_COLORS.card, padding: 16 },
  emptyContentTitle: { color: HOME_COLORS.textPrimary, fontSize: 16, fontWeight: "900" },
  errorState: { gap: 10, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 14, backgroundColor: HOME_COLORS.card, padding: 18 },
  errorText: { color: "#ffb4c0", fontSize: 13, fontWeight: "800", lineHeight: 19 },
  previewCard: { gap: 10, borderWidth: 1, borderColor: HOME_COLORS.accent, borderRadius: 16, backgroundColor: HOME_COLORS.card, padding: 18 },
  previewEyebrow: { color: HOME_COLORS.accent, fontSize: 11, fontWeight: "900", letterSpacing: 0.7 },
  previewTitle: { color: HOME_COLORS.textPrimary, fontSize: 22, fontWeight: "900" },
  previewOrigin: { color: HOME_COLORS.accentMuted, fontSize: 13, fontWeight: "800" },
  previewText: { color: HOME_COLORS.textSecondary, fontSize: 14, fontWeight: "600", lineHeight: 21 },
  metaRow: { minHeight: 30, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, borderTopWidth: 1, borderTopColor: HOME_COLORS.border },
  metaLabel: { color: HOME_COLORS.textMuted, fontSize: 13, fontWeight: "700" },
  metaValue: { flex: 1, color: HOME_COLORS.textPrimary, fontSize: 13, fontWeight: "800", textAlign: "right" },
  previewBlock: { gap: 5, borderTopWidth: 1, borderTopColor: HOME_COLORS.border, paddingTop: 10 },
  previewBlockTitle: { color: HOME_COLORS.textPrimary, fontSize: 14, fontWeight: "900" },
  previewListItem: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "700", lineHeight: 19 },
  previewMuted: { color: HOME_COLORS.textMuted, fontSize: 13, fontWeight: "700" },
  previewNote: { color: HOME_COLORS.textMuted, fontSize: 12, fontWeight: "700", lineHeight: 18 },
  actionButton: { minHeight: 46, alignItems: "center", justifyContent: "center", alignSelf: "flex-start", borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 10, backgroundColor: HOME_COLORS.surface, paddingHorizontal: 14 },
  primaryButton: { borderColor: HOME_COLORS.accent, backgroundColor: HOME_COLORS.accent },
  actionButtonText: { color: HOME_COLORS.textPrimary, fontSize: 13, fontWeight: "900" },
  primaryButtonText: { color: HOME_COLORS.ink },
  secondaryButton: { minHeight: 46, alignItems: "center", justifyContent: "center", alignSelf: "flex-start", borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 10, backgroundColor: HOME_COLORS.surface, paddingHorizontal: 14 },
  secondaryButtonText: { color: HOME_COLORS.textPrimary, fontSize: 13, fontWeight: "900" },
  pressed: { opacity: 0.78 },
});
