/**
 * Adjustment service – getAdjustmentRecommendation (pure logic)
 */
import { getAdjustmentRecommendation } from "../adjustmentService";
import type { CyclePhase } from "../../utils/cycleUtils";

describe("adjustment service", () => {
  it("returns null when readiness is null", () => {
    const result = getAdjustmentRecommendation("follicular", null);
    expect(result).toBeNull();
  });

  it("returns recovery_session for high stress + low energy", () => {
    const result = getAdjustmentRecommendation("follicular", {
      energy_level: 2,
      sleep_quality: 5,
      stress_level: 8,
      soreness: 2,
    });
    expect(result).not.toBeNull();
    expect(result?.type).toBe("recovery_session");
  });

  it("returns volume_reduction for poor sleep + low energy", () => {
    const result = getAdjustmentRecommendation("follicular", {
      energy_level: 2,
      sleep_quality: 2,
      stress_level: 4,
      soreness: 2,
    });
    expect(result).not.toBeNull();
    expect(result?.type).toBe("volume_reduction");
  });

  it("returns volume_reduction for menstruation", () => {
    const result = getAdjustmentRecommendation("menstruation", {
      energy_level: 7,
      sleep_quality: 8,
      stress_level: 3,
      soreness: 2,
    });
    expect(result).not.toBeNull();
    expect(result?.type).toBe("volume_reduction");
  });

  it("returns technique_focus for luteal + low energy", () => {
    const result = getAdjustmentRecommendation("luteal", {
      energy_level: 2,
      sleep_quality: 6,
      stress_level: 5,
      soreness: 2,
    });
    expect(result).not.toBeNull();
    expect(result?.type).toBe("technique_focus");
  });

  it("returns null when no conditions match", () => {
    const result = getAdjustmentRecommendation("follicular", {
      energy_level: 8,
      sleep_quality: 9,
      stress_level: 2,
      soreness: 1,
    });
    expect(result).toBeNull();
  });
});
