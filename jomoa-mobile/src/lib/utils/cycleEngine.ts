/**
 * cycleEngine – pure (no-DB) cycle calculation functions.
 * Importable in tests and UI without pulling in Supabase.
 */

import type { CyclePhase } from "./cycleUtils";

export type CycleMode = "regular" | "missing_period" | "perimenopause";
export type OverdueState = "none" | "soft" | "hard";
export type CycleStatus = "active" | "closed" | "delayed" | "irregular" | "unknown";

// ─── Phase proportions & constraints ─────────────────────────────────────────

const PROPORTIONS = {
  menstrual: 0.18,
  follicular: 0.32,
  ovulation: 0.10,
  luteal: 0.40,
} as const;

const PHASE_MIN_MAX = {
  menstrual:  { min: 3, max: 7 },
  ovulation:  { min: 2, max: 4 },
  luteal:     { min: 9, max: Infinity },
  follicular: { min: 1, max: Infinity },
} as const;

export const VALID_CYCLE_MIN = 10;
export const VALID_CYCLE_MAX = 60;

// ─── Date helpers ─────────────────────────────────────────────────────────────

/** Days between two YYYY-MM-DD strings (to - from). Uses noon to stay locale-safe. */
export function dateDiffDays(from: string, to: string): number {
  const a = new Date(from + "T12:00:00").getTime();
  const b = new Date(to   + "T12:00:00").getTime();
  return Math.round((b - a) / 86_400_000);
}

/** Today as YYYY-MM-DD. Pass asOfDate for tests/scenarios. */
export function todayString(asOfDate?: string): string {
  if (asOfDate != null && asOfDate !== "") return asOfDate;
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Offset a YYYY-MM-DD string by delta days. */
export function addDaysToDate(dateStr: string, delta: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
}

// ─── Phase boundaries ─────────────────────────────────────────────────────────

/**
 * Compute proportional phase day-counts for a given cycle length.
 * Result always sums to cycleLengthDays.
 */
export function computePhaseBoundaries(cycleLengthDays: number): {
  menstrual: number;
  follicular: number;
  ovulation: number;
  luteal: number;
} {
  const len = cycleLengthDays;

  let menstrual = Math.round(len * PROPORTIONS.menstrual);
  let ovulation = Math.round(len * PROPORTIONS.ovulation);

  menstrual = Math.max(PHASE_MIN_MAX.menstrual.min, Math.min(PHASE_MIN_MAX.menstrual.max, menstrual));
  ovulation = Math.max(PHASE_MIN_MAX.ovulation.min, Math.min(PHASE_MIN_MAX.ovulation.max, ovulation));
  let luteal = Math.max(PHASE_MIN_MAX.luteal.min, Math.round(len * PROPORTIONS.luteal));

  let follicular = len - menstrual - ovulation - luteal;
  if (follicular < PHASE_MIN_MAX.follicular.min) {
    follicular = PHASE_MIN_MAX.follicular.min;
    luteal = len - menstrual - ovulation - follicular;
    if (luteal < PHASE_MIN_MAX.luteal.min) luteal = PHASE_MIN_MAX.luteal.min;
    follicular = len - menstrual - ovulation - luteal;
    if (follicular < 1) follicular = 1;
  }

  return { menstrual, follicular, ovulation, luteal };
}

/**
 * Given a 1-based cycleDay and an (optional) cycle length, return the phase.
 * Falls back to 28 if cycleLengthDays is unknown / too short.
 */
export function getCyclePhase(
  dayIndex: number,
  cycleLengthDays: number | null | undefined
): CyclePhase {
  const len =
    cycleLengthDays && cycleLengthDays >= VALID_CYCLE_MIN ? cycleLengthDays : 28;

  // Wrap into [1, len]
  const day = ((dayIndex - 1) % len) + 1;
  const { menstrual, follicular, ovulation } = computePhaseBoundaries(len);

  if (day <= menstrual)                          return "menstruation";
  if (day <= menstrual + follicular)             return "follicular";
  if (day <= menstrual + follicular + ovulation) return "ovulation";
  return "luteal";
}

// ─── Overdue detection ────────────────────────────────────────────────────────

/**
 * Determine overdue state.
 * currentDay > round(avg) + softDays → "soft"
 * currentDay > round(avg) + hardDays → "hard"
 */
export function getOverdueState(
  today: string,
  activeCycleStartDate: string,
  rollingAvg: number | null,
  overdueSoftDays: number,
  overdueHardDays: number
): OverdueState {
  if (!rollingAvg) return "none";
  const currentDay = dateDiffDays(activeCycleStartDate, today) + 1;
  const softThreshold = Math.round(rollingAvg) + overdueSoftDays;
  const hardThreshold = Math.round(rollingAvg) + overdueHardDays;

  if (currentDay > hardThreshold) return "hard";
  if (currentDay > softThreshold) return "soft";
  return "none";
}
