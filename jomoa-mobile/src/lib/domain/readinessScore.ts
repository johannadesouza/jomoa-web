/**
 * Pure readiness score calculation.
 * Default weights: sleep 25%, energy 30%, stress (inverted) 20%, soreness (inverted) 25%.
 * All inputs 0–10; score 0–100. No side effects, no I/O.
 * Optional weights from remote config for experimentation.
 */

export interface ReadinessScoreInput {
  sleep_quality?: number | null;
  energy_level?: number | null;
  stress_level?: number | null;
  soreness?: number | null;
}

export interface ReadinessScoreWeights {
  sleep_quality?: number;
  energy_level?: number;
  stress_level?: number;
  soreness?: number;
}

const DEFAULT_WEIGHTS: Required<ReadinessScoreWeights> = {
  sleep_quality: 25,
  energy_level: 30,
  stress_level: 20,
  soreness: 25,
};

/**
 * Compute readiness score from check-in factors.
 * Returns null if no factors provided.
 * Weights optional (e.g. from app_config for A/B); must sum to 100 for 0–100 scale.
 */
export function calculateReadinessScore(
  data: ReadinessScoreInput,
  weights?: ReadinessScoreWeights | null
): number | null {
  const w = weights
    ? { ...DEFAULT_WEIGHTS, ...weights }
    : DEFAULT_WEIGHTS;
  const factors: number[] = [];
  if (data.sleep_quality != null) {
    factors.push((data.sleep_quality / 10) * w.sleep_quality);
  }
  if (data.energy_level != null) {
    factors.push((data.energy_level / 10) * w.energy_level);
  }
  if (data.stress_level != null) {
    factors.push(((10 - data.stress_level) / 10) * w.stress_level);
  }
  if (data.soreness != null) {
    factors.push(((10 - data.soreness) / 10) * w.soreness);
  }
  if (factors.length === 0) return null;
  const sum = factors.reduce((a, b) => a + b, 0);
  return Math.round(Math.max(0, Math.min(100, sum)));
}
