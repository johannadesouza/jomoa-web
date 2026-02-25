/**
 * Gemensamma etiketter och mappning för onboarding, profil och program.
 * Håller målen i synk mellan onboardingen och produkten.
 */

import type { TrainingGoal, DayOfWeek } from "../../shared/types/onboarding";

// —— Onboarding (clients.primary_goal) ——
const PRIMARY_GOAL_LABELS: Record<TrainingGoal, string> = {
  muscle_growth: "Bygga muskler",
  strength: "Bli starkare",
  fat_loss: "Gå ner i vikt",
  performance: "Bättre prestation",
  maintenance: "Hålla formen",
};

// —— Program (training_programs.target_goal) ——
export const PROGRAM_GOAL_LABELS: Record<string, string> = {
  hypertrophy: "Muskeluppbyggnad",
  strength: "Styrka",
  endurance: "Uthållighet",
  general_fitness: "Allmän fitness",
};

// —— Mappning: onboarding primary_goal → program target_goal (för sortering/badge) ——
const PRIMARY_TO_PROGRAM_GOAL: Record<TrainingGoal, string> = {
  muscle_growth: "hypertrophy",
  strength: "strength",
  fat_loss: "general_fitness",
  performance: "endurance",
  maintenance: "general_fitness",
};

const DAY_LABELS: Record<DayOfWeek, string> = {
  1: "Mån",
  2: "Tis",
  3: "Ons",
  4: "Tor",
  5: "Fre",
  6: "Lör",
  7: "Sön",
};

export function getPrimaryGoalLabel(goal: TrainingGoal | null | undefined): string {
  if (!goal) return "Inte angivet";
  return PRIMARY_GOAL_LABELS[goal] ?? goal;
}

export function getTrainingDaysLabel(days: DayOfWeek[] | null | undefined): string {
  if (!days?.length) return "Inte angivet";
  return days.map((d) => DAY_LABELS[d]).join(", ");
}

/** Etikett för program.target_goal (används i ProgramList, ProgramDetail, ProgramSelect). */
export function getProgramGoalLabel(targetGoal: string | null | undefined): string | null {
  if (!targetGoal) return null;
  return PROGRAM_GOAL_LABELS[targetGoal] ?? targetGoal;
}

/** Returnerar program target_goal som matchar användarens primary_goal – för sortering och "Passar ditt mål". */
export function getProgramGoalForPrimaryGoal(primaryGoal: TrainingGoal | null | undefined): string | null {
  if (!primaryGoal) return null;
  return PRIMARY_TO_PROGRAM_GOAL[primaryGoal] ?? null;
}

/** Kollar om ett program passar användarens mål från onboarding. */
export function programMatchesPrimaryGoal(
  programTargetGoal: string | null | undefined,
  clientPrimaryGoal: TrainingGoal | null | undefined
): boolean {
  const expected = getProgramGoalForPrimaryGoal(clientPrimaryGoal);
  if (!expected || !programTargetGoal) return false;
  return programTargetGoal === expected;
}
