const FIRST_MIDI = 21;
const LAST_MIDI = 108;
const PITCH_NAMES = Object.freeze(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']);

/**
 * Generate immutable A0–C8 metadata without React, audio, or browser dependencies.
 * @returns {ReadonlyArray<import('../types.js').ImmutablePianoNote>}
 */
export function generatePianoNotes() {
  const notes = Array.from({ length: LAST_MIDI - FIRST_MIDI + 1 }, (_, index) => {
    const midi = FIRST_MIDI + index;
    const pitchName = PITCH_NAMES[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    return Object.freeze({
      midi,
      noteName: `${pitchName}${octave}`,
      isBlack: pitchName.includes('#'),
      freqHz: 440 * 2 ** ((midi - 69) / 12),
    });
  });
  return Object.freeze(notes);
}

// Generate once at module scope; components import this stable collection.
export const pianoNotes = generatePianoNotes();
