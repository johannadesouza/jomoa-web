/**
 * Phase Knowledge Service
 * Provides phase-based insights for training, nutrition, recovery, social energy
 * Does not modify adaptation engine or training logic
 * Daily insight: först Content DB (phase_training_tips, phase_wellness_tips), fallback till PHASE_PROFILES.
 */

import type { CyclePhase } from "../utils/cycleUtils";
import { PHASE_PROFILES } from "../data/phaseProfiles";

export interface ReadinessInput {
  energy_level: number | null;
  sleep_quality: number | null;
  stress_level: number | null;
  soreness: number | null;
}

export interface DailyPhaseInsight {
  headline: string;
  bullets: string[];
  phase: Exclude<CyclePhase, null>;
}

/** Get full phase profile */
export function getPhaseProfile(
  phase: CyclePhase
): PhaseProfile | null {
  if (!phase || phase === null) return null;
  return PHASE_PROFILES[phase] ?? null;
}

/**
 * Get short daily insight – 1 headline + 2–3 bullets
 * Adapts to readiness when provided
 */
export function getDailyPhaseInsight(
  phase: CyclePhase,
  readiness?: ReadinessInput | null
): DailyPhaseInsight | null {
  const profile = getPhaseProfile(phase);
  if (!profile) return null;

  const lowEnergy = (readiness?.energy_level ?? 10) <= 4;
  const highSoreness = (readiness?.soreness ?? 0) >= 6;
  const poorSleep = (readiness?.sleep_quality ?? 10) <= 4;

  let headline: string;
  let bullets: string[];

  switch (phase) {
    case "menstruation":
      headline = lowEnergy
        ? "Vila och lätt rörelse"
        : "Försiktig träning – lyssna på kroppen";
      bullets = lowEnergy
        ? profile.recoveryFocus.slice(0, 2)
        : profile.trainingFocus.slice(0, 2);
      break;

    case "follicular":
      headline = lowEnergy || highSoreness
        ? "Justera intensitet efter hur du mår"
        : "Bra fas för intensiv träning";
      bullets = lowEnergy || highSoreness
        ? profile.trainingFocus.slice(1, 3)
        : profile.trainingFocus.slice(0, 2);
      break;

    case "ovulation":
      headline = lowEnergy
        ? "Energin varierar – fokusera på teknik"
        : "Peak energi – utmana dig om det känns rätt";
      bullets = lowEnergy
        ? profile.trainingFocus.slice(1, 3)
        : profile.trainingFocus.slice(0, 2);
      break;

    case "luteal":
      headline = lowEnergy || poorSleep
        ? "Prioritera återhämtning idag"
        : "Stabil träning – justera efter energi";
      bullets = lowEnergy || poorSleep
        ? profile.recoveryFocus
        : profile.trainingFocus.slice(0, 2);
      break;

    default:
      return null;
  }

  return {
    headline,
    bullets: bullets.slice(0, 3),
    phase,
  };
}

/**
 * Async: först Content DB, sedan fallback till getDailyPhaseInsight (PHASE_PROFILES).
 * Använd i useDailyPhaseInsight. Lazy-import av cycleContent så att tester inte kräver Content DB-env.
 */
export async function getDailyPhaseInsightAsync(
  phase: CyclePhase,
  readiness?: ReadinessInput | null
): Promise<DailyPhaseInsight | null> {
  if (!phase || phase === null) return null;
  try {
    const { fetchPhaseInsightContent, toContentPhaseId } = await import(
      "../repos/contentRepo/cycleContent"
    );
    const content = await fetchPhaseInsightContent(toContentPhaseId(phase));
    if (content && content.headline) {
      return {
        headline: content.headline,
        bullets: content.bullets.slice(0, 3),
        phase: phase as Exclude<CyclePhase, null>,
      };
    }
  } catch (_) {
    // fallback
  }
  return getDailyPhaseInsight(phase, readiness);
}
