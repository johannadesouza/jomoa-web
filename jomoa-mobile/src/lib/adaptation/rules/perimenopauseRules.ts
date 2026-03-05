/**
 * Perimenopause mode adaptation rules.
 * Applied when mode === 'perimenopause'; cycle phase rules are NOT applied.
 */

import type { PerimenopauseSymptoms, ReadinessInput } from "../types";
import type { RuleEffect } from "./cyclePhaseRules";

export function evaluatePerimenopauseRules(
  symptoms: PerimenopauseSymptoms | null | undefined,
  readiness: ReadinessInput | null
): RuleEffect[] {
  if (!symptoms) return [];

  const effects: RuleEffect[] = [];

  const lowEnergy = (readiness?.energy_level ?? 10) <= 3;

  // Hot flashes + energy crash → significant volume reduction
  if (symptoms.hot_flashes && symptoms.energy_crash) {
    effects.push({
      volumeModifier: 0.8,
      suggestRecovery: true,
      reason: "Värmevallningar och energikrasch – prioritera återhämtning.",
      ruleId: "peri_hot_flash_energy_crash",
    });
  } else if (symptoms.hot_flashes || symptoms.energy_crash) {
    effects.push({
      volumeModifier: 0.9,
      reason: "Symtom idag – lätt volymjustering.",
      ruleId: "peri_single_symptom",
    });
  }

  // Sleep disruption → same as poor sleep in readiness rules
  if (symptoms.sleep_disruption) {
    effects.push({
      volumeModifier: 0.9,
      reason: "Sömnproblem – håll intensiteten måttlig.",
      ruleId: "peri_sleep_disruption",
    });
  }

  // Joint stiffness → lower intensity suggestion
  if (symptoms.joint_stiffness) {
    effects.push({
      volumeModifier: 0.9,
      suggestDeload: lowEnergy,
      reason: "Ledvärk – fokus på rörlighet och teknik.",
      ruleId: "peri_joint_stiffness",
    });
  }

  return effects;
}
