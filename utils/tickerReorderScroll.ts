export const TICKER_REORDER_MIN_MOVEMENT = 12;
export const TICKER_REORDER_EDGE_SIZE = 56;
export const TICKER_REORDER_MAX_SPEED = 180;

export interface TickerReorderEdgeInput {
  pointerY: number;
  translationY: number;
  viewportTop: number;
  viewportHeight: number;
}

// The pointer must deliberately move toward an edge. The height or position
// of the dragged card never starts scrolling by itself.
export function tickerReorderScrollVelocity({
  pointerY,
  translationY,
  viewportTop,
  viewportHeight,
}: TickerReorderEdgeInput): number {
  if (
    ![pointerY, translationY, viewportTop, viewportHeight].every(
      Number.isFinite,
    ) ||
    viewportHeight <= 0 ||
    Math.abs(translationY) < TICKER_REORDER_MIN_MOVEMENT
  )
    return 0;
  const zone = Math.min(TICKER_REORDER_EDGE_SIZE, viewportHeight / 2);
  const topDistance = Math.max(0, pointerY - viewportTop);
  const bottomDistance = Math.max(0, viewportTop + viewportHeight - pointerY);
  if (translationY < 0 && topDistance < zone)
    return -TICKER_REORDER_MAX_SPEED * (1 - topDistance / zone);
  if (translationY > 0 && bottomDistance < zone)
    return TICKER_REORDER_MAX_SPEED * (1 - bottomDistance / zone);
  return 0;
}

export function tickerReorderScrollTarget(
  input: TickerReorderEdgeInput & {
    scrollOffset: number;
    contentHeight: number;
    elapsedMs: number;
  },
): number {
  if (
    ![input.scrollOffset, input.contentHeight, input.elapsedMs].every(
      Number.isFinite,
    ) ||
    input.contentHeight <= 0 ||
    input.viewportHeight <= 0 ||
    !Number.isFinite(input.viewportHeight)
  )
    return Number.isFinite(input.scrollOffset) ? input.scrollOffset : 0;
  const maxOffset = Math.max(0, input.contentHeight - input.viewportHeight);
  // Capping a stalled frame prevents a jump after JS has been busy.
  const seconds = Math.min(50, Math.max(0, input.elapsedMs)) / 1000;
  const next =
    input.scrollOffset + tickerReorderScrollVelocity(input) * seconds;
  return Math.min(maxOffset, Math.max(0, next));
}
