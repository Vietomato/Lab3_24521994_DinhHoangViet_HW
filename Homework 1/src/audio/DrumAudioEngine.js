const SOUND_KINDS = new Set(['kick', 'snare', 'closedHat', 'openHat', 'tom', 'clap', 'rim']);
// Headroom for the seven configured voices; volume is still normalized [0, 1].
const MASTER_HEADROOM = 0.18;

/** Local synthesis engine. Construct freely; call trigger from a user gesture. */
export class DrumAudioEngine {
  #context = null;
  #master = null;
  #analyser = null;
  #voices = new Set();
  #volume = 0.7;
  #disposed = false;
  #disposePromise = null;
  #resumePromise = null;

  /**
   * Call from a click, tap, or key handler. Resolves once a voice is scheduled.
   * Rejects on invalid input, initialization failure, or use after disposal.
   * @param {import('../types.js').SoundConfig} sound
   * @returns {Promise<void>}
   */
  async trigger(sound) {
    this.#assertUsable();
    validateSound(sound);
    try {
      await this.#ready();
      this.#assertUsable();
      if (this.#context.state !== 'running') throw new Error('Audio context is not running.');
      this.#synthesize(sound);
    } catch (cause) {
      throw new Error('Unable to play this sound. Try again using a drum pad.', { cause });
    }
  }

  /** @param {number} normalizedLevel Finite number in [0, 1]. */
  setVolume(normalizedLevel) {
    this.#assertUsable();
    if (!Number.isFinite(normalizedLevel) || normalizedLevel < 0 || normalizedLevel > 1) {
      throw new RangeError('Volume must be a finite number between 0 and 1.');
    }
    this.#volume = normalizedLevel;
    if (this.#master) {
      this.#master.gain.setTargetAtTime(normalizedLevel * MASTER_HEADROOM, this.#context.currentTime, 0.01);
    }
  }

  /** @returns {AnalyserNode|null} Null before first interaction or after disposal. */
  getAnalyser() { return this.#analyser; }

  /**
   * Permanently disposes this instance. Repeated calls return the same promise.
   * React effect setup must create a fresh engine after cleanup.
   * @returns {Promise<void>}
   */
  dispose() {
    if (this.#disposePromise) return this.#disposePromise;
    this.#disposed = true;
    for (const voice of this.#voices) voice.release(true);
    this.#master?.disconnect();
    this.#analyser?.disconnect();
    const context = this.#context;
    this.#context = this.#master = this.#analyser = null;
    this.#disposePromise = context && context.state !== 'closed'
      ? context.close()
      : Promise.resolve();
    return this.#disposePromise;
  }

  #assertUsable() {
    if (this.#disposed) throw new Error('Audio engine has been disposed. Create a new instance.');
  }

  async #ready() {
    if (!this.#context || this.#context.state !== 'running') {
      if (globalThis.navigator?.userActivation && !navigator.userActivation.isActive) {
        throw new Error('Start audio from a click, tap, or keyboard interaction.');
      }
    }
    if (!this.#context) {
      if (!globalThis.AudioContext) throw new Error('Web Audio is unavailable in this browser.');
      const context = new AudioContext();
      let master;
      let analyser;
      try {
        master = context.createGain();
        analyser = context.createAnalyser();
        master.gain.value = this.#volume * MASTER_HEADROOM;
        analyser.fftSize = 256;
        master.connect(analyser);
        analyser.connect(context.destination);
        this.#context = context;
        this.#master = master;
        this.#analyser = analyser;
      } catch (error) {
        master?.disconnect();
        analyser?.disconnect();
        await context.close();
        throw error;
      }
    }
    const context = this.#context;
    if (context.state !== 'running') {
      // Invoke resume synchronously within the gesture, sharing concurrent resumes.
      if (!this.#resumePromise) {
        this.#resumePromise = context.resume().finally(() => { this.#resumePromise = null; });
      }
      await this.#resumePromise;
    }
    this.#assertUsable();
  }

  /** @param {import('../types.js').SoundConfig} sound */
  #synthesize(sound) {
    const context = this.#context;
    const time = context.currentTime;
    const duration = sound.durationSeconds;
    const frequency = Math.min(sound.frequencyHz, context.sampleRate * 0.45);
    const created = [];
    const add = (noise, type, level, start, length, pitch, endPitch) => {
      const nodes = [];
      let source;
      let released = false;
      const voice = {
        release: (stop = false) => {
          if (released) return;
          released = true;
          if (source) {
            source.onended = null;
            if (stop) {
              try { source.stop(); } catch (error) {
                // A source that failed before start() cannot be stopped.
                if (error.name !== 'InvalidStateError') throw error;
              }
            }
            if (noise) source.buffer = null;
          }
          for (const node of nodes) node.disconnect();
          this.#voices.delete(voice);
        },
      };
      created.push(voice);
      this.#voices.add(voice);
      try {
        source = noise ? context.createBufferSource() : context.createOscillator();
        nodes.push(source);
        if (noise) {
          const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * length), context.sampleRate);
          const samples = buffer.getChannelData(0);
          for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
          source.buffer = buffer;
        } else {
          source.type = type;
          source.frequency.setValueAtTime(pitch, start);
          if (endPitch) source.frequency.exponentialRampToValueAtTime(endPitch, start + length);
        }
        const gain = context.createGain();
        nodes.push(gain);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(level, start + Math.min(0.002, length / 4));
        if (level > 0) gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
        gain.gain.setValueAtTime(0, start + length + 0.002);
        if (noise) {
          const filter = context.createBiquadFilter();
          nodes.push(filter);
          filter.type = type;
          filter.frequency.value = frequency;
          filter.Q.value = 0.7;
          source.connect(filter);
          filter.connect(gain);
        } else source.connect(gain);
        gain.connect(this.#master);
        source.onended = () => voice.release();
        source.start(start);
        source.stop(start + length + 0.003);
      } catch (error) {
        voice.release(true);
        throw error;
      }
    };
    try {
      switch (sound.kind) {
        case 'kick':
          add(false, 'sine', sound.gain, time, duration, frequency, 35);
          break;
        case 'snare':
          add(true, 'highpass', sound.gain * 0.65, time, duration);
          add(false, 'triangle', sound.gain * 0.35, time, duration * 0.6, frequency, 90);
          break;
        case 'closedHat':
        case 'openHat':
          add(true, 'highpass', sound.gain, time, duration);
          break;
        case 'tom':
          add(false, 'sine', sound.gain, time, duration, frequency, frequency * 0.45);
          break;
        case 'clap':
          for (let pulse = 0; pulse < 3; pulse++) {
            add(true, 'bandpass', sound.gain / 3, time + pulse * 0.012, duration);
          }
          break;
        case 'rim':
          add(false, 'square', sound.gain * 0.6, time, duration, frequency);
          add(false, 'triangle', sound.gain * 0.4, time, duration * 0.6, frequency * 1.47);
          break;
      }
    } catch (error) {
      for (const voice of created) voice.release(true);
      throw error;
    }
  }
}

/** @param {import('../types.js').SoundConfig} sound */
function validateSound(sound) {
  if (!sound || !SOUND_KINDS.has(sound.kind)) throw new TypeError('Unsupported drum sound.');
  if (!Number.isFinite(sound.durationSeconds) || sound.durationSeconds <= 0 || sound.durationSeconds > 5
    || !Number.isFinite(sound.frequencyHz) || sound.frequencyHz <= 0
    || !Number.isFinite(sound.gain) || sound.gain < 0 || sound.gain > 1) {
    throw new RangeError('Invalid sound parameters: duration (0, 5], positive frequency, gain [0, 1].');
  }
}
