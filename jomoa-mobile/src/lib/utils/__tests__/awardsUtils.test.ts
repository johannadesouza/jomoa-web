/**
 * awardsUtils – Fas C Awards logic
 */
import { getEarnedAwards } from "../awardsUtils";

describe("getEarnedAwards", () => {
  it("returns empty when no streak or sessions", () => {
    const awards = getEarnedAwards({ streak: 0, sessionsThisMonth: 0 });
    expect(awards).toHaveLength(0);
  });

  it("returns streak award when streak >= 1", () => {
    const awards = getEarnedAwards({ streak: 1, sessionsThisMonth: 0 });
    expect(awards.some((a) => a.id === "streak_1")).toBe(true);
  });

  it("returns 1 week streak when streak >= 7", () => {
    const awards = getEarnedAwards({ streak: 7, sessionsThisMonth: 0 });
    expect(awards.some((a) => a.id === "streak_7")).toBe(true);
  });

  it("returns sessions award when sessionsThisMonth >= 5", () => {
    const awards = getEarnedAwards({ streak: 0, sessionsThisMonth: 5 });
    expect(awards.some((a) => a.id === "sessions_5")).toBe(true);
  });

  it("returns multiple awards", () => {
    const awards = getEarnedAwards({ streak: 10, sessionsThisMonth: 12 });
    expect(awards.length).toBeGreaterThan(1);
  });
});
