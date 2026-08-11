import { shikomoriLanguage } from "./shikomori/questions-a1";
import type {
  Assessment,
  Chapter,
  Concept,
  Language,
  LanguageLevel,
  LearningBlock,
  Skill,
} from "../../types/learning";

export type CurriculumChapterDetails = {
  language: Language;
  level: LanguageLevel;
  skill: Skill;
  chapter: Chapter;
};

export type CurriculumConceptDetails = CurriculumChapterDetails & {
  block: LearningBlock;
  concept: Concept;
};

export type CurriculumAssessmentDetails = CurriculumChapterDetails & {
  assessment: Assessment;
};

export const curriculumRegistry = {
  languages: [shikomoriLanguage] satisfies readonly Language[],
};

function* iterateChapters(): Generator<CurriculumChapterDetails> {
  for (const language of curriculumRegistry.languages) {
    for (const level of language.levels) {
      for (const skill of level.skills) {
        for (const chapter of skill.chapters) {
          yield { language, level, skill, chapter };
        }
      }
    }
  }
}

export function getCurriculumChapter(
  chapterId: string | undefined,
): CurriculumChapterDetails | undefined {
  if (!chapterId) {
    return undefined;
  }

  for (const details of iterateChapters()) {
    if (details.chapter.id === chapterId) {
      return details;
    }
  }

  return undefined;
}

export function findConceptInChapter(
  chapterId: string | undefined,
  conceptId: string | undefined,
): CurriculumConceptDetails | undefined {
  const chapterDetails = getCurriculumChapter(chapterId);

  if (!chapterDetails || !conceptId) {
    return undefined;
  }

  for (const block of chapterDetails.chapter.blocks) {
    const concept = block.concepts.find((candidate) => candidate.id === conceptId);

    if (concept) {
      return {
        ...chapterDetails,
        block,
        concept,
      };
    }
  }

  return undefined;
}

export function findConceptInCurriculum(
  conceptId: string | undefined,
): CurriculumConceptDetails | undefined {
  if (!conceptId) {
    return undefined;
  }

  for (const chapterDetails of iterateChapters()) {
    for (const block of chapterDetails.chapter.blocks) {
      const concept = block.concepts.find((candidate) => candidate.id === conceptId);

      if (concept) {
        return {
          ...chapterDetails,
          block,
          concept,
        };
      }
    }
  }

  return undefined;
}

export function findAssessmentInCurriculum(
  assessmentId: string | undefined,
): CurriculumAssessmentDetails | undefined {
  if (!assessmentId) {
    return undefined;
  }

  for (const chapterDetails of iterateChapters()) {
    const assessment = chapterDetails.chapter.assessments?.find(
      (candidate) => candidate.id === assessmentId,
    );

    if (assessment) {
      return {
        ...chapterDetails,
        assessment,
      };
    }
  }

  return undefined;
}
