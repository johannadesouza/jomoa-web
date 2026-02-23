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

    it("returns follicular around day 8 (28-day cycle)", () => {
      const start = "2025-02-01";
      const target = new Date("2025-02-08");
      const result = calculateCyclePhase(start, target);
      expect(result.phase).toBe("follicular");
    });

    it("returns ovulation around day 14 (28-day cycle)", () => {
      const start = "2025-02-01";
      const target = new Date("2025-02-14");
      const result = calculateCyclePhase(start, target);
      expect(result.phase).toBe("ovulation");
    });

    it("returns luteal around day 20 (28-day cycle)", () => {
      const start = "2025-02-01";
      const target = new Date("2025-02-20");
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
