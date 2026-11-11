import assert from 'node:assert/strict';
import { test } from 'node:test';
import { drumPads } from '../src/config/drumPads.js';

test('seven independent pad configs have unique identities, physical codes, and valid voices', () => {
  assert.equal(drumPads.length, 7);
  assert.equal(new Set(drumPads.map(pad => pad.id)).size, 7);
  assert.deepEqual(drumPads.map(pad => pad.code), ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyJ', 'KeyK', 'KeyL']);
  assert.equal(new Set(drumPads.map(pad => pad.sound.kind)).size, 7);
  for (const pad of drumPads) {
    assert.ok(typeof pad.id === 'string' && pad.id.trim());
    assert.ok(typeof pad.label === 'string' && pad.label.trim());
    assert.ok(Number.isFinite(pad.sound.durationSeconds) && pad.sound.durationSeconds > 0 && pad.sound.durationSeconds <= 5);
    assert.ok(Number.isFinite(pad.sound.frequencyHz) && pad.sound.frequencyHz > 0);
    assert.ok(Number.isFinite(pad.sound.gain) && pad.sound.gain >= 0 && pad.sound.gain <= 1);
  }
});
