/**
 * Simplified hormone levels for 28-day cycle (typical model)
 * Estrogen: low menstruation, rises follicular, peak ovulation, drops luteal
 * Progesterone: low until ovulation, rises luteal
 */
const CYCLE_LENGTH = 28;

function estrogen(day: number): number {
  if (day <= 5) return 0.2;
  if (day <= 13) return 0.2 + ((day - 5) / 8) * 0.6;
  if (day <= 16) return 0.9;
  if (day <= 20) return 0.9 - ((day - 16) / 4) * 0.4;
  return Math.max(0.2, 0.5 - ((day - 20) / 8) * 0.3);
}

function progesterone(day: number): number {
  if (day <= 14) return 0.1;
  if (day <= 20) return 0.1 + ((day - 14) / 6) * 0.8;
  if (day <= 28) return Math.max(0.1, 0.9 - ((day - 20) / 8) * 0.8);
  return 0.1;
}

export function getHormoneLevels(cycleLength: number = CYCLE_LENGTH) {
  const scale = cycleLength / CYCLE_LENGTH;
  const days = Math.ceil(cycleLength);
  return Array.from({ length: days }, (_, i) => {
    const d = (i + 1) / scale;
    const normDay = Math.min(28, Math.max(1, Math.round(d)));
    return {
      day: i + 1,
      estrogen: estrogen(normDay),
      progesterone: progesterone(normDay),
    };
  });
}
