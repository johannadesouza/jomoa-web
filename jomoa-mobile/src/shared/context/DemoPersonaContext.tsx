import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import type { DemoPersona } from "../../lib/demo/demoMode";
import { getDemoPersona, isDemoMode, setRuntimeDemoPersona } from "../../lib/demo/demoMode";

type DemoPersonaContextValue = {
  persona: DemoPersona;
  setPersona: (persona: DemoPersona) => Promise<void>;
  isReady: boolean;
  /** Increments on persona switch to invalidate demo data caches */
  epoch: number;
};

const STORAGE_KEY = "demo_persona";

const DemoPersonaContext = createContext<DemoPersonaContextValue | undefined>(undefined);

export function DemoPersonaProvider({ children }: { children: React.ReactNode }) {
  const [persona, setPersonaState] = useState<DemoPersona>(getDemoPersona());
  const [isReady, setIsReady] = useState(!isDemoMode());
  const [epoch, setEpoch] = useState(0);

  useEffect(() => {
    if (!isDemoMode()) return;
    setRuntimeDemoPersona(persona);
  }, [persona]);

  useEffect(() => {
    if (!isDemoMode()) return;
    let cancelled = false;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (cancelled) return;
        if (stored === "strength_3x" || stored === "cycle_only" || stored === "perimenopause") {
          setPersonaState(stored);
        } else {
          setPersonaState(getDemoPersona());
        }
      } finally {
        if (!cancelled) setIsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<DemoPersonaContextValue>(
    () => ({
      persona,
      isReady,
      epoch,
      setPersona: async (p) => {
        setEpoch((n) => n + 1);
        setPersonaState(p);
        if (isDemoMode()) {
          await AsyncStorage.setItem(STORAGE_KEY, p);
        }
      },
    }),
    [persona, isReady, epoch]
  );

  return <DemoPersonaContext.Provider value={value}>{children}</DemoPersonaContext.Provider>;
}

export function useDemoPersona(): DemoPersonaContextValue {
  const ctx = useContext(DemoPersonaContext);
  if (!ctx) {
    return {
      persona: getDemoPersona(),
      isReady: !isDemoMode(),
      setPersona: async () => {},
      epoch: 0,
    };
  }
  return ctx;
}

