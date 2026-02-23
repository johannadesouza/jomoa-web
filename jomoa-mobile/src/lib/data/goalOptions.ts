/**
 * Fördefinierade mål per typ – JOMOA-stil
 */

import type { GoalType } from "../services/goalsService";

export interface GoalOption {
  id: string;
  label: string;
  iconName: string;
}

export const FITNESS_GOALS: GoalOption[] = [
  { id: "general_fitness", label: "Förbättra allmän fitness", iconName: "body-outline" },
  { id: "strength", label: "Bli starkare", iconName: "barbell-outline" },
  { id: "muscle", label: "Bygga muskler", iconName: "fitness-outline" },
  { id: "lean_up", label: "Gå ner i vikt", iconName: "trending-down-outline" },
  { id: "mental_wellbeing", label: "Bättre psykisk hälsa", iconName: "heart-outline" },
];

export const NUTRITION_GOALS: GoalOption[] = [
  { id: "lose_weight", label: "Gå ner i vikt", iconName: "trending-down-outline" },
  { id: "maintain", label: "Behåll vikt", iconName: "remove-outline" },
  { id: "gain_weight", label: "Gå upp i vikt", iconName: "trending-up-outline" },
];

export const WELLNESS_GOALS: GoalOption[] = [
  { id: "habits", label: "Bättre vanor och rutiner", iconName: "checkmark-circle-outline" },
  { id: "confidence", label: "Mer självförtroende", iconName: "happy-outline" },
  { id: "transformation", label: "Fysisk förändring", iconName: "body-outline" },
  { id: "nutrition", label: "Bättre kost", iconName: "nutrition-outline" },
  { id: "variety", label: "Mer variation i träning", iconName: "flash-outline" },
  { id: "strength_fitness", label: "Styrka och kondition", iconName: "barbell-outline" },
  { id: "mental", label: "Bättre psykisk hälsa", iconName: "happy-outline" },
  { id: "energy", label: "Mer energi", iconName: "flash-outline" },
];

export const EVENT_GOALS: GoalOption[] = [
  { id: "holiday", label: "Semester", iconName: "umbrella-outline" },
  { id: "wedding", label: "Bröllop", iconName: "heart-outline" },
  { id: "birthday", label: "Födelsedag", iconName: "gift-outline" },
  { id: "summer", label: "Sommar", iconName: "sunny-outline" },
];

export const GOAL_OPTIONS: Record<GoalType, GoalOption[]> = {
  fitness: FITNESS_GOALS,
  nutrition: NUTRITION_GOALS,
  wellness: WELLNESS_GOALS,
  event: EVENT_GOALS,
};

export const GOAL_SELECT_LIMITS: Record<GoalType, number> = {
  fitness: 2,
  nutrition: 1,
  wellness: 3,
  event: 1,
};
