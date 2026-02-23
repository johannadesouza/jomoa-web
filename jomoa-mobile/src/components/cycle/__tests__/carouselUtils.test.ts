/**
 * carouselUtils – PhaseCardCarousel dot indicator logic
 */
import { getVisibleIndexFromScrollOffset } from "../carouselUtils";

const CARD_WIDTH = 160;
const CARD_MARGIN = 12;
const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN;
const PADDING_H = 16;

describe("getVisibleIndexFromScrollOffset", () => {
  it("returns 0 for offset at first card", () => {
    const offset = 0;
    expect(getVisibleIndexFromScrollOffset(offset)).toBe(0);
  });

  it("returns 1 when scrolled to second card", () => {
    const offset = PADDING_H + SNAP_INTERVAL;
    expect(getVisibleIndexFromScrollOffset(offset)).toBe(1);
  });

  it("clamps to max 3 (fourth card)", () => {
    const offset = 10000;
    expect(getVisibleIndexFromScrollOffset(offset)).toBe(3);
  });

  it("clamps to min 0 for negative offset", () => {
    expect(getVisibleIndexFromScrollOffset(-100)).toBe(0);
  });
});
