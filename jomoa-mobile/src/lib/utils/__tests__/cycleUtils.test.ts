/**
 * Cycle utils – calculateCyclePhase, getPhaseLabel (pure logic)
 */
import { calculateCyclePhase, getPhaseLabel } from "../cycleUtils";

describe("cycle utils", () => {
  describe("calculateCyclePhase", () => {
    it("returns null phase when periodStartDate is null", () => {
      const result = calculateCyclePhase(null);
      expect(result.phase).toBeNull();
      expect(result.cycleDay).toBe(0);
    });

    it("returns menstruation on day 1", () => {
      const start = "2025-02-01";
      const target = new Date("2025-02-01");
      const result = calculateCyclePhase(start, target);
      expect(result.phase).toBe("menstruation");
      expect(result.cycleDay).toBe(1);
    });

    it("returns follicular around day 8 (28-day proportional cycle)", () => {
      // Proportional 28-day: menstrual=5, follicular=9 (days 6-14), ovulation=3, luteal=11
      const start = "2025-02-01";
      const target = new Date("2025-02-08"); // day 8 → follicular
      const result = calculateCyclePhase(start, target);
      expect(result.phase).toBe("follicular");
    });

    it("returns ovulation around day 15 (28-day proportional cycle)", () => {
      // Ovulation: days 15-17 (after menstrual=5 + follicular=9)
      const start = "2025-02-01";
      const target = new Date("2025-02-15"); // day 15 → ovulation
      const result = calculateCyclePhase(start, target);
      expect(result.phase).toBe("ovulation");
    });

    it("returns luteal around day 20 (28-day cycle)", () => {
      const start = "2025-02-01";
      const target = new Date("2025-02-20"); // day 20 → luteal
      const result = calculateCyclePhase(start, target);
      expect(result.phase).toBe("luteal");
    });

    it("computes correct cycle day", () => {
      const start = "2025-02-01";
      const target = new Date("2025-02-05");
      const result = calculateCyclePhase(start, target);
      expect(result.cycleDay).toBe(5);
    });

    it("supports custom cycle length", () => {
      const start = "2025-02-01";
      const target = new Date("2025-02-01");
      const result = calculateCyclePhase(start, target, 32);
      expect(result.phase).toBe("menstruation");
      expect(result.cycleDay).toBe(1);
    });

    it("proportional engine maps correctly for 60-day cycle (day 21 = follicular)", () => {
      // 60-day proportional: menstrual=7(max), follicular≈19, ovulation=4, luteal=30
      // Day 21 falls in follicular range (8-26)
      const start = "2026-01-27";
      const target = new Date("2026-02-16T12:00:00"); // 20 days later = day 21
      const result = calculateCyclePhase(start, target, 60);
      expect(result.phase).toBe("follicular");
    });

    it("wraps cycle day when past cycle length so phase is shown", () => {
      const start = "2026-02-01";
      const target = new Date("2026-03-05");
      const result = calculateCyclePhase(start, target, 28);
      expect(result.phase).not.toBeNull();
      expect(result.cycleDay).toBeGreaterThanOrEqual(1);
      expect(result.cycleDay).toBeLessThanOrEqual(28);
    });
  });

  describe("getPhaseLabel", () => {
    it("returns Swedish labels for known phases", () => {
      expect(getPhaseLabel("menstruation")).toBe("Mens");
      expect(getPhaseLabel("follicular")).toBe("Follikulär");
      expect(getPhaseLabel("ovulation")).toBe("Ägglossning");
      expect(getPhaseLabel("luteal")).toBe("Luteal");
    });

    it("returns 'Okänd' for null", () => {
      expect(getPhaseLabel(null)).toBe("Okänd");
    });
  });
});
