import { useEffect, useState, useCallback, useRef } from "react";
import { useCycle } from "./useCycle";
import { useReadiness } from "./useReadiness";
import {
  getOrCreateTodayInsight,
  getTodayInsight,
  type DailyInsight,
} from "../services/insightService";
import { getTodayHasSymptoms } from "../services/cycleSymptomService";

const REFETCH_DEBOUNCE_MS = 300;

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

  const inputRef = useRef({
    phase: phase ?? null,
    cycleDay: cycleDay ?? null,
    readinessTier: readinessToTier(readiness),
    energyLevel: readiness?.energy_level ?? null,
  });
  inputRef.current = {
    phase: phase ?? null,
    cycleDay: cycleDay ?? null,
    readinessTier: readinessToTier(readiness),
    energyLevel: readiness?.energy_level ?? null,
  };

  const loadInsight = useCallback(async () => {
    if (!clientId) {
      setInsight(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const { phase: p, cycleDay: cd, readinessTier: tier, energyLevel: energy } = inputRef.current;
      const hasSymptoms = await getTodayHasSymptoms(clientId);
      const { data, error } = await getOrCreateTodayInsight(clientId, {
        phase: p,
        cycleDay: cd,
        readinessTier: tier,
        energyLevel: energy,
        hasSymptoms,
      });
      if (!error && data) {
        setInsight(data);
      } else {
        const fallback = await getTodayInsight(clientId);
        if (fallback.data) setInsight(fallback.data);
        else setInsight(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (!clientId) return;
    const timeout = setTimeout(loadInsight, REFETCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [clientId, loadInsight]);

  return { insight, isLoading, refetch: loadInsight };
}
