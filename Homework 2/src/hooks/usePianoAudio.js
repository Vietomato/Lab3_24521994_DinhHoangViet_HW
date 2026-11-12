import { useCallback, useEffect, useRef, useState } from 'react';
import { PolyphonicSynth } from '../audio/PolyphonicSynth.js';

/** Each effect setup owns a fresh lazy engine, including StrictMode setup replay. */
export function usePianoAudio() {
  const engineRef = useRef(null);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    const engine = new PolyphonicSynth();
    engineRef.current = engine;
    return () => {
      engineRef.current = null;
      engine.dispose().catch(cause => console.error('Audio cleanup failed:', cause));
    };
  }, []);

  const initialize = useCallback(async () => {
    const engine = engineRef.current;
    if (!engine) return false;
    try {
      await engine.initialize();
      if (engineRef.current === engine) { setError(null); setIsReady(true); }
      return true;
    } catch (cause) {
      if (engineRef.current === engine) { setError(cause.message); setIsReady(false); }
      return false;
    }
  }, []);

  const noteOn = useCallback(async (midi, ownerId, signal) => {
    const engine = engineRef.current;
    if (!engine) return null;
    try {
      const voice = await engine.noteOn(midi, ownerId, signal);
      if (engineRef.current === engine) { setError(null); setIsReady(true); }
      return voice;
    } catch (cause) {
      if (engineRef.current === engine && !signal?.aborted) setError(cause.message);
      return null;
    }
  }, []);
  const noteOff = useCallback((voice, ownerId) => engineRef.current?.noteOff(voice, ownerId), []);
  const getActiveVoices = useCallback(() => engineRef.current?.getActiveVoices() ?? [], []);
  const subscribeVoiceEnd = useCallback(listener => engineRef.current?.subscribeVoiceEnd(listener) ?? (() => {}), []);
  const waitForVoice = useCallback(voice => engineRef.current?.waitForVoice(voice) ?? Promise.resolve(), []);
  return { initialize, isReady, error, noteOn, noteOff, getActiveVoices, subscribeVoiceEnd, waitForVoice };
}
