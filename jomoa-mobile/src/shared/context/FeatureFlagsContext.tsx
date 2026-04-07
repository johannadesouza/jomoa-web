/**
 * Feature flags / remote config – hämtas vid start.
 * Använd useFeatureFlags() för att läsa; skärmar importerar inte Supabase.
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchAppConfig, type FeatureFlags } from "../../lib/services/appConfigService";
import { isDemoMode } from "../../lib/demo/demoMode";

type FeatureFlagsState = {
  flags: FeatureFlags;
  isLoading: boolean;
};

const defaultState: FeatureFlagsState = { flags: {}, isLoading: true };
const FeatureFlagsContext = createContext<FeatureFlagsState>(defaultState);

export function FeatureFlagsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FeatureFlagsState>(defaultState);

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7348/ingest/41ec0831-5954-48fc-a855-14be2128bf09',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a405e1'},body:JSON.stringify({sessionId:'a405e1',runId:'pre-fix',hypothesisId:'H5',location:'FeatureFlagsContext.tsx:effect',message:'FeatureFlagsProvider effect tick',data:{isDemoMode:isDemoMode()},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (isDemoMode()) {
      setState({ flags: {}, isLoading: false });
      return;
    }
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
