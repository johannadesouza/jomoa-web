/**
 * Adaptation Engine
 * Evaluates rules and merges modifiers into AdaptationResult
 */

import { evaluateAllRules } from "./rules";
import type { AdaptationContext, AdaptationResult } from "./types";
import type { RuleEffect } from "./rules";

export function computeAdaptation(
  context: AdaptationContext
): AdaptationResult {
  const effects = evaluateAllRules(context);

  let volumeModifier = 1.0;
  let rpeModifier = 0;
  let suggestDeload = false;
  let suggestRecovery = false;
  const reasons: string[] = [];
  const appliedRules: string[] = [];

  for (const e of effects) {
    if (e.volumeModifier != null) {
      volumeModifier *= e.volumeModifier;
      appliedRules.push(e.ruleId);
      if (e.reason) reasons.push(e.reason);
    }
    if (e.rpeModifier != null) {
      rpeModifier += e.rpeModifier;
      if (!appliedRules.includes(e.ruleId)) {
        appliedRules.push(e.ruleId);
        if (e.reason) reasons.push(e.reason);
      }
    }
    if (e.suggestDeload) suggestDeload = true;
    if (e.suggestRecovery) suggestRecovery = true;
  }

  volumeModifier = Math.max(0.5, Math.min(1.2, volumeModifier));
  rpeModifier = Math.max(-2, Math.min(1, rpeModifier));

  const topDrivers = [...new Set(reasons)].slice(0, 2);

  return {
    volumeModifier,
    rpeModifier,
    suggestDeload,
    suggestRecovery,
    reason: reasons.length > 0 ? reasons[0] : "",
    appliedRules,
    topDrivers,
  };
}
