import assert from 'node:assert/strict';
import { test } from 'node:test';
import { measureSignalLevel } from '../src/audio/signalLevel.js';

test('signal level handles silence and invalid input without invalid meter values', () => {
  for (const samples of [[], [0, 0], [NaN], [Infinity], [0.000001]]) {
    assert.equal(measureSignalLevel(samples), 0);
  }
});

test('RMS measures polarity-independent amplitude and clamps overloads', () => {
  assert.equal(measureSignalLevel([0.5, -0.5]), 0.5);
  assert.equal(measureSignalLevel([1, -1]), 1);
  assert.equal(measureSignalLevel([2, -2]), 1);
  assert.ok(Math.abs(measureSignalLevel([1, 0]) - Math.SQRT1_2) < 1e-10);
});
