import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CyclePhase, calculateCyclePhase, getCycleColorClasses } from "@/lib/utils/cycleColors";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";

interface CycleStatus {
  cycleDay: number;
  phase: string;
  phaseEnum: CyclePhase | null;
  periodStartDate: string;
  confidence: number;
  isManual: boolean;
}

interface UseCycleDataReturn {
  latestPeriodStart: string | null;
  cycleStatus: CycleStatus | null;
  recentPeriodStarts: Array<{ date: string }>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook för att hämta och hantera cykeldata
 * Konsoliderar duplicerad logik från flera komponenter
 */
export function useCycleData(clientId: string | null): UseCycleDataReturn {
  const [latestPeriodStart, setLatestPeriodStart] = useState<string | null>(null);
  const [cycleStatus, setCycleStatus] = useState<CycleStatus | null>(null);
  const [recentPeriodStarts, setRecentPeriodStarts] = useState<Array<{ date: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestPeriodStart = useCallback(async () => {
    if (!clientId) {
      setLatestPeriodStart(null);
      setCycleStatus(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("cycle_events")
        .select("date")
        .eq("client_id", clientId)
        .eq("event_type", "period_start")
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error fetching period start:", fetchError);
        setError("Kunde inte hämta cykeldata.");
        setLatestPeriodStart(null);
        setCycleStatus(null);
        return;
      }

      if (data?.date) {
        setLatestPeriodStart(data.date);
      } else {
        setLatestPeriodStart(null);
        setCycleStatus(null);
      }
    } catch (err: unknown) {
      console.error("Unexpected error fetching period start:", err);
      setError(getErrorMessage(err));
      setLatestPeriodStart(null);
      setCycleStatus(null);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  const fetchRecentPeriodStarts = useCallback(async () => {
    if (!clientId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from("cycle_events")
        .select("date")
        .eq("client_id", clientId)
        .eq("event_type", "period_start")
        .order("date", { ascending: false })
        .limit(6);

      if (fetchError) {
        throw fetchError;
      }

      setRecentPeriodStarts((data || []) as Array<{ date: string }>);
    } catch (err: unknown) {
      console.error("Error fetching recent period starts:", err);
      // Tyst fel - det är okej om detta misslyckas
    }
  }, [clientId]);

  const updateCycleStatus = useCallback(async () => {
    if (!latestPeriodStart || !clientId) {
      setCycleStatus(null);
      return;
    }

    // Använd utility-funktion för att beräkna fas
    const { phase, cycleDay } = calculateCyclePhase(latestPeriodStart);
    const phaseLabel = phase ? getCycleColorClasses(phase).label : "Okänd / behöver ny mensstart";

    // Kontrollera om det finns manuell justering för idag
    const todayStr = new Date().toISOString().split("T")[0];
    try {
      const { data: manualPhase, error: manualPhaseError } = await supabase
        .from("cycle_phases")
        .select("phase, source")
        .eq("client_id", clientId)
        .eq("date", todayStr)
        .in("source", ["client", "coach"])
        .maybeSingle();

      if (manualPhaseError) {
        throw manualPhaseError;
      }

      let finalPhase: CyclePhase = phase;
      let finalPhaseLabel = phaseLabel;
      let isManual = false;
      let confidence = 70;

      if (manualPhase?.phase && manualPhase.phase !== "unknown") {
        // Validera att manualPhase.phase är en giltig CyclePhase
        if (["menstruation", "follicular", "ovulation", "luteal"].includes(manualPhase.phase)) {
          finalPhase = manualPhase.phase as CyclePhase;
          finalPhaseLabel = getCycleColorClasses(finalPhase).label;
          isManual = true;
          confidence = 100;
        }
      }

      setCycleStatus({
        cycleDay,
        phase: finalPhaseLabel,
        phaseEnum: finalPhase,
        periodStartDate: latestPeriodStart,
        confidence,
        isManual,
      });
    } catch (err: unknown) {
      // Om query misslyckas, använd beräknad fas
      console.error("Error checking manual phase adjustment:", err);
      setCycleStatus({
        cycleDay,
        phase: phaseLabel,
        phaseEnum: phase,
        periodStartDate: latestPeriodStart,
        confidence: 70,
        isManual: false,
      });
    }
  }, [latestPeriodStart, clientId]);

  const refetch = useCallback(async () => {
    await fetchLatestPeriodStart();
    await fetchRecentPeriodStarts();
  }, [fetchLatestPeriodStart, fetchRecentPeriodStarts]);

  useEffect(() => {
    if (clientId) {
      fetchLatestPeriodStart();
      fetchRecentPeriodStarts();
    }
  }, [clientId, fetchLatestPeriodStart, fetchRecentPeriodStarts]);

  useEffect(() => {
    if (latestPeriodStart && clientId) {
      updateCycleStatus();
    } else {
      setCycleStatus(null);
    }
  }, [latestPeriodStart, clientId, updateCycleStatus]);

  return {
    latestPeriodStart,
    cycleStatus,
    recentPeriodStarts,
    loading,
    error,
    refetch,
  };
}

