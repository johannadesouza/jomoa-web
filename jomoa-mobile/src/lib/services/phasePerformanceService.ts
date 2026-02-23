/**
 * Phase Performance Service
 * Analyzes training volume per cycle phase for "You lift X% stronger in phase Y" insights
 */

import { supabase } from "../../config/supabase";
import { getAllPeriodStarts } from "./cycleService";
import { calculateCyclePhase, type CyclePhase } from "../utils/cycleUtils";

const DAYS_TO_ANALYZE = 90;

export interface PhaseVolume {
  phase: CyclePhase;
  totalVolume: number;
  sessionCount: number;
  avgVolumePerSession: number;
}

export interface PhaseComparison {
  strongerPhase: CyclePhase;
  weakerPhase: CyclePhase;
  percentStronger: number;
  /** e.g. "Du lyfter 8% starkare i follikulär fas jämfört med lutealfas" */
  insight: string;
}

interface SessionWithSets {
  id: string;
  date: string;
  set_logs: { weight: number | null; reps: number | null }[];
}

function getPeriodStartForDate(
  periodStarts: string[],
  dateStr: string
): string | null {
  const date = new Date(dateStr);
  const periodStartsSorted = [...periodStarts].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );
  for (const p of periodStartsSorted) {
    if (new Date(p).getTime() <= date.getTime()) {
      return p;
    }
  }
  return null;
}

export async function fetchPhasePerformance(
  clientId: string,
  cycleLength: number = 28
): Promise<{
  phaseVolumes: PhaseVolume[];
  comparison: PhaseComparison | null;
}> {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - DAYS_TO_ANALYZE);
  const startStr = start.toISOString().split("T")[0];
  const endStr = end.toISOString().split("T")[0];

  const [periodStarts, { data: sessions }] = await Promise.all([
    getAllPeriodStarts(clientId),
    supabase
      .from("workout_sessions_log")
      .select(`
        id,
        date,
        set_logs (weight, reps)
      `)
      .eq("client_id", clientId)
      .eq("status", "completed")
      .gte("date", startStr)
      .lte("date", endStr)
      .order("date", { ascending: true }),
  ]);

  const phaseAgg: Record<
    Exclude<CyclePhase, null>,
    { totalVolume: number; sessionCount: number }
  > = {
    menstruation: { totalVolume: 0, sessionCount: 0 },
    follicular: { totalVolume: 0, sessionCount: 0 },
    ovulation: { totalVolume: 0, sessionCount: 0 },
    luteal: { totalVolume: 0, sessionCount: 0 },
  };

  for (const session of sessions || []) {
    const s = session as unknown as SessionWithSets;
    const periodStart = getPeriodStartForDate(periodStarts, s.date);
    if (!periodStart) continue;

    const { phase } = calculateCyclePhase(periodStart, new Date(s.date), cycleLength);
    if (!phase) continue;

    let volume = 0;
    for (const log of s.set_logs || []) {
      volume += (log?.weight ?? 0) * (log?.reps ?? 0);
    }

    phaseAgg[phase].totalVolume += volume;
    phaseAgg[phase].sessionCount += 1;
  }

  const phaseVolumes: PhaseVolume[] = (
    ["menstruation", "follicular", "ovulation", "luteal"] as const
  ).map((phase) => {
    const agg = phaseAgg[phase];
    return {
      phase,
      totalVolume: agg.totalVolume,
      sessionCount: agg.sessionCount,
      avgVolumePerSession:
        agg.sessionCount > 0
          ? Math.round(agg.totalVolume / agg.sessionCount)
          : 0,
    };
  });

  const comparison = computePhaseComparison(phaseVolumes);
  return { phaseVolumes, comparison };
}

function computePhaseComparison(
  phaseVolumes: PhaseVolume[]
): PhaseComparison | null {
  const withData = phaseVolumes.filter((p) => p.sessionCount >= 2);
  if (withData.length < 2) return null;

  const sorted = [...withData].sort(
    (a, b) => b.avgVolumePerSession - a.avgVolumePerSession
  );
  const stronger = sorted[0];
  const weaker = sorted[sorted.length - 1];
  if (stronger.avgVolumePerSession <= 0) return null;

  const percentStronger = Math.round(
    ((stronger.avgVolumePerSession - weaker.avgVolumePerSession) /
      weaker.avgVolumePerSession) *
      100
  );
  if (percentStronger < 5) return null;

  const phaseLabels: Record<Exclude<CyclePhase, null>, string> = {
    menstruation: "mens",
    follicular: "follikulär",
    ovulation: "ägglossning",
    luteal: "luteal",
  };

  return {
    strongerPhase: stronger.phase,
    weakerPhase: weaker.phase,
    percentStronger,
    insight: `Du lyfter ${percentStronger}% starkare i ${phaseLabels[stronger.phase]} fas jämfört med ${phaseLabels[weaker.phase]}fas`,
  };
}
