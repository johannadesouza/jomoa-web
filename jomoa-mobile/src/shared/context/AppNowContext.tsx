/**
 * AppNowContext – injectable "current time" for tests and scenarios.
 * Defaults to real time; can be overridden (e.g. __DEV__ scenario menu).
 */

import React, { createContext, useContext, useMemo, useState } from "react";

export interface AppNowValue {
  /** YYYY-MM-DD for "today" in app logic */
  todayString: () => string;
  /** Current Date (for greeting hour, etc.) */
  now: () => Date;
  /** Override "today" for scenario/testing (e.g. "2025-03-15"). Clear with null. */
  setTodayOverride: (date: string | null) => void;
  /** Override "now" for scenario/testing. Clear with null. */
  setNowOverride: (date: Date | null) => void;
}

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const AppNowContext = createContext<AppNowValue | undefined>(undefined);

export function AppNowProvider({ children }: { children: React.ReactNode }) {
  const [todayOverride, setTodayOverrideState] = useState<string | null>(null);
  const [nowOverride, setNowOverrideState] = useState<Date | null>(null);

  const value = useMemo<AppNowValue>(() => ({
    todayString: () => todayOverride ?? toDateString(new Date()),
    now: () => nowOverride ?? new Date(),
    setTodayOverride: setTodayOverrideState,
    setNowOverride: setNowOverrideState,
  }), [todayOverride, nowOverride]);

  return (
    <AppNowContext.Provider value={value}>
      {children}
    </AppNowContext.Provider>
  );
}

export function useAppNow(): AppNowValue {
  const ctx = useContext(AppNowContext);
  if (!ctx) {
    return {
      todayString: () => toDateString(new Date()),
      now: () => new Date(),
      setTodayOverride: () => {},
      setNowOverride: () => {},
    };
  }
  return ctx;
}
