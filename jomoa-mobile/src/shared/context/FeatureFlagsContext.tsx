/**
 * Feature flags / remote config – hämtas vid start.
 * Använd useFeatureFlags() för att läsa; skärmar importerar inte Supabase.
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchAppConfig, type FeatureFlags } from "../../lib/services/appConfigService";

type FeatureFlagsState = {
  flags: FeatureFlags;
  isLoading: boolean;
};

const defaultState: FeatureFlagsState = { flags: {}, isLoading: true };
const FeatureFlagsContext = createContext<FeatureFlagsState>(defaultState);

export function FeatureFlagsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FeatureFlagsState>(defaultState);

  useEffect(() => {
    let cancelled = false;
    fetchAppConfig().then((flags) => {
      if (!cancelled) setState({ flags, isLoading: false });
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <FeatureFlagsContext.Provider value={state}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags(): FeatureFlags {
  const { flags } = useContext(FeatureFlagsContext);
  return flags;
}

export function useFeatureFlagsLoading(): boolean {
  const { isLoading } = useContext(FeatureFlagsContext);
  return isLoading;
}
