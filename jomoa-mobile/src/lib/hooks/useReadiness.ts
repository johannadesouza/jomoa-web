import { useEffect, useState, useCallback, useMemo } from "react";
import { useAppNow } from "../../shared/context/AppNowContext";
import { useScenario } from "../../shared/context/ScenarioContext";
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
  const appNow = useAppNow();
  const scenario = useScenario();
  const viewDate = date ?? appNow.todayString();
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

  // __DEV__ scenario: override today's readiness score when set
  const effectiveReadiness = useMemo(() => {
    if (scenario.readinessOverride == null || viewDate !== appNow.todayString()) return readiness;
    const base = readiness ?? {
      id: "",
      client_id: clientId ?? "",
      date: viewDate,
      sleep_hours: null,
      sleep_quality: null,
      stress_level: null,
      energy_level: null,
      soreness: null,
      readiness_score: null,
      created_at: "",
      updated_at: "",
    };
    return { ...base, readiness_score: scenario.readinessOverride };
  }, [readiness, scenario.readinessOverride, viewDate, appNow, clientId]);

  return { readiness: effectiveReadiness, isLoading, error, refetch: fetchReadiness };
}
