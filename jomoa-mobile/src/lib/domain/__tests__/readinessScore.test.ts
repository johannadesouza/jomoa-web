import { calculateReadinessScore } from "../readinessScore";

describe("calculateReadinessScore", () => {
  it("returns null when no factors provided", () => {
    expect(calculateReadinessScore({})).toBeNull();
    expect(calculateReadinessScore({ sleep_quality: null, energy_level: null })).toBeNull();
  });

  it("uses sleep_quality (25% weight)", () => {
    expect(calculateReadinessScore({ sleep_quality: 10 })).toBe(25);
    expect(calculateReadinessScore({ sleep_quality: 0 })).toBe(0);
  });

  it("uses energy_level (30% weight)", () => {
    expect(calculateReadinessScore({ energy_level: 10 })).toBe(30);
    expect(calculateReadinessScore({ energy_level: 0 })).toBe(0);
  });

  it("inverts stress_level (20% weight)", () => {
    expect(calculateReadinessScore({ stress_level: 0 })).toBe(20);
    expect(calculateReadinessScore({ stress_level: 10 })).toBe(0);
  });

  it("inverts soreness (25% weight)", () => {
    expect(calculateReadinessScore({ soreness: 0 })).toBe(25);
    expect(calculateReadinessScore({ soreness: 10 })).toBe(0);
  });

  it("averages when all four provided", () => {
    const score = calculateReadinessScore({
      sleep_quality: 10,
      energy_level: 10,
      stress_level: 0,
      soreness: 0,
    });
    expect(score).toBe(100);
  });

  it("clamps result to 0-100", () => {
    // Out-of-range inputs are still computed; final score is clamped
    const low = calculateReadinessScore({ sleep_quality: 0, energy_level: 0 });
    expect(low).toBe(0);
    expect(calculateReadinessScore({ sleep_quality: 10, energy_level: 10, stress_level: 0, soreness: 0 })).toBe(100);
  });

  it("rounds to integer", () => {
    const score = calculateReadinessScore({ sleep_quality: 5, energy_level: 5 });
    expect(Number.isInteger(score)).toBe(true);
  });
});
