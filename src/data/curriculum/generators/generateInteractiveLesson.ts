import type {
  Chapter,
  Concept,
  InteractiveLesson,
  InteractiveLessonChoiceExerciseStep,
  InteractiveLessonLetterBuilderStep,
  InteractiveLessonOption,
  InteractiveLessonStep,
  LearningBlock,
  LearningContext,
  LessonGenerationConfig,
  LinguisticContent,
  LinguisticExample,
  SingleMeaningLessonConfig,
} from "@/src/types/learning";

type DistractorConceptDetails = {
  concept: Concept;
  primaryExample: LinguisticExample;
  primaryContext: LearningContext;
};

const DEFAULT_RESULT = {
  title: "Leçon terminée",
  xpPerCorrectAnswer: 10,
  thresholds: [
    {
      minPercentage: 80,
      label: "Maîtrisé",
    },
    {
      minPercentage: 60,
      label: "En acquisition",
    },
    {
      minPercentage: 0,
      label: "À retravailler",
    },
  ],
};

function getLinguisticMetadata(content: LinguisticContent): LinguisticContent {
  const metadata: LinguisticContent = {
    validationStatus: content.validationStatus,
    source: content.source,
    audioStatus: content.audioStatus,
  };

  if (content.audioUrl !== undefined) {
    metadata.audioUrl = content.audioUrl;
  }

  if (content.speaker !== undefined) {
    metadata.speaker = content.speaker;
  }

  if (content.dialect !== undefined) {
    metadata.dialect = content.dialect;
  }

  if (content.requiresLinguisticReview !== undefined) {
    metadata.requiresLinguisticReview = content.requiresLinguisticReview;
  }

  return metadata;
}

function findBlockForConcept(chapter: Chapter, concept: Concept): LearningBlock | undefined {
  return chapter.blocks.find((block) =>
    block.concepts.some((candidate) => candidate.id === concept.id),
  );
}

function findConceptInChapter(chapter: Chapter, conceptId: string): Concept | undefined {
  for (const block of chapter.blocks) {
    const concept = block.concepts.find((candidate) => candidate.id === conceptId);

    if (concept) {
      return concept;
    }
  }

  return undefined;
}

function findExampleInConcept(
  concept: Concept,
  exampleId: string,
): LinguisticExample | undefined {
  return concept.examples.find((example) => example.id === exampleId);
}

function getPrimaryExample(concept: Concept): LinguisticExample | undefined {
  return concept.examples[0];
}

function findContextInConcept(
  concept: Concept,
  contextId: string,
): LearningContext | undefined {
  return concept.contexts.find((context) => context.id === contextId);
}

function normalizeContextDescription(description: string) {
  return description.trim().replace(/[.?!]+$/g, "").toLocaleLowerCase();
}

function toSituationOption(description: string) {
  return `Tu veux ${normalizeContextDescription(description)}.`;
}

function stripFinalPunctuation(text: string) {
  return text.trim().replace(/[.?!]+$/g, "");
}

function getDiscoveryExampleIds(primaryExampleId: string, exampleIds: string[]) {
  return [primaryExampleId, ...exampleIds].filter(
    (exampleId, index, allExampleIds) => allExampleIds.indexOf(exampleId) === index,
  );
}

function compactText(parts: string[]) {
  return parts
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");
}

function uniqueByText(options: InteractiveLessonOption[]) {
  const seenTexts = new Set<string>();

  return options.filter((option) => {
    const normalizedText = option.text.trim().toLocaleLowerCase();

    if (seenTexts.has(normalizedText)) {
      return false;
    }

    seenTexts.add(normalizedText);
    return true;
  });
}

function createOption(
  id: string,
  text: string,
  explanation: string,
  metadata: LinguisticContent,
  isCorrect = false,
  exampleId?: string,
): InteractiveLessonOption {
  return {
    id,
    text,
    isCorrect,
    exampleId,
    explanation,
    ...metadata,
  };
}

function getDistractorDetails(
  chapter: Chapter,
  distractorConceptIds: string[] | undefined,
): DistractorConceptDetails[] | undefined {
  const details: DistractorConceptDetails[] = [];

  for (const conceptId of distractorConceptIds ?? []) {
    const concept = findConceptInChapter(chapter, conceptId);

    if (!concept) {
      return undefined;
    }

    const primaryExample = getPrimaryExample(concept);
    const primaryContext = concept.contexts[0];

    if (!primaryExample || !primaryContext) {
      return undefined;
    }

    details.push({
      concept,
      primaryExample,
      primaryContext,
    });
  }

  return details;
}

function findConceptKeyRange(text: string, conceptKey: string) {
  const start = text.toLocaleLowerCase().indexOf(conceptKey.toLocaleLowerCase());

  if (start === -1) {
    return undefined;
  }

  return {
    start,
    end: start + conceptKey.length,
  };
}

function buildFillBlankPrompt(
  example: LinguisticExample,
  concept: Concept,
): string | undefined {
  const range = findConceptKeyRange(example.targetLanguageText, concept.key);

  if (!range) {
    return undefined;
  }

  const before = example.targetLanguageText.slice(0, range.start);
  const after = example.targetLanguageText.slice(range.end);

  return compactText([before, "______", after]);
}

function buildLetterSentenceParts(
  example: LinguisticExample,
  concept: Concept,
): Pick<
  InteractiveLessonLetterBuilderStep,
  "sentenceBefore" | "sentenceAfter"
> | undefined {
  const range = findConceptKeyRange(example.targetLanguageText, concept.key);

  if (!range) {
    return undefined;
  }

  return {
    sentenceBefore: example.targetLanguageText.slice(0, range.start).trim(),
    sentenceAfter: example.targetLanguageText.slice(range.end).trim(),
  };
}

function shouldGenerateExercise(
  config: SingleMeaningLessonConfig,
  exerciseKey: keyof NonNullable<SingleMeaningLessonConfig["exercises"]>,
) {
  return config.exercises?.[exerciseKey] !== false;
}

function buildContextStep(
  concept: Concept,
  config: SingleMeaningLessonConfig,
  usageExplanation: string,
  metadata: LinguisticContent,
  distractors: DistractorConceptDetails[],
): InteractiveLessonChoiceExerciseStep {
  const correctOption = createOption(
    `${concept.id}-generated-context-correct`,
    config.usages[0].situationPrompt,
    usageExplanation,
    metadata,
    true,
  );
  const distractorOptions = distractors.map((distractor) =>
    createOption(
      `${concept.id}-generated-context-distractor-${distractor.concept.id}`,
      toSituationOption(distractor.primaryContext.description),
      usageExplanation,
      metadata,
      false,
      distractor.primaryExample.id,
    ),
  );
  const options = uniqueByText([correctOption, ...distractorOptions]);

  return {
    id: `${concept.id}-generated-context`,
    type: "exercise",
    exerciseType: "context_choice",
    title: "Reconnaissance du contexte",
    prompt: `Dans quelle situation utiliserais-tu « ${concept.title} » ?`,
    options,
    correctOptionId: correctOption.id,
    feedbackExplanation: usageExplanation,
    ...metadata,
  };
}

function buildRecognitionStep(
  concept: Concept,
  config: SingleMeaningLessonConfig,
  primaryExample: LinguisticExample,
  usageExplanation: string,
  metadata: LinguisticContent,
  distractors: DistractorConceptDetails[],
): InteractiveLessonChoiceExerciseStep {
  const correctOption = createOption(
    `${concept.id}-generated-meaning-correct`,
    config.usages[0].meaning,
    usageExplanation,
    metadata,
    true,
    primaryExample.id,
  );
  const distractorOptions = distractors
    .filter(
      (distractor) =>
        distractor.primaryExample.frenchText.trim().toLocaleLowerCase() !==
        config.usages[0].meaning.trim().toLocaleLowerCase(),
    )
    .map((distractor) =>
      createOption(
        `${concept.id}-generated-meaning-distractor-${distractor.concept.id}`,
        distractor.primaryExample.frenchText,
        usageExplanation,
        metadata,
        false,
        distractor.primaryExample.id,
      ),
    );
  const options = uniqueByText([correctOption, ...distractorOptions]);

  return {
    id: `${concept.id}-generated-meaning`,
    type: "exercise",
    exerciseType: "recognition",
    interactionType: options.length === 4 ? "answer_card_grid" : undefined,
    title: "Reconnaître le sens",
    prompt: `Que signifie « ${primaryExample.targetLanguageText} » ?`,
    options,
    correctOptionId: correctOption.id,
    feedbackExplanation: usageExplanation,
    ...metadata,
  };
}

function buildFillBlankStep(
  concept: Concept,
  primaryExample: LinguisticExample,
  usageExplanation: string,
  metadata: LinguisticContent,
  distractors: DistractorConceptDetails[],
): InteractiveLessonChoiceExerciseStep | undefined {
  const prompt = buildFillBlankPrompt(primaryExample, concept);

  if (!prompt) {
    return undefined;
  }

  const correctOption = createOption(
    `${concept.id}-generated-fill-blank-correct`,
    concept.key,
    usageExplanation,
    metadata,
    true,
    primaryExample.id,
  );
  const distractorOptions = distractors.map((distractor) =>
    createOption(
      `${concept.id}-generated-fill-blank-distractor-${distractor.concept.id}`,
      distractor.concept.key,
      usageExplanation,
      metadata,
      false,
      distractor.primaryExample.id,
    ),
  );
  const options = uniqueByText([correctOption, ...distractorOptions]);

  return {
    id: `${concept.id}-generated-fill-blank`,
    type: "exercise",
    interactionType: options.length === 4 ? "answer_card_grid" : undefined,
    exerciseType: "fill_blank",
    title: "Phrase à compléter",
    prompt,
    options,
    correctOptionId: correctOption.id,
    feedbackExplanation: usageExplanation,
    ...metadata,
  };
}

function buildLetterBuilderStep(
  concept: Concept,
  config: SingleMeaningLessonConfig,
  primaryExample: LinguisticExample,
  metadata: LinguisticContent,
): InteractiveLessonLetterBuilderStep | undefined {
  const sentenceParts = buildLetterSentenceParts(primaryExample, concept);

  if (!sentenceParts) {
    return undefined;
  }

  const expectedAnswer = concept.key.toLocaleUpperCase();
  const meaning = stripFinalPunctuation(config.usages[0].meaning).toLocaleLowerCase();

  return {
    id: `${concept.id}-generated-letter-builder`,
    type: "exercise",
    interactionType: "letter_builder",
    exerciseType: "translation_to_target",
    title: "Construction avec lettres",
    instruction: `Construis le mot qui signifie « ${meaning} ».`,
    sentenceBefore: sentenceParts.sentenceBefore,
    sentenceAfter: sentenceParts.sentenceAfter,
    letterBank: [
      ...Array.from(expectedAnswer),
      ...(config.letterDistractors ?? []).map((letter) => letter.toLocaleUpperCase()),
    ],
    expectedAnswer,
    slotCount: Array.from(expectedAnswer).length,
    completedText: primaryExample.targetLanguageText,
    correctConstructionText: primaryExample.targetLanguageText,
    explanation: config.usages[0].explanation,
    ...metadata,
  };
}

function buildDirectThinkingStep(
  concept: Concept,
  config: SingleMeaningLessonConfig,
  primaryExample: LinguisticExample,
  usageExplanation: string,
  metadata: LinguisticContent,
  distractors: DistractorConceptDetails[],
): InteractiveLessonChoiceExerciseStep {
  const correctOption = createOption(
    `${concept.id}-generated-direct-thinking-correct`,
    primaryExample.targetLanguageText,
    usageExplanation,
    metadata,
    true,
    primaryExample.id,
  );
  const distractorOptions = distractors.map((distractor) =>
    createOption(
      `${concept.id}-generated-direct-thinking-distractor-${distractor.concept.id}`,
      distractor.primaryExample.targetLanguageText,
      usageExplanation,
      metadata,
      false,
      distractor.primaryExample.id,
    ),
  );
  const options = uniqueByText([correctOption, ...distractorOptions]);
  const isStandaloneQuestionWord =
    stripFinalPunctuation(primaryExample.targetLanguageText).toLocaleLowerCase() ===
    concept.key.toLocaleLowerCase();

  return {
    id: `${concept.id}-generated-direct-thinking`,
    type: "exercise",
    exerciseType: "direct_thinking",
    title: "Pensée directe",
    prompt: config.usages[0].situationPrompt,
    question: isStandaloneQuestionWord ? "Quel mot dois-tu utiliser ?" : "Que dois-tu dire ?",
    options,
    correctOptionId: correctOption.id,
    feedbackExplanation: usageExplanation,
    ...metadata,
  };
}

function generateSingleMeaningLesson(
  concept: Concept,
  config: SingleMeaningLessonConfig,
  chapter: Chapter,
): InteractiveLesson | undefined {
  const block = findBlockForConcept(chapter, concept);
  const primaryExample = findExampleInConcept(concept, config.primaryExampleId);
  const usage = config.usages[0];
  const usageContext = findContextInConcept(concept, usage.contextId);
  const usageExamplesExist = usage.exampleIds.every((exampleId) =>
    findExampleInConcept(concept, exampleId),
  );
  const discoveryExampleIds = getDiscoveryExampleIds(
    config.primaryExampleId,
    usage.exampleIds,
  );
  const distractors = getDistractorDetails(chapter, config.distractorConceptIds);

  if (!block || !primaryExample || !usageContext || !usageExamplesExist || !distractors) {
    return undefined;
  }

  const metadata = getLinguisticMetadata(concept);
  const usageExplanation = usage.explanation;
  const steps: InteractiveLessonStep[] = [
    {
      id: `${concept.id}-generated-objective`,
      type: "objective",
      title: config.objectiveTitle ?? block.title,
      objective:
        config.objective ??
        `Découvrir ${concept.title} et savoir l'utiliser dans une situation simple.`,
      actionLabel: "Découvrir",
      ...metadata,
    },
    {
      id: `${concept.id}-generated-discovery`,
      type: "discovery",
      title: "Découverte",
      exampleIds: discoveryExampleIds,
      explanation: usageExplanation,
      audioLabel: "Audio bientôt disponible",
      actionLabel: "Continuer",
      ...metadata,
    },
  ];

  if (shouldGenerateExercise(config, "contextChoice")) {
    steps.push(buildContextStep(concept, config, usageExplanation, metadata, distractors));
  }

  if (shouldGenerateExercise(config, "recognition")) {
    steps.push(
      buildRecognitionStep(
        concept,
        config,
        primaryExample,
        usageExplanation,
        metadata,
        distractors,
      ),
    );
  }

  if (shouldGenerateExercise(config, "fillBlank")) {
    const fillBlankStep = buildFillBlankStep(
      concept,
      primaryExample,
      usageExplanation,
      metadata,
      distractors,
    );

    if (!fillBlankStep) {
      return undefined;
    }

    steps.push(fillBlankStep);
  }

  if (shouldGenerateExercise(config, "letterBuilder")) {
    const letterBuilderStep = buildLetterBuilderStep(
      concept,
      config,
      primaryExample,
      metadata,
    );

    if (!letterBuilderStep) {
      return undefined;
    }

    steps.push(letterBuilderStep);
  }

  if (shouldGenerateExercise(config, "directThinking")) {
    steps.push(
      buildDirectThinkingStep(
        concept,
        config,
        primaryExample,
        usageExplanation,
        metadata,
        distractors,
      ),
    );
  }

  return {
    id: `${concept.id}-generated-lesson`,
    conceptId: concept.id,
    title: `Leçon interactive - ${concept.title}`,
    enabled: true,
    unavailableMessage: "Cette leçon interactive sera bientôt disponible.",
    steps,
    result: DEFAULT_RESULT,
    ...metadata,
  };
}

export function generateInteractiveLesson(
  concept: Concept,
  config: LessonGenerationConfig,
  chapter: Chapter,
): InteractiveLesson | undefined {
  if (config.template !== "single_meaning") {
    return undefined;
  }

  return generateSingleMeaningLesson(concept, config, chapter);
}

export function resolveInteractiveLesson(
  concept: Concept,
  chapter: Chapter,
): InteractiveLesson | undefined {
  if (concept.interactiveLesson) {
    return concept.interactiveLesson;
  }

  if (!concept.lessonConfig) {
    return undefined;
  }

  return generateInteractiveLesson(concept, concept.lessonConfig, chapter);
}
