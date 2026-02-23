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

/** Alias for clarity: training load input to adaptation */
export type TrainingLoadInput = RecentLoadInput;

export interface WeeklyProgressionInput {
  lastWeekPlanned: number;
  lastWeekCompleted: number;
  completionRate: number;
}

export interface StrategyPreferenceInput {
  acceptanceRate: number;
  decisionCount: number;
}

export interface AdaptationContext {
  /** Cycle phase – null if no cycle tracking; cycle rules are skipped */
  cyclePhase: CyclePhase | null;
  /** Readiness check-in – null if no check-in today */
  readiness: ReadinessInput | null;
  /** Training load – null if no training; load rules are skipped */
  trainingLoad: RecentLoadInput | null;
  /** Weekly completion – null if no program or no data; progression rules skipped */
  weeklyProgression: WeeklyProgressionInput | null;
  /** Strategy preference – user accept/reject history for learning */
  strategyPreference: StrategyPreferenceInput | null;
}
