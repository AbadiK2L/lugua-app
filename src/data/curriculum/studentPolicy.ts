import type { Concept, ValidationStatus } from "../../types/learning";

export const STUDENT_CURRICULUM_POLICY = {
  phase: "pilot",
  allowedValidationStatuses: [
    "draft",
    "reviewed",
    "validated",
  ] satisfies readonly ValidationStatus[],
} as const;

export function isConceptAllowedForStudent(
  concept: Pick<Concept, "validationStatus">,
) {
  return STUDENT_CURRICULUM_POLICY.allowedValidationStatuses.some(
    (status) => status === concept.validationStatus,
  );
}
