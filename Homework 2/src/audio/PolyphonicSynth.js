const FLOOR = 0.0001;
const ATTACK = 0.01;
const DECAY = 0.12;
const PEAK = 0.18;
const SUSTAIN = 0.1;
const RELEASE = 0.04;
const HEADROOM = 0.3;
const MAX_VOICES = 8;

/** Eight distinct active pitches, allocated in Map insertion (FIFO) order. */
export class PolyphonicSynth {
  #context = null;
  #master = null;
  #resume = null;
  #active = new Map();
  #owners = new Map();
  #listeners = new Set();
  // Resources include both active allocations and short releasing tails.
  #resources = new Map();
  #volume = 0.7;
  #order = 0;
  #generation = 0;
  #disposed = false;
  #disposal = null;

  /** @returns {Promise<void>} Call from a user interaction; failures reject. */
  async initialize() {
    this.#assertUsable();
    const activation = globalThis.navigator?.userActivation;
    if ((!this.#context || this.#context.state !== 'running') && activation && !activation.isActive) {
      throw new Error('Enable audio with a click, tap, or key press.');
    }
    try {
      if (!this.#context) {
        if (!globalThis.AudioContext) throw new Error('Web Audio is unavailable in this browser.');
        const context = new AudioContext();
        let master;
        try {
          master = context.createGain();
          master.gain.value = this.#volume * HEADROOM;
          master.connect(context.destination);
          this.#context = context;
          this.#master = master;
        } catch (cause) {
          master?.disconnect();
          await context.close();
          throw cause;
        }
      }
      const context = this.#context;
      if (context.state !== 'running') {
        // Invoke resume in the gesture and share it between concurrent callers.
        this.#resume ??= context.resume().finally(() => { this.#resume = null; });
        await this.#resume;
      }
      this.#assertUsable();
      if (context.state !== 'running') throw new Error('Audio context did not resume.');
    } catch (cause) {
      throw new Error('Audio could not initialize. Try enabling audio again.', { cause });
    }
  }

  /**
   * @param {number} midi
   * @param {string} ownerId
   * @param {AbortSignal} [signal]
   * @returns {Promise<import('../types.js').VoiceHandle|null>}
   */
  async noteOn(midi, ownerId, signal) {
    this.#assertUsable();
    if (!Number.isInteger(midi) || midi < 21 || midi > 108) throw new RangeError('MIDI must be an integer from 21 to 108.');
    if (typeof ownerId !== 'string' || !ownerId.trim()) throw new TypeError('A nonempty input owner ID is required.');
    if (signal?.aborted) return null;
    const generation = this.#generation;
    await this.initialize();
    if (signal?.aborted || generation !== this.#generation) return null;
    this.#assertUsable();
    const owned = this.#owners.get(ownerId);
    if (owned) return owned.isReleasing || owned.isReleased ? null : owned;
    const existing = this.#active.get(midi);
    if (existing) {
      existing.ownerIds.add(ownerId);
      this.#owners.set(ownerId, existing);
      return existing;
    }
    if (this.#active.size >= MAX_VOICES) this.#release(this.#active.values().next().value, 'stolen');
    // Subscribers can stop/dispose from the logical-end notification.
    if (generation !== this.#generation) return null;
    this.#assertUsable();
    const context = this.#context;
    const nodes = [];
    let oscillator;
    try {
      oscillator = context.createOscillator();
      nodes.push(oscillator);
      const gain = context.createGain();
      nodes.push(gain);
      const startedAt = context.currentTime;
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(440 * 2 ** ((midi - 69) / 12), startedAt);
      gain.gain.setValueAtTime(FLOOR, startedAt);
      gain.gain.linearRampToValueAtTime(PEAK, startedAt + ATTACK);
      gain.gain.exponentialRampToValueAtTime(SUSTAIN, startedAt + ATTACK + DECAY);
      oscillator.connect(gain);
      gain.connect(this.#master);
      const voice = {
        id: crypto.randomUUID(), midi, oscillator, gain, startOrder: ++this.#order,
        ownerIds: new Set([ownerId]), isReleasing: false, isReleased: false,
      };
      let resolveDone;
      const done = new Promise(resolve => { resolveDone = resolve; });
      const resource = { done, timer: null, finish: () => {
        if (voice.isReleased) return;
        if (!voice.isReleasing) this.#removeAllocation(voice, 'released');
        voice.isReleased = true;
        clearTimeout(resource.timer);
        oscillator.onended = null;
        for (const node of nodes) node.disconnect();
        this.#resources.delete(voice);
        resolveDone();
      } };
      oscillator.onended = resource.finish;
      oscillator.start(startedAt);
      this.#resources.set(voice, resource);
      this.#active.set(midi, voice);
      this.#owners.set(ownerId, voice);
      return voice;
    } catch (cause) {
      if (oscillator) oscillator.onended = null;
      for (const node of nodes) node.disconnect();
      throw new Error('The note could not start.', { cause });
    }
  }

  /** @param {import('../types.js').VoiceHandle} voice @param {string} ownerId */
  noteOff(voice, ownerId) {
    // Identity protects a new generation even when owner ID and MIDI are reused.
    if (this.#owners.get(ownerId) !== voice) return;
    this.#owners.delete(ownerId);
    voice.ownerIds.delete(ownerId);
    if (this.#active.get(voice.midi) === voice && !voice.ownerIds.size) this.#release(voice, 'released');
  }

  /** @returns {ReadonlyArray<import('../types.js').VoiceHandle>} FIFO snapshot. */
  getActiveVoices() { return Object.freeze([...this.#active.values()]); }

  /** Wait for this exact generation's release tail, without stopping other voices. */
  waitForVoice(voice) { return this.#resources.get(voice)?.done ?? Promise.resolve(); }

  /**
   * Notify at logical release/steal/end, not again when its audio tail ends.
   * @param {function(import('../types.js').VoiceEndEvent): void} listener
   * @returns {function(): void}
   */
  subscribeVoiceEnd(listener) {
    this.#assertUsable();
    if (typeof listener !== 'function') throw new TypeError('A voice-end listener must be a function.');
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  /** @param {number} level Normalized [0, 1]; can be set before initialization. */
  setVolume(level) {
    this.#assertUsable();
    if (!Number.isFinite(level) || level < 0 || level > 1) throw new RangeError('Volume must be between 0 and 1.');
    this.#volume = level;
    this.#master?.gain.setTargetAtTime(level * HEADROOM, this.#context.currentTime, 0.01);
  }

  /** @returns {Promise<void>} Includes release tails; safe when repeated. */
  stopAll() {
    return this.#stopAll('released');
  }

  #stopAll(reason) {
    this.#generation++;
    for (const voice of [...this.#active.values()]) this.#release(voice, reason);
    for (const voice of this.#owners.values()) voice.ownerIds.clear();
    this.#owners.clear();
    for (const voice of this.#resources.keys()) voice.ownerIds.clear();
    return Promise.all([...this.#resources.values()].map(resource => resource.done)).then(() => {});
  }

  /** @returns {Promise<void>} Permanently disposes this instance, once. */
  dispose() {
    if (this.#disposal) return this.#disposal;
    this.#disposed = true;
    this.#disposal = (async () => {
      await this.#stopAll('disposed');
      this.#listeners.clear();
      this.#master?.disconnect();
      const context = this.#context;
      this.#context = this.#master = null;
      if (context && context.state !== 'closed') await context.close();
    })();
    return this.#disposal;
  }

  #assertUsable() {
    if (this.#disposed) throw new Error('This audio instance is disposed; create a fresh instance.');
  }

  #removeAllocation(voice, reason) {
    if (this.#active.get(voice.midi) === voice) this.#active.delete(voice.midi);
    voice.isReleasing = true;
    const event = Object.freeze({ voice, reason, endedAtMs: performance.now(), ownerIds: Object.freeze([...voice.ownerIds]) });
    for (const listener of [...this.#listeners]) {
      try { listener(event); } catch (cause) { console.error('Voice-end listener failed:', cause); }
    }
  }

  #release(voice, reason) {
    const resource = this.#resources.get(voice);
    if (!resource || voice.isReleasing) return;
    this.#removeAllocation(voice, reason);
    const now = this.#context.currentTime;
    // Every scheduled envelope value is positive, including the held value.
    voice.gain.gain.cancelAndHoldAtTime(now);
    voice.gain.gain.exponentialRampToValueAtTime(FLOOR, now + RELEASE);
    voice.oscillator.stop(now + RELEASE);
    // Bound cleanup if a suspended context delays the ended event indefinitely.
    resource.timer = setTimeout(() => {
      voice.oscillator.stop();
      resource.finish();
    }, RELEASE * 1000 + 100);
  }
}
