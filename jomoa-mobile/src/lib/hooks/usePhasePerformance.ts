import { useEffect, useState, useCallback } from "react";
import {
  fetchPhasePerformance,
  type PhaseComparison,
} from "../services/phasePerformanceService";
import { useCycleContext } from "../../shared/context/CycleContext";

export function usePhasePerformance(clientId: string | undefined) {
  const { cycleLength } = useCycleContext();
  const [comparison, setComparison] = useState<PhaseComparison | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!clientId) {
      setComparison(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const { comparison: c } = await fetchPhasePerformance(clientId, cycleLength);
      setComparison(c);
    } catch {
      setComparison(null);
    } finally {
      setIsLoading(false);
    }
  }, [clientId, cycleLength]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { comparison, isLoading, refetch };
}
