import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { DrumAudioEngine } from '../src/audio/DrumAudioEngine.js';
import { drumPads } from '../src/config/drumPads.js';

const originalContext = globalThis.AudioContext;
afterEach(() => { globalThis.AudioContext = originalContext; });

function mockAudio({ resume, failGraph = false } = {}) {
  const contexts = [];
  class Context {
    state = 'suspended';
    currentTime = 0;
    sampleRate = 48000;
    destination = {};
    nodes = [];
    closes = 0;
    resumes = 0;
    constructor() { contexts.push(this); }
    createGain() {
      if (failGraph) throw Error('Graph failed');
      return this.node();
    }
    createAnalyser() { return this.node(); }
    createOscillator() { return this.node(true); }
    createBufferSource() { return this.node(true); }
    createBiquadFilter() { return this.node(); }
    createBuffer(channels, length) { return { getChannelData: () => new Float32Array(length) }; }
    node(source = false) {
      const param = { value: 0, setValueAtTime() {}, linearRampToValueAtTime() {},
        exponentialRampToValueAtTime() {}, setTargetAtTime(value) { this.value = value; } };
      const node = { source, gain: { ...param }, frequency: { ...param }, Q: {},
        connections: [], disconnected: false, started: false, stopped: false,
        connect(target) { this.connections.push(target); },
        disconnect() { this.disconnected = true; },
        start() { this.started = true; },
        stop() { this.stopped = true; },
      };
      this.nodes.push(node);
      return node;
    }
    async resume() {
      this.resumes++;
      if (resume) await resume();
      if (this.state !== 'closed') this.state = 'running';
    }
    async close() { this.closes++; this.state = 'closed'; }
  }
  globalThis.AudioContext = Context;
  return contexts;
}

test('lazy initialization, overlap, master routing, ended cleanup, idempotent disposal', async () => {
  const contexts = mockAudio();
  const engine = new DrumAudioEngine();
  engine.setVolume(0.5);
  assert.equal(contexts.length, 0);
  assert.equal(engine.getAnalyser(), null);
  await Promise.all(drumPads.map(pad => engine.trigger(pad.sound)));
  assert.equal(contexts.length, 1);
  const context = contexts[0];
  assert.equal(context.resumes, 1);
  const [master, analyser] = context.nodes;
  assert.equal(master.gain.value, 0.09);
  assert.deepEqual(master.connections, [analyser]);
  assert.deepEqual(analyser.connections, [context.destination]);
  const sources = context.nodes.filter(node => node.source);
  assert.equal(sources.length, 11);
  assert.ok(sources.every(node => node.started && node.onended));
  for (const source of sources) source.onended();
  assert.ok(context.nodes.slice(2).every(node => node.disconnected));
  await engine.trigger(drumPads[0].sound);
  const disposal = engine.dispose();
  assert.equal(engine.dispose(), disposal);
  await disposal;
  assert.equal(context.closes, 1);
  assert.ok(context.nodes.every(node => node.disconnected));
  assert.equal(engine.getAnalyser(), null);
  await assert.rejects(engine.trigger(drumPads[0].sound), /disposed/);
});

test('invalid input never initializes audio; initialization errors reject', async () => {
  const contexts = mockAudio();
  const engine = new DrumAudioEngine();
  assert.throws(() => engine.setVolume(NaN), RangeError);
  assert.throws(() => engine.setVolume(2), RangeError);
  await assert.rejects(engine.trigger({ kind: 'unknown' }), TypeError);
  await assert.rejects(engine.trigger({ ...drumPads[0].sound, durationSeconds: -1 }), RangeError);
  assert.equal(contexts.length, 0);
  delete globalThis.AudioContext;
  await assert.rejects(engine.trigger(drumPads[0].sound), /Unable to play/);
  await engine.dispose();
});

test('failed graph closes context; failed resume can be retried', async () => {
  const failed = mockAudio({ failGraph: true });
  const engine = new DrumAudioEngine();
  await assert.rejects(engine.trigger(drumPads[0].sound), /Unable to play/);
  assert.equal(failed[0].closes, 1);
  let attempts = 0;
  const contexts = mockAudio({ resume: () => { if (++attempts === 1) throw Error('Blocked'); } });
  await assert.rejects(engine.trigger(drumPads[0].sound), /Unable to play/);
  await engine.trigger(drumPads[0].sound);
  assert.equal(contexts.length, 1);
  assert.equal(contexts[0].resumes, 2);
  await engine.dispose();
});

test('disposal during resume prevents voice creation; fresh lifecycle remains usable', async () => {
  let finishResume;
  const contexts = mockAudio({ resume: () => new Promise(resolve => { finishResume = resolve; }) });
  const engine = new DrumAudioEngine();
  const hit = engine.trigger(drumPads[0].sound);
  const rejected = assert.rejects(hit, /Unable to play/);
  await engine.dispose();
  finishResume();
  await rejected;
  assert.equal(contexts[0].nodes.filter(node => node.source).length, 0);
  const freshContexts = mockAudio();
  const fresh = new DrumAudioEngine();
  await fresh.trigger(drumPads[0].sound);
  assert.equal(freshContexts.length, 1);
  await fresh.dispose();
});
