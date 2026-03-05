/**
 * Adaptation engine types
 */

import type { CyclePhase } from "../utils/cycleUtils";
import type { CycleMode } from "../utils/cycleEngine";

export type { CycleMode };

export interface ReadinessInput {
  energy_level: number | null;
  sleep_quality: number | null;
  stress_level: number | null;
  soreness: number | null;
}

/** Symptom flags used in perimenopause mode */
export interface PerimenopauseSymptoms {
  hot_flashes: boolean;
  sleep_disruption: boolean;
  joint_stiffness: boolean;
  energy_crash: boolean;
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

/** Alias for clarity */
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
  /**
   * Cycle mode:
   *  - regular: cyclePhase is used for phase rules
   *  - missing_period: cyclePhase rules are skipped; readiness + history only
   *  - perimenopause: cyclePhase rules are skipped; perimenopauseSymptoms used instead
   */
  mode: CycleMode;

  /** Cycle phase – only populated when mode === 'regular'; null otherwise */
  cyclePhase: CyclePhase | null;

  /** Symptom flags – only populated when mode === 'perimenopause' */
  perimenopauseSymptoms?: PerimenopauseSymptoms | null;

  /** Readiness check-in – null if no check-in today */
  readiness: ReadinessInput | null;

  /** Training load – null if no training data */
  trainingLoad: RecentLoadInput | null;

  /** Weekly completion – null if no program or no data */
  weeklyProgression: WeeklyProgressionInput | null;

  /** Strategy preference – user accept/reject history for learning */
  strategyPreference: StrategyPreferenceInput | null;
}
