import { useCallback, useEffect, useRef, useState } from 'react';
import { DrumAudioEngine } from '../audio/DrumAudioEngine.js';

/** Owns one engine per effect setup; exposes errors for future inline UI. */
export function useDrumAudio() {
  const engineRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // StrictMode cleanup disposes this instance; the next setup gets a fresh one.
    const engine = new DrumAudioEngine();
    engineRef.current = engine;
    return () => {
      engineRef.current = null;
      engine.dispose().catch((cause) => console.error('Audio cleanup failed:', cause));
    };
  }, []);

  const trigger = useCallback(/** @param {import('../types.js').SoundConfig} sound */ async (sound) => {
    const engine = engineRef.current;
    if (!engine) return false;
    try {
      await engine.trigger(sound);
      if (engineRef.current === engine) setError(null);
      return true;
    } catch (cause) {
      if (engineRef.current === engine) setError(cause.message);
      return false;
    }
  }, []);

  const setVolume = useCallback((level) => engineRef.current?.setVolume(level), []);
  const getAnalyser = useCallback(() => engineRef.current?.getAnalyser() ?? null, []);
  return { trigger, setVolume, getAnalyser, error };
}
