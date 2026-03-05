import { useMemo } from "react";
import { useCycleContext } from "../../shared/context/CycleContext";
import { useReadiness } from "./useReadiness";
import { useRecentLoad } from "./useRecentLoad";
import { useWeeklyProgression } from "./useWeeklyProgression";
import { useStrategyAcceptanceRate } from "./useStrategyAcceptanceRate";
import { computeAdaptation } from "../adaptation/engine";
import type { AdaptationResult } from "../adaptation/types";
import { useTodayPerimenopauseSymptoms } from "./useTodayPerimenopauseSymptoms";

export function useTrainingAdaptation(
  clientId: string | undefined,
  _date?: Date
): AdaptationResult {
  const { phase, mode } = useCycleContext();
  const { readiness } = useReadiness(clientId);
  const recentLoad = useRecentLoad(clientId);
  const weeklyProgression = useWeeklyProgression(clientId);
  const strategyStats = useStrategyAcceptanceRate(clientId);
  const periSymptoms = useTodayPerimenopauseSymptoms(
    mode === "perimenopause" ? clientId : undefined
  );

  return useMemo(() => {
    return computeAdaptation({
      mode: mode ?? "regular",
      // Phase only passed in regular mode
      cyclePhase: mode === "regular" ? (phase ?? null) : null,
      // Peri symptoms only in perimenopause mode
      perimenopauseSymptoms:
        mode === "perimenopause" ? (periSymptoms ?? null) : null,
      readiness: readiness
        ? {
            energy_level: readiness.energy_level,
            sleep_quality: readiness.sleep_quality,
            stress_level: readiness.stress_level,
            soreness: readiness.soreness,
          }
        : null,
      trainingLoad: recentLoad
        ? {
            sessionsLast7Days: recentLoad.sessionsLast7Days,
            volumeLast7Days: recentLoad.volumeLast7Days,
          }
        : null,
      weeklyProgression: weeklyProgression
        ? {
            lastWeekPlanned: weeklyProgression.lastWeekPlanned,
            lastWeekCompleted: weeklyProgression.lastWeekCompleted,
            completionRate: weeklyProgression.completionRate,
          }
        : null,
      strategyPreference: strategyStats
        ? {
            acceptanceRate: strategyStats.acceptanceRate,
            decisionCount: strategyStats.decisionCount,
          }
        : null,
    });
  }, [mode, phase, periSymptoms, readiness, recentLoad, weeklyProgression, strategyStats]);
}
