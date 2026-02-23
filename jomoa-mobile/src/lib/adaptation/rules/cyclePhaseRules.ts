/**
 * Cycle phase-based adaptation rules
 */

import type { CyclePhase } from "../../utils/cycleUtils";
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

export function evaluateCyclePhaseRules(
  phase: CyclePhase,
  readiness: ReadinessInput | null
): RuleEffect[] {
  const effects: RuleEffect[] = [];

  if (phase === "menstruation") {
    if (lowEnergy(readiness) || highStress(readiness)) {
      effects.push({
        volumeModifier: 0.8,
        suggestDeload: lowEnergy(readiness),
        reason: "Mensfas med låg energi eller hög stress.",
        ruleId: "menstruation_deload",
      });
    } else {
      effects.push({
        volumeModifier: 0.9,
        reason: "Mensfas – lätt volymminskning för återhämtning.",
        ruleId: "menstruation_volume",
      });
    }
  }

  if (phase === "luteal" && (lowEnergy(readiness) || highStress(readiness))) {
    effects.push({
      volumeModifier: 0.9,
      reason: "Lutealfas med låg energi – fokusera på teknik.",
      ruleId: "luteal_volume",
    });
  }

  if (phase === "follicular") {
    const highReadiness =
      (readiness?.energy_level ?? 5) >= 7 &&
      !lowEnergy(readiness) &&
      !poorSleep(readiness) &&
      !highSoreness(readiness);
    if (highReadiness) {
      effects.push({
        volumeModifier: 1.05,
        reason: "Follikulär fas + bra readiness – bra tillfälle att pusha.",
        ruleId: "follicular_overload",
      });
    }
  }

  if (phase === "ovulation") {
    const highReadiness =
      (readiness?.energy_level ?? 5) >= 7 &&
      !lowEnergy(readiness) &&
      !poorSleep(readiness);
    if (highReadiness) {
      effects.push({
        volumeModifier: 1.05,
        reason: "Ägglossning + bra readiness – utmana dig idag.",
        ruleId: "ovulation_overload",
      });
    } else {
      effects.push({
        volumeModifier: 1.0,
        reason: "Ägglossning – bra dag för hög intensitet.",
        ruleId: "ovulation_intensity",
      });
    }
  }

  return effects;
}
