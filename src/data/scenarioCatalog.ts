import { dictionaryEntries, normalizeDictionaryText } from "@/src/data/dictionary";
import { shikomoriQuestionsA1Chapter } from "@/src/data/curriculum/shikomori/questions-a1";
import type { Concept } from "@/src/types/learning";
import type { ScenarioCardData } from "@/src/types/scenarios";

function isCommerceConcept(concept: Concept) {
  return concept.contexts.some((context) => {
    const contextText = normalizeDictionaryText(
      `${context.label} ${context.description}`,
    );

    return contextText.includes("prix") || contextText.includes("commercial");
  });
}

const commerceConcepts = shikomoriQuestionsA1Chapter.blocks
  .flatMap((block) => block.concepts)
  .filter(isCommerceConcept);

const commerceEntries = commerceConcepts
  .map((concept) =>
    dictionaryEntries.find((entry) => entry.id === concept.id),
  )
  .filter((entry) => entry !== undefined);

const firstAvailableEntry = commerceEntries.find(
  (entry) => entry.lessonAvailable && entry.conceptId,
);

const commerceTags = commerceConcepts.flatMap((concept) => [
  concept.title,
  ...concept.contexts.flatMap((context) => [context.label, context.description]),
]);

export const scenarioCatalog: ScenarioCardData[] =
  commerceConcepts.length > 0
    ? [
        {
          id: "commerce-prix",
          title: "Au marché",
          description: "Apprendre à demander un prix et comprendre une réponse.",
          category: "commerce",
          level: shikomoriQuestionsA1Chapter.level,
          conceptIds: commerceConcepts.map((concept) => concept.id),
          conceptLabels: commerceConcepts.map((concept) => concept.title),
          tags: commerceTags,
          availability: firstAvailableEntry ? "available" : "coming_soon",
          ...(firstAvailableEntry?.conceptId
            ? { lessonConceptId: firstAvailableEntry.conceptId }
            : {}),
        },
      ]
    : [];
