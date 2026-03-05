/**
 * cycleEngineService – unit tests for pure functions.
 * No Supabase calls – only tests exported pure helpers.
 */
import {
  dateDiffDays,
  addDaysToDate,
  computePhaseBoundaries,
  getCyclePhase,
  getOverdueState,
} from "../../utils/cycleEngine";

// ─── dateDiffDays ─────────────────────────────────────────────────────────────

describe("dateDiffDays", () => {
  it("same day = 0", () => {
    expect(dateDiffDays("2025-02-01", "2025-02-01")).toBe(0);
  });

  it("one day apart = 1", () => {
    expect(dateDiffDays("2025-02-01", "2025-02-02")).toBe(1);
  });

  it("28 days apart = 28", () => {
    expect(dateDiffDays("2025-01-01", "2025-01-29")).toBe(28);
  });

  it("negative when to < from", () => {
    expect(dateDiffDays("2025-02-10", "2025-02-01")).toBe(-9);
  });

  it("crosses month boundary correctly", () => {
    expect(dateDiffDays("2025-01-31", "2025-02-01")).toBe(1);
  });
});

// ─── addDaysToDate ────────────────────────────────────────────────────────────

describe("addDaysToDate", () => {
  it("adds positive delta", () => {
    expect(addDaysToDate("2025-01-28", 5)).toBe("2025-02-02");
  });

  it("subtracts negative delta", () => {
    expect(addDaysToDate("2025-02-05", -5)).toBe("2025-01-31");
  });

  it("adding 0 returns same date", () => {
    expect(addDaysToDate("2025-06-15", 0)).toBe("2025-06-15");
  });
});

// ─── computePhaseBoundaries ───────────────────────────────────────────────────

describe("computePhaseBoundaries", () => {
  const CYCLE_LENGTHS = [21, 28, 35, 45];

  CYCLE_LENGTHS.forEach((len) => {
    it(`sums to cycleLengthDays for len=${len}`, () => {
      const { menstrual, follicular, ovulation, luteal } =
        computePhaseBoundaries(len);
      expect(menstrual + follicular + ovulation + luteal).toBe(len);
    });

    it(`menstrual min 3, max 7 for len=${len}`, () => {
      const { menstrual } = computePhaseBoundaries(len);
      expect(menstrual).toBeGreaterThanOrEqual(3);
      expect(menstrual).toBeLessThanOrEqual(7);
    });

    it(`ovulation min 2, max 4 for len=${len}`, () => {
      const { ovulation } = computePhaseBoundaries(len);
      expect(ovulation).toBeGreaterThanOrEqual(2);
      expect(ovulation).toBeLessThanOrEqual(4);
    });

    it(`luteal min 9 for len=${len}`, () => {
      const { luteal } = computePhaseBoundaries(len);
      expect(luteal).toBeGreaterThanOrEqual(9);
    });

    it(`follicular >= 1 for len=${len}`, () => {
      const { follicular } = computePhaseBoundaries(len);
      expect(follicular).toBeGreaterThanOrEqual(1);
    });
  });
});

// ─── getCyclePhase ────────────────────────────────────────────────────────────

describe("getCyclePhase", () => {
  it("day 1 is always menstruation", () => {
    expect(getCyclePhase(1, 28)).toBe("menstruation");
    expect(getCyclePhase(1, 21)).toBe("menstruation");
    expect(getCyclePhase(1, 35)).toBe("menstruation");
  });

  it("falls back to 28 when cycleLengthDays is null", () => {
    // With 28-day proportions: menstrual=5, follicular=9, ovulation=3, luteal=11
    // Day 1 → menstrual, day 15 → ovulation (day 5+9+1=15)
    expect(getCyclePhase(1, null)).toBe("menstruation");
    expect(getCyclePhase(15, null)).toBe("ovulation");
  });

  it("returns luteal on last day of 28-day cycle", () => {
    expect(getCyclePhase(28, 28)).toBe("luteal");
  });

  it("wraps day > cycleLength into phase range", () => {
    // Day 29 of 28-day cycle = day 1 of next = menstruation
    expect(getCyclePhase(29, 28)).toBe("menstruation");
    // Day 56 = day 28 = luteal
    expect(getCyclePhase(56, 28)).toBe("luteal");
  });

  it("covers all 4 phases in a 28-day cycle", () => {
    const phases = new Set(
      Array.from({ length: 28 }, (_, i) => getCyclePhase(i + 1, 28))
    );
    expect(phases.has("menstruation")).toBe(true);
    expect(phases.has("follicular")).toBe(true);
    expect(phases.has("ovulation")).toBe(true);
    expect(phases.has("luteal")).toBe(true);
  });

  it("covers all 4 phases in a 35-day cycle", () => {
    const phases = new Set(
      Array.from({ length: 35 }, (_, i) => getCyclePhase(i + 1, 35))
    );
    expect(phases.has("menstruation")).toBe(true);
    expect(phases.has("follicular")).toBe(true);
    expect(phases.has("ovulation")).toBe(true);
    expect(phases.has("luteal")).toBe(true);
  });

  it("covers all 4 phases in a 21-day cycle", () => {
    const phases = new Set(
      Array.from({ length: 21 }, (_, i) => getCyclePhase(i + 1, 21))
    );
    expect(phases.has("menstruation")).toBe(true);
    expect(phases.has("follicular")).toBe(true);
    expect(phases.has("ovulation")).toBe(true);
    expect(phases.has("luteal")).toBe(true);
  });
});

// ─── getOverdueState ──────────────────────────────────────────────────────────

describe("getOverdueState", () => {
  const START = "2025-01-01";
  const AVG = 28;
  const SOFT = 3; // avg+3 = 31
  const HARD = 7; // avg+7 = 35

  it("returns none when before softThreshold", () => {
    // Day 30 – below soft (31)
    const today = addDaysToDate(START, 29); // day 30
    expect(getOverdueState(today, START, AVG, SOFT, HARD)).toBe("none");
  });

  it("returns none on exact avg day", () => {
    const today = addDaysToDate(START, 27); // day 28 = avg
    expect(getOverdueState(today, START, AVG, SOFT, HARD)).toBe("none");
  });

  it("returns soft on softThreshold day", () => {
    // Day 31 = avg+3 = soft threshold – currentDay > softThreshold requires > 31, so day 32
    const today = addDaysToDate(START, 31); // day 32
    expect(getOverdueState(today, START, AVG, SOFT, HARD)).toBe("soft");
  });

  it("returns soft just below hardThreshold", () => {
    // Day 34 < hard(35)
    const today = addDaysToDate(START, 33); // day 34
    expect(getOverdueState(today, START, AVG, SOFT, HARD)).toBe("soft");
  });

  it("returns hard on hardThreshold day", () => {
    // Day 36 > hard(35)
    const today = addDaysToDate(START, 35); // day 36
    expect(getOverdueState(today, START, AVG, SOFT, HARD)).toBe("hard");
  });

  it("returns hard well past threshold", () => {
    const today = addDaysToDate(START, 50); // day 51
    expect(getOverdueState(today, START, AVG, SOFT, HARD)).toBe("hard");
  });

  it("returns none when rollingAvg is null", () => {
    const today = addDaysToDate(START, 50);
    expect(getOverdueState(today, START, null, SOFT, HARD)).toBe("none");
  });

  it("exact softThreshold day returns none (boundary exclusive)", () => {
    // Soft threshold = 31, currentDay must be > 31 for soft
    const today = addDaysToDate(START, 30); // day 31
    expect(getOverdueState(today, START, AVG, SOFT, HARD)).toBe("none");
  });

  it("exact hardThreshold day returns soft (currentDay must be > hard)", () => {
    // Hard threshold = 35, currentDay must be > 35 for hard
    const today = addDaysToDate(START, 34); // day 35
    expect(getOverdueState(today, START, AVG, SOFT, HARD)).toBe("soft");
  });
});
