import { useEffect, useState, useCallback } from "react";
import {
  fetchEarnedAwards,
  ensureAwardsSynced,
  type ClientAward,
} from "../services/awardsService";

export function useAwards(clientId: string | undefined) {
  const [awards, setAwards] = useState<ClientAward[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!clientId) {
      setAwards([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      await ensureAwardsSynced(clientId);
      const data = await fetchEarnedAwards(clientId);
      setAwards(data);
    } catch {
      setAwards([]);
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    load();
  }, [load]);

  return { awards, isLoading, refetch: load };
}
