/**
 * Cycle-aware färgkodning enligt beslut:
 * - Menstruation: rose (bg-rose-50, dot rose-500)
 * - Follicular: sky (bg-sky-50, dot sky-500)
 * - Ovulation: amber (bg-amber-50, dot amber-500)
 * - Luteal: violet (bg-violet-50, dot violet-500)
 */

export type CyclePhase = "menstruation" | "follicular" | "ovulation" | "luteal" | null;

export interface CycleColorClasses {
  background: string;
  dot: string;
  border: string;
  label: string;
}

export function getCycleColorClasses(phase: CyclePhase): CycleColorClasses {
  switch (phase) {
    case "menstruation":
      return {
        background: "bg-rose-50",
        dot: "bg-rose-500",
        border: "border-rose-200",
        label: "Mens",
      };
    case "follicular":
      return {
        background: "bg-sky-50",
        dot: "bg-sky-500",
        border: "border-sky-200",
        label: "Follikulär",
      };
    case "ovulation":
      return {
        background: "bg-amber-50",
        dot: "bg-amber-500",
        border: "border-amber-200",
        label: "Ägglossning",
      };
    case "luteal":
      return {
        background: "bg-violet-50",
        dot: "bg-violet-500",
        border: "border-violet-200",
        label: "Luteal",
      };
    default:
      return {
        background: "",
        dot: "bg-gray-400",
        border: "",
        label: "Okänd",
      };
  }
}

/**
 * Beräkna cykelfas baserat på period start och dag
 */
export function calculateCyclePhase(
  periodStartDate: string | null,
  targetDate: Date = new Date()
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

  let phase: CyclePhase = null;
  if (cycleDay >= 1 && cycleDay <= 5) {
    phase = "menstruation";
  } else if (cycleDay >= 6 && cycleDay <= 13) {
    phase = "follicular";
  } else if (cycleDay >= 14 && cycleDay <= 16) {
    phase = "ovulation";
  } else if (cycleDay >= 17 && cycleDay <= 28) {
    phase = "luteal";
  }

  return { phase, cycleDay };
}

