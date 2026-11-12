import test from 'node:test';
import assert from 'node:assert/strict';
import { beethovenSequence } from '../src/music/beethoven.js';
import { createReplaySchedule } from '../src/sequencer/AudioTaskQueue.js';

test('Beethoven score is valid, immutable and replayable at every supported speed', () => {
  assert.equal(beethovenSequence.length, 2385);
  assert.ok(Object.isFrozen(beethovenSequence));
  for (const speed of [0.5, 1, 2]) {
    const schedule = createReplaySchedule(beethovenSequence, speed);
    assert.equal(schedule.length, 2385);
    assert.ok(schedule.at(-1).releaseMs > 0);
    assert.ok(beethovenSequence.every(Object.isFrozen));
  }
});
