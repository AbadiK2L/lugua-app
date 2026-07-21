import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { AnswerCard } from "@/src/components/learning/AnswerCard";
import { AnswerOption } from "@/src/components/learning/AnswerOption";
import { LessonFeedback } from "@/src/components/learning/LessonFeedback";
import { LessonHeader } from "@/src/components/learning/LessonHeader";
import { LetterBuilder } from "@/src/components/learning/LetterBuilder";
import {
  findConceptDetails,
  findExampleById,
  resolveInteractiveLesson,
} from "@/src/data/curriculum";
import type {
  InteractiveLesson,
  InteractiveLessonChoiceExerciseStep,
  InteractiveLessonDiscoveryStep,
  InteractiveLessonExerciseStep,
  InteractiveLessonLetterBuilderStep,
  InteractiveLessonObjectiveStep,
  InteractiveLessonOption,
  InteractiveLessonResultThreshold,
  InteractiveLessonStep,
} from "@/src/types/learning";

const UNAVAILABLE_MESSAGE = "Cette leçon interactive sera bientôt disponible.";

function normalizeParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getExerciseSteps(lesson: InteractiveLesson) {
  return lesson.steps.filter(
    (step): step is InteractiveLessonExerciseStep => step.type === "exercise",
  );
}

function getResultLabel(
  thresholds: InteractiveLessonResultThreshold[],
  percentage: number,
) {
  const sortedThresholds = [...thresholds].sort(
    (first, second) => second.minPercentage - first.minPercentage,
  );

  return (
    sortedThresholds.find((threshold) => percentage >= threshold.minPercentage)?.label ??
    ""
  );
}

function getSelectedOption(
  step: InteractiveLessonChoiceExerciseStep,
  selectedOptionId: string | null,
) {
  return step.options.find((option) => option.id === selectedOptionId);
}

function isLetterBuilderStep(
  step: InteractiveLessonExerciseStep,
): step is InteractiveLessonLetterBuilderStep {
  return step.interactionType === "letter_builder";
}

function renderMissingConcept() {
  return (
    <View style={styles.centeredContainer}>
      <Text style={styles.emptyTitle}>Concept introuvable</Text>
      <Text style={styles.emptyText}>
        Aucun concept local ne correspond à cet identifiant.
      </Text>
      <TouchableOpacity activeOpacity={0.85} style={styles.secondaryButton} onPress={router.back}>
        <Text style={styles.secondaryButtonText}>Retour</Text>
      </TouchableOpacity>
    </View>
  );
}

function renderUnavailableLesson(message: string) {
  return (
    <View style={styles.centeredContainer}>
      <Text style={styles.emptyTitle}>Bientôt disponible</Text>
      <Text style={styles.emptyText}>{message}</Text>
      <TouchableOpacity activeOpacity={0.85} style={styles.secondaryButton} onPress={router.back}>
        <Text style={styles.secondaryButtonText}>Retour au concept</Text>
      </TouchableOpacity>
    </View>
  );
}

type LessonContentProps = {
  lesson: InteractiveLesson;
  step: InteractiveLessonStep;
  selectedOptionId: string | null;
  isValidated: boolean;
  onSelectOption: (option: InteractiveLessonOption) => void;
  onValidate: () => void;
  onLetterValidation: (isCorrect: boolean, builtAnswer: string) => void;
  onContinue: () => void;
};

function LessonContent({
  lesson,
  step,
  selectedOptionId,
  isValidated,
  onSelectOption,
  onValidate,
  onLetterValidation,
  onContinue,
}: LessonContentProps) {
  if (step.type === "objective") {
    return <ObjectiveStep step={step} onContinue={onContinue} />;
  }

  if (step.type === "discovery") {
    return <DiscoveryStep lesson={lesson} step={step} onContinue={onContinue} />;
  }

  if (isLetterBuilderStep(step)) {
    return (
      <LetterBuilderStep
        step={step}
        isValidated={isValidated}
        onValidation={onLetterValidation}
        onContinue={onContinue}
      />
    );
  }

  return (
    <ExerciseStep
      step={step}
      selectedOptionId={selectedOptionId}
      isValidated={isValidated}
      onSelectOption={onSelectOption}
      onValidate={onValidate}
      onContinue={onContinue}
    />
  );
}

type ObjectiveStepProps = {
  step: InteractiveLessonObjectiveStep;
  onContinue: () => void;
};

function ObjectiveStep({ step, onContinue }: ObjectiveStepProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.stepTitle}>{step.title}</Text>
      <Text style={styles.objectiveText}>{step.objective}</Text>
      <TouchableOpacity activeOpacity={0.85} style={styles.primaryButton} onPress={onContinue}>
        <Text style={styles.primaryButtonText}>{step.actionLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

type DiscoveryStepProps = {
  lesson: InteractiveLesson;
  step: InteractiveLessonDiscoveryStep;
  onContinue: () => void;
};

function DiscoveryStep({ lesson, step, onContinue }: DiscoveryStepProps) {
  const conceptDetails = findConceptDetails(lesson.conceptId);
  const examples = conceptDetails
    ? step.exampleIds
        .map((exampleId) => findExampleById(conceptDetails.concept, exampleId))
        .filter((example) => example !== undefined)
    : [];

  const mainExample = examples[0];
  const supportingExample = examples[1];
  const isAudioDisabled = step.audioStatus === "missing" || !step.audioUrl;

  return (
    <View style={styles.card}>
      <Text style={styles.stepTitle}>{step.title}</Text>

      {mainExample ? (
        <View style={styles.discoveryBlock}>
          <Text style={styles.targetText}>{mainExample.targetLanguageText}</Text>
          <Text style={styles.translationText}>{mainExample.frenchText}</Text>
        </View>
      ) : null}

      {supportingExample ? (
        <View style={styles.compactExample}>
          <Text style={styles.compactTarget}>{supportingExample.targetLanguageText}</Text>
          <Text style={styles.arrow}>→</Text>
          <Text style={styles.compactFrench}>{supportingExample.frenchText}</Text>
        </View>
      ) : null}

      {step.explanation ? <Text style={styles.discoveryExplanation}>{step.explanation}</Text> : null}

      <TouchableOpacity
        activeOpacity={isAudioDisabled ? 1 : 0.85}
        disabled={isAudioDisabled}
        style={[styles.audioButton, isAudioDisabled && styles.disabledAudioButton]}
      >
        <Text style={styles.audioButtonText}>{step.audioLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={0.85} style={styles.primaryButton} onPress={onContinue}>
        <Text style={styles.primaryButtonText}>{step.actionLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

type ExerciseStepProps = {
  step: InteractiveLessonChoiceExerciseStep;
  selectedOptionId: string | null;
  isValidated: boolean;
  onSelectOption: (option: InteractiveLessonOption) => void;
  onValidate: () => void;
  onContinue: () => void;
};

function ExerciseStep({
  step,
  selectedOptionId,
  isValidated,
  onSelectOption,
  onValidate,
  onContinue,
}: ExerciseStepProps) {
  const selectedOption = getSelectedOption(step, selectedOptionId);
  const isCorrect = selectedOption?.id === step.correctOptionId;
  const explanation = selectedOption
    ? step.feedbackExplanation ?? selectedOption.explanation
    : "";
  const usesCardGrid = step.interactionType === "answer_card_grid";

  return (
    <View style={styles.card}>
      <Text style={styles.stepTitle}>{step.title}</Text>

      {step.instruction ? <Text style={styles.instruction}>{step.instruction}</Text> : null}

      <Text style={styles.prompt}>{step.prompt}</Text>

      {step.question ? <Text style={styles.question}>{step.question}</Text> : null}

      <View style={usesCardGrid ? styles.answerCardGrid : styles.optionsList}>
        {step.options.map((option) =>
          usesCardGrid ? (
            <AnswerCard
              key={option.id}
              text={option.text}
              selected={option.id === selectedOptionId}
              disabled={isValidated}
              isCorrect={option.id === step.correctOptionId}
              showResult={isValidated}
              onPress={() => onSelectOption(option)}
            />
          ) : (
            <AnswerOption
              key={option.id}
              text={option.text}
              selected={option.id === selectedOptionId}
              disabled={isValidated}
              isCorrect={option.id === step.correctOptionId}
              showResult={isValidated}
              onPress={() => onSelectOption(option)}
            />
          ),
        )}
      </View>

      {isValidated && selectedOption ? (
        <LessonFeedback isCorrect={isCorrect} explanation={explanation} />
      ) : null}

      <TouchableOpacity
        activeOpacity={0.85}
        disabled={!selectedOptionId}
        style={[
          styles.primaryButton,
          !selectedOptionId && styles.disabledButton,
          isValidated && styles.continueButton,
        ]}
        onPress={isValidated ? onContinue : onValidate}
      >
        <Text style={styles.primaryButtonText}>
          {isValidated ? "Continuer" : "Valider"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

type LetterBuilderStepProps = {
  step: InteractiveLessonLetterBuilderStep;
  isValidated: boolean;
  onValidation: (isCorrect: boolean, builtAnswer: string) => void;
  onContinue: () => void;
};

function LetterBuilderStep({
  step,
  isValidated,
  onValidation,
  onContinue,
}: LetterBuilderStepProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.stepTitle}>{step.title}</Text>
      <Text style={styles.instruction}>{step.instruction}</Text>
      <LetterBuilder
        letters={step.letterBank}
        expectedAnswer={step.expectedAnswer}
        slotCount={step.slotCount}
        sentenceBefore={step.sentenceBefore}
        sentenceAfter={step.sentenceAfter}
        completedText={step.completedText}
        correctConstructionText={step.correctConstructionText}
        explanation={step.explanation}
        validated={isValidated}
        onValidation={onValidation}
        onContinue={onContinue}
      />
    </View>
  );
}

type ResultContentProps = {
  lesson: InteractiveLesson;
  score: number;
  totalExercises: number;
  conceptId: string;
  onRestart: () => void;
};

function ResultContent({
  lesson,
  score,
  totalExercises,
  conceptId,
  onRestart,
}: ResultContentProps) {
  const percentage =
    totalExercises > 0 ? Math.round((score / totalExercises) * 100) : 0;
  const xp = score * lesson.result.xpPerCorrectAnswer;
  const status = getResultLabel(lesson.result.thresholds, percentage);

  return (
    <View style={styles.card}>
      <Text style={styles.resultTitle}>{lesson.result.title}</Text>

      <View style={styles.resultGrid}>
        <View style={styles.resultBox}>
          <Text style={styles.resultValue}>
            {score}/{totalExercises}
          </Text>
          <Text style={styles.resultLabel}>Bonnes réponses</Text>
        </View>
        <View style={styles.resultBox}>
          <Text style={styles.resultValue}>{percentage}%</Text>
          <Text style={styles.resultLabel}>Réussite</Text>
        </View>
        <View style={styles.resultBox}>
          <Text style={styles.resultValue}>+{xp}</Text>
          <Text style={styles.resultLabel}>XP gagnés</Text>
        </View>
        <View style={styles.resultBox}>
          <Text style={styles.resultValue}>{status}</Text>
          <Text style={styles.resultLabel}>Statut</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity activeOpacity={0.85} style={styles.primaryButton} onPress={onRestart}>
          <Text style={styles.primaryButtonText}>Recommencer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.secondaryButton}
          onPress={() =>
            router.replace({
              pathname: "../concept/[id]",
              params: {
                id: conceptId,
              },
            })
          }
        >
          <Text style={styles.secondaryButtonText}>Retour au concept</Text>
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

export default function LessonScreen() {
  const params = useLocalSearchParams<{ conceptId?: string | string[] }>();
  const conceptId = normalizeParam(params.conceptId);
  const details = findConceptDetails(conceptId);
  const concept = details?.concept;
  const chapter = details?.chapter;
  const lesson = useMemo(
    () => (concept && chapter ? resolveInteractiveLesson(concept, chapter) : undefined),
    [concept, chapter],
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isValidated, setIsValidated] = useState(false);
  const [score, setScore] = useState(0);

  const exerciseSteps = lesson ? getExerciseSteps(lesson) : [];

  if (!details || !conceptId) {
    return renderMissingConcept();
  }

  if (!lesson?.enabled) {
    return renderUnavailableLesson(lesson?.unavailableMessage ?? UNAVAILABLE_MESSAGE);
  }

  const totalSteps = lesson.steps.length + 1;
  const isResultStep = stepIndex >= lesson.steps.length;
  const currentStepNumber = isResultStep ? totalSteps : stepIndex + 1;
  const currentStep = lesson.steps[stepIndex];

  function handleSelectOption(option: InteractiveLessonOption) {
    if (isValidated) {
      return;
    }

    setSelectedOptionId(option.id);
  }

  function handleValidate() {
    if (
      !currentStep ||
      currentStep.type !== "exercise" ||
      isLetterBuilderStep(currentStep) ||
      !selectedOptionId ||
      isValidated
    ) {
      return;
    }

    setIsValidated(true);

    if (selectedOptionId === currentStep.correctOptionId) {
      setScore((currentScore) => currentScore + 1);
    }
  }

  function handleLetterValidation(isCorrect: boolean) {
    if (isValidated) {
      return;
    }

    setIsValidated(true);

    if (isCorrect) {
      setScore((currentScore) => currentScore + 1);
    }
  }

  function handleContinue() {
    setStepIndex((currentIndex) => currentIndex + 1);
    setSelectedOptionId(null);
    setIsValidated(false);
  }

  function handleRestart() {
    setStepIndex(0);
    setSelectedOptionId(null);
    setIsValidated(false);
    setScore(0);
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity activeOpacity={0.85} style={styles.backButton} onPress={router.back}>
        <Text style={styles.backButtonText}>Retour</Text>
      </TouchableOpacity>

      <LessonHeader
        currentStep={currentStepNumber}
        totalSteps={totalSteps}
        title={lesson.title}
      />

      {isResultStep ? (
        <ResultContent
          lesson={lesson}
          score={score}
          totalExercises={exerciseSteps.length}
          conceptId={conceptId}
          onRestart={handleRestart}
        />
      ) : (
        <LessonContent
          lesson={lesson}
          step={currentStep}
          selectedOptionId={selectedOptionId}
          isValidated={isValidated}
          onSelectOption={handleSelectOption}
          onValidate={handleValidate}
          onLetterValidation={handleLetterValidation}
          onContinue={handleContinue}
        />
      )}
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
  backButton: {
    alignSelf: "flex-start",
    minHeight: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  backButtonText: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "800",
  },
  card: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    gap: 18,
  },
  stepTitle: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 30,
  },
  objectiveText: {
    color: "#cbd5e1",
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 26,
  },
  discoveryBlock: {
    gap: 8,
  },
  targetText: {
    color: "#f8fafc",
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 38,
  },
  translationText: {
    color: "#cbd5e1",
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 25,
  },
  compactExample: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#172033",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  compactTarget: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "900",
  },
  arrow: {
    color: "#38bdf8",
    fontSize: 17,
    fontWeight: "900",
  },
  compactFrench: {
    color: "#cbd5e1",
    fontSize: 17,
    fontWeight: "800",
  },
  discoveryExplanation: {
    color: "#cbd5e1",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
  },
  audioButton: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  disabledAudioButton: {
    opacity: 0.72,
  },
  audioButtonText: {
    color: "#94a3b8",
    fontSize: 15,
    fontWeight: "900",
  },
  instruction: {
    color: "#94a3b8",
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 21,
  },
  prompt: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 30,
  },
  question: {
    color: "#cbd5e1",
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 24,
  },
  optionsList: {
    gap: 10,
  },
  answerCardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
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
  disabledButton: {
    opacity: 0.45,
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
  resultTitle: {
    color: "#f8fafc",
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
  },
  resultGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  resultBox: {
    flexGrow: 1,
    flexBasis: "45%",
    minHeight: 94,
    backgroundColor: "#172033",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  resultValue: {
    color: "#38bdf8",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  resultLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 6,
  },
  actions: {
    gap: 10,
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
