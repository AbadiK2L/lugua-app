import { resolveInteractiveLesson } from "./generators/generateInteractiveLesson";
import {
  findConceptInChapter,
  getCurriculumChapter,
  type CurriculumChapterDetails,
} from "./registry";
import { isConceptAllowedForStudent } from "./studentPolicy";

export type ResolveCourseConceptsInput = {
  sourceChapterId?: string;
  selectedConceptIds: readonly string[];
};

export type ResolvedCourseConcept = {
  id: string;
  title: string;
  blockTitle: string;
  primaryMeaning?: string;
  lessonEnabled: boolean;
};

export type CourseConceptResolution = {
  chapter?: CurriculumChapterDetails;
  resolved: ResolvedCourseConcept[];
  available: ResolvedCourseConcept[];
  unavailableCount: number;
};

export function resolveCourseConcepts({
  sourceChapterId,
  selectedConceptIds,
}: ResolveCourseConceptsInput): CourseConceptResolution {
  const chapter = getCurriculumChapter(sourceChapterId);

  if (!chapter) {
    return {
      resolved: [],
      available: [],
      unavailableCount: selectedConceptIds.length,
    };
  }

  const resolved: ResolvedCourseConcept[] = [];
  const available: ResolvedCourseConcept[] = [];
  const seenConceptIds = new Set<string>();
  let unavailableCount = 0;

  for (const conceptId of selectedConceptIds) {
    if (seenConceptIds.has(conceptId)) {
      unavailableCount += 1;
      continue;
    }

    seenConceptIds.add(conceptId);
    const details = findConceptInChapter(chapter.chapter.id, conceptId);

    if (!details || !isConceptAllowedForStudent(details.concept)) {
      unavailableCount += 1;
      continue;
    }

    const lesson = resolveInteractiveLesson(details.concept, details.chapter);
    const item: ResolvedCourseConcept = {
      id: details.concept.id,
      title: details.concept.title,
      blockTitle: details.block.title,
      primaryMeaning:
        details.concept.examples[0]?.frenchText ?? details.concept.explanation,
      lessonEnabled: Boolean(lesson?.enabled),
    };

    resolved.push(item);

    if (item.lessonEnabled) {
      available.push(item);
    } else {
      unavailableCount += 1;
    }
  }

  return {
    chapter,
    resolved,
    available,
    unavailableCount,
  };
}
