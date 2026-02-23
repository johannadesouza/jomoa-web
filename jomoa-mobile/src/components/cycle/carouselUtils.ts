/**
 * Pure logic for PhaseCardCarousel dot indicator – testable
 */

const CARD_WIDTH = 160;
const CARD_MARGIN = 12;
const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN;
const PADDING_H = 16;
const PHASE_COUNT = 4;

export function getVisibleIndexFromScrollOffset(
  scrollOffsetX: number
): number {
  const index = Math.round(
    (scrollOffsetX + PADDING_H - CARD_MARGIN / 2) / SNAP_INTERVAL
  );
  return Math.max(0, Math.min(index, PHASE_COUNT - 1));
}
