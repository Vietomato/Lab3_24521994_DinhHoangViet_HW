/** Validate/copy saved data; replay never consumes the recorded array. */
export function createReplaySchedule(events, speed) {
  if (![0.5, 1, 2].includes(speed)) throw new RangeError('Replay speed must be 0.5, 1, or 2.');
  if (!Array.isArray(events)) throw new TypeError('A recorded sequence must be an array.');
  const ids = new Set();
  let elapsed = 0;
  return Object.freeze(events.map(event => {
    if (!event || typeof event.id !== 'string' || !event.id || ids.has(event.id)) throw new TypeError('Recorded event IDs must be unique.');
    ids.add(event.id);
    if (!Number.isInteger(event.midi) || event.midi < 21 || event.midi > 108) throw new RangeError('Invalid recorded MIDI.');
    const expected = 440 * 2 ** ((event.midi - 69) / 12);
    if (!Number.isFinite(event.freqHz) || Math.abs(event.freqHz - expected) > expected * 1e-9) throw new RangeError('Recorded frequency must match MIDI.');
    if (![event.deltaMs, event.durationMs].every(value => Number.isFinite(value) && value >= 0)) throw new RangeError('Recorded timing must be finite and nonnegative.');
    elapsed += event.deltaMs;
    const onsetMs = elapsed / speed;
    const releaseMs = onsetMs + event.durationMs / speed;
    if (!Number.isFinite(onsetMs) || !Number.isFinite(releaseMs)) throw new RangeError('Replay timing overflow.');
    return Object.freeze({ event: Object.freeze({ ...event }), onsetMs, releaseMs });
  }));
}

/** FIFO onsets and independent generation-safe releases preserve overlap. */
export class AudioTaskQueue {
  #audio;
  #clock;
  #run = null;
  #disposed = false;

  constructor(audio, clock = {}) {
    this.#audio = audio;
    this.#clock = { now: () => performance.now(), setTimer: (fn, delay) => setTimeout(fn, delay), clearTimer: id => clearTimeout(id), ...clock };
  }

  /** @returns {Promise<import('../types.js').ReplayOutcome>} */
  async play(events, speed) {
    if (this.#disposed) throw new Error('The sequencer is disposed.');
    if (this.#run) throw new Error('A replay is already active.');
    const schedule = createReplaySchedule(events, speed);
    if (!schedule.length) return 'completed';
    const run = { id: crypto.randomUUID(), cancelled: false, waits: new Set(), voices: new Map(), releases: new Set(), error: null, done: null };
    this.#run = run;
    run.done = this.#execute(run, schedule);
    return run.done;
  }

  // Internal lifecycle cleanup; the Stop Sequence UI/AbortSignal is Stage 3.
  stop() {
    const run = this.#run;
    if (!run) return Promise.resolve();
    this.#cancel(run);
    return run.done.then(() => {});
  }

  dispose() { this.#disposed = true; return this.stop(); }

  #cancel(run) {
    run.cancelled = true;
    for (const waiter of [...run.waits]) waiter.finish(false);
  }

  #waitUntil(run, targetMs) {
    return new Promise(resolve => {
      const waiter = { timer: null, finish: result => {
        this.#clock.clearTimer(waiter.timer);
        run.waits.delete(waiter);
        resolve(result);
      } };
      const tick = () => {
        if (run.cancelled) return waiter.finish(false);
        const remaining = targetMs - this.#clock.now();
        if (remaining <= 0) return waiter.finish(true);
        waiter.timer = this.#clock.setTimer(tick, Math.min(remaining, 2147483647));
      };
      run.waits.add(waiter);
      tick();
    });
  }

  async #release(run, ownerId, voice, targetMs) {
    await this.#waitUntil(run, targetMs);
    if (run.voices.get(ownerId) !== voice) return;
    run.voices.delete(ownerId);
    this.#audio.noteOff(voice, ownerId);
    await this.#audio.waitForVoice(voice);
  }

  async #execute(run, schedule) {
    try {
      // Called before the first await so context resume follows user interaction.
      const initialized = await this.#audio.initialize();
      if (run.cancelled) return 'aborted';
      if (initialized === false) throw new Error('Enable audio before replaying.');
      const startedAt = this.#clock.now();
      for (const item of schedule) {
        if (!await this.#waitUntil(run, startedAt + item.onsetMs)) break;
        const ownerId = `replay:${run.id}:${item.event.id}`;
        const voice = await this.#audio.noteOn(item.event.midi, ownerId);
        if (voice) run.voices.set(ownerId, voice);
        if (run.cancelled) break;
        if (!voice) throw new Error('A replay note could not start.');
        this.#audio.onVoicesChange?.();
        if (run.cancelled) break;
        const release = this.#release(run, ownerId, voice, startedAt + item.releaseMs)
          .catch(error => { run.error ??= error; this.#cancel(run); });
        run.releases.add(release);
        void release.then(() => run.releases.delete(release));
      }
      await Promise.all([...run.releases]);
      if (run.error) throw run.error;
      return run.cancelled ? 'aborted' : 'completed';
    } finally {
      this.#cancel(run);
      const tails = [];
      for (const [ownerId, voice] of run.voices) {
        this.#audio.noteOff(voice, ownerId);
        tails.push(this.#audio.waitForVoice(voice));
      }
      run.voices.clear();
      await Promise.all([...run.releases, ...tails]);
      if (this.#run === run) this.#run = null;
    }
  }
}
