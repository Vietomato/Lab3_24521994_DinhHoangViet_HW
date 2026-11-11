import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AudioTaskQueue, createReplaySchedule } from '../src/sequencer/AudioTaskQueue.js';

const event = (id, midi, deltaMs, durationMs) => ({ id, midi, freqHz: 440 * 2 ** ((midi - 69) / 12), deltaMs, durationMs });
const flush = async () => { for (let i = 0; i < 25; i++) await Promise.resolve(); };

class Clock {
  time = 0;
  next = 0;
  timers = new Map();
  now = () => this.time;
  setTimer = (fn, delay) => { const id = ++this.next; this.timers.set(id, { fn, at: this.time + delay }); return id; };
  clearTimer = id => this.timers.delete(id);
  async advanceTo(target) {
    await flush();
    for (;;) {
      const next = [...this.timers].filter(([, timer]) => timer.at <= target).sort((a,b) => a[1].at - b[1].at)[0];
      if (!next) break;
      this.time = next[1].at; this.timers.delete(next[0]); next[1].fn(); await flush();
    }
    this.time = target; await flush();
  }
}

function makeAudio(clock, allocationDelay = 0) {
  const calls = [];
  const audio = {
    calls, initialized: 0,
    async initialize() { this.initialized++; return true; },
    async noteOn(midi, ownerId) {
      if (allocationDelay) await new Promise(resolve => clock.setTimer(resolve, allocationDelay));
      const voice = { id: crypto.randomUUID(), midi, ownerId, release: null };
      calls.push(['on', midi, clock.now(), voice.id, ownerId]);
      return voice;
    },
    noteOff(voice, ownerId) {
      assert.equal(ownerId, voice.ownerId);
      if (voice.release) return;
      calls.push(['off', voice.midi, clock.now(), voice.id, ownerId]);
      voice.release = new Promise(resolve => clock.setTimer(resolve, 40));
    },
    waitForVoice(voice) { return voice.release ?? Promise.resolve(); },
  };
  return audio;
}

for (const speed of [0.5, 1, 2]) {
  test(`replay preserves FIFO overlaps and scales onsets/durations at ${speed}x`, async () => {
    const clock = new Clock(); const audio = makeAudio(clock); const queue = new AudioTaskQueue(audio, clock);
    const events = Object.freeze([event('a',60,100,300),event('b',64,50,50),event('c',67,0,200)].map(Object.freeze));
    const saved = JSON.stringify(events);
    let complete = false;
    const playing = queue.play(events, speed).then(outcome => { complete = true; return outcome; });
    await clock.advanceTo(400 / speed);
    assert.equal(complete, false, 'wait for the final release tail');
    await clock.advanceTo(400 / speed + 40);
    assert.equal(await playing, 'completed');
    assert.deepEqual(audio.calls.filter(call => call[0] === 'on').map(call => call.slice(1,3)),
      [[60,100/speed],[64,150/speed],[67,150/speed]]);
    assert.deepEqual(audio.calls.filter(call => call[0] === 'off').map(call => call.slice(1,3)),
      [[64,200/speed],[67,350/speed],[60,400/speed]]);
    for (const on of audio.calls.filter(call => call[0] === 'on')) {
      const off = audio.calls.find(call => call[0] === 'off' && call[3] === on[3]);
      assert.equal(off[4], on[4]); // Release uses the exact generation and owner.
    }
    assert.equal(JSON.stringify(events), saved);
    assert.equal(clock.timers.size, 0);
  });
}

test('schedule is a detached immutable snapshot; empty replay never initializes audio', async () => {
  const events = [event('a',69,20,100)];
  const schedule = createReplaySchedule(events, 2);
  events[0].durationMs = 999; events.push(event('b',70,0,200));
  assert.equal(schedule.length, 1); assert.equal(schedule[0].releaseMs, 60);
  assert.ok(Object.isFrozen(schedule) && Object.isFrozen(schedule[0].event));
  const clock = new Clock(); const audio = makeAudio(clock);
  assert.equal(await new AudioTaskQueue(audio, clock).play([],1), 'completed');
  assert.equal(audio.initialized, 0);
});

test('rejects invalid events, duplicate IDs, speeds and cumulative overflow before initialization', async () => {
  const clock = new Clock(); const audio = makeAudio(clock); const queue = new AudioTaskQueue(audio, clock);
  for (const speed of [0,3,NaN,Infinity]) await assert.rejects(queue.play([event('a',69,0,100)], speed), RangeError);
  for (const change of [{midi:109},{freqHz:NaN},{freqHz:123},{deltaMs:-1},{durationMs:Infinity},{id:''}]) {
    await assert.rejects(queue.play([{...event('a',69,0,100),...change}],1));
  }
  await assert.rejects(queue.play([event('a',60,0,1),event('a',64,0,1)],1));
  await assert.rejects(queue.play([event('a',60,Number.MAX_VALUE,Number.MAX_VALUE)],0.5));
  assert.equal(audio.initialized, 0);
});

test('absolute onset targets avoid accumulating note-allocation delays', async () => {
  const clock = new Clock(); const audio = makeAudio(clock, 10); const queue = new AudioTaskQueue(audio, clock);
  const playing = queue.play([event('a',60,100,50),event('b',64,100,50),event('c',67,100,50)],1);
  await clock.advanceTo(500); await playing;
  assert.deepEqual(audio.calls.filter(call => call[0] === 'on').map(call => call[2]),[110,210,310]);
  assert.deepEqual(audio.calls.filter(call => call[0] === 'off').map(call => call[2]),[150,250,350]);
});

test('concurrent Play rejects; completed queue can replay the saved data again', async () => {
  const clock = new Clock(); const audio = makeAudio(clock); const queue = new AudioTaskQueue(audio, clock);
  const events = [event('a',60,0,20)];
  const first = queue.play(events,1);
  await assert.rejects(queue.play(events,1), /already active/);
  await clock.advanceTo(100); await first;
  const second = queue.play(events,2); await clock.advanceTo(200); await second;
  assert.equal(audio.calls.filter(call => call[0] === 'on').length,2);
  assert.equal(events.length,1);
});

test('a running replay uses its own snapshot even if caller data changes', async () => {
  const clock = new Clock(); const audio = makeAudio(clock); const queue = new AudioTaskQueue(audio, clock);
  const events = [event('a',60,100,100)];
  const playing = queue.play(events,1);
  events[0].deltaMs = 9999; events[0].durationMs = 9999; events.length = 0;
  await clock.advanceTo(300); await playing;
  assert.deepEqual(audio.calls.map(call => call.slice(0,3)), [['on',60,100],['off',60,200]]);
});

test('allocation failure releases earlier owned voices and clears scheduled work', async () => {
  const clock = new Clock(); const audio = makeAudio(clock);
  const noteOn = audio.noteOn;
  audio.noteOn = async (midi, owner) => { if (midi === 64) throw Error('Simulated allocation failure'); return noteOn(midi, owner); };
  const queue = new AudioTaskQueue(audio, clock);
  const rejected = assert.rejects(queue.play([event('a',60,0,1000),event('b',64,20,100)],1), /allocation failure/);
  await clock.advanceTo(200); await rejected;
  assert.deepEqual(audio.calls.map(call => call.slice(0,3)), [['on',60,0],['off',60,20]]);
  assert.equal(clock.timers.size, 0);
});

test('lifecycle stop while initialization is pending resolves an expected aborted outcome', async () => {
  const clock = new Clock(); const audio = makeAudio(clock);
  let finish;
  audio.initialize = () => new Promise(resolve => { finish = resolve; });
  const queue = new AudioTaskQueue(audio, clock);
  const outcome = queue.play([event('a',60,0,100)],1).catch(error => ({ error: error.message }));
  const stopping = queue.stop().catch(error => ({ error: error.message }));
  finish(false);
  assert.equal(await outcome, 'aborted');
  await stopping;
  assert.equal(audio.calls.length,0);
  assert.equal(clock.timers.size,0);
});
