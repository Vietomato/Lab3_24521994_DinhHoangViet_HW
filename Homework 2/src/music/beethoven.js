import notes from './beethoven-notes.json' with { type: 'json' };

// Public-domain Mutopia edition by Chris Sawer; see assets/README.md.
let previousOnset = 0;
export const beethovenSequence = Object.freeze(notes.map(([midi, onset, durationMs], index) => {
  const deltaMs = Math.max(0, onset - previousOnset);
  previousOnset = onset;
  return Object.freeze({ id: `beethoven-${index + 1}`, midi,
    freqHz: 440 * 2 ** ((midi - 69) / 12), deltaMs, durationMs });
}));
