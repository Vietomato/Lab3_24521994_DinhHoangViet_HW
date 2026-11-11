import { useCallback, useEffect, useRef, useState } from 'react';
import { PianoRecorder } from '../sequencer/recording.js';

/** Shared idle/recording/playing gate, enforced beyond disabled UI controls. */
export function useRecorder() {
  const recorderRef = useRef(null);
  const owners = useRef(new Map());
  const stateRef = useRef('idle');
  const [state, setState] = useState('idle');
  const [events, setEvents] = useState(() => Object.freeze([]));
  const [error, setError] = useState(null);

  useEffect(() => {
    const recorder = new PianoRecorder();
    recorderRef.current = recorder;
    return () => {
      if (recorder.isRecording) recorder.stop(performance.now());
      owners.current.clear();
      recorderRef.current = null;
    };
  }, []);

  const onLiveNoteOn = useCallback((midi, ownerId) => {
    const recorder = recorderRef.current;
    if (!recorder?.isRecording || owners.current.has(ownerId)) return;
    const id = recorder.noteOn(midi, 440 * 2 ** ((midi - 69) / 12), performance.now());
    owners.current.set(ownerId, id);
  }, []);

  const onLiveNoteOff = useCallback((ownerId, nowMs = performance.now()) => {
    const id = owners.current.get(ownerId);
    if (!id) return;
    recorderRef.current?.noteOff(id, nowMs);
    owners.current.delete(ownerId);
  }, []);

  const startRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || stateRef.current !== 'idle') return;
    try {
      recorder.start(performance.now());
      owners.current.clear();
      setEvents(recorder.getEvents());
      setError(null);
      stateRef.current = 'recording';
      setState('recording');
    } catch (cause) { setError(cause.message); }
  }, []);

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder?.isRecording || stateRef.current !== 'recording') return;
    try {
      setEvents(recorder.stop(performance.now()));
      owners.current.clear();
      stateRef.current = 'idle';
      setState('idle');
    } catch (cause) { setError(cause.message); }
  }, []);

  const clearRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || stateRef.current !== 'idle') return;
    recorder.clear();
    setEvents(recorder.getEvents());
  }, []);

  const beginPlayback = useCallback(() => {
    if (stateRef.current !== 'idle') return false;
    stateRef.current = 'playing'; setState('playing'); return true;
  }, []);
  const endPlayback = useCallback(() => {
    if (stateRef.current !== 'playing') return;
    stateRef.current = 'idle'; setState('idle');
  }, []);
  const canPlayLive = useCallback(() => stateRef.current !== 'playing', []);
  return { state, events, error, startRecording, stopRecording, clearRecording, onLiveNoteOn, onLiveNoteOff,
    beginPlayback, endPlayback, canPlayLive };
}
