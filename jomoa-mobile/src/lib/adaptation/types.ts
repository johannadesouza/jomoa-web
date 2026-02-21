/**
 * Adaptation engine types
 */

import type { CyclePhase } from "../utils/cycleUtils";

export interface ReadinessInput {
  energy_level: number | null;
  sleep_quality: number | null;
  stress_level: number | null;
  soreness: number | null;
}

export interface AdaptationResult {
  volumeModifier: number;
  rpeModifier: number;
  suggestDeload: boolean;
  suggestRecovery: boolean;
  reason: string;
  appliedRules: string[];
  /** Top 2 drivers for adjustment (WHY) */
  topDrivers: string[];
}

export interface RecentLoadInput {
  sessionsLast7Days: number;
  volumeLast7Days: number;
}

export interface AdaptationContext {
  phase: CyclePhase;
  readiness: ReadinessInput | null;
  recentLoad: RecentLoadInput | null;
}
