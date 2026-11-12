import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PianoRecorder } from '../src/sequencer/recording.js';

const freq = midi => 440 * 2 ** ((midi - 69) / 12);

test('recording preserves onset order, overlaps and reverse release order', () => {
  const recorder = new PianoRecorder();
  recorder.start(1000);
  const a = recorder.noteOn(60, freq(60), 1100);
  const b = recorder.noteOn(64, freq(64), 1150);
  const c = recorder.noteOn(67, freq(67), 1150);
  recorder.noteOff(b, 1200); recorder.noteOff(c, 1350); recorder.noteOff(a, 1400);
  const events = recorder.stop(1500);
  assert.deepEqual(events.map(e => [e.id, e.midi, e.deltaMs, e.durationMs]),
    [[a,60,100,300],[b,64,50,50],[c,67,0,200]]);
  assert.equal(new Set(events.map(e => e.id)).size, 3);
  assert.ok(events.every(e => e.freqHz === freq(e.midi)));
});

test('stolen notes finalize at logical steal time, not release tail completion', () => {
  const recorder = new PianoRecorder(); recorder.start(0);
  const old = recorder.noteOn(60, freq(60), 10);
  const next = recorder.noteOn(64, freq(64), 30);
  recorder.noteOff(old, 50); recorder.noteOff(old, 90); // Later old release cannot extend it.
  recorder.noteOff(next, 100);
  assert.deepEqual(recorder.stop(110).map(e => e.durationMs), [40,70]);
});

test('stop finalizes all held events and publishes frozen snapshots', () => {
  const recorder = new PianoRecorder(); recorder.start(10);
  recorder.noteOn(60, freq(60), 20); recorder.noteOn(64, freq(64), 40);
  const events = recorder.stop(100);
  assert.deepEqual(events.map(e => e.durationMs), [80,60]);
  assert.ok(Object.isFrozen(events) && events.every(Object.isFrozen));
  assert.throws(() => { events[0].durationMs = 0; }, TypeError);
  assert.throws(() => events.pop(), TypeError);
  recorder.clear(); assert.equal(recorder.getEvents().length, 0);
  assert.equal(events.length, 2); // Old immutable recording is not consumed.
});

test('invalid/nonmonotonic timing cannot corrupt an active session', () => {
  const recorder = new PianoRecorder();
  for (const time of [-1,NaN,Infinity]) assert.throws(() => recorder.start(time), RangeError);
  recorder.start(100);
  assert.throws(() => recorder.start(100), /already active/);
  assert.throws(() => recorder.clear(), /Stop recording/);
  for (const time of [-1,NaN,Infinity,99]) assert.throws(() => recorder.noteOn(60, freq(60), time), RangeError);
  assert.throws(() => recorder.noteOn(109, freq(109), 110), RangeError);
  assert.throws(() => recorder.noteOn(60, Infinity, 110), RangeError);
  const id = recorder.noteOn(60, freq(60), 120);
  for (const time of [-1,NaN,Infinity,119]) assert.throws(() => recorder.noteOff(id, time), RangeError);
  for (const time of [-1,NaN,Infinity,119]) assert.throws(() => recorder.stop(time), RangeError);
  assert.deepEqual(recorder.stop(130).map(e => [e.deltaMs,e.durationMs]), [[20,10]]);
});

test('empty sessions and repeated stop are safe; events outside recording are ignored', () => {
  const recorder = new PianoRecorder();
  assert.equal(recorder.noteOn(60, freq(60), 0), null);
  recorder.start(100); const events = recorder.stop(100);
  assert.deepEqual(events, []); assert.equal(recorder.stop(200), events);
  recorder.start(300); recorder.noteOn(69, 440, 310);
  assert.equal(recorder.stop(320).length, 1);
});

test('stop cannot precede an already finalized note-off', () => {
  const recorder = new PianoRecorder(); recorder.start(100);
  const id = recorder.noteOn(60, freq(60), 110);
  recorder.noteOff(id, 130);
  assert.throws(() => recorder.stop(120), RangeError);
  assert.equal(recorder.stop(140)[0].durationMs, 20);
});
