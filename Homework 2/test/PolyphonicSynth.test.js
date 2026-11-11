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

test('shared/duplicate owners and generation-safe stale releases', async () => {
  mockAudio();
  const synth = new PolyphonicSynth();
  const first = await synth.noteOn(60, 'a');
  assert.equal(await synth.noteOn(60, 'a'), first);
  assert.equal(await synth.noteOn(60, 'b'), first);
  synth.noteOff(first, 'a');
  assert.equal(first.isReleasing, false);
  const other = await synth.noteOn(62, 'c');
  assert.equal(synth.getActiveVoices().length, 2);
  synth.noteOff(first, 'b');
  const second = await synth.noteOn(60, 'a');
  assert.notEqual(first.id, second.id);
  synth.noteOff(first, 'a');
  assert.equal(second.isReleasing, false);
  assert.equal(other.isReleasing, false);
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

test('eight allocations, ninth/tenth FIFO stealing, and tails outside active allocation', async () => {
  const contexts = mockAudio({ emitEnded: false });
  const synth = new PolyphonicSynth();
  const ended = [];
  synth.subscribeVoiceEnd(event => ended.push({ event, active: synth.getActiveVoices().length,
    sources: contexts[0].nodes.filter(node => node.source).length }));
  const voices = [];
  for (let midi = 60; midi < 68; midi++) voices.push(await synth.noteOn(midi, `owner:${midi}`));
  assert.deepEqual(synth.getActiveVoices().map(voice => voice.midi), [60,61,62,63,64,65,66,67]);
  assert.equal(ended.length, 0);
  assert.equal(await synth.noteOn(60, 'owner:60'), voices[0]); // Does not refresh FIFO order.
  const ninth = await synth.noteOn(68, 'owner:68');
  assert.deepEqual(synth.getActiveVoices().map(voice => voice.midi), [61,62,63,64,65,66,67,68]);
  assert.equal(ended[0].event.voice, voices[0]);
  assert.equal(ended[0].event.reason, 'stolen');
  assert.equal(ended[0].active, 7); // Removed before replacement starts.
  assert.equal(ended[0].sources, 8);
  assert.deepEqual(ended[0].event.ownerIds, ['owner:60']);
  assert.ok(Number.isFinite(ended[0].event.endedAtMs));
  assert.ok(voices[0].isReleasing && !voices[0].isReleased);
  assert.equal(contexts[0].nodes.filter(node => node.source && !node.disconnected).length, 9);
  const tenth = await synth.noteOn(69, 'owner:69');
  assert.equal(ended[1].event.voice, voices[1]);
  assert.equal(synth.getActiveVoices().length, 8);
  assert.ok(ninth.startOrder < tenth.startOrder);
  await synth.dispose();
  assert.ok([...voices, ninth, tenth].every(voice => voice.isReleased && voice.ownerIds.size === 0));
  assert.ok(contexts[0].nodes.every(node => node.disconnected));
  assert.equal(synth.getActiveVoices().length, 0);
});

test('concurrent duplicate owners do not allocate or refresh order, including cross-pitch duplicates', async () => {
  const contexts = mockAudio();
  const synth = new PolyphonicSynth();
  const [first, duplicate] = await Promise.all([synth.noteOn(60, 'pointer:1'), synth.noteOn(60, 'pointer:1')]);
  assert.equal(first, duplicate);
  assert.equal(await synth.noteOn(62, 'pointer:1'), first);
  assert.equal(await synth.noteOn(60, 'keyboard:a'), first);
  assert.equal(synth.getActiveVoices().length, 1);
  assert.equal(contexts[0].nodes.filter(node => node.source).length, 1);
  synth.noteOff(first, 'pointer:1');
  assert.equal(first.isReleasing, false);
  synth.noteOff(first, 'keyboard:a');
  assert.equal(first.isReleasing, true);
  await synth.dispose();
});

test('stolen held owner remains silent; retrigger and old-generation noteOff stay independent', async () => {
  mockAudio({ emitEnded: false });
  const synth = new PolyphonicSynth();
  const old = await synth.noteOn(60, 'held');
  for (let midi = 61; midi <= 68; midi++) await synth.noteOn(midi, `owner:${midi}`);
  assert.equal(await synth.noteOn(60, 'held'), null);
  const replacement = await synth.noteOn(60, 'fresh-owner');
  assert.notEqual(old.id, replacement.id);
  synth.noteOff(old, 'held');
  assert.equal(await synth.noteOn(60, 'held'), replacement);
  synth.noteOff(old, 'held'); // Same owner ID now belongs to replacement.
  assert.ok(replacement.ownerIds.has('held'));
  assert.equal(replacement.isReleasing, false);
  old.oscillator.onended(); // Late old ended callback cannot remove replacement.
  assert.equal(synth.getActiveVoices().find(voice => voice.midi === 60), replacement);
  await synth.dispose();
});

test('end notifications occur once; unsubscribe and unexpected source endings are safe', async () => {
  mockAudio();
  const synth = new PolyphonicSynth();
  const events = [];
  const unsubscribe = synth.subscribeVoiceEnd(event => events.push(event));
  const first = await synth.noteOn(60, 'a');
  synth.noteOff(first, 'a');
  await synth.stopAll();
  assert.equal(events.length, 1);
  assert.equal(events[0].reason, 'released');
  const second = await synth.noteOn(62, 'b');
  second.oscillator.onended();
  assert.equal(events.length, 2);
  assert.equal(events[1].voice, second);
  assert.equal(synth.getActiveVoices().length, 0);
  assert.equal(await synth.noteOn(62, 'b'), null);
  synth.noteOff(second, 'b');
  unsubscribe(); unsubscribe();
  await synth.noteOn(64, 'c');
  await synth.dispose();
  assert.equal(events.length, 2);
});

test('disposal reports every active voice once and blocks allocation from reentrant callbacks', async () => {
  mockAudio();
  const synth = new PolyphonicSynth();
  for (let midi = 60; midi < 68; midi++) await synth.noteOn(midi, `owner:${midi}`);
  const reasons = [];
  synth.subscribeVoiceEnd(event => {
    reasons.push(event.reason);
    if (event.reason === 'stolen') void synth.dispose();
  });
  assert.equal(await synth.noteOn(68, 'new'), null);
  await synth.dispose();
  assert.equal(reasons.filter(reason => reason === 'stolen').length, 1);
  assert.equal(reasons.filter(reason => reason === 'disposed').length, 7);
  assert.equal(synth.getActiveVoices().length, 0);
});
