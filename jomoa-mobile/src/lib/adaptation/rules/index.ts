/**
 * Rule registry – combines all rule evaluators.
 * Mode-aware: cycle phase rules are skipped in missing_period and perimenopause modes.
 */

import { evaluateCyclePhaseRules } from "./cyclePhaseRules";
import { evaluateReadinessRules } from "./readinessRules";
import { evaluateRecentLoadRules } from "./recentLoadRules";
import { evaluateWeeklyProgressionRules } from "./weeklyProgressionRules";
import { evaluatePerimenopauseRules } from "./perimenopauseRules";
import type { AdaptationContext } from "../types";
import type { RuleEffect } from "./cyclePhaseRules";

export { evaluateCyclePhaseRules } from "./cyclePhaseRules";
export { evaluateReadinessRules } from "./readinessRules";
export { evaluateRecentLoadRules } from "./recentLoadRules";
export { evaluateWeeklyProgressionRules } from "./weeklyProgressionRules";
export { evaluatePerimenopauseRules } from "./perimenopauseRules";
export type { RuleEffect } from "./cyclePhaseRules";

export function evaluateAllRules(
  context: AdaptationContext
): RuleEffect[] {
  const mode = context.mode ?? "regular";

  // Cycle phase rules only in regular mode
  const cycleEffects =
    mode === "regular"
      ? evaluateCyclePhaseRules(context.cyclePhase, context.readiness)
      : [];

  // Perimenopause symptom rules only in perimenopause mode
  const periEffects =
    mode === "perimenopause"
      ? evaluatePerimenopauseRules(context.perimenopauseSymptoms, context.readiness)
      : [];

  const readinessEffects = evaluateReadinessRules(context.readiness);
  const recentLoadEffects = evaluateRecentLoadRules(
    context.trainingLoad,
    context.readiness
  );
  const weeklyProgressionEffects = evaluateWeeklyProgressionRules(
    context.weeklyProgression,
    context.readiness
  );

  return [
    ...cycleEffects,
    ...periEffects,
    ...readinessEffects,
    ...recentLoadEffects,
    ...weeklyProgressionEffects,
  ];
}
