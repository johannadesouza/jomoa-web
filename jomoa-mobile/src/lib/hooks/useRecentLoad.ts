import { useEffect, useState, useCallback } from "react";
import { fetchRecentLoad, type RecentLoad } from "../services/workoutLogService";

export function useRecentLoad(clientId: string | undefined): RecentLoad | null {
  const [recentLoad, setRecentLoad] = useState<RecentLoad | null>(null);

  const load = useCallback(async () => {
    if (!clientId) {
      setRecentLoad(null);
      return;
    }
    try {
      const data = await fetchRecentLoad(clientId);
      setRecentLoad(data);
    } catch {
      setRecentLoad(null);
    }
  }, [clientId]);

  useEffect(() => {
    load();
  }, [load]);

  return recentLoad;
}
