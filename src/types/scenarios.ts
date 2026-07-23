import type { CEFRLevel } from "@/src/types/learning";

export type ScenarioCategory =
  | "all"
  | "daily_life"
  | "travel"
  | "family"
  | "commerce";

export type ScenarioAvailability = "available" | "coming_soon" | "locked";

export type ScenarioCardData = {
  id: string;
  title: string;
  description: string;
  category: Exclude<ScenarioCategory, "all">;
  level: CEFRLevel;
  conceptIds: string[];
  conceptLabels: string[];
  tags: string[];
  availability: ScenarioAvailability;
  lessonConceptId?: string;
};
