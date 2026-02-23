/**
 * Adaptation engine – computeAdaptation (pure logic)
 */
import { computeAdaptation } from "../engine";
import type { AdaptationContext } from "../types";

describe("adaptation engine", () => {
  const baseContext: AdaptationContext = {
    cyclePhase: "follicular",
    readiness: null,
    trainingLoad: null,
    weeklyProgression: null,
    strategyPreference: null,
  };

  it("returns neutral result when no rules apply", () => {
    const result = computeAdaptation(baseContext);
    expect(result.volumeModifier).toBe(1);
    expect(result.suggestDeload).toBe(false);
    expect(result.suggestRecovery).toBe(false);
  });

  it("caps volume modifier between 0.5 and 1.2", () => {
    const result = computeAdaptation({
      cyclePhase: "ovulation",
      readiness: {
        energy_level: 2,
        sleep_quality: 2,
        stress_level: 8,
        soreness: 8,
      },
      trainingLoad: null,
      weeklyProgression: null,
      strategyPreference: null,
    });
    expect(result.volumeModifier).toBeGreaterThanOrEqual(0.5);
    expect(result.volumeModifier).toBeLessThanOrEqual(1.2);
  });

  it("includes topDrivers (max 2)", () => {
    const result = computeAdaptation({
      cyclePhase: "menstruation",
      readiness: {
        energy_level: 2,
        sleep_quality: 2,
        stress_level: 0,
        soreness: 0,
      },
      trainingLoad: null,
      weeklyProgression: null,
    });
    expect(result.topDrivers).toBeDefined();
    expect(Array.isArray(result.topDrivers)).toBe(true);
    expect(result.topDrivers.length).toBeLessThanOrEqual(2);
  });

  it("returns appliedRules array", () => {
    const result = computeAdaptation({
      cyclePhase: "ovulation",
      readiness: null,
      trainingLoad: null,
      weeklyProgression: null,
      strategyPreference: null,
    });
    expect(result.appliedRules).toBeDefined();
    expect(Array.isArray(result.appliedRules)).toBe(true);
  });

  it("reduces volume for menstruation + low energy", () => {
    const result = computeAdaptation({
      cyclePhase: "menstruation",
      readiness: {
        energy_level: 2,
        sleep_quality: 7,
        stress_level: 5,
        soreness: 3,
      },
      trainingLoad: null,
      weeklyProgression: null,
      strategyPreference: null,
    });
    expect(result.volumeModifier).toBeLessThan(1);
  });

  it("dampens modifier when user often rejects (acceptance rate < 0.4)", () => {
    const result = computeAdaptation({
      cyclePhase: "menstruation",
      readiness: {
        energy_level: 2,
        sleep_quality: 7,
        stress_level: 5,
        soreness: 3,
      },
      trainingLoad: null,
      weeklyProgression: null,
      strategyPreference: { acceptanceRate: 0.2, decisionCount: 10 },
    });
    const withoutPref = computeAdaptation({
      cyclePhase: "menstruation",
      readiness: {
        energy_level: 2,
        sleep_quality: 7,
        stress_level: 5,
        soreness: 3,
      },
      trainingLoad: null,
      weeklyProgression: null,
      strategyPreference: null,
    });
    expect(result.volumeModifier).toBeGreaterThan(withoutPref.volumeModifier);
    expect(result.volumeModifier).toBeLessThanOrEqual(1.2);
  });

  it("suggests recovery for high stress + low energy", () => {
    const result = computeAdaptation({
      cyclePhase: "follicular",
      readiness: {
        energy_level: 2,
        sleep_quality: 5,
        stress_level: 8,
        soreness: 2,
      },
      trainingLoad: null,
      weeklyProgression: null,
      strategyPreference: null,
    });
    expect(result.suggestRecovery).toBe(true);
  });
});
