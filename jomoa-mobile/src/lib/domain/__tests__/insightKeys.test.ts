import { getInsightTemplateKey, type InsightInput } from "../insightKeys";

function input(overrides: Partial<InsightInput> = {}): InsightInput {
  return {
    phase: null,
    cycleDay: null,
    readinessTier: null,
    energyLevel: null,
    hasSymptoms: false,
    ...overrides,
  };
}

describe("getInsightTemplateKey", () => {
  it("returns default when no phase and no tier", () => {
    expect(getInsightTemplateKey(input())).toBe("default");
    expect(getInsightTemplateKey(input({ readinessTier: "medium" }))).toBe("default");
  });

  it("returns no_phase_low when phase is null and readinessTier is low", () => {
    expect(getInsightTemplateKey(input({ readinessTier: "low" }))).toBe("no_phase_low");
  });

  it("returns no_phase_high when phase is null and readinessTier is high", () => {
    expect(getInsightTemplateKey(input({ readinessTier: "high" }))).toBe("no_phase_high");
  });

  it("returns menstruation keys by energy", () => {
    expect(getInsightTemplateKey(input({ phase: "menstruation", energyLevel: 3 }))).toBe("menstruation_low");
    expect(getInsightTemplateKey(input({ phase: "menstruation", energyLevel: 4 }))).toBe("menstruation_low");
    expect(getInsightTemplateKey(input({ phase: "menstruation", energyLevel: 5 }))).toBe("menstruation_default");
    expect(getInsightTemplateKey(input({ phase: "menstruation" }))).toBe("menstruation_default");
  });

  it("returns follicular_<tier>", () => {
    expect(getInsightTemplateKey(input({ phase: "follicular", readinessTier: "high" }))).toBe("follicular_high");
    expect(getInsightTemplateKey(input({ phase: "follicular", readinessTier: "low" }))).toBe("follicular_low");
    expect(getInsightTemplateKey(input({ phase: "follicular" }))).toBe("follicular_medium");
  });

  it("returns ovulation_<tier>", () => {
    expect(getInsightTemplateKey(input({ phase: "ovulation", readinessTier: "medium" }))).toBe("ovulation_medium");
  });

  it("returns luteal keys by readiness and energy", () => {
    expect(getInsightTemplateKey(input({ phase: "luteal", readinessTier: "low" }))).toBe("luteal_low");
    expect(getInsightTemplateKey(input({ phase: "luteal", energyLevel: 3 }))).toBe("luteal_low");
    expect(getInsightTemplateKey(input({ phase: "luteal", energyLevel: 4 }))).toBe("luteal_low");
    expect(getInsightTemplateKey(input({ phase: "luteal", readinessTier: "high", energyLevel: 8 }))).toBe("luteal_default");
  });
});
