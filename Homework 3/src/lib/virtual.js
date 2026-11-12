// Two clipped single-line text blocks plus padding fit each 72px row.
export const FEED_ROW_HEIGHT = 72;
export const FEED_VIEWPORT_HEIGHT = 360;
export const FEED_OVERSCAN = 3;

export function filterKillEvents(events, squadId = '') {
  return squadId ? events.filter((event) => event.squadId === squadId) : events;
}

/** end is exclusive; clamp overscroll before calculating the visible window. */
export function getVirtualWindow({ count, scrollTop, rowHeight = FEED_ROW_HEIGHT,
  viewportHeight = FEED_VIEWPORT_HEIGHT, overscan = FEED_OVERSCAN }) {
  if (!Number.isInteger(count) || count < 0 || !Number.isFinite(scrollTop) ||
      !Number.isFinite(rowHeight) || rowHeight <= 0 || !Number.isFinite(viewportHeight) ||
      viewportHeight <= 0 || !Number.isInteger(overscan) || overscan < 0) {
    throw new TypeError('Invalid virtual window input.');
  }
  const totalHeight = count * rowHeight;
  const clampedScrollTop = Math.min(Math.max(0, scrollTop), Math.max(0, totalHeight - viewportHeight));
  const start = Math.max(0, Math.floor(clampedScrollTop / rowHeight) - overscan);
  const end = Math.min(count, Math.ceil((clampedScrollTop + viewportHeight) / rowHeight) + overscan);
  return { start, end, totalHeight, offsetTop: start * rowHeight, scrollTop: clampedScrollTop };
}
