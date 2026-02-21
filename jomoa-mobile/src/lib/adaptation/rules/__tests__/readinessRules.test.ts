/**
 * Readiness rules – evaluateReadinessRules (pure logic)
 */
import { evaluateReadinessRules } from "../readinessRules";
import type { ReadinessInput } from "../../types";

describe("readiness rules", () => {
  it("returns empty when readiness is null", () => {
    const effects = evaluateReadinessRules(null);
    expect(effects).toEqual([]);
  });

  it("suggests recovery for high stress + low energy", () => {
    const effects = evaluateReadinessRules({
      energy_level: 2,
      sleep_quality: 5,
      stress_level: 8,
      soreness: 2,
    });
    const recovery = effects.find((e) => e.ruleId === "high_stress_recovery");
    expect(recovery).toBeDefined();
    expect(recovery?.suggestRecovery).toBe(true);
    expect(recovery?.volumeModifier).toBe(0.6);
  });

  it("reduces volume for poor sleep + low energy", () => {
    const effects = evaluateReadinessRules({
      energy_level: 2,
      sleep_quality: 2,
      stress_level: 4,
      soreness: 2,
    });
    const poorSleep = effects.find((e) => e.ruleId === "poor_sleep_volume");
    expect(poorSleep).toBeDefined();
    expect(poorSleep?.volumeModifier).toBe(0.8);
  });

  it("applies poor_sleep only when energy is not low", () => {
    const effects = evaluateReadinessRules({
      energy_level: 7,
      sleep_quality: 2,
      stress_level: 4,
      soreness: 2,
    });
    const poorSleep = effects.find((e) => e.ruleId === "poor_sleep");
    expect(poorSleep).toBeDefined();
    expect(poorSleep?.volumeModifier).toBe(0.9);
  });

  it("reduces volume and rpe for high soreness + low energy", () => {
    const effects = evaluateReadinessRules({
      energy_level: 2,
      sleep_quality: 6,
      stress_level: 4,
      soreness: 8,
    });
    const soreness = effects.find((e) => e.ruleId === "high_soreness");
    expect(soreness).toBeDefined();
    expect(soreness?.volumeModifier).toBe(0.75);
    expect(soreness?.rpeModifier).toBe(-0.5);
  });

  it("uses default 10 for energy/sleep when null (treats as good)", () => {
    const effects = evaluateReadinessRules({
      energy_level: null,
      sleep_quality: null,
      stress_level: null,
      soreness: null,
    });
    expect(effects.length).toBe(0);
  });
});
