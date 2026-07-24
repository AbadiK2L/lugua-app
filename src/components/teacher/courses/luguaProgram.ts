import {
  resolveInteractiveLesson,
  shikomoriQuestionsA1Path,
} from "@/src/data/curriculum";
import type { Concept } from "@/src/types/learning";

export const luguaProgramChapter = shikomoriQuestionsA1Path.chapter;
export const luguaProgramLanguage = shikomoriQuestionsA1Path.language;
export const luguaProgramConcepts = luguaProgramChapter.blocks.flatMap(
  (block) => block.concepts,
);
export const luguaProgramSkill = shikomoriQuestionsA1Path.skill;

export function getLuguaConceptSummary(concept: Concept) {
  return concept.examples[0]?.frenchText ?? concept.explanation ?? "";
}

export function hasInteractiveLesson(concept: Concept) {
  return Boolean(resolveInteractiveLesson(concept, luguaProgramChapter)?.enabled);
}

export function getFirstInteractiveConcept() {
  return luguaProgramConcepts.find(hasInteractiveLesson);
}
