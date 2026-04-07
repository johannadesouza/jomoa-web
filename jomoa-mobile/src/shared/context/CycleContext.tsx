/**
 * CycleContext – single source of truth for cycle data.
 *
 * Extended to support:
 *  - Dynamic cycle length from rolling stats
 *  - Overdue state (none / soft / hard)
 *  - Cycle mode (regular / missing_period / perimenopause)
 *  - logPeriodStart action (replaces direct cycleService calls)
 *  - updateMode action
 *  - First-run migration for existing users
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  getCyclePhase,
  getOverdueState,
  dateDiffDays,
} from "../../lib/utils/cycleEngine";
import type { CycleMode, OverdueState } from "../../lib/utils/cycleEngine";
import {
  getActiveCycle,
  getCycleStats,
  getUserCycleSettings,
  openCloseCycle,
  updateCycleMode,
  migrateExistingUser,
  type CycleRecord,
  type CycleStats,
  type UserCycleSettings,
} from "../../lib/services/cycleEngineService";
import {
  getDaysUntilNextPeriod,
  getPhaseLabel,
  type CyclePhase,
} from "../../lib/utils/cycleUtils";
import { useAuth } from "./AuthContext";
import { useAppNow } from "./AppNowContext";
import { useScenario } from "./ScenarioContext";
import { isDemoMode } from "../../lib/demo/demoMode";
import { useDemoPersona } from "./DemoPersonaContext";
import { getDemoCycle } from "../../lib/demo/demoData";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CycleContextValue {
  // Core phase info
  phase: CyclePhase;
  phaseLabel: string;
  cycleDay: number;
  daysUntilNextPeriod: number | null;
  isLoading: boolean;
  error: string | null;

  // Backward-compat fields
  latestPeriodStart: string | null;
  cycleLength: number; // round(rollingAvg) or 28

  // New engine fields
  mode: CycleMode;
  cycleLengthDisplay: number;         // round(rollingAvg) or 28 – shown as "av ~Y"
  rollingAvg: number | null;
  rollingStdDev: number;
  overdueState: OverdueState;
  activeCycleStartDate: string | null;
  stats: CycleStats | null;
  settings: UserCycleSettings | null;
  missingPeriodSuggestion: boolean;   // true when days since last period > threshold

  // Actions
  logPeriodStart: (date: string) => Promise<{ error: string | null }>;
  updateMode: (mode: CycleMode) => Promise<void>;
  refetch: () => Promise<void>;
  getPhaseForDate: (date: Date) => { phase: CyclePhase; cycleDay: number; phaseLabel: string };
}

const CycleContext = createContext<CycleContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CycleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const appNow = useAppNow();
  const scenario = useScenario();
  const demo = useDemoPersona();

  const [activeCycle, setActiveCycle] = useState<CycleRecord | null>(null);
  const [stats, setStats] = useState<CycleStats | null>(null);
  const [settings, setSettings] = useState<UserCycleSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  // Use auth user.id (= auth.uid()) so RLS policies pass.
  // client.id is the clients-table PK and does NOT match auth.uid().
  const clientId = user?.id;

  const load = useCallback(async () => {
    // #region agent log
    fetch('http://127.0.0.1:7348/ingest/41ec0831-5954-48fc-a855-14be2128bf09',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a405e1'},body:JSON.stringify({sessionId:'a405e1',runId:'pre-fix',hypothesisId:'H2',location:'CycleContext.tsx:load',message:'CycleProvider load enter',data:{isDemoMode:isDemoMode(),demoIsReady:demo.isReady,demoPersona:demo.persona,clientId:clientId??null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (!clientId) {
      setIsLoading(false);
      return;
    }
    if (isDemoMode() && demo.isReady) {
      const today = appNow.todayString();
      const d = getDemoCycle(demo.persona, today);
      // #region agent log
      fetch('http://127.0.0.1:7348/ingest/41ec0831-5954-48fc-a855-14be2128bf09',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a405e1'},body:JSON.stringify({sessionId:'a405e1',runId:'pre-fix',hypothesisId:'H2',location:'CycleContext.tsx:demoBranch',message:'CycleProvider demo branch',data:{today,dPresent:!!d,dMode:d?.mode??null,dStartDate:d?.startDate??null},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      if (!d) {
        setActiveCycle(null);
        setStats(null);
        setSettings(null);
        setIsLoading(false);
        return;
      }
      setActiveCycle({ id: `demo_cycle_${demo.persona}`, client_id: clientId, start_date: d.startDate, end_date: null } as CycleRecord);
      setStats({
        id: `demo_cycle_stats_${demo.persona}`,
        client_id: clientId,
        rolling_avg_days: d.cycleLength,
        rolling_std_dev_days: 2,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      } as CycleStats);
      setSettings({
        id: `demo_cycle_settings_${demo.persona}`,
        client_id: clientId,
        mode: d.mode,
        overdue_soft_days: 3,
        overdue_hard_days: 7,
        missing_period_threshold_days: 60,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as UserCycleSettings);
      setIsLoading(false);
      return;
    }
    // Prevent concurrent overlapping loads (e.g. rapid re-mounts / token refresh)
    if (loadingRef.current) return;
    loadingRef.current = true;

    setIsLoading(true);
    setError(null);

    try {
      // Run migration for users with no stats yet (no-op if already migrated)
      await migrateExistingUser(clientId, 1, appNow.todayString());

      const [activeResult, statsResult, settingsResult] = await Promise.all([
        getActiveCycle(clientId),
        getCycleStats(clientId),
        getUserCycleSettings(clientId),
      ]);

      setActiveCycle(activeResult);
      setStats(statsResult);
      setSettings(settingsResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kunde inte ladda cykeldata");
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [clientId, appNow, demo.persona, demo.isReady]);

  useEffect(() => {
    load();
  }, [load]);

  // ─── Derived values ──────────────────────────────────────────────────────

  const mode: CycleMode = settings?.mode ?? "regular";
  const rollingAvg = stats?.rolling_avg_days ?? null;
  const rollingStdDev = stats?.rolling_std_dev_days ?? 0;
  const activeCycleStartDate = activeCycle?.start_date ?? null;

  // Effective cycle length for display and phase calculation
  const cycleLengthDisplay =
    rollingAvg != null ? Math.round(rollingAvg) : 28;
  const cycleLength = cycleLengthDisplay; // backward-compat alias

  // Current cycle day (1-based) – use AppNow so scenario/debug can override "today"
  const today = appNow.todayString();
  const cycleDay =
    activeCycleStartDate
      ? dateDiffDays(activeCycleStartDate, today) + 1
      : 0;

  // Phase (only in regular mode) – scenario override for __DEV__ testing (only when mode is regular)
  const computedPhase: CyclePhase =
    mode === "regular" && cycleDay > 0
      ? getCyclePhase(cycleDay, cycleLengthDisplay)
      : null;
  const phase: CyclePhase =
    mode === "regular" && scenario.phaseOverride != null
      ? scenario.phaseOverride
      : computedPhase;
  const phaseLabel = getPhaseLabel(phase);

  // Days until next period estimate
  const daysUntilNextPeriod =
    mode === "regular" && activeCycleStartDate
      ? getDaysUntilNextPeriod(activeCycleStartDate, cycleLengthDisplay)
      : null;

  // Overdue state (only in regular mode)
  const overdueState: OverdueState =
    mode === "regular" && activeCycleStartDate && rollingAvg
      ? getOverdueState(
          today,
          activeCycleStartDate,
          rollingAvg,
          settings?.overdue_soft_days ?? 3,
          settings?.overdue_hard_days ?? 7
        )
      : "none";

  // Suggest switching to missing_period mode if > threshold days since last period
  const daysSincePeriod =
    activeCycleStartDate ? dateDiffDays(activeCycleStartDate, today) + 1 : 0;
  const missingPeriodSuggestion =
    mode === "regular" &&
    !!activeCycleStartDate &&
    daysSincePeriod > (settings?.missing_period_threshold_days ?? 60);

  // ─── Actions ────────────────────────────────────────────────────────────

  const handleLogPeriodStart = useCallback(
    async (date: string): Promise<{ error: string | null }> => {
      if (!clientId) return { error: "Ingen användare" };
      const result = await openCloseCycle(clientId, date);
      if (!result.error) {
        // Force a fresh load even if guard is set
        loadingRef.current = false;
        await load();
      }
      return result;
    },
    [clientId, load]
  );

  const handleUpdateMode = useCallback(
    async (newMode: CycleMode): Promise<void> => {
      if (!clientId) return;
      await updateCycleMode(clientId, newMode);
      setSettings((prev) =>
        prev ? { ...prev, mode: newMode } : null
      );
    },
    [clientId]
  );

  const getPhaseForDate = useCallback(
    (date: Date): { phase: CyclePhase; cycleDay: number; phaseLabel: string } => {
      if (mode !== "regular" || !activeCycleStartDate) {
        return { phase: null, cycleDay: 0, phaseLabel: getPhaseLabel(null) };
      }
      const dateStr = date.toISOString().slice(0, 10);
      const day = dateDiffDays(activeCycleStartDate, dateStr) + 1;
      if (day < 1) return { phase: null, cycleDay: day, phaseLabel: getPhaseLabel(null) };
      const p = getCyclePhase(day, cycleLengthDisplay);
      return { phase: p, cycleDay: day, phaseLabel: getPhaseLabel(p) };
    },
    [mode, activeCycleStartDate, cycleLengthDisplay]
  );

  // ─── Context value ───────────────────────────────────────────────────────

  const value: CycleContextValue = {
    phase,
    phaseLabel,
    cycleDay,
    daysUntilNextPeriod,
    isLoading,
    error,
    latestPeriodStart: activeCycleStartDate,
    cycleLength,
    mode,
    cycleLengthDisplay,
    rollingAvg,
    rollingStdDev,
    overdueState,
    activeCycleStartDate,
    stats,
    settings,
    missingPeriodSuggestion,
    logPeriodStart: handleLogPeriodStart,
    updateMode: handleUpdateMode,
    refetch: load,
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
