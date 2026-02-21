import { useEffect, useState } from "react";
import { fetchInsightStats } from "../services/workoutLogService";
import { InsightStats } from "../services/workoutLogService";

export function useInsights(clientId: string | undefined) {
  const [stats, setStats] = useState<InsightStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (clientId) {
      load();
    } else {
      setIsLoading(false);
    }
  }, [clientId]);

  async function load() {
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
  }

  return { stats, isLoading, refetch: load };
}
