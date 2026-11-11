const FLOOR = 0.0001;
const ATTACK = 0.01;
const DECAY = 0.12;
const PEAK = 0.18;
const SUSTAIN = 0.1;
const RELEASE = 0.04;
const HEADROOM = 0.3;

/** Single-voice foundation. Eight-voice allocation belongs to the next task. */
export class PolyphonicSynth {
  #context = null;
  #master = null;
  #resume = null;
  #active = null;
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
    if (this.#active) {
      if (this.#active.midi !== midi) throw new Error('Release the current note first; the voice pool is not implemented yet.');
      this.#active.ownerIds.add(ownerId);
      return this.#active;
    }
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
        voice.isReleased = true;
        voice.ownerIds.clear();
        clearTimeout(resource.timer);
        oscillator.onended = null;
        for (const node of nodes) node.disconnect();
        this.#resources.delete(voice);
        if (this.#active === voice) this.#active = null;
        resolveDone();
      } };
      oscillator.onended = resource.finish;
      oscillator.start(startedAt);
      this.#resources.set(voice, resource);
      this.#active = voice;
      return voice;
    } catch (cause) {
      if (oscillator) oscillator.onended = null;
      for (const node of nodes) node.disconnect();
      throw new Error('The note could not start.', { cause });
    }
  }

  /** @param {import('../types.js').VoiceHandle} voice @param {string} ownerId */
  noteOff(voice, ownerId) {
    if (this.#active !== voice || !voice.ownerIds.delete(ownerId)) return;
    if (!voice.ownerIds.size) this.#release(voice);
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
    this.#generation++;
    if (this.#active) this.#release(this.#active);
    return Promise.all([...this.#resources.values()].map(resource => resource.done)).then(() => {});
  }

  /** @returns {Promise<void>} Permanently disposes this instance, once. */
  dispose() {
    if (this.#disposal) return this.#disposal;
    this.#disposed = true;
    this.#disposal = (async () => {
      await this.stopAll();
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

  #release(voice) {
    const resource = this.#resources.get(voice);
    if (!resource || voice.isReleasing) return;
    voice.isReleasing = true;
    voice.ownerIds.clear();
    this.#active = null;
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
