/**
 * Adaptation engine – mode-specific tests
 * Covers perimenopause and missing_period modes.
 */
import { computeAdaptation } from "../engine";
import type { AdaptationContext } from "../types";

const baseReadiness = {
  energy_level: 7,
  sleep_quality: 7,
  stress_level: 3,
  soreness: 3,
};

const lowReadiness = {
  energy_level: 2,
  sleep_quality: 2,
  stress_level: 8,
  soreness: 8,
};

// ─── missing_period mode ──────────────────────────────────────────────────────

describe("missing_period mode", () => {
  const baseContext: AdaptationContext = {
    mode: "missing_period",
    cyclePhase: null,
    readiness: baseReadiness,
    trainingLoad: null,
    weeklyProgression: null,
    strategyPreference: null,
  };

  it("cycle phase rules are NOT applied even if cyclePhase is provided", () => {
    const result = computeAdaptation({
      ...baseContext,
      cyclePhase: "menstruation", // should be ignored
    });
    // menstruation normally applies 0.9 modifier – should not be in appliedRules
    expect(result.appliedRules).not.toContain("menstruation_volume");
    expect(result.appliedRules).not.toContain("menstruation_deload");
  });

  it("readiness rules still apply in missing_period mode", () => {
    const result = computeAdaptation({
      ...baseContext,
      readiness: lowReadiness,
    });
    // High stress + low energy → suggestRecovery
    expect(result.suggestRecovery).toBe(true);
    expect(result.volumeModifier).toBeLessThan(1);
  });

  it("volumeModifier is 1.0 with good readiness (no cycle phase boost)", () => {
    const result = computeAdaptation({ ...baseContext });
    // No cycle phase rules, good readiness → modifier stays near 1
    expect(result.volumeModifier).toBeGreaterThanOrEqual(0.95);
    expect(result.volumeModifier).toBeLessThanOrEqual(1.1);
  });

  it("output structure matches regular mode output", () => {
    const result = computeAdaptation({ ...baseContext });
    expect(result).toHaveProperty("volumeModifier");
    expect(result).toHaveProperty("suggestDeload");
    expect(result).toHaveProperty("suggestRecovery");
    expect(result).toHaveProperty("appliedRules");
    expect(result).toHaveProperty("topDrivers");
  });
});

// ─── perimenopause mode ───────────────────────────────────────────────────────

describe("perimenopause mode", () => {
  const baseContext: AdaptationContext = {
    mode: "perimenopause",
    cyclePhase: null,
    readiness: baseReadiness,
    trainingLoad: null,
    weeklyProgression: null,
    strategyPreference: null,
  };

  it("cycle phase rules are NOT applied in perimenopause mode", () => {
    const result = computeAdaptation({
      ...baseContext,
      cyclePhase: "follicular", // should be ignored
    });
    expect(result.appliedRules).not.toContain("follicular_overload");
  });

  it("no symptoms → no peri-specific modifier", () => {
    const result = computeAdaptation({
      ...baseContext,
      perimenopauseSymptoms: {
        hot_flashes: false,
        sleep_disruption: false,
        joint_stiffness: false,
        energy_crash: false,
      },
    });
    // No symptom rules triggered
    expect(result.appliedRules).not.toContain("peri_hot_flash_energy_crash");
    expect(result.appliedRules).not.toContain("peri_single_symptom");
  });

  it("hot_flashes + energy_crash → 0.8 modifier and suggestRecovery", () => {
    const result = computeAdaptation({
      ...baseContext,
      perimenopauseSymptoms: {
        hot_flashes: true,
        sleep_disruption: false,
        joint_stiffness: false,
        energy_crash: true,
      },
    });
    expect(result.appliedRules).toContain("peri_hot_flash_energy_crash");
    expect(result.suggestRecovery).toBe(true);
    expect(result.volumeModifier).toBeLessThan(1);
  });

  it("only hot_flashes → single symptom rule (0.9 modifier)", () => {
    const result = computeAdaptation({
      ...baseContext,
      perimenopauseSymptoms: {
        hot_flashes: true,
        sleep_disruption: false,
        joint_stiffness: false,
        energy_crash: false,
      },
    });
    expect(result.appliedRules).toContain("peri_single_symptom");
    expect(result.volumeModifier).toBeLessThanOrEqual(0.95);
  });

  it("sleep_disruption triggers peri sleep rule", () => {
    const result = computeAdaptation({
      ...baseContext,
      perimenopauseSymptoms: {
        hot_flashes: false,
        sleep_disruption: true,
        joint_stiffness: false,
        energy_crash: false,
      },
    });
    expect(result.appliedRules).toContain("peri_sleep_disruption");
  });

  it("joint_stiffness triggers peri joint rule", () => {
    const result = computeAdaptation({
      ...baseContext,
      perimenopauseSymptoms: {
        hot_flashes: false,
        sleep_disruption: false,
        joint_stiffness: true,
        energy_crash: false,
      },
    });
    expect(result.appliedRules).toContain("peri_joint_stiffness");
  });

  it("multiple symptoms stack modifiers but stays within [0.5, 1.2]", () => {
    const result = computeAdaptation({
      ...baseContext,
      perimenopauseSymptoms: {
        hot_flashes: true,
        sleep_disruption: true,
        joint_stiffness: true,
        energy_crash: true,
      },
    });
    expect(result.volumeModifier).toBeGreaterThanOrEqual(0.5);
    expect(result.volumeModifier).toBeLessThanOrEqual(1.2);
  });

  it("readiness rules still apply alongside peri rules", () => {
    const result = computeAdaptation({
      ...baseContext,
      readiness: lowReadiness,
      perimenopauseSymptoms: {
        hot_flashes: true,
        sleep_disruption: false,
        joint_stiffness: false,
        energy_crash: false,
      },
    });
    // Both peri rule and readiness rule should be applied
    expect(result.suggestRecovery).toBe(true);
    expect(result.volumeModifier).toBeLessThan(0.9);
  });
});

// ─── regular mode backward-compat ────────────────────────────────────────────

describe("regular mode (backward-compat when mode not provided)", () => {
  it("defaults to regular mode behavior", () => {
    const result = computeAdaptation({
      mode: "regular",
      cyclePhase: "menstruation",
      readiness: baseReadiness,
      trainingLoad: null,
      weeklyProgression: null,
      strategyPreference: null,
    });
    expect(result.appliedRules).toContain("menstruation_volume");
  });
});
