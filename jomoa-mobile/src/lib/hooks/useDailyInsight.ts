import { useEffect, useState, useCallback } from "react";
import { useCycle } from "./useCycle";
import { useReadiness } from "./useReadiness";
import {
  getOrCreateTodayInsight,
  getTodayInsight,
  type DailyInsight,
} from "../services/insightService";

function readinessToTier(
  readiness: { readiness_score?: number | null; energy_level?: number | null } | null
): "high" | "medium" | "low" | null {
  if (!readiness) return null;
  const score = readiness.readiness_score;
  if (score != null) {
    if (score >= 75) return "high";
    if (score >= 50) return "medium";
    return "low";
  }
  const energy = readiness.energy_level;
  if (energy != null) {
    if (energy >= 7) return "high";
    if (energy >= 4) return "medium";
    return "low";
  }
  return null;
}

export function useDailyInsight(clientId: string | undefined) {
  const { phase, cycleDay } = useCycle(clientId);
  const { readiness } = useReadiness(clientId);
  const [insight, setInsight] = useState<DailyInsight | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!clientId) {
      setInsight(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const tier = readinessToTier(readiness);
    const { data, error } = await getOrCreateTodayInsight(clientId, {
      phase: phase ?? null,
      cycleDay: cycleDay ?? null,
      readinessTier: tier,
      energyLevel: readiness?.energy_level ?? null,
      hasSymptoms: false,
    });
    if (!error && data) {
      setInsight(data);
    } else {
      const fallback = await getTodayInsight(clientId);
      if (fallback.data) setInsight(fallback.data);
      else setInsight(null);
    }
    setIsLoading(false);
  }, [clientId, phase, cycleDay, readiness?.readiness_score, readiness?.energy_level]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { insight, isLoading, refetch };
}
