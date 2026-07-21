import { shikomoriQuestionsA1Path } from "./shikomori/questions-a1";
import type {
  Assessment,
  Chapter,
  Concept,
  LearningBlock,
  LinguisticExample,
} from "../../types/learning";

export type ConceptDetails = {
  chapter: Chapter;
  block: LearningBlock;
  concept: Concept;
};

export type AssessmentDetails = {
  chapter: Chapter;
  assessment: Assessment;
};

export function findConceptDetails(conceptId: string | undefined): ConceptDetails | undefined {
  if (!conceptId) {
    return undefined;
  }

  const chapter = shikomoriQuestionsA1Path.chapter;

  for (const block of chapter.blocks) {
    const concept = block.concepts.find((candidate) => candidate.id === conceptId);

    if (concept) {
      return {
        chapter,
        block,
        concept,
      };
    }
  }

  return undefined;
}

export function findAssessmentDetails(
  assessmentId: string | undefined,
): AssessmentDetails | undefined {
  if (!assessmentId) {
    return undefined;
  }

  const chapter = shikomoriQuestionsA1Path.chapter;
  const assessment = chapter.assessments?.find(
    (candidate) => candidate.id === assessmentId,
  );

  if (!assessment) {
    return undefined;
  }

  return {
    chapter,
    assessment,
  };
}

export function findExampleById(
  concept: Concept,
  exampleId: string,
): LinguisticExample | undefined {
  return concept.examples.find((example) => example.id === exampleId);
}
