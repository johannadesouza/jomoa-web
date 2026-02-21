/**
 * Recent load rules – evaluateRecentLoadRules (pure logic)
 */
import { evaluateRecentLoadRules } from "../recentLoadRules";

describe("recent load rules", () => {
  it("returns empty when recentLoad is null", () => {
    const effects = evaluateRecentLoadRules(null, null);
    expect(effects).toEqual([]);
  });

  it("returns empty when sessions < 4", () => {
    const effects = evaluateRecentLoadRules(
      { sessionsLast7Days: 3, volumeLast7Days: 5000 },
      { energy_level: 2, sleep_quality: 3, stress_level: 5, soreness: 4 }
    );
    expect(effects).toEqual([]);
  });

  it("returns empty when no recovery signals", () => {
    const effects = evaluateRecentLoadRules(
      { sessionsLast7Days: 5, volumeLast7Days: 10000 },
      { energy_level: 8, sleep_quality: 9, stress_level: 2, soreness: 1 }
    );
    expect(effects).toEqual([]);
  });

  it("reduces volume for 4+ sessions + low energy", () => {
    const effects = evaluateRecentLoadRules(
      { sessionsLast7Days: 4, volumeLast7Days: 8000 },
      { energy_level: 2, sleep_quality: 6, stress_level: 4, soreness: 2 }
    );
    expect(effects.length).toBeGreaterThan(0);
    expect(effects[0].volumeModifier).toBeLessThan(1);
  });

  it("applies stronger reduction for 5+ sessions + recovery signals", () => {
    const effects = evaluateRecentLoadRules(
      { sessionsLast7Days: 5, volumeLast7Days: 12000 },
      { energy_level: 2, sleep_quality: 3, stress_level: 5, soreness: 6 }
    );
    const rule = effects.find((e) => e.ruleId === "high_load_recovery");
    expect(rule).toBeDefined();
    expect(rule?.volumeModifier).toBe(0.85);
    expect(rule?.rpeModifier).toBe(-0.5);
  });
});
