import { useEffect, useState, useCallback } from "react";
import {
  fetchAcceptanceRate,
  type StrategyAcceptanceStats,
} from "../services/strategyDecisionService";

export function useStrategyAcceptanceRate(
  clientId: string | undefined,
  lookback = 20
): StrategyAcceptanceStats | null {
  const [stats, setStats] = useState<StrategyAcceptanceStats | null>(null);

  const load = useCallback(async () => {
    if (!clientId) {
      setStats(null);
      return;
    }
    try {
      const data = await fetchAcceptanceRate(clientId, lookback);
      setStats(data);
    } catch {
      setStats(null);
    }
  }, [clientId, lookback]);

  useEffect(() => {
    load();
  }, [load]);

  return stats;
}
