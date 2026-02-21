/**
 * Rule registry – combines all rule evaluators
 */

import { evaluateCyclePhaseRules } from "./cyclePhaseRules";
import { evaluateReadinessRules } from "./readinessRules";
import { evaluateRecentLoadRules } from "./recentLoadRules";
import type { AdaptationContext } from "../types";
import type { RuleEffect } from "./cyclePhaseRules";

export { evaluateCyclePhaseRules } from "./cyclePhaseRules";
export { evaluateReadinessRules } from "./readinessRules";
export { evaluateRecentLoadRules } from "./recentLoadRules";
export type { RuleEffect } from "./cyclePhaseRules";

export function evaluateAllRules(
  context: AdaptationContext
): RuleEffect[] {
  const cycleEffects = evaluateCyclePhaseRules(
    context.phase,
    context.readiness
  );
  const readinessEffects = evaluateReadinessRules(context.readiness);
  const recentLoadEffects = evaluateRecentLoadRules(
    context.recentLoad,
    context.readiness
  );
  return [...cycleEffects, ...readinessEffects, ...recentLoadEffects];
}
