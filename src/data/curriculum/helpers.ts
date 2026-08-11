import {
  findAssessmentInCurriculum,
  findConceptInCurriculum,
  type CurriculumAssessmentDetails,
  type CurriculumConceptDetails,
} from "./registry";
import type {
  Concept,
  LinguisticExample,
} from "../../types/learning";

export type ConceptDetails = CurriculumConceptDetails;

export type AssessmentDetails = CurriculumAssessmentDetails;

export function findConceptDetails(conceptId: string | undefined): ConceptDetails | undefined {
  return findConceptInCurriculum(conceptId);
}

export function findAssessmentDetails(
  assessmentId: string | undefined,
): AssessmentDetails | undefined {
  return findAssessmentInCurriculum(assessmentId);
}

export function findExampleById(
  concept: Concept,
  exampleId: string,
): LinguisticExample | undefined {
  return concept.examples.find((example) => example.id === exampleId);
}
