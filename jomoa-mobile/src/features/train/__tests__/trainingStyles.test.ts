/**
 * trainingStyles – Fas B Training Styles data
 */
import { TRAINING_STYLES } from "../trainingStyles";

describe("TRAINING_STYLES", () => {
  it("has 8 styles", () => {
    expect(TRAINING_STYLES).toHaveLength(8);
  });

  it("each style has id, label, icon", () => {
    TRAINING_STYLES.forEach((style) => {
      expect(style).toHaveProperty("id");
      expect(style).toHaveProperty("label");
      expect(style).toHaveProperty("icon");
      expect(typeof style.id).toBe("string");
      expect(typeof style.label).toBe("string");
      expect(typeof style.icon).toBe("string");
    });
  });

  it("includes expected styles", () => {
    const ids = TRAINING_STYLES.map((s) => s.id);
    expect(ids).toContain("styrka");
    expect(ids).toContain("pilates");
    expect(ids).toContain("kondition");
  });
});
