import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { AssessmentHeader } from "@/src/components/assessment/AssessmentHeader";
import { AssessmentOptionCard } from "@/src/components/assessment/AssessmentOptionCard";
import {
  AssessmentResult,
  type CorrectedAssessmentResult,
  type OralAssessmentResult,
} from "@/src/components/assessment/AssessmentResult";
import { AssessmentTextAnswer } from "@/src/components/assessment/AssessmentTextAnswer";
import { OralTimer } from "@/src/components/assessment/OralTimer";
import { findAssessmentDetails } from "@/src/data/curriculum";
import type {
  Assessment,
  AssessmentCorrectionMode,
  AssessmentSection,
  Exercise,
  ExerciseOption,
  ExerciseType,
} from "@/src/types/learning";

const ORAL_DURATION_SECONDS = 60;

type AssessmentPhase = "intro" | "questions" | "result";
type OralStatus = "completed" | "not_completed";

type FlatAssessmentExercise = {
  section: AssessmentSection;
  sectionPosition: number;
  positionInSection: number;
  globalPosition: number;
  exercise: Exercise;
};

type ChoiceAssessmentAnswer = {
  kind: "choice";
  exerciseId: string;
  selectedOptionId: string;
  learnerAnswer: string;
  expectedAnswer: string;
  isCorrect: boolean;
};

type TextAssessmentAnswer = {
  kind: "text";
  exerciseId: string;
  learnerAnswer: string;
  expectedAnswer: string;
  isCorrect: boolean;
};

type OralAssessmentAnswer = {
  kind: "oral";
  exerciseId: string;
  status: OralStatus;
};

type AssessmentAnswer =
  | ChoiceAssessmentAnswer
  | TextAssessmentAnswer
  | OralAssessmentAnswer;

const correctionModeLabels: Record<AssessmentCorrectionMode, string> = {
  none: "Aucune correction automatique",
  partial: "Correction automatique partielle",
  full: "Correction automatique complète",
};

function normalizeParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function flattenAssessmentExercises(assessment: Assessment): FlatAssessmentExercise[] {
  let globalPosition = 0;

  return assessment.sections.flatMap((section, sectionIndex) =>
    section.exercises.map((exercise, exerciseIndex) => {
      globalPosition += 1;

      return {
        section,
        sectionPosition: sectionIndex + 1,
        positionInSection: exerciseIndex + 1,
        globalPosition,
        exercise,
      };
    }),
  );
}

function isChoiceExerciseType(type: ExerciseType) {
  return type === "recognition" || type === "context_choice" || type === "listening";
}

function isTextExerciseType(type: ExerciseType) {
  return type === "translation_to_french" || type === "translation_to_target";
}

function isAutomaticallyCorrectedExercise(exercise: Exercise) {
  return isChoiceExerciseType(exercise.type) || isTextExerciseType(exercise.type);
}

export function normalizeFreeTextAnswer(value: string) {
  return value
    .trim()
    .replace(/[’‘`´]/g, "'")
    .replace(/\s+/g, " ")
    .replace(/\s+([?!.,])/g, "$1")
    .replace(/[?!.,]+$/g, "")
    .toLocaleLowerCase();
}

function getCorrectOption(exercise: Exercise): ExerciseOption | undefined {
  return (
    exercise.options?.find((option) => option.id === exercise.correctOptionId) ??
    exercise.options?.find((option) => option.isCorrect === true)
  );
}

function getExpectedTextAnswer(exercise: Exercise) {
  return (
    exercise.expectedAnswer ??
    exercise.acceptedAnswers?.[0] ??
    "Réponse attendue à préciser"
  );
}

function isTextAnswerCorrect(exercise: Exercise, learnerAnswer: string) {
  const acceptedAnswers = [
    exercise.expectedAnswer,
    ...(exercise.acceptedAnswers ?? []),
  ].filter((answer): answer is string => Boolean(answer));
  const normalizedLearnerAnswer = normalizeFreeTextAnswer(learnerAnswer);

  return acceptedAnswers.some(
    (answer) => normalizeFreeTextAnswer(answer) === normalizedLearnerAnswer,
  );
}

function getStatusLabel(percentage: number) {
  if (percentage >= 80) {
    return "Contrôle réussi";
  }

  if (percentage >= 60) {
    return "En acquisition";
  }

  return "À retravailler";
}

function buildCorrectedResults(
  exercises: FlatAssessmentExercise[],
  answers: Record<string, AssessmentAnswer>,
): CorrectedAssessmentResult[] {
  return exercises
    .filter(({ exercise }) => isAutomaticallyCorrectedExercise(exercise))
    .map(({ exercise, section }) => {
      const answer = answers[exercise.id];

      if (answer?.kind === "choice" || answer?.kind === "text") {
        return {
          id: exercise.id,
          sectionTitle: section.title,
          question: exercise.prompt,
          learnerAnswer: answer.learnerAnswer,
          expectedAnswer: answer.expectedAnswer,
          isCorrect: answer.isCorrect,
        };
      }

      return {
        id: exercise.id,
        sectionTitle: section.title,
        question: exercise.prompt,
        learnerAnswer: "Sans réponse",
        expectedAnswer: getCorrectOption(exercise)?.text ?? getExpectedTextAnswer(exercise),
        isCorrect: false,
      };
    });
}

function buildOralResult(
  exercises: FlatAssessmentExercise[],
  answers: Record<string, AssessmentAnswer>,
): OralAssessmentResult | undefined {
  const oralExercise = exercises.find(({ exercise }) => exercise.type === "conversation");

  if (!oralExercise) {
    return undefined;
  }

  const answer = answers[oralExercise.exercise.id];

  return {
    sectionTitle: oralExercise.section.title,
    status: answer?.kind === "oral" ? answer.status : "not_completed",
    acceptedAnswers: oralExercise.exercise.acceptedAnswers ?? [],
  };
}

function renderMissingAssessment() {
  return (
    <View style={styles.centeredContainer}>
      <Text style={styles.emptyTitle}>Contrôle introuvable</Text>
      <Text style={styles.emptyText}>
        Aucun contrôle local ne correspond à cet identifiant.
      </Text>
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.secondaryButton}
        onPress={() => router.replace("/(tabs)/lessons")}
      >
        <Text style={styles.secondaryButtonText}>Retour au parcours</Text>
      </TouchableOpacity>
    </View>
  );
}

type IntroContentProps = {
  assessment: Assessment;
  exerciseCount: number;
  onStart: () => void;
};

function IntroContent({ assessment, exerciseCount, onStart }: IntroContentProps) {
  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <View style={styles.titleText}>
          <Text style={styles.eyebrow}>Contrôle de fin de chapitre</Text>
          <Text style={styles.title}>{assessment.title}</Text>
        </View>

        {assessment.validationStatus === "draft" ? (
          <View style={styles.draftBadge}>
            <Text style={styles.draftBadgeText}>Version provisoire</Text>
          </View>
        ) : null}
      </View>

      {assessment.description ? (
        <Text style={styles.description}>{assessment.description}</Text>
      ) : null}

      <View style={styles.metaGrid}>
        <View style={styles.metaBox}>
          <Text style={styles.metaValue}>{exerciseCount}</Text>
          <Text style={styles.metaLabel}>exercices</Text>
        </View>
        <View style={styles.metaBox}>
          <Text style={styles.metaValue}>{assessment.sections.length}</Text>
          <Text style={styles.metaLabel}>sections</Text>
        </View>
      </View>

      <View style={styles.infoBadge}>
        <Text style={styles.infoBadgeText}>
          {correctionModeLabels[assessment.correctionMode]}
        </Text>
      </View>

      <Text style={styles.noticeText}>
        Les réponses écrites et les choix seront corrigés localement. L’activité
        orale ne sera pas notée automatiquement.
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity activeOpacity={0.85} style={styles.primaryButton} onPress={onStart}>
          <Text style={styles.primaryButtonText}>Commencer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.secondaryButton}
          onPress={() => router.replace("/(tabs)/lessons")}
        >
          <Text style={styles.secondaryButtonText}>Retour au parcours</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

type QuestionContentProps = {
  flatExercise: FlatAssessmentExercise;
  totalExercises: number;
  selectedOptionId: string | null;
  textAnswer: string;
  locked: boolean;
  hasResponse: boolean;
  oralStatus: OralStatus;
  oralStarted: boolean;
  restartKey: string;
  isLastQuestion: boolean;
  onSelectOption: (optionId: string) => void;
  onChangeText: (value: string) => void;
  onOralStarted: () => void;
  onOralCompleted: () => void;
  onValidate: () => void;
  onContinue: () => void;
};

function QuestionContent({
  flatExercise,
  totalExercises,
  selectedOptionId,
  textAnswer,
  locked,
  hasResponse,
  oralStatus,
  oralStarted,
  restartKey,
  isLastQuestion,
  onSelectOption,
  onChangeText,
  onOralStarted,
  onOralCompleted,
  onValidate,
  onContinue,
}: QuestionContentProps) {
  const { exercise, section, positionInSection, sectionPosition, globalPosition } =
    flatExercise;
  const buttonLabel = locked
    ? isLastQuestion
      ? "Voir le résultat"
      : "Question suivante"
    : "Valider la réponse";

  return (
    <View style={styles.questionLayout}>
      <AssessmentHeader
        currentQuestion={globalPosition}
        totalQuestions={totalExercises}
        sectionTitle={section.title}
      />

      <View style={styles.card}>
        <Text style={styles.stepMeta}>
          Section {sectionPosition} · Exercice {positionInSection}
        </Text>
        {section.description ? (
          <Text style={styles.sectionDescription}>{section.description}</Text>
        ) : null}

        <Text style={styles.instruction}>{exercise.instruction}</Text>
        <Text style={styles.prompt}>{exercise.prompt}</Text>

        {exercise.type === "listening" ? (
          <ListeningExerciseContent
            exercise={exercise}
            selectedOptionId={selectedOptionId}
            locked={locked}
            onSelectOption={onSelectOption}
          />
        ) : null}

        {isChoiceExerciseType(exercise.type) && exercise.type !== "listening" ? (
          <ChoiceExerciseContent
            exercise={exercise}
            selectedOptionId={selectedOptionId}
            locked={locked}
            onSelectOption={onSelectOption}
          />
        ) : null}

        {isTextExerciseType(exercise.type) ? (
          <AssessmentTextAnswer
            editable={!locked}
            placeholder="Écris ta réponse"
            value={textAnswer}
            onChangeText={onChangeText}
          />
        ) : null}

        {exercise.type === "conversation" ? (
          <View style={styles.oralBlock}>
            <View style={styles.unscoredBadge}>
              <Text style={styles.unscoredBadgeText}>Non noté automatiquement</Text>
            </View>
            <Text style={styles.noticeText}>
              Cette activité ne sera pas corrigée automatiquement et aucun micro
              n’est enregistré.
            </Text>
            <OralTimer
              durationSeconds={ORAL_DURATION_SECONDS}
              locked={locked}
              resetKey={restartKey}
              onStarted={onOralStarted}
              onCompleted={onOralCompleted}
            />
            {oralStarted ? (
              <Text style={styles.oralStatusText}>
                Statut actuel :{" "}
                {oralStatus === "completed" ? "terminée" : "non terminée"}
              </Text>
            ) : null}
          </View>
        ) : null}

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={!locked && !hasResponse}
          style={[
            styles.primaryButton,
            !locked && !hasResponse && styles.disabledButton,
            locked && styles.continueButton,
          ]}
          onPress={locked ? onContinue : onValidate}
        >
          <Text style={styles.primaryButtonText}>{buttonLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

type ChoiceExerciseContentProps = {
  exercise: Exercise;
  selectedOptionId: string | null;
  locked: boolean;
  onSelectOption: (optionId: string) => void;
};

function ChoiceExerciseContent({
  exercise,
  selectedOptionId,
  locked,
  onSelectOption,
}: ChoiceExerciseContentProps) {
  return (
    <View style={styles.optionsList}>
      {exercise.options?.map((option) => (
        <AssessmentOptionCard
          key={option.id}
          text={option.text}
          selected={option.id === selectedOptionId}
          disabled={locked}
          onPress={() => onSelectOption(option.id)}
        />
      ))}
    </View>
  );
}

function ListeningExerciseContent({
  exercise,
  selectedOptionId,
  locked,
  onSelectOption,
}: ChoiceExerciseContentProps) {
  return (
    <View style={styles.listeningBlock}>
      {exercise.script ? (
        <View style={styles.scriptCard}>
          <View style={styles.titleRow}>
            <View style={styles.titleText}>
              {exercise.script.title ? (
                <Text style={styles.scriptTitle}>{exercise.script.title}</Text>
              ) : null}
              <Text style={styles.scriptDescription}>{exercise.script.description}</Text>
            </View>
            <View style={styles.scriptBadge}>
              <Text style={styles.scriptBadgeText}>Script provisoire</Text>
            </View>
          </View>

          <Text style={styles.noticeText}>
            Lecture du script provisoire : aucun audio validé n’est disponible
            pour cette activité.
          </Text>

          <View style={styles.turnsList}>
            {exercise.script.turns.map((turn) => (
              <View key={turn.id} style={styles.turnCard}>
                <Text style={styles.speakerName}>{turn.speaker}</Text>
                {turn.text ? <Text style={styles.turnText}>{turn.text}</Text> : null}
                <TouchableOpacity
                  activeOpacity={1}
                  disabled
                  style={styles.disabledAudioButton}
                >
                  <Text style={styles.disabledAudioText}>Audio bientôt disponible</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <ChoiceExerciseContent
        exercise={exercise}
        selectedOptionId={selectedOptionId}
        locked={locked}
        onSelectOption={onSelectOption}
      />
    </View>
  );
}

export default function AssessmentScreen() {
  const params = useLocalSearchParams<{ assessmentId?: string | string[] }>();
  const assessmentId = normalizeParam(params.assessmentId);
  const details = findAssessmentDetails(assessmentId);
  const exercises = useMemo(
    () => (details ? flattenAssessmentExercises(details.assessment) : []),
    [details],
  );
  const totalAutomaticallyCorrected = useMemo(
    () => exercises.filter(({ exercise }) => isAutomaticallyCorrectedExercise(exercise)).length,
    [exercises],
  );
  const [phase, setPhase] = useState<AssessmentPhase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [answers, setAnswers] = useState<Record<string, AssessmentAnswer>>({});
  const [oralStatus, setOralStatus] = useState<OralStatus>("not_completed");
  const [oralStarted, setOralStarted] = useState(false);
  const [restartCount, setRestartCount] = useState(0);

  const correctedResults = useMemo(
    () => buildCorrectedResults(exercises, answers),
    [answers, exercises],
  );
  const score = correctedResults.filter((result) => result.isCorrect).length;
  const percentage =
    totalAutomaticallyCorrected > 0
      ? Math.round((score / totalAutomaticallyCorrected) * 100)
      : 0;
  const oralResult = useMemo(
    () => buildOralResult(exercises, answers),
    [answers, exercises],
  );

  const handleOralStarted = useCallback(() => {
    setOralStarted(true);
    setOralStatus("not_completed");
  }, []);

  const handleOralCompleted = useCallback(() => {
    setOralStarted(true);
    setOralStatus("completed");
  }, []);

  if (!details) {
    return renderMissingAssessment();
  }

  const { assessment } = details;
  const currentFlatExercise = exercises[currentIndex];
  const currentExercise = currentFlatExercise?.exercise;
  const savedAnswer = currentExercise ? answers[currentExercise.id] : undefined;
  const isLocked = savedAnswer !== undefined;
  const hasResponse =
    isLocked ||
    (currentExercise
      ? (isChoiceExerciseType(currentExercise.type) && selectedOptionId !== null) ||
        (isTextExerciseType(currentExercise.type) && textAnswer.trim().length > 0) ||
        (currentExercise.type === "conversation" && oralStarted)
      : false);

  function handleSelectOption(optionId: string) {
    if (isLocked) {
      return;
    }

    setSelectedOptionId(optionId);
  }

  function handleValidateAnswer() {
    if (!currentExercise || isLocked || !hasResponse) {
      return;
    }

    if (isChoiceExerciseType(currentExercise.type)) {
      const selectedOption = currentExercise.options?.find(
        (option) => option.id === selectedOptionId,
      );
      const correctOption = getCorrectOption(currentExercise);

      if (!selectedOption) {
        return;
      }

      const answer: ChoiceAssessmentAnswer = {
        kind: "choice",
        exerciseId: currentExercise.id,
        selectedOptionId: selectedOption.id,
        learnerAnswer: selectedOption.text,
        expectedAnswer: correctOption?.text ?? "Réponse attendue à préciser",
        isCorrect: selectedOption.id === correctOption?.id,
      };

      setAnswers((currentAnswers) =>
        currentAnswers[currentExercise.id]
          ? currentAnswers
          : {
              ...currentAnswers,
              [currentExercise.id]: answer,
            },
      );
      return;
    }

    if (isTextExerciseType(currentExercise.type)) {
      const answer: TextAssessmentAnswer = {
        kind: "text",
        exerciseId: currentExercise.id,
        learnerAnswer: textAnswer,
        expectedAnswer: getExpectedTextAnswer(currentExercise),
        isCorrect: isTextAnswerCorrect(currentExercise, textAnswer),
      };

      setAnswers((currentAnswers) =>
        currentAnswers[currentExercise.id]
          ? currentAnswers
          : {
              ...currentAnswers,
              [currentExercise.id]: answer,
            },
      );
      return;
    }

    if (currentExercise.type === "conversation") {
      const answer: OralAssessmentAnswer = {
        kind: "oral",
        exerciseId: currentExercise.id,
        status: oralStatus,
      };

      setAnswers((currentAnswers) =>
        currentAnswers[currentExercise.id]
          ? currentAnswers
          : {
              ...currentAnswers,
              [currentExercise.id]: answer,
            },
      );
    }
  }

  function resetPendingAnswer() {
    setSelectedOptionId(null);
    setTextAnswer("");
    setOralStatus("not_completed");
    setOralStarted(false);
  }

  function handleContinue() {
    if (!isLocked) {
      return;
    }

    if (currentIndex >= exercises.length - 1) {
      setPhase("result");
      return;
    }

    setCurrentIndex((index) => index + 1);
    resetPendingAnswer();
  }

  function handleRestart() {
    setPhase("intro");
    setCurrentIndex(0);
    setAnswers({});
    resetPendingAnswer();
    setRestartCount((count) => count + 1);
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {phase === "intro" ? (
        <IntroContent
          assessment={assessment}
          exerciseCount={exercises.length}
          onStart={() => setPhase("questions")}
        />
      ) : null}

      {phase === "questions" && currentFlatExercise ? (
        <QuestionContent
          flatExercise={currentFlatExercise}
          totalExercises={exercises.length}
          selectedOptionId={
            savedAnswer?.kind === "choice"
              ? savedAnswer.selectedOptionId
              : selectedOptionId
          }
          textAnswer={savedAnswer?.kind === "text" ? savedAnswer.learnerAnswer : textAnswer}
          locked={isLocked}
          hasResponse={hasResponse}
          oralStatus={savedAnswer?.kind === "oral" ? savedAnswer.status : oralStatus}
          oralStarted={oralStarted || savedAnswer?.kind === "oral"}
          restartKey={`${restartCount}-${currentFlatExercise.exercise.id}`}
          isLastQuestion={currentIndex >= exercises.length - 1}
          onSelectOption={handleSelectOption}
          onChangeText={setTextAnswer}
          onOralStarted={handleOralStarted}
          onOralCompleted={handleOralCompleted}
          onValidate={handleValidateAnswer}
          onContinue={handleContinue}
        />
      ) : null}

      {phase === "result" ? (
        <AssessmentResult
          score={score}
          totalAutomaticallyCorrected={totalAutomaticallyCorrected}
          percentage={percentage}
          statusLabel={getStatusLabel(percentage)}
          correctedResults={correctedResults}
          oralResult={oralResult}
          onRestart={handleRestart}
          onBackToPath={() => router.replace("/(tabs)/lessons")}
        />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1120",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 58,
    paddingBottom: 28,
    gap: 22,
  },
  centeredContainer: {
    flex: 1,
    backgroundColor: "#0b1120",
    justifyContent: "center",
    paddingHorizontal: 22,
    gap: 16,
  },
  card: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    gap: 16,
  },
  titleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  titleText: {
    flex: 1,
    minWidth: 220,
  },
  eyebrow: {
    color: "#38bdf8",
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  title: {
    color: "#f8fafc",
    fontSize: 31,
    fontWeight: "900",
    lineHeight: 38,
    marginTop: 6,
  },
  draftBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#3f2d12",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  draftBadgeText: {
    color: "#fbbf24",
    fontSize: 12,
    fontWeight: "900",
  },
  description: {
    color: "#cbd5e1",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 23,
  },
  metaGrid: {
    flexDirection: "row",
    gap: 10,
  },
  metaBox: {
    flex: 1,
    minHeight: 82,
    backgroundColor: "#172033",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  metaValue: {
    color: "#38bdf8",
    fontSize: 24,
    fontWeight: "900",
  },
  metaLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
    textTransform: "uppercase",
  },
  infoBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#123047",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  infoBadgeText: {
    color: "#38bdf8",
    fontSize: 13,
    fontWeight: "900",
  },
  noticeText: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  actions: {
    gap: 10,
  },
  primaryButton: {
    minHeight: 54,
    backgroundColor: "#38bdf8",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  continueButton: {
    backgroundColor: "#22c55e",
  },
  primaryButtonText: {
    color: "#082f49",
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  secondaryButtonText: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  disabledButton: {
    opacity: 0.45,
  },
  questionLayout: {
    gap: 18,
  },
  stepMeta: {
    color: "#38bdf8",
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  sectionDescription: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  instruction: {
    color: "#cbd5e1",
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 23,
  },
  prompt: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 30,
  },
  optionsList: {
    gap: 10,
  },
  listeningBlock: {
    gap: 14,
  },
  scriptCard: {
    backgroundColor: "#172033",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 14,
  },
  scriptTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 24,
  },
  scriptDescription: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  scriptBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#3f2d12",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  scriptBadgeText: {
    color: "#fbbf24",
    fontSize: 12,
    fontWeight: "900",
  },
  turnsList: {
    gap: 10,
  },
  turnCard: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  speakerName: {
    color: "#38bdf8",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  turnText: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 24,
  },
  disabledAudioButton: {
    minHeight: 42,
    borderRadius: 12,
    borderColor: "#334155",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.7,
    paddingHorizontal: 12,
  },
  disabledAudioText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "900",
  },
  oralBlock: {
    gap: 14,
  },
  unscoredBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#172033",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  unscoredBadgeText: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "900",
  },
  oralStatusText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },
  emptyTitle: {
    color: "#f8fafc",
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
  },
  emptyText: {
    color: "#cbd5e1",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 23,
    textAlign: "center",
  },
});
