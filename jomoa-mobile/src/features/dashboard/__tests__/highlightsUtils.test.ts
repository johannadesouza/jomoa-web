/**
 * highlightsUtils – Fas A Highlights logic
 */
import { getHighlightItems } from "../highlightsUtils";

describe("getHighlightItems", () => {
  it("returns 4 items", () => {
    const items = getHighlightItems({
      sessionsThisMonth: 0,
      totalVolume: 0,
      streak: 0,
      weeklyWorkouts: 0,
    });
    expect(items).toHaveLength(4);
  });

  it("uses correct labels", () => {
    const items = getHighlightItems({
      sessionsThisMonth: 5,
      totalVolume: 1000,
      streak: 3,
      weeklyWorkouts: 2,
    });
    expect(items[0].label).toBe("Pass denna månad");
    expect(items[1].label).toBe("Volym (kg)");
    expect(items[3].label).toBe("Pass denna vecka");
  });

  it("uses singular streak label when streak is 1", () => {
    const items = getHighlightItems({
      sessionsThisMonth: 0,
      totalVolume: 0,
      streak: 1,
      weeklyWorkouts: 0,
    });
    expect(items[2].label).toBe("Dag streak");
  });

  it("uses plural streak label when streak is not 1", () => {
    const items = getHighlightItems({
      sessionsThisMonth: 0,
      totalVolume: 0,
      streak: 2,
      weeklyWorkouts: 0,
    });
    expect(items[2].label).toBe("Dagars streak");
  });

  it("rounds total volume", () => {
    const items = getHighlightItems({
      sessionsThisMonth: 0,
      totalVolume: 1234.7,
      streak: 0,
      weeklyWorkouts: 0,
    });
    expect(items[1].value).toBe(1235);
  });
});
