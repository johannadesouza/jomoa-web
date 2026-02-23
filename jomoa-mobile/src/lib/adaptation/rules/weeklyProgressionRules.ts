/**
 * Weekly progression rules
 * Adaptive overload when last week was completed successfully
 */

import type { ReadinessInput, WeeklyProgressionInput } from "../types";

export interface RuleEffect {
  volumeModifier?: number;
  rpeModifier?: number;
  suggestDeload?: boolean;
  suggestRecovery?: boolean;
  reason: string;
  ruleId: string;
}

const COMPLETION_THRESHOLD = 0.8;
const PROGRESSION_VOLUME = 1.025;

function decentReadiness(readiness: ReadinessInput | null): boolean {
  const energy = readiness?.energy_level ?? 5;
  const soreness = readiness?.soreness ?? 0;
  return energy >= 5 && soreness < 7;
}

export function evaluateWeeklyProgressionRules(
  weeklyProgression: WeeklyProgressionInput | null,
  readiness: ReadinessInput | null
): RuleEffect[] {
  const effects: RuleEffect[] = [];

  if (!weeklyProgression || weeklyProgression.lastWeekPlanned < 1) {
    return effects;
  }

  const completedWell =
    weeklyProgression.completionRate >= COMPLETION_THRESHOLD &&
    weeklyProgression.lastWeekCompleted > 0;

  if (completedWell && decentReadiness(readiness)) {
    effects.push({
      volumeModifier: PROGRESSION_VOLUME,
      reason: "Förra veckan genomförd – lätt volymökning (+2,5%).",
      ruleId: "weekly_progression",
    });
  }

  return effects;
}
