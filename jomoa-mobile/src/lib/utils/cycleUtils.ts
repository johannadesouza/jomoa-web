/**
 * Cycle phase calculation and phase labels
 */

export type CyclePhase = "menstruation" | "follicular" | "ovulation" | "luteal" | null;

const PHASE_LABELS: Record<Exclude<CyclePhase, null>, string> = {
  menstruation: "Mens",
  follicular: "Follikulär",
  ovulation: "Ägglossning",
  luteal: "Luteal",
};

const DEFAULT_CYCLE_LENGTH = 28;

/**
 * Calculate cycle phase from period start date and target date
 * Uses cycleLength from client settings (default 28)
 */
export function calculateCyclePhase(
  periodStartDate: string | null,
  targetDate: Date = new Date(),
  cycleLength: number = DEFAULT_CYCLE_LENGTH
): { phase: CyclePhase; cycleDay: number } {
  if (!periodStartDate) {
    return { phase: null, cycleDay: 0 };
  }

  const startDate = new Date(periodStartDate);
  startDate.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const cycleDay = diffDays + 1;

  const scale = cycleLength / DEFAULT_CYCLE_LENGTH;
  const menstruationEnd = Math.floor(5 * scale);
  const follicularEnd = Math.floor(13 * scale);
  const ovulationEnd = Math.floor(16 * scale);

  let phase: CyclePhase = null;
  if (cycleDay >= 1 && cycleDay <= menstruationEnd) {
    phase = "menstruation";
  } else if (cycleDay <= follicularEnd) {
    phase = "follicular";
  } else if (cycleDay <= ovulationEnd) {
    phase = "ovulation";
  } else if (cycleDay <= cycleLength) {
    phase = "luteal";
  }

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
