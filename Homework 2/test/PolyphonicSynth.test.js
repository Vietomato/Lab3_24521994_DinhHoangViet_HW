import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { PolyphonicSynth } from '../src/audio/PolyphonicSynth.js';

const originalContext = globalThis.AudioContext;
afterEach(() => { globalThis.AudioContext = originalContext; });

function mockAudio({ resume, failGain = false, emitEnded = true } = {}) {
  const contexts = [];
  class Param {
    value = 0;
    calls = [];
    setValueAtTime(...args) { this.calls.push(['set', ...args]); }
    linearRampToValueAtTime(...args) { this.calls.push(['linear', ...args]); }
    exponentialRampToValueAtTime(...args) { this.calls.push(['exponential', ...args]); }
    cancelAndHoldAtTime(...args) { this.calls.push(['hold', ...args]); }
    setTargetAtTime(...args) { this.calls.push(['target', ...args]); }
  }
  class Context {
    state = 'suspended';
    currentTime = 10;
    destination = {};
    nodes = [];
    closes = 0;
    resumes = 0;
    constructor() { contexts.push(this); }
    createGain() { if (failGain) throw Error('Graph failure'); return this.node(); }
    createOscillator() { return this.node(true); }
    node(source = false) {
      const node = { gain: new Param(), frequency: new Param(), connections: [], stops: [],
        disconnected: false, source,
        connect(target) { this.connections.push(target); },
        disconnect() { this.disconnected = true; },
        start(at) { this.startedAt = at; },
        stop(at) { this.stops.push(at); if (emitEnded) queueMicrotask(() => this.onended?.()); },
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

test('lazy audio, A4 oscillator, ADS envelope, conservative master, 40ms release and cleanup', async () => {
  const contexts = mockAudio();
  const synth = new PolyphonicSynth();
  synth.setVolume(0.5);
  assert.equal(contexts.length, 0);
  const voice = await synth.noteOn(69, 'pointer:1');
  const context = contexts[0];
  const master = context.nodes[0];
  assert.equal(master.gain.value, 0.15);
  assert.deepEqual(master.connections, [context.destination]);
  assert.deepEqual(voice.oscillator.connections, [voice.gain]);
  assert.deepEqual(voice.gain.connections, [master]);
  assert.deepEqual(voice.oscillator.frequency.calls, [['set', 440, 10]]);
  const envelope = voice.gain.gain.calls;
  assert.deepEqual(envelope.map(call => call.slice(0, 2)), [['set', 0.0001], ['linear', 0.18], ['exponential', 0.1]]);
  for (const [i, time] of [10, 10.01, 10.13].entries()) assert.ok(Math.abs(envelope[i][2] - time) < 1e-10);
  context.currentTime = 10.005; // Release during attack, preserving the current level.
  synth.noteOff(voice, 'pointer:1');
  assert.equal(voice.isReleasing, true);
  assert.ok(Math.abs(voice.oscillator.stops[0] - 10.045) < 1e-10);
  assert.ok(voice.gain.gain.calls.filter(call => call[0] === 'exponential').every(call => call[1] > 0));
  await synth.stopAll();
  assert.equal(voice.isReleased, true);
  assert.ok(voice.gain.disconnected && voice.oscillator.disconnected);
  assert.equal(voice.oscillator.onended, null);
  const disposal = synth.dispose();
  assert.equal(synth.dispose(), disposal);
  await disposal;
  assert.equal(context.closes, 1);
  assert.ok(master.disconnected);
});

test('shared/duplicate owners, stale releases, and single-voice scope', async () => {
  mockAudio();
  const synth = new PolyphonicSynth();
  const first = await synth.noteOn(60, 'a');
  assert.equal(await synth.noteOn(60, 'a'), first);
  assert.equal(await synth.noteOn(60, 'b'), first);
  synth.noteOff(first, 'a');
  assert.equal(first.isReleasing, false);
  await assert.rejects(synth.noteOn(62, 'c'), /voice pool/);
  synth.noteOff(first, 'b');
  const second = await synth.noteOn(60, 'a');
  assert.notEqual(first.id, second.id);
  synth.noteOff(first, 'a');
  assert.equal(second.isReleasing, false);
  await synth.dispose();
  await assert.rejects(synth.noteOn(60, 'a'), /disposed/);
});

test('invalid and already-aborted input allocates no resources', async () => {
  const contexts = mockAudio();
  const synth = new PolyphonicSynth();
  for (const midi of [20, 109, 60.5, NaN]) await assert.rejects(synth.noteOn(midi, 'a'), RangeError);
  await assert.rejects(synth.noteOn(60, ''), TypeError);
  assert.throws(() => synth.setVolume(Infinity), RangeError);
  const controller = new AbortController(); controller.abort();
  assert.equal(await synth.noteOn(60, 'a', controller.signal), null);
  assert.equal(contexts.length, 0);
  await synth.dispose();
});

test('failed initialization cleans partial graph; resume retry succeeds', async () => {
  const contexts = mockAudio({ failGain: true });
  const synth = new PolyphonicSynth();
  await assert.rejects(synth.initialize(), /could not initialize/);
  assert.equal(contexts[0].closes, 1);
  let attempts = 0;
  const retry = mockAudio({ resume: () => { if (++attempts === 1) throw Error('Blocked'); } });
  await assert.rejects(synth.initialize(), /could not initialize/);
  await synth.initialize();
  assert.equal(retry.length, 1);
  assert.equal(retry[0].resumes, 2);
  await synth.dispose();
});

test('disposal during resume blocks late allocation; a fresh lifecycle works', async () => {
  let finish;
  const contexts = mockAudio({ resume: () => new Promise(resolve => { finish = resolve; }) });
  const synth = new PolyphonicSynth();
  const pending = synth.noteOn(60, 'a');
  const rejected = assert.rejects(pending, /initialize/);
  await synth.dispose(); finish(); await rejected;
  assert.equal(contexts[0].nodes.filter(node => node.source).length, 0);
  mockAudio();
  const next = new PolyphonicSynth();
  await next.noteOn(60, 'a');
  await next.dispose();
});

test('release cleanup stays bounded if ended never arrives (suspended audio clock)', async () => {
  mockAudio({ emitEnded: false });
  const synth = new PolyphonicSynth();
  const voice = await synth.noteOn(60, 'a');
  await synth.dispose();
  assert.equal(voice.isReleased, true);
  assert.ok(voice.oscillator.disconnected && voice.gain.disconnected);
});
