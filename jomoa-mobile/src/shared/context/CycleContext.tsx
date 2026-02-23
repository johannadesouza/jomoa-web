/**
 * CycleContext – single source of truth for cycle data
 * All cycle UI (calendar, dashboard, insights, training adjustments) reads from here.
 * Invalidate when period is logged so all consumers refresh.
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getLatestPeriodStart } from "../../lib/services/cycleService";
import {
  calculateCyclePhase,
  getPhaseLabel,
  getDaysUntilNextPeriod,
  type CyclePhase,
} from "../../lib/utils/cycleUtils";
import { useAuth } from "./AuthContext";

const DEFAULT_CYCLE_LENGTH = 28;

export interface CycleState {
  latestPeriodStart: string | null;
  cycleLength: number;
  phase: CyclePhase;
  phaseLabel: string;
  cycleDay: number;
  daysUntilNextPeriod: number | null;
  isLoading: boolean;
  error: string | null;
}

interface CycleContextType extends CycleState {
  refetch: () => Promise<void>;
  getPhaseForDate: (date: Date) => { phase: CyclePhase; cycleDay: number; phaseLabel: string };
}

const CycleContext = createContext<CycleContextType | undefined>(undefined);

export function CycleProvider({ children }: { children: React.ReactNode }) {
  const { client } = useAuth();
  const [latestPeriodStart, setLatestPeriodStart] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cycleLength =
    client?.cycle_length != null && client.cycle_length > 0
      ? client.cycle_length
      : DEFAULT_CYCLE_LENGTH;

  const fetchLatestPeriod = useCallback(async () => {
    if (!client?.id) {
      setLatestPeriodStart(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await getLatestPeriodStart(client.id);
      setLatestPeriodStart(data);
      setError(error);
    } catch (e) {
      setLatestPeriodStart(null);
      setError(e instanceof Error ? e.message : "Kunde inte hämta");
    } finally {
      setIsLoading(false);
    }
  }, [client?.id]);

  useEffect(() => {
    fetchLatestPeriod();
  }, [fetchLatestPeriod]);

  const { phase, cycleDay } = calculateCyclePhase(
    latestPeriodStart,
    new Date(),
    cycleLength
  );
  const phaseLabel = getPhaseLabel(phase);
  const daysUntilNextPeriod = getDaysUntilNextPeriod(
    latestPeriodStart,
    cycleLength
  );

  const getPhaseForDate = useCallback(
    (date: Date) => {
      const { phase: p, cycleDay: cd } = calculateCyclePhase(
        latestPeriodStart,
        date,
        cycleLength
      );
      return {
        phase: p,
        cycleDay: cd,
        phaseLabel: getPhaseLabel(p),
      };
    },
    [latestPeriodStart, cycleLength]
  );

  const value: CycleContextType = {
    latestPeriodStart,
    cycleLength,
    phase,
    phaseLabel,
    cycleDay,
    daysUntilNextPeriod,
    isLoading,
    error,
    refetch: fetchLatestPeriod,
    getPhaseForDate,
  };

  return (
    <CycleContext.Provider value={value}>{children}</CycleContext.Provider>
  );
}

export function useCycleContext() {
  const context = useContext(CycleContext);
  if (context === undefined) {
    throw new Error("useCycleContext must be used within CycleProvider");
  }
  return context;
}
