/**
 * cycleEngineService – event-driven cycle engine (DB layer)
 *
 * Pure calculation functions live in src/lib/utils/cycleEngine.ts
 * and are re-exported here for convenience.
 */

import { supabase } from "../../config/supabase";
import {
  dateDiffDays,
  addDaysToDate,
  todayString,
  VALID_CYCLE_MAX,
  VALID_CYCLE_MIN,
} from "../utils/cycleEngine";

// Re-export pure functions & types so consumers only need one import
export {
  dateDiffDays,
  addDaysToDate,
  todayString,
  getCyclePhase,
  getOverdueState,
  computePhaseBoundaries,
} from "../utils/cycleEngine";

export type {
  CycleMode,
  OverdueState,
  CycleStatus,
} from "../utils/cycleEngine";

// ─── DB-facing types ──────────────────────────────────────────────────────────

import type { CycleStatus, OverdueState } from "../utils/cycleEngine";

export interface CycleRecord {
  id: string;
  client_id: string;
  start_date: string;
  end_date: string | null;
  length_days: number | null;
  status: CycleStatus;
  computed_at: string;
}

export interface CycleStats {
  client_id: string;
  rolling_avg_days: number | null;
  rolling_std_dev_days: number;
  last_cycle_length_days: number | null;
  last_period_start_date: string | null;
  last_updated_at: string;
}

export interface UserCycleSettings {
  client_id: string;
  mode: import("../utils/cycleEngine").CycleMode;
  missing_period_threshold_days: number;
  overdue_soft_days: number;
  overdue_hard_days: number;
}

export interface PerimenopauseSymptoms {
  hot_flashes: boolean;
  sleep_disruption: boolean;
  joint_stiffness: boolean;
  energy_crash: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLLING_N = 6;

// ─── Rolling stats helpers (pure) ────────────────────────────────────────────

function mean(values: number[]): number {
  if (values.length === 0) return 28;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function stddev(values: number[], avg: number): number {
  if (values.length <= 1) return 0;
  const variance =
    values.reduce((s, v) => s + (v - avg) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

// ─── DB reads ─────────────────────────────────────────────────────────────────

/** Fetch the current active cycle for a user (end_date IS NULL). */
export async function getActiveCycle(
  clientId: string
): Promise<CycleRecord | null> {
  const { data, error } = await supabase
    .from("cycles")
    .select("*")
    .eq("client_id", clientId)
    .is("end_date", null)
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return null;
  return (data as CycleRecord) ?? null;
}

/** Fetch cycle stats for a user. */
export async function getCycleStats(
  clientId: string
): Promise<CycleStats | null> {
  const { data, error } = await supabase
    .from("cycle_stats")
    .select("*")
    .eq("client_id", clientId)
    .maybeSingle();

  if (error) return null;
  return (data as CycleStats) ?? null;
}

/** Fetch user cycle settings, creating defaults if none exist. */
export async function getUserCycleSettings(
  clientId: string
): Promise<UserCycleSettings> {
  const { data } = await supabase
    .from("user_cycle_settings")
    .select("*")
    .eq("client_id", clientId)
    .maybeSingle();

  if (data) return data as UserCycleSettings;

  const defaults: UserCycleSettings = {
    client_id: clientId,
    mode: "regular",
    missing_period_threshold_days: 60,
    overdue_soft_days: 3,
    overdue_hard_days: 7,
  };
  await supabase.from("user_cycle_settings").upsert(defaults);
  return defaults;
}

/** Update the user's cycle mode. */
export async function updateCycleMode(
  clientId: string,
  mode: import("../utils/cycleEngine").CycleMode
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("user_cycle_settings")
    .upsert(
      { client_id: clientId, mode, updated_at: new Date().toISOString() },
      { onConflict: "client_id" }
    );
  return { error: error?.message ?? null };
}

/** Recompute and upsert CycleStats from the last N closed cycles. */
export async function recomputeCycleStats(
  clientId: string,
  n: number = ROLLING_N
): Promise<{ error: string | null }> {
  try {
    const { data: closed, error: closedError } = await supabase
      .from("cycles")
      .select("length_days, start_date")
      .eq("client_id", clientId)
      .in("status", ["closed", "irregular"])
      .not("length_days", "is", null)
      .order("start_date", { ascending: false })
      .limit(n);

    if (closedError) throw closedError;

    const lengths: number[] = (closed ?? [])
      .map((r: { length_days: number | null }) => r.length_days)
      .filter((v): v is number => v != null);

    const rollingAvg = lengths.length > 0 ? mean(lengths) : null;
    const rollingStdDev = rollingAvg != null ? stddev(lengths, rollingAvg) : 0;
    const lastLength = lengths[0] ?? null;

    const { data: latestLog } = await supabase
      .from("cycle_logs")
      .select("start_date")
      .eq("client_id", clientId)
      .order("start_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { error: upsertError } = await supabase.from("cycle_stats").upsert(
      {
        client_id: clientId,
        rolling_avg_days: rollingAvg,
        rolling_std_dev_days: rollingStdDev,
        last_cycle_length_days: lastLength,
        last_period_start_date: latestLog?.start_date ?? null,
        last_updated_at: new Date().toISOString(),
      },
      { onConflict: "client_id" }
    );

    if (upsertError) throw upsertError;
    return { error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "recomputeCycleStats failed";
    console.error("[cycleEngine] recomputeCycleStats:", msg);
    return { error: msg };
  }
}

/**
 * Core engine: called when user logs a period start.
 * 1. De-duplicates same-day logs.
 * 2. Prevents backdating before active cycle start.
 * 3. Closes the active cycle if one exists.
 * 4. Opens a new active cycle.
 * 5. Recomputes stats.
 */
export async function openCloseCycle(
  clientId: string,
  newStartDate: string
): Promise<{ error: string | null }> {
  try {
    // Check for duplicate
    const { data: existing } = await supabase
      .from("cycle_logs")
      .select("id")
      .eq("client_id", clientId)
      .eq("start_date", newStartDate)
      .maybeSingle();

    if (existing) return { error: null }; // already logged this day

    const active = await getActiveCycle(clientId);

    if (active) {
      if (newStartDate <= active.start_date) {
        return {
          error: `Datumet (${newStartDate}) kan inte vara före eller samma dag som den aktiva cykeln (${active.start_date}).`,
        };
      }

      const lengthDays = dateDiffDays(active.start_date, newStartDate);
      const isIrregular =
        lengthDays < VALID_CYCLE_MIN || lengthDays > VALID_CYCLE_MAX;

      const { error: closeError } = await supabase
        .from("cycles")
        .update({
          end_date: newStartDate,
          length_days: lengthDays,
          status: isIrregular ? "irregular" : "closed",
          computed_at: new Date().toISOString(),
        })
        .eq("id", active.id);

      if (closeError) {
        return { error: closeError.message };
      }
    }

    // Upsert log
    await supabase.from("cycle_logs").upsert(
      { client_id: clientId, start_date: newStartDate },
      { onConflict: "client_id,start_date" }
    );

    // Open new cycle
    await supabase.from("cycles").insert({
      client_id: clientId,
      start_date: newStartDate,
      end_date: null,
      length_days: null,
      status: "active",
      computed_at: new Date().toISOString(),
    });

    await recomputeCycleStats(clientId);
    return { error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Okänt fel";
    console.error("openCloseCycle:", msg);
    return { error: msg };
  }
}

/**
 * Update active cycle status (delayed / irregular) based on overdue state.
 */
export async function updateActiveCycleStatus(
  clientId: string,
  overdueState: OverdueState,
  rollingStdDev: number
): Promise<void> {
  const active = await getActiveCycle(clientId);
  if (!active) return;

  let newStatus: CycleStatus = "active";
  if (overdueState === "hard") {
    newStatus = "delayed";
  } else if (rollingStdDev >= 7) {
    newStatus = "irregular";
  }

  if (newStatus !== active.status) {
    await supabase
      .from("cycles")
      .update({ status: newStatus, computed_at: new Date().toISOString() })
      .eq("id", active.id);
  }
}

/**
 * Migration helper – creates active cycle + baseline stats for users who
 * don't have cycle_stats yet.
 *
 * Priority for the seed start date:
 *  1. Latest period_start from the legacy `cycle_events` table
 *  2. Existing active cycle in `cycles` (already created)
 *  3. Synthetic start = today - (currentDisplayedDay - 1) as last resort
 */
export async function migrateExistingUser(
  clientId: string,
  currentDisplayedDay: number = 1,
  today?: string
): Promise<void> {
  const todayStr = today ?? todayString();
  const { data: existingStats } = await supabase
    .from("cycle_stats")
    .select("client_id")
    .eq("client_id", clientId)
    .maybeSingle();

  if (existingStats) return;

  // Try to find the latest period_start from legacy cycle_events
  const { data: legacyEvent } = await supabase
    .from("cycle_events")
    .select("date")
    .eq("client_id", clientId)
    .eq("event_type", "period_start")
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const legacyStart: string | null = legacyEvent?.date ?? null;

  // Also check if an active cycle already exists
  const active = await getActiveCycle(clientId);

  // Determine best seed start date
  const fallbackStart = addDaysToDate(
    todayStr,
    -(Math.max(1, currentDisplayedDay) - 1)
  );
  const seedStart = legacyStart ?? active?.start_date ?? fallbackStart;

  if (!active) {
    // Create the active cycle from the best available start date
    await supabase.from("cycles").insert({
      client_id: clientId,
      start_date: seedStart,
      end_date: null,
      length_days: null,
      status: "active",
      computed_at: new Date().toISOString(),
    });
    await supabase.from("cycle_logs").upsert(
      { client_id: clientId, start_date: seedStart },
      { onConflict: "client_id,start_date" }
    );
  } else if (legacyStart && legacyStart !== active.start_date) {
    // An active cycle exists but its start differs from the legacy log.
    // If the legacy start is more recent, update the active cycle.
    if (legacyStart > active.start_date) {
      await supabase
        .from("cycles")
        .update({
          start_date: legacyStart,
          computed_at: new Date().toISOString(),
        })
        .eq("id", active.id);
      await supabase.from("cycle_logs").upsert(
        { client_id: clientId, start_date: legacyStart },
        { onConflict: "client_id,start_date" }
      );
    }
  }

  const latestStart = legacyStart ?? active?.start_date ?? seedStart;

  await supabase.from("cycle_stats").upsert(
    {
      client_id: clientId,
      rolling_avg_days: 28,
      rolling_std_dev_days: 0,
      last_cycle_length_days: null,
      last_period_start_date: latestStart,
      last_updated_at: new Date().toISOString(),
    },
    { onConflict: "client_id" }
  );

  await getUserCycleSettings(clientId);
}

// ─── Perimenopause symptoms ───────────────────────────────────────────────────

/** Save perimenopause symptom flags to today's cycle_symptoms record. */
export async function savePerimenopauseSymptoms(
  clientId: string,
  symptoms: PerimenopauseSymptoms,
  today?: string
): Promise<{ error: string | null }> {
  const todayStr = today ?? todayString();
  const { error } = await supabase.from("cycle_symptoms").upsert(
    {
      client_id: clientId,
      date: todayStr,
      hot_flashes: symptoms.hot_flashes,
      sleep_disruption: symptoms.sleep_disruption,
      joint_stiffness: symptoms.joint_stiffness,
      energy_crash: symptoms.energy_crash,
    },
    { onConflict: "client_id,date" }
  );
  return { error: error?.message ?? null };
}

/** Fetch today's perimenopause symptom flags. */
export async function getTodayPerimenopauseSymptoms(
  clientId: string,
  today?: string
): Promise<PerimenopauseSymptoms | null> {
  const todayStr = today ?? todayString();
  const { data, error } = await supabase
    .from("cycle_symptoms")
    .select("hot_flashes, sleep_disruption, joint_stiffness, energy_crash")
    .eq("client_id", clientId)
    .eq("date", todayStr)
    .maybeSingle();

  if (error || !data) return null;
  return {
    hot_flashes: data.hot_flashes ?? false,
    sleep_disruption: data.sleep_disruption ?? false,
    joint_stiffness: data.joint_stiffness ?? false,
    energy_crash: data.energy_crash ?? false,
  };
}
