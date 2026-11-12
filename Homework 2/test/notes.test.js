import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generatePianoNotes, pianoNotes } from '../src/music/notes.js';

test('exactly 88 unique consecutive MIDI notes with 52 white and 36 black keys', () => {
  const notes = generatePianoNotes();
  assert.equal(notes.length, 88);
  assert.equal(new Set(notes.map(note => note.midi)).size, 88);
  assert.equal(new Set(notes.map(note => note.noteName)).size, 88);
  assert.equal(notes.filter(note => !note.isBlack).length, 52);
  assert.equal(notes.filter(note => note.isBlack).length, 36);
  for (let i = 0; i < notes.length; i++) assert.equal(notes[i].midi, 21 + i);
});

test('endpoints and octave boundaries have correct names', () => {
  const names = new Map(pianoNotes.map(note => [note.midi, note.noteName]));
  for (const [midi, name] of [[21,'A0'],[22,'A#0'],[23,'B0'],[24,'C1'],
    [59,'B3'],[60,'C4'],[61,'C#4'],[64,'E4'],[65,'F4'],[66,'F#4'],
    [69,'A4'],[107,'B7'],[108,'C8']]) {
    assert.equal(names.get(midi), name);
  }
  assert.equal(pianoNotes[0].midi, 21);
  assert.equal(pianoNotes.at(-1).midi, 108);
});

test('black-key classification follows the five accidental pitch classes in every octave', () => {
  const blackPitchClasses = new Set([1, 3, 6, 8, 10]);
  for (const note of pianoNotes) {
    assert.equal(note.isBlack, blackPitchClasses.has(note.midi % 12), note.noteName);
    assert.equal(typeof note.isBlack, 'boolean');
  }
});

test('representative frequencies include A4 = 440 Hz and correct low/high endpoints', () => {
  const frequencies = new Map(pianoNotes.map(note => [note.midi, note.freqHz]));
  assert.equal(frequencies.get(69), 440);
  for (const [midi, expected] of [[21,27.5],[60,261.6255653005986],
    [66,369.9944227116344],[81,880],[108,4186.009044809578]]) {
    assert.ok(Math.abs(frequencies.get(midi) - expected) < 1e-9, `MIDI ${midi}`);
  }
  for (let i = 0; i < pianoNotes.length; i++) {
    assert.ok(Number.isFinite(pianoNotes[i].freqHz) && pianoNotes[i].freqHz > 0);
    if (i) assert.ok(pianoNotes[i].freqHz > pianoNotes[i - 1].freqHz);
    if (i >= 12) assert.ok(Math.abs(pianoNotes[i].freqHz / pianoNotes[i - 12].freqHz - 2) < 1e-12);
  }
});

test('generation is deterministic, independent, and immutable', () => {
  const first = generatePianoNotes();
  const second = generatePianoNotes();
  assert.deepEqual(first, second);
  assert.deepEqual(first, pianoNotes);
  assert.notEqual(first, second);
  assert.notEqual(first[0], second[0]);
  assert.ok(Object.isFrozen(pianoNotes));
  assert.ok(pianoNotes.every(note => Object.isFrozen(note)));
  assert.throws(() => { first[0].midi = 0; }, TypeError);
  assert.throws(() => first.push(first[0]), TypeError);
  assert.equal(second[0].midi, 21);
});
