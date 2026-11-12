/** Finite epoch milliseconds within the JavaScript Date range. */
export const isTimestamp = (value) => Number.isFinite(value) && Math.abs(value) <= 8.64e15;

/**
 * Invalid inputs have no eligible phase. Stock must be confirmed, never the
 * displayed optimistic deduction. Callers display error text for null.
 * @returns {import('../contracts.js').DropPhase | null}
 */
export function getDropPhase(drop, nowEpochMs, confirmedStock = drop?.remainingStock) {
  if (!drop || !isTimestamp(nowEpochMs) || !isTimestamp(drop.dropEpochMs) ||
      !isTimestamp(drop.expiresEpochMs) || drop.expiresEpochMs <= drop.dropEpochMs ||
      !Number.isInteger(confirmedStock) || confirmedStock < 0) return null;
  if (nowEpochMs >= drop.expiresEpochMs) return 'EXPIRED';
  if (nowEpochMs < drop.dropEpochMs) return 'WARMUP';
  if (confirmedStock === 0) return 'LOOTED_OUT';
  return 'AIRDROP_LIVE';
}

/** Explicit clock input keeps this calculation pure and testable. */
export function getTimerSnapshot(targetEpochMs, serverOffsetMs = 0, clientNowMs = Date.now()) {
  const nowEpochMs = clientNowMs + serverOffsetMs;
  if (!isTimestamp(targetEpochMs) || !Number.isFinite(serverOffsetMs) ||
      !isTimestamp(clientNowMs) || !isTimestamp(nowEpochMs)) {
    return { nowEpochMs: null, remainingMs: null, error: 'Mốc thời gian hoặc độ lệch đồng hồ không hợp lệ.' };
  }
  return { nowEpochMs, remainingMs: Math.max(0, targetEpochMs - nowEpochMs), error: null };
}

/** Round up partial seconds; do not wrap hours at 24. Invalid input is text. */
export function formatRemainingTime(remainingMs) {
  if (!Number.isFinite(remainingMs) || remainingMs < 0) return '—';
  const seconds = Math.ceil(remainingMs / 1_000);
  return [Math.floor(seconds / 3_600), Math.floor(seconds / 60) % 60, seconds % 60]
    .map((part) => String(part).padStart(2, '0')).join(':');
}
