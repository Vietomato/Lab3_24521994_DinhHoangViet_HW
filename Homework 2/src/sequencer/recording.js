function checkTime(nowMs) {
  if (!Number.isFinite(nowMs) || nowMs < 0) throw new RangeError('Timing must be finite and nonnegative.');
}

/** FIFO onset slots; releases finalize slots without reordering them. */
export class PianoRecorder {
  #recording = false;
  #previousOnset = 0;
  #lastTime = 0;
  #slots = [];
  #pending = new Map();
  #events = Object.freeze([]);

  get isRecording() { return this.#recording; }

  /** @param {number} nowMs Monotonic recording start. */
  start(nowMs) {
    checkTime(nowMs);
    if (this.#recording) throw new Error('A recording is already active.');
    this.#recording = true;
    this.#previousOnset = nowMs;
    this.#lastTime = nowMs;
    this.#slots = [];
    this.#pending.clear();
    this.#events = Object.freeze([]);
  }

  /** @returns {string|null} Recording ID independent of voice generation. */
  noteOn(midi, freqHz, nowMs) {
    if (!this.#recording) return null;
    checkTime(nowMs);
    if (nowMs < this.#lastTime) throw new RangeError('Recording time cannot move backwards.');
    if (!Number.isInteger(midi) || midi < 21 || midi > 108) throw new RangeError('Invalid piano MIDI note.');
    const expected = 440 * 2 ** ((midi - 69) / 12);
    if (!Number.isFinite(freqHz) || Math.abs(freqHz - expected) > expected * 1e-9) throw new RangeError('Frequency must match MIDI.');
    const event = { id: crypto.randomUUID(), midi, freqHz, durationMs: null, deltaMs: nowMs - this.#previousOnset };
    const slot = { event, onsetMs: nowMs };
    this.#slots.push(slot);
    this.#pending.set(event.id, slot);
    this.#previousOnset = nowMs;
    this.#lastTime = nowMs;
    return event.id;
  }

  noteOff(eventId, nowMs) {
    const slot = this.#pending.get(eventId);
    if (!slot) return;
    checkTime(nowMs);
    if (nowMs < this.#lastTime) throw new RangeError('Recording time cannot move backwards.');
    slot.event.durationMs = nowMs - slot.onsetMs;
    this.#pending.delete(eventId);
    this.#lastTime = nowMs;
  }

  /** @returns {import('../types.js').RecordedSequence} Immutable completed data. */
  stop(nowMs) {
    if (!this.#recording) return this.#events;
    checkTime(nowMs);
    if (nowMs < this.#lastTime) throw new RangeError('Recording stop cannot precede its latest event.');
    for (const id of this.#pending.keys()) this.noteOff(id, nowMs);
    this.#recording = false;
    this.#events = Object.freeze(this.#slots.map(({ event }) => Object.freeze({ ...event })));
    this.#slots = [];
    return this.#events;
  }

  getEvents() { return this.#events; }

  clear() {
    if (this.#recording) throw new Error('Stop recording before clearing.');
    this.#events = Object.freeze([]);
  }
}
