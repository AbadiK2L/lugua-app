import { shikomoriQuestionsA1Path } from "./shikomori/questions-a1";
import type { Concept, LearningBlock, LinguisticExample } from "../../types/learning";

export type ConceptDetails = {
  block: LearningBlock;
  concept: Concept;
};

export function findConceptDetails(conceptId: string | undefined): ConceptDetails | undefined {
  if (!conceptId) {
    return undefined;
  }

  for (const block of shikomoriQuestionsA1Path.chapter.blocks) {
    const concept = block.concepts.find((candidate) => candidate.id === conceptId);

    if (concept) {
      return {
        block,
        concept,
      };
    }
  }

  return undefined;
}

export function findExampleById(
  concept: Concept,
  exampleId: string,
): LinguisticExample | undefined {
  return concept.examples.find((example) => example.id === exampleId);
}
