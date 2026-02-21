/**
 * Simplified adjustment logic for mobile
 * Returns a recommendation based on readiness + cycle phase
 */

import type { CyclePhase } from "../utils/cycleUtils";

interface ReadinessInput {
  energy_level: number | null;
  sleep_quality: number | null;
  stress_level: number | null;
  soreness: number | null;
}

export type AdjustmentType =
  | "volume_reduction"
  | "technique_focus"
  | "recovery_session"
  | "none";

export interface AdjustmentRecommendation {
  type: AdjustmentType;
  reason: string;
}

export function getAdjustmentRecommendation(
  cyclePhase: CyclePhase,
  readiness: ReadinessInput | null
): AdjustmentRecommendation | null {
  if (!readiness) return null;

  const lowEnergy = readiness.energy_level != null && readiness.energy_level <= 3;
  const highStress = readiness.stress_level != null && readiness.stress_level >= 7;
  const poorSleep = readiness.sleep_quality != null && readiness.sleep_quality <= 3;
  const highSoreness = readiness.soreness != null && readiness.soreness >= 7;

  if (highStress && lowEnergy) {
    return {
      type: "recovery_session",
      reason: "Hög stress och låg energi. Överväg ett lätt återhämtningspass.",
    };
  }

  if (poorSleep && lowEnergy) {
    return {
      type: "volume_reduction",
      reason: "Dålig sömn och låg energi. Minska volym idag.",
    };
  }

  if (cyclePhase === "menstruation") {
    if (lowEnergy || highStress) {
      return {
        type: "volume_reduction",
        reason: "Mensfas med låg energi. Justera volym för att behålla progression.",
      };
    }
    return {
      type: "volume_reduction",
      reason: "Mensfas. Lätt volymminskning för att stödja återhämtning.",
    };
  }

  if (cyclePhase === "luteal" && (lowEnergy || highStress)) {
    return {
      type: "technique_focus",
      reason: "Lutealfas med låg energi. Fokusera på teknik istället för volym.",
    };
  }

  if (highSoreness && lowEnergy) {
    return {
      type: "technique_focus",
      reason: "Ömhet och låg energi. Lättare pass med teknikfokus.",
    };
  }

  return null;
}
