import { useEffect, useState, useCallback } from "react";
import { fetchInsightStats } from "../services/workoutLogService";
import { InsightStats } from "../services/workoutLogService";

export function useInsights(clientId: string | undefined) {
  const [stats, setStats] = useState<InsightStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!clientId) return;

    setIsLoading(true);
    try {
      const data = await fetchInsightStats(clientId);
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (clientId) {
      load();
    } else {
      setIsLoading(false);
    }
  }, [clientId, load]);

  return { stats, isLoading, refetch: load };
}
