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
  // Default mode to 'regular' if not provided (backward compatibility)
  const ctx: AdaptationContext = { mode: "regular", ...context };
  const effects = evaluateAllRules(ctx);

  let volumeModifier = 1.0;
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
    if (e.suggestDeload) suggestDeload = true;
    if (e.suggestRecovery) suggestRecovery = true;
  }

  volumeModifier = Math.max(0.5, Math.min(1.2, volumeModifier));

  // Apply strategy preference: if user often rejects, make suggestions more conservative
  const pref = ctx.strategyPreference;
  if (pref && pref.decisionCount >= 5 && volumeModifier !== 1) {
    const dampen =
      pref.acceptanceRate < 0.4 ? 0.6 : pref.acceptanceRate > 0.7 ? 1.0 : 0.85;
    volumeModifier = 1 + (volumeModifier - 1) * dampen;
    volumeModifier = Math.max(0.5, Math.min(1.2, volumeModifier));
  }

  const topDrivers = [...new Set(reasons)].slice(0, 2);

  return {
    volumeModifier,
    suggestDeload,
    suggestRecovery,
    reason: reasons.length > 0 ? reasons[0] : "",
    appliedRules,
    topDrivers,
  };
}
