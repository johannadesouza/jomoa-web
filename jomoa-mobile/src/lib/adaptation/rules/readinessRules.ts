/**
 * Readiness-based adaptation rules
 */

import type { ReadinessInput } from "../types";

export interface RuleEffect {
  volumeModifier?: number;
  suggestDeload?: boolean;
  suggestRecovery?: boolean;
  reason: string;
  ruleId: string;
}

function lowEnergy(readiness: ReadinessInput | null): boolean {
  return (readiness?.energy_level ?? 10) <= 3;
}

function highStress(readiness: ReadinessInput | null): boolean {
  return (readiness?.stress_level ?? 0) >= 7;
}

function poorSleep(readiness: ReadinessInput | null): boolean {
  return (readiness?.sleep_quality ?? 10) <= 3;
}

function highSoreness(readiness: ReadinessInput | null): boolean {
  return (readiness?.soreness ?? 0) >= 7;
}

export function evaluateReadinessRules(
  readiness: ReadinessInput | null
): RuleEffect[] {
  const effects: RuleEffect[] = [];

  if (!readiness) return effects;

  if (highStress(readiness) && lowEnergy(readiness)) {
    effects.push({
      suggestRecovery: true,
      volumeModifier: 0.6,
      reason: "Hög stress och låg energi – återhämtningspass rekommenderas.",
      ruleId: "high_stress_recovery",
    });
  }

  if (poorSleep(readiness) && lowEnergy(readiness)) {
    effects.push({
      volumeModifier: 0.8,
      reason: "Dålig sömn och låg energi – minska volym.",
      ruleId: "poor_sleep_volume",
    });
  } else if (poorSleep(readiness)) {
    effects.push({
      volumeModifier: 0.9,
      reason: "Dålig sömn – lätt volymminskning.",
      ruleId: "poor_sleep",
    });
  }

  if (highSoreness(readiness) && lowEnergy(readiness)) {
    effects.push({
      volumeModifier: 0.75,
      reason: "Ömhet och låg energi – lättare pass med teknikfokus.",
      ruleId: "high_soreness",
    });
  } else if (highSoreness(readiness)) {
    effects.push({
      volumeModifier: 0.85,
      reason: "Hög ömhet – minska volym något.",
      ruleId: "soreness",
    });
  }

  return effects;
}
