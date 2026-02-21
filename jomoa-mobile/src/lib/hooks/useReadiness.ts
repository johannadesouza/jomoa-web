import { useEffect, useState } from "react";
import { getTodayReadiness } from "../services/readinessService";
import type { ReadinessRecord } from "../services/readinessService";

interface UseReadinessResult {
  readiness: ReadinessRecord | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useReadiness(clientId: string | undefined): UseReadinessResult {
  const [readiness, setReadiness] = useState<ReadinessRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReadiness = async () => {
    if (!clientId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    const { data, error: err } = await getTodayReadiness(clientId);
    setReadiness(data);
    setError(err);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReadiness();
  }, [clientId]);

  return { readiness, isLoading, error, refetch: fetchReadiness };
}
