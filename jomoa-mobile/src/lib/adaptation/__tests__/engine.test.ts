/**
 * Adaptation engine – computeAdaptation (pure logic)
 */
import { computeAdaptation } from "../engine";
import type { AdaptationContext } from "../types";

describe("adaptation engine", () => {
  const baseContext: AdaptationContext = {
    phase: "follicular",
    readiness: null,
    recentLoad: null,
  };

  it("returns neutral result when no rules apply", () => {
    const result = computeAdaptation(baseContext);
    expect(result.volumeModifier).toBe(1);
    expect(result.rpeModifier).toBe(0);
    expect(result.suggestDeload).toBe(false);
    expect(result.suggestRecovery).toBe(false);
  });

  it("caps volume modifier between 0.5 and 1.2", () => {
    // ovulation adds 1.0; low energy + poor sleep could stack low
    const result = computeAdaptation({
      phase: "ovulation",
      readiness: {
        energy_level: 2,
        sleep_quality: 2,
        stress_level: 8,
        soreness: 8,
      },
      recentLoad: null,
    });
    expect(result.volumeModifier).toBeGreaterThanOrEqual(0.5);
    expect(result.volumeModifier).toBeLessThanOrEqual(1.2);
  });

  it("caps rpe modifier between -2 and 1", () => {
    const result = computeAdaptation({
      phase: "menstruation",
      readiness: {
        energy_level: 1,
        sleep_quality: 1,
        stress_level: 9,
        soreness: 9,
      },
      recentLoad: null,
    });
    expect(result.rpeModifier).toBeGreaterThanOrEqual(-2);
    expect(result.rpeModifier).toBeLessThanOrEqual(1);
  });

  it("includes topDrivers (max 2)", () => {
    const result = computeAdaptation({
      phase: "menstruation",
      readiness: {
        energy_level: 2,
        sleep_quality: 2,
        stress_level: 0,
        soreness: 0,
      },
      recentLoad: null,
    });
    expect(result.topDrivers).toBeDefined();
    expect(Array.isArray(result.topDrivers)).toBe(true);
    expect(result.topDrivers.length).toBeLessThanOrEqual(2);
  });

  it("returns appliedRules array", () => {
    const result = computeAdaptation({
      phase: "ovulation",
      readiness: null,
      recentLoad: null,
    });
    expect(result.appliedRules).toBeDefined();
    expect(Array.isArray(result.appliedRules)).toBe(true);
  });

  it("reduces volume for menstruation + low energy", () => {
    const result = computeAdaptation({
      phase: "menstruation",
      readiness: {
        energy_level: 2,
        sleep_quality: 7,
        stress_level: 5,
        soreness: 3,
      },
      recentLoad: null,
    });
    expect(result.volumeModifier).toBeLessThan(1);
  });

  it("suggests recovery for high stress + low energy", () => {
    const result = computeAdaptation({
      phase: "follicular",
      readiness: {
        energy_level: 2,
        sleep_quality: 5,
        stress_level: 8,
        soreness: 2,
      },
      recentLoad: null,
    });
    expect(result.suggestRecovery).toBe(true);
  });
});
