import { useCallback, useEffect, useRef, useState } from 'react';

/** Own live input independently from audio allocation, including stolen holds. */
export function usePianoInput({ noteOn, noteOff, getActiveVoices, subscribeVoiceEnd }) {
  const held = useRef(new Map());
  const mounted = useRef(false);
  const [pressedMidi, setPressedMidi] = useState(() => new Set());

  const synchronize = useCallback(() => {
    if (!mounted.current) return;
    const next = new Set(getActiveVoices().map(voice => voice.midi));
    setPressedMidi(previous => {
      // Preserve state identity when owners change but active pitches do not.
      if (previous.size === next.size && [...next].every(midi => previous.has(midi))) return previous;
      return next;
    });
  }, [getActiveVoices]);

  const onNoteOff = useCallback((midi, ownerId) => {
    const input = held.current.get(ownerId);
    if (!input || input.midi !== midi) return;
    held.current.delete(ownerId);
    input.controller.abort();
    clearTimeout(input.timer);
    if (input.voice) noteOff(input.voice, ownerId);
    synchronize();
  }, [noteOff, synchronize]);

  const clearHeld = useCallback(() => {
    for (const [ownerId, input] of held.current) onNoteOff(input.midi, ownerId);
  }, [onNoteOff]);

  const onNoteOn = useCallback((midi, ownerId, durationMs) => {
    if (held.current.has(ownerId)) return;
    const input = { midi, controller: new AbortController(), voice: null, timer: null };
    held.current.set(ownerId, input);
    void noteOn(midi, ownerId, input.controller.signal).then(voice => {
      // Release/repress can happen before the original initialization resolves.
      if (held.current.get(ownerId) !== input || input.controller.signal.aborted) {
        if (voice) noteOff(voice, ownerId);
        return;
      }
      if (!voice) { held.current.delete(ownerId); synchronize(); return; }
      input.voice = voice;
      synchronize();
      // Assistive clicks have no held key/pointer. Give them a short audible pulse.
      if (durationMs !== undefined) input.timer = setTimeout(() => onNoteOff(midi, ownerId), durationMs);
    });
  }, [noteOn, noteOff, onNoteOff, synchronize]);

  useEffect(() => {
    mounted.current = true;
    const unsubscribe = subscribeVoiceEnd(synchronize);
    const visibility = () => { if (document.hidden) clearHeld(); };
    window.addEventListener('blur', clearHeld);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      mounted.current = false;
      unsubscribe();
      window.removeEventListener('blur', clearHeld);
      document.removeEventListener('visibilitychange', visibility);
      clearHeld();
    };
  }, [subscribeVoiceEnd, synchronize, clearHeld]);

  return { pressedMidi, onNoteOn, onNoteOff };
}
