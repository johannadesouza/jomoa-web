/**
 * Cycle phase calculation and phase labels
 *
 * calculateCyclePhase now delegates to the proportional engine in cycleEngine.ts,
 * giving dynamic phase boundaries that scale with actual cycle length.
 */

import { getCyclePhase as getCyclePhaseEngine, dateDiffDays } from "./cycleEngine";

export type CyclePhase = "menstruation" | "follicular" | "ovulation" | "luteal" | null;

const PHASE_LABELS: Record<Exclude<CyclePhase, null>, string> = {
  menstruation: "Mens",
  follicular: "Follikulär",
  ovulation: "Ägglossning",
  luteal: "Luteal",
};

const DEFAULT_CYCLE_LENGTH = 28;

/**
 * Calculate cycle phase from period start date and target date.
 * Uses proportional phase boundaries (see cycleEngine.ts) that scale with cycleLength.
 * Falls back to 28-day cycle when cycleLength is unknown.
 */
export function calculateCyclePhase(
  periodStartDate: string | null,
  targetDate: Date = new Date(),
  cycleLength: number = DEFAULT_CYCLE_LENGTH
): { phase: CyclePhase; cycleDay: number } {
  if (!periodStartDate) {
    return { phase: null, cycleDay: 0 };
  }

  const startStr = periodStartDate;
  // Build YYYY-MM-DD for target using local date (noon = locale-safe)
  const t = new Date(targetDate);
  t.setHours(12, 0, 0, 0);
  const y = t.getFullYear();
  const mo = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  const targetStr = `${y}-${mo}-${d}`;

  const rawCycleDay = dateDiffDays(startStr, targetStr) + 1;

  if (rawCycleDay < 1) {
    return { phase: null, cycleDay: rawCycleDay };
  }

  const phase = getCyclePhaseEngine(rawCycleDay, cycleLength);

  // Wrap cycleDay for display (stays within [1, cycleLength])
  const effectiveLength = cycleLength > 0 ? cycleLength : DEFAULT_CYCLE_LENGTH;
  const cycleDay =
    rawCycleDay > effectiveLength
      ? ((rawCycleDay - 1) % effectiveLength) + 1
      : rawCycleDay;

  return { phase, cycleDay };
}

export function getPhaseLabel(phase: CyclePhase): string {
  return phase ? PHASE_LABELS[phase] : "Okänd";
}

/** Brand palette: warm terracotta, dusty mauve, yellow beige sand, deep plum brown */
export function getPhaseColor(phase: CyclePhase): string {
  switch (phase) {
    case "menstruation":
    case "follicular":
      return "#D96D46"; // warm terracotta
    case "ovulation":
      return "#5E3F50"; // dusty mauve
    case "luteal":
      return "#976568"; // deep plum brown lighter
    default:
      return "#976568"; // muted (deep plum brown lighter)
  }
}

const PHASE_ORDER: Exclude<CyclePhase, null>[] = [
  "menstruation",
  "follicular",
  "ovulation",
  "luteal",
];

/**
 * Returns the next phase in the cycle (menstruation → follicular → ovulation → luteal → menstruation)
 */
export function getNextPhase(phase: CyclePhase): CyclePhase {
  if (!phase) return null;
  const idx = PHASE_ORDER.indexOf(phase);
  if (idx < 0) return null;
  const nextIdx = (idx + 1) % PHASE_ORDER.length;
  return PHASE_ORDER[nextIdx];
}

/**
 * Days until next estimated period start
 * Returns null if no period data
 */
export function getDaysUntilNextPeriod(
  periodStartDate: string | null,
  cycleLength: number = DEFAULT_CYCLE_LENGTH,
  fromDate: Date = new Date()
): number | null {
  if (!periodStartDate) return null;
  const start = new Date(periodStartDate);
  start.setHours(0, 0, 0, 0);
  const target = new Date(fromDate);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((target.getTime() - start.getTime()) / 86400000);
  const cycleDay = diffDays + 1;
  const daysUntilNext = cycleLength - cycleDay;
  if (daysUntilNext <= 0) return 0; // today or overdue
  return daysUntilNext;
}
