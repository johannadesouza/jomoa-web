/**
 * ScenarioContext – __DEV__ overrides for testing (idag, fas, readiness).
 * AppNowContext hanterar "idag"; denna hanterar fas + readiness.
 */

import React, { createContext, useContext, useState, useMemo } from "react";
import type { CyclePhase } from "../../lib/utils/cycleUtils";

export interface ScenarioValue {
  phaseOverride: CyclePhase | null;
  readinessOverride: number | null;
  setPhaseOverride: (phase: CyclePhase | null) => void;
  setReadinessOverride: (score: number | null) => void;
}

const ScenarioContext = createContext<ScenarioValue | undefined>(undefined);

export function ScenarioProvider({ children }: { children: React.ReactNode }) {
  const [phaseOverride, setPhaseOverride] = useState<CyclePhase | null>(null);
  const [readinessOverride, setReadinessOverride] = useState<number | null>(null);

  const value = useMemo<ScenarioValue>(
    () => ({
      phaseOverride,
      readinessOverride,
      setPhaseOverride,
      setReadinessOverride,
    }),
    [phaseOverride, readinessOverride]
  );

  return (
    <ScenarioContext.Provider value={value}>
      {children}
    </ScenarioContext.Provider>
  );
}

export function useScenario(): ScenarioValue {
  const ctx = useContext(ScenarioContext);
  if (!ctx) {
    return {
      phaseOverride: null,
      readinessOverride: null,
      setPhaseOverride: () => {},
      setReadinessOverride: () => {},
    };
  }
  return ctx;
}
