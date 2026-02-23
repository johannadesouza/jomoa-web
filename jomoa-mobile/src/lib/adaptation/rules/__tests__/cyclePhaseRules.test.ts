/**
 * Cycle phase rules – evaluateCyclePhaseRules (pure logic)
 */
import { evaluateCyclePhaseRules } from "../cyclePhaseRules";
import type { CyclePhase } from "../../../utils/cycleUtils";
import type { ReadinessInput } from "../../types";

describe("cycle phase rules", () => {
  const nullReadiness: ReadinessInput | null = null;

  it("returns empty for follicular with good readiness", () => {
    const effects = evaluateCyclePhaseRules("follicular", nullReadiness);
    expect(effects.length).toBe(0);
  });

  it("reduces volume for menstruation", () => {
    const effects = evaluateCyclePhaseRules("menstruation", nullReadiness);
    expect(effects.length).toBeGreaterThan(0);
    const m = effects.find((e) => e.ruleId === "menstruation_volume");
    expect(m).toBeDefined();
    expect(m?.volumeModifier).toBe(0.9);
  });

  it("reduces volume for menstruation + low energy", () => {
    const effects = evaluateCyclePhaseRules("menstruation", {
      energy_level: 2,
      sleep_quality: 7,
      stress_level: 5,
      soreness: 2,
    });
    const m = effects.find((e) => e.ruleId === "menstruation_deload");
    expect(m).toBeDefined();
    expect(m?.volumeModifier).toBe(0.8);
  });

  it("reduces volume for luteal + low energy", () => {
    const effects = evaluateCyclePhaseRules("luteal", {
      energy_level: 2,
      sleep_quality: 6,
      stress_level: 4,
      soreness: 2,
    });
    const m = effects.find((e) => e.ruleId === "luteal_volume");
    expect(m).toBeDefined();
    expect(m?.volumeModifier).toBe(0.9);
  });

  it("returns neutral for ovulation", () => {
    const effects = evaluateCyclePhaseRules("ovulation", nullReadiness);
    const m = effects.find((e) => e.ruleId === "ovulation_intensity");
    expect(m).toBeDefined();
    expect(m?.volumeModifier).toBe(1);
  });
});
