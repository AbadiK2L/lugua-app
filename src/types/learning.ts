export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type MasteryStatus =
  | "not_started"
  | "learning"
  | "needs_revision"
  | "mastered";

export type ExerciseType =
  | "recognition"
  | "multiple_choice"
  | "context_choice"
  | "fill_blank"
  | "translation_to_french"
  | "translation_to_target"
  | "direct_thinking"
  | "listening"
  | "speaking"
  | "conversation";

export type ValidationStatus = "draft" | "reviewed" | "validated";

export type ContentSource =
  | "user_provided"
  | "orelc"
  | "teacher"
  | "editorial";

export type LinguisticContent = {
  validationStatus: ValidationStatus;
  source: ContentSource;
  dialect?: string;
  requiresLinguisticReview?: boolean;
};

export type Language = {
  id: string;
  name: string;
  autonym?: string;
  code?: string;
  levels: LanguageLevel[];
};

export type LanguageLevel = {
  id: string;
  languageId: string;
  level: CEFRLevel;
  title: string;
  description?: string;
  skills: Skill[];
};

export type Skill = {
  id: string;
  languageId: string;
  levelId: string;
  title: string;
  description?: string;
  chapters: Chapter[];
};

export type Chapter = LinguisticContent & {
  id: string;
  languageId: string;
  level: CEFRLevel;
  skillId: string;
  title: string;
  description?: string;
  blocks: LearningBlock[];
  assessments?: Assessment[];
};

export type LearningBlock = LinguisticContent & {
  id: string;
  chapterId: string;
  title: string;
  objective?: string;
  concepts: Concept[];
  exercises?: Exercise[];
};

export type Concept = LinguisticContent & {
  id: string;
  blockId: string;
  key: string;
  title: string;
  explanation?: string;
  examples: LinguisticExample[];
  contexts: LearningContext[];
  exercises: Exercise[];
};

export type LinguisticExample = LinguisticContent & {
  id: string;
  targetLanguageText: string;
  frenchText: string;
  contextId?: string;
  notes?: string;
};

export type LearningContext = LinguisticContent & {
  id: string;
  conceptId: string;
  label: string;
  description: string;
  exampleIds: string[];
};

export type ExerciseOption = LinguisticContent & {
  id: string;
  text: string;
  isCorrect?: boolean;
  exampleId?: string;
};

export type ConversationScriptTurn = LinguisticContent & {
  id: string;
  speaker: string;
  text?: string;
  description?: string;
  exampleId?: string;
};

export type ConversationScript = LinguisticContent & {
  id: string;
  title?: string;
  description: string;
  turns: ConversationScriptTurn[];
};

export type Exercise = LinguisticContent & {
  id: string;
  type: ExerciseType;
  instruction: string;
  prompt: string;
  conceptId?: string;
  contextId?: string;
  exampleId?: string;
  targetLanguageText?: string;
  frenchText?: string;
  options?: ExerciseOption[];
  correctOptionId?: string;
  expectedAnswer?: string;
  acceptedAnswers?: string[];
  script?: ConversationScript;
  scoreCategoryIds?: string[];
  notes?: string;
};

export type AssessmentScoreCategory = {
  id: string;
  label: string;
  maxScore: number;
  description?: string;
};

export type AssessmentSection = LinguisticContent & {
  id: string;
  title: string;
  description?: string;
  scoreCategoryIds: string[];
  exercises: Exercise[];
};

export type Assessment = LinguisticContent & {
  id: string;
  chapterId: string;
  languageId: string;
  level: CEFRLevel;
  title: string;
  description?: string;
  deliveryMode: "local";
  supportsAudioRecording: boolean;
  supportsAutomaticCorrection: boolean;
  scoreCategories: AssessmentScoreCategory[];
  sections: AssessmentSection[];
};

export type MasteryProgressScope =
  | "language"
  | "level"
  | "skill"
  | "chapter"
  | "block"
  | "concept"
  | "exercise"
  | "assessment";

export type MasteryMetric = {
  attempts: number;
  correctAnswers: number;
  totalAnswers: number;
  accuracy?: number;
  lastPracticedAt?: string;
  nextReviewAt?: string;
};

export type MasteryProgress = {
  id: string;
  learnerId: string;
  scope: MasteryProgressScope;
  entityId: string;
  status: MasteryStatus;
  startedAt?: string;
  updatedAt: string;
  masteredAt?: string;
  metrics: MasteryMetric;
  exerciseTypeProgress?: Partial<Record<ExerciseType, MasteryMetric>>;
  childProgress?: MasteryProgress[];
  notes?: string;
};
