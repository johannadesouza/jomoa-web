import { useState, useEffect } from "react";
import { useCycle } from "./useCycle";
import { useReadiness } from "./useReadiness";
import { getDailyPhaseInsightAsync } from "../services/phaseKnowledgeService";
import type { DailyPhaseInsight } from "../services/phaseKnowledgeService";

export function useDailyPhaseInsight(clientId: string | undefined): DailyPhaseInsight | null {
  const { phase } = useCycle(clientId);
  const { readiness } = useReadiness(clientId);
  const [insight, setInsight] = useState<DailyPhaseInsight | null>(null);

  useEffect(() => {
    let cancelled = false;
    const readinessInput =
      readiness != null
        ? {
            energy_level: readiness.energy_level,
            sleep_quality: readiness.sleep_quality,
            stress_level: readiness.stress_level,
            soreness: readiness.soreness,
          }
        : null;
    getDailyPhaseInsightAsync(phase ?? null, readinessInput).then((result) => {
      if (!cancelled) setInsight(result);
    });
    return () => { cancelled = true; };
  }, [phase, readiness]);

  return insight;
}
