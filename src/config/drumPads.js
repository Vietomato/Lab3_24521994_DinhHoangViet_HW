/**
 * Shared pad data, independent of React and browser/audio initialization.
 * Frequencies configure oscillators or noise filters, depending on sound kind.
 * @type {import('../types.js').DrumPad[]}
 */
export const drumPads = [
  {
    id: 'kick',
    label: 'Kick Drum',
    code: 'KeyW',
    sound: { kind: 'kick', durationSeconds: 0.5, frequencyHz: 150, gain: 0.8 },
  },
  {
    id: 'snare',
    label: 'Snare Drum',
    code: 'KeyA',
    sound: { kind: 'snare', durationSeconds: 0.2, frequencyHz: 180, gain: 0.6 },
  },
  {
    id: 'closed-hat',
    label: 'Closed Hi-Hat',
    code: 'KeyS',
    sound: { kind: 'closedHat', durationSeconds: 0.06, frequencyHz: 8000, gain: 0.3 },
  },
  {
    id: 'open-hat',
    label: 'Open Hi-Hat',
    code: 'KeyD',
    sound: { kind: 'openHat', durationSeconds: 0.4, frequencyHz: 7000, gain: 0.3 },
  },
  {
    id: 'tom',
    label: 'Low Tom',
    code: 'KeyJ',
    sound: { kind: 'tom', durationSeconds: 0.35, frequencyHz: 120, gain: 0.7 },
  },
  {
    id: 'clap',
    label: 'Hand Clap',
    code: 'KeyK',
    sound: { kind: 'clap', durationSeconds: 0.18, frequencyHz: 1500, gain: 0.5 },
  },
  {
    id: 'rim',
    label: 'Rim Shot',
    code: 'KeyL',
    sound: { kind: 'rim', durationSeconds: 0.08, frequencyHz: 900, gain: 0.5 },
  },
];
