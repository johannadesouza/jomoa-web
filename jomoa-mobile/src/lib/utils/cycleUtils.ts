/**
 * Cycle phase calculation
 * Based on jomoa-app/lib/utils/cycleColors.ts
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
