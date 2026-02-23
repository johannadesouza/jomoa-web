import { useEffect, useState, useCallback } from "react";
import { getReadinessForDate } from "../services/readinessService";
import { getLocalDateString } from "../utils/date";
import type { ReadinessRecord } from "../services/readinessService";

interface UseReadinessResult {
  readiness: ReadinessRecord | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useReadiness(
  clientId: string | undefined,
  date?: string
): UseReadinessResult {
  const viewDate = date ?? getLocalDateString();
  const [readiness, setReadiness] = useState<ReadinessRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReadiness = useCallback(async () => {
    if (!clientId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: err } = await getReadinessForDate(clientId, viewDate);
      setReadiness(data);
      setError(err);
    } catch (e) {
      setReadiness(null);
      setError(e instanceof Error ? e.message : "Kunde inte hämta");
    } finally {
      setIsLoading(false);
    }
  }, [clientId, viewDate]);

  useEffect(() => {
    fetchReadiness();
  }, [fetchReadiness]);

  return { readiness, isLoading, error, refetch: fetchReadiness };
}
