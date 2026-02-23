import { useMemo } from "react";
import { useCycle } from "./useCycle";
import { useReadiness } from "./useReadiness";
import { getDailyPhaseInsight } from "../services/phaseKnowledgeService";

export function useDailyPhaseInsight(clientId: string | undefined) {
  const { phase } = useCycle(clientId);
  const { readiness } = useReadiness(clientId);

  return useMemo(() => {
    const readinessInput =
      readiness != null
        ? {
            energy_level: readiness.energy_level,
            sleep_quality: readiness.sleep_quality,
            stress_level: readiness.stress_level,
            soreness: readiness.soreness,
          }
        : null;
    return getDailyPhaseInsight(phase ?? null, readinessInput);
  }, [phase, readiness]);
}
