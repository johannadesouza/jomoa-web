import { useMemo } from "react";
import { useCycle } from "./useCycle";
import { useReadiness } from "./useReadiness";
import { useRecentLoad } from "./useRecentLoad";
import { useWeeklyProgression } from "./useWeeklyProgression";
import { computeAdaptation } from "../adaptation/engine";
import type { AdaptationResult } from "../adaptation/types";

export function useTrainingAdaptation(
  clientId: string | undefined,
  _date?: Date
): AdaptationResult {
  const { phase } = useCycle(clientId);
  const { readiness } = useReadiness(clientId);
  const recentLoad = useRecentLoad(clientId);
  const weeklyProgression = useWeeklyProgression(clientId);

  return useMemo(() => {
    return computeAdaptation({
      cyclePhase: phase ?? null,
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
    });
  }, [phase, readiness, recentLoad, weeklyProgression]);
}
