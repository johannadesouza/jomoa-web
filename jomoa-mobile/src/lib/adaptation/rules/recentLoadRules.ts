/**
 * Recent load–based adaptation rules
 * Uses training volume/sessions from last 7 days
 */

import type { ReadinessInput, RecentLoadInput } from "../types";

export interface RuleEffect {
  volumeModifier?: number;
  rpeModifier?: number;
  suggestDeload?: boolean;
  suggestRecovery?: boolean;
  reason: string;
  ruleId: string;
}

const HIGH_SESSIONS_THRESHOLD = 4;
const VERY_HIGH_SESSIONS_THRESHOLD = 5;

function lowEnergy(readiness: ReadinessInput | null): boolean {
  return (readiness?.energy_level ?? 10) <= 3;
}

function poorSleep(readiness: ReadinessInput | null): boolean {
  return (readiness?.sleep_quality ?? 10) <= 3;
}

function highSoreness(readiness: ReadinessInput | null): boolean {
  return (readiness?.soreness ?? 0) >= 7;
}

export function evaluateRecentLoadRules(
  recentLoad: RecentLoadInput | null,
  readiness: ReadinessInput | null
): RuleEffect[] {
  const effects: RuleEffect[] = [];

  if (!recentLoad || recentLoad.sessionsLast7Days < HIGH_SESSIONS_THRESHOLD) {
    return effects;
  }

  const hasRecoverySignals =
    lowEnergy(readiness) || poorSleep(readiness) || highSoreness(readiness);

  if (!hasRecoverySignals) return effects;

  if (recentLoad.sessionsLast7Days >= VERY_HIGH_SESSIONS_THRESHOLD) {
    effects.push({
      volumeModifier: 0.85,
      rpeModifier: -0.5,
      suggestDeload: true,
      reason: "Hög träningsbelastning (5+ pass/vecka) och återhämtningssignaler – minska volym.",
      ruleId: "high_load_recovery",
    });
  } else {
    effects.push({
      volumeModifier: 0.9,
      reason: "Ökad belastning och återhämtningssignaler – lätt volymminskning.",
      ruleId: "moderate_load_recovery",
    });
  }

  return effects;
}
