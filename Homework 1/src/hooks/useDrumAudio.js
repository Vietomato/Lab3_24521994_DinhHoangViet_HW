import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react';
import { DrumAudioEngine } from '../audio/DrumAudioEngine.js';

/** Owns one engine per effect setup; exposes errors for future inline UI. */
export function useDrumAudio() {
  const engineRef = useRef(null);
  const [error, setError] = useState(null);
  const [volume, setVolumeState] = useState(0.7);
  const configureEngine = useEffectEvent((engine) => engine.setVolume(volume));

  useEffect(() => {
    // StrictMode cleanup disposes this instance; the next setup gets a fresh one.
    const engine = new DrumAudioEngine();
    configureEngine(engine);
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

  const setVolume = useCallback((level) => {
    if (!Number.isFinite(level) || level < 0 || level > 1) {
      throw new RangeError('Volume must be between 0 and 1.');
    }
    engineRef.current?.setVolume(level);
    setVolumeState(level);
  }, []);
  const getAnalyser = useCallback(() => engineRef.current?.getAnalyser() ?? null, []);
  return { trigger, volume, setVolume, getAnalyser, error };
}
