import { useMemo } from "react";
import { useCycle } from "./useCycle";
import { useReadiness } from "./useReadiness";
import { useRecentLoad } from "./useRecentLoad";
import { computeAdaptation } from "../adaptation/engine";
import type { AdaptationResult } from "../adaptation/types";

export function useTrainingAdaptation(
  clientId: string | undefined,
  date?: Date
): AdaptationResult {
  const { phase } = useCycle(clientId);
  const { readiness } = useReadiness(clientId);
  const recentLoad = useRecentLoad(clientId);

  return useMemo(() => {
    return computeAdaptation({
      phase,
      readiness: readiness
        ? {
            energy_level: readiness.energy_level,
            sleep_quality: readiness.sleep_quality,
            stress_level: readiness.stress_level,
            soreness: readiness.soreness,
          }
        : null,
      recentLoad: recentLoad
        ? {
            sessionsLast7Days: recentLoad.sessionsLast7Days,
            volumeLast7Days: recentLoad.volumeLast7Days,
          }
        : null,
    });
  }, [phase, readiness, recentLoad]);
}
