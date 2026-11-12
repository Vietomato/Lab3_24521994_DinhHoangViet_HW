import { useEffect, useState } from 'react';
import { getTimerSnapshot } from '../lib/drop.js';

/**
 * Clock-driven countdown, refreshed every 250ms and on visibility wake-up.
 * Returns { nowEpochMs, remainingMs, error }; invalid input yields null times.
 * nowEpochMs lets the UI derive both opening and expiry from the same clock.
 * Reaching zero does not stop clock updates or imply a phase; expiry is separate.
 * Timestamp arithmetic avoids callback drift but still follows device clock
 * changes and the configured offset.
 */
export function usePubgAirdropTimer(targetEpochMs, serverOffsetMs = 0) {
  const [sample, setSample] = useState(() => ({
    targetEpochMs, serverOffsetMs,
    snapshot: getTimerSnapshot(targetEpochMs, serverOffsetMs),
  }));

  useEffect(() => {
    const refresh = () => setSample({
      targetEpochMs, serverOffsetMs,
      snapshot: getTimerSnapshot(targetEpochMs, serverOffsetMs),
    });
    refresh();
    const interval = setInterval(refresh, 250);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [targetEpochMs, serverOffsetMs]);

  // Do not expose a stale sample even on the first render with changed props.
  return Object.is(sample.targetEpochMs, targetEpochMs) && Object.is(sample.serverOffsetMs, serverOffsetMs)
    ? sample.snapshot
    : getTimerSnapshot(targetEpochMs, serverOffsetMs);
}
