/**
 * Phase Knowledge Service – getPhaseProfile, getDailyPhaseInsight (pure logic)
 */
import {
  getPhaseProfile,
  getDailyPhaseInsight,
  type ReadinessInput,
} from "../phaseKnowledgeService";
import type { CyclePhase } from "../../utils/cycleUtils";

describe("phaseKnowledgeService", () => {
  describe("getPhaseProfile", () => {
    it("returns null when phase is null", () => {
      expect(getPhaseProfile(null)).toBeNull();
    });

    it("returns profile for menstruation", () => {
      const profile = getPhaseProfile("menstruation");
      expect(profile).not.toBeNull();
      expect(profile?.phase).toBe("menstruation");
      expect(profile?.physiology.length).toBeGreaterThan(0);
      expect(profile?.trainingFocus.length).toBeGreaterThan(0);
    });

    it("returns profile for follicular", () => {
      const profile = getPhaseProfile("follicular");
      expect(profile).not.toBeNull();
      expect(profile?.phase).toBe("follicular");
    });

    it("returns profile for ovulation", () => {
      const profile = getPhaseProfile("ovulation");
      expect(profile).not.toBeNull();
      expect(profile?.phase).toBe("ovulation");
    });

    it("returns profile for luteal", () => {
      const profile = getPhaseProfile("luteal");
      expect(profile).not.toBeNull();
      expect(profile?.phase).toBe("luteal");
    });

    it("includes libidoPattern, enjoymentFocus, lifestyleTips", () => {
      const profile = getPhaseProfile("luteal");
      expect(profile?.libidoPattern).toBeDefined();
      expect(profile?.enjoymentFocus).toBeDefined();
      expect(profile?.lifestyleTips).toBeDefined();
    });
  });

  describe("getDailyPhaseInsight", () => {
    it("returns null when phase is null", () => {
      expect(getDailyPhaseInsight(null)).toBeNull();
    });

    it("returns insight for menstruation with low energy", () => {
      const readiness: ReadinessInput = {
        energy_level: 3,
        sleep_quality: 7,
        stress_level: 4,
        soreness: 2,
      };
      const result = getDailyPhaseInsight("menstruation", readiness);
      expect(result).not.toBeNull();
      expect(result?.phase).toBe("menstruation");
      expect(result?.headline).toContain("Vila");
      expect(result?.bullets.length).toBeGreaterThan(0);
    });

    it("returns insight for follicular with high energy", () => {
      const result = getDailyPhaseInsight("follicular", {
        energy_level: 8,
        sleep_quality: 8,
        stress_level: 2,
        soreness: 1,
      });
      expect(result).not.toBeNull();
      expect(result?.phase).toBe("follicular");
      expect(result?.headline).toContain("intensiv");
    });

    it("returns insight for luteal with poor sleep", () => {
      const result = getDailyPhaseInsight("luteal", {
        energy_level: 6,
        sleep_quality: 3,
        stress_level: 5,
        soreness: 3,
      });
      expect(result).not.toBeNull();
      expect(result?.phase).toBe("luteal");
      expect(result?.headline).toContain("återhämtning");
    });

    it("limits bullets to 3", () => {
      const result = getDailyPhaseInsight("ovulation");
      expect(result?.bullets.length).toBeLessThanOrEqual(3);
    });
  });
});
