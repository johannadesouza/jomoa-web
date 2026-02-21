import { useEffect, useState } from "react";
import { getLatestPeriodStart } from "../services/cycleService";
import {
  calculateCyclePhase,
  getPhaseLabel,
  type CyclePhase,
} from "../utils/cycleUtils";

interface UseCycleResult {
  latestPeriodStart: string | null;
  phase: CyclePhase;
  phaseLabel: string;
  cycleDay: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCycle(clientId: string | undefined): UseCycleResult {
  const [latestPeriodStart, setLatestPeriodStart] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestPeriod = async () => {
    if (!clientId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    const { data, error: err } = await getLatestPeriodStart(clientId);
    setLatestPeriodStart(data);
    setError(err);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLatestPeriod();
  }, [clientId]);

  const { phase, cycleDay } = calculateCyclePhase(latestPeriodStart);
  const phaseLabel = getPhaseLabel(phase);

  return {
    latestPeriodStart,
    phase,
    phaseLabel,
    cycleDay,
    isLoading,
    error,
    refetch: fetchLatestPeriod,
  };
}
