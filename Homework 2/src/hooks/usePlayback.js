import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioTaskQueue } from '../sequencer/AudioTaskQueue.js';

export function usePlayback({ initialize, noteOn, noteOff, waitForVoice, events, clearHeld, beginPlayback, endPlayback, refreshPressed }) {
  const queueRef = useRef(null);
  const ownerRef = useRef(null);
  const [speed, setSpeed] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    const queue = new AudioTaskQueue({ initialize, noteOn, noteOff, waitForVoice, onVoicesChange: refreshPressed });
    queueRef.current = queue;
    return () => {
      ownerRef.current = null;
      queueRef.current = null;
      void queue.dispose().catch(cause => console.error('Replay cleanup failed:', cause));
    };
  }, [initialize, noteOn, noteOff, waitForVoice, refreshPressed]);

  const play = useCallback(async () => {
    const queue = queueRef.current;
    if (!queue || !beginPlayback()) return;
    const owner = {};
    ownerRef.current = owner;
    clearHeld(); setError(null);
    try { await queue.play(events, speed); }
    catch (cause) { if (ownerRef.current === owner) setError(cause.message); }
    finally {
      if (ownerRef.current === owner) { ownerRef.current = null; endPlayback(); }
    }
  }, [beginPlayback, clearHeld, endPlayback, events, speed]);

  return { play, speed, setSpeed, error };
}
