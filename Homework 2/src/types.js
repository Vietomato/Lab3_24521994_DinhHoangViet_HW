/**
 * Contract definitions only. No audio nodes, timers, React components, or
 * transport implementations are created by this module.
 * All MIDI inputs must be integers in [21, 108]; all numeric inputs finite.
 */

/**
 * Immutable generated metadata: 88 notes, A0 through C8 (52 white, 36 black).
 * Freeze metadata during generation; JSDoc readonly alone is not runtime freezing.
 * @typedef {Object} PianoNote
 * @property {number} midi
 * @property {string} noteName Note plus octave, e.g. A0, C#4, C8.
 * @property {boolean} isBlack
 * @property {number} freqHz 440 * 2 ** ((midi - 69) / 12).
 */
/** @typedef {Readonly<PianoNote>} ImmutablePianoNote */
/** @typedef {'idle'|'recording'|'playing'} TransportState */
/** @typedef {0.5|1|2} PlaybackSpeed */
/** @typedef {'completed'|'aborted'} ReplayOutcome */

/**
 * Stable UI callback. The input/audio hook handles async errors inline.
 * Owner IDs identify a held input, e.g. pointer:7 or native:60:Space.
 * Repeated note-on for the same held owner must not create a new activation.
 * @callback NoteOnCallback
 * @param {number} midi
 * @param {string} ownerId
 * @returns {void}
 */
/**
 * Stable UI callback. Resolve the owner's stored generation handle, never
 * release a replacement voice using MIDI pitch alone.
 * @callback NoteOffCallback
 * @param {number} midi
 * @param {string} ownerId
 * @returns {void}
 */
/**
 * Pass primitive metadata and a per-key boolean, not a pressed collection.
 * React.memo uses default shallow comparison; callback identities stay stable.
 * @typedef {Object} PianoKeyProps
 * @property {number} midi
 * @property {string} noteName
 * @property {boolean} isBlack
 * @property {boolean} isPressed Actual allocated/held state, cleared on stealing.
 * @property {NoteOnCallback} onNoteOn
 * @property {NoteOffCallback} onNoteOff
 */

/**
 * Engine-owned mutable lifecycle record; callers treat the handle as opaque.
 * One allocation per distinct MIDI pitch; separate owners may share it.
 * @typedef {Object} VoiceHandle
 * @property {string} id Unique generation ID; never reused after stealing/release.
 * @property {number} midi
 * @property {OscillatorNode} oscillator
 * @property {GainNode} gain
 * @property {number} startOrder Monotonically increasing allocation order.
 * @property {Set<string>} ownerIds Current held owners, maintained by engine.
 * @property {boolean} isReleasing Logical allocation already removed if true.
 * @property {boolean} isReleased Nodes stopped/disconnected if true.
 */
/**
 * Fired when a voice leaves logical active allocation, before its release tail
 * finishes. Input/recorder finalize stolen owners at this notification time.
 * @typedef {Object} VoiceEndEvent
 * @property {VoiceHandle} voice
 * @property {'released'|'stolen'|'disposed'} reason
 * @property {number} endedAtMs Monotonic performance.now() domain.
 */

/**
 * Invoke from a user gesture; lazily create/resume AudioContext. Rejects on
 * failure without alerts. A disposed engine stays disposed; setup creates a new one.
 * @callback InitializeAudio
 * @returns {Promise<void>}
 */
/**
 * Initialize/resume synchronously from the gesture before awaiting readiness.
 * At capacity remove/release oldest Map allocation before allocating a new pitch.
 * Duplicate owner returns its existing handle, with no new allocation/order.
 * A new owner of an active pitch shares its handle; last-owner release ends it.
 * A stolen still-held owner returns null until noteOff and a fresh press.
 * A pending operation must not allocate after disposal or signal cancellation.
 * @callback StartVoice
 * @param {number} midi
 * @param {string} ownerId
 * @param {AbortSignal} [signal] Cancel a pending initialization/allocation.
 * @returns {Promise<VoiceHandle|null>}
 */
/**
 * Remove this owner; only start release when no owners remain. Stale generation
 * handles cannot affect a replacement. Repeated/stale calls do not release audio;
 * they may clear that old owner's stolen-held suppression. The input adapter
 * aborts pending noteOn on early release and releases any already-resolved handle.
 * @callback ReleaseVoice
 * @param {VoiceHandle} voice
 * @param {string} ownerId
 * @returns {void}
 */
/**
 * @callback SetVolume
 * @param {number} level Normalized [0, 1]; invalid values rejected.
 * @returns {void}
 */
/**
 * Logical release of all active voices, including shared owners; keep tails
 * bounded, stop/disconnect them after approximately 40ms. Safe when repeated.
 * @callback StopAllVoices
 * @returns {Promise<void>} Resolves after owned release tails complete.
 */
/**
 * Permanently invalidate pending work, stop voices, disconnect graph, close the
 * owned context, remove callbacks/timers. Safe when called multiple times.
 * @callback DisposeAudio
 * @returns {Promise<void>}
 */
/**
 * @callback SubscribeVoiceEnd
 * @param {function(VoiceEndEvent): void} listener
 * @returns {function(): void} Idempotent unsubscribe.
 */
/**
 * At most 8 logical allocations; release tails are not extra active allocations.
 * @typedef {Object} PianoAudioEngine
 * @property {InitializeAudio} initialize
 * @property {StartVoice} noteOn
 * @property {ReleaseVoice} noteOff
 * @property {SetVolume} setVolume
 * @property {StopAllVoices} stopAll
 * @property {DisposeAudio} dispose
 * @property {SubscribeVoiceEnd} subscribeVoiceEnd
 */

/**
 * Immutable published event. Frequency must agree with the MIDI formula.
 * Pending notes remain internal until finalized; never publish a partial event.
 * @typedef {Object} RecordedNote
 * @property {string} id Unique event ID, independent of voice generation/list index.
 * @property {number} midi
 * @property {number} freqHz
 * @property {number} durationMs Nonnegative note-off minus note-on, not release tail.
 * @property {number} deltaMs Nonnegative gap from previous onset; first from record start.
 */
/** @typedef {ReadonlyArray<Readonly<RecordedNote>>} RecordedSequence */
/**
 * Begins a new recording, rejected if already recording or transport is playing.
 * @callback StartRecording
 * @param {number} nowMs Monotonic recording-start timestamp.
 * @returns {void}
 */
/**
 * Reserve a slot in onset order; return its unique recording ID. Called once per
 * accepted live activation after ownership validation, not for repeats/replay.
 * @callback RecordNoteOn
 * @param {number} midi
 * @param {number} freqHz
 * @param {number} nowMs Monotonic onset timestamp.
 * @returns {string|null} Null outside recording.
 */
/**
 * Finalize that slot in place internally, without reordering published events.
 * Repeated finalization is a no-op; stolen voices use their logical end time.
 * @callback RecordNoteOff
 * @param {string} eventId
 * @param {number} nowMs Monotonic note-off/steal timestamp.
 * @returns {void}
 */
/**
 * Finalize all pending events at nowMs and publish an immutable onset-order
 * snapshot. Transport separately releases held live input at the same stop time.
 * @callback StopRecording
 * @param {number} nowMs
 * @returns {RecordedSequence}
 */
/**
 * @typedef {Object} PianoRecorder
 * @property {StartRecording} start
 * @property {RecordNoteOn} noteOn
 * @property {RecordNoteOff} noteOff
 * @property {StopRecording} stop
 * @property {function(): RecordedSequence} getEvents Published sequence snapshot.
 * @property {function(): void} clear Allowed only when transport is idle.
 */

/**
 * Validate and snapshot events/speed before scheduling. Do not consume events.
 * Empty replay completes immediately. Invalid MIDI/timing/frequency/speed rejects.
 * Use cumulative onset targets; independent handle-safe note-offs preserve overlap.
 * Already-aborted signals allocate nothing and resolve 'aborted'. Abort is an
 * expected outcome, not an unhandled rejection. Other failures reject for inline UI.
 * @callback PlaySequence
 * @param {RecordedSequence} events
 * @param {PlaybackSpeed} speed
 * @param {AbortSignal} signal
 * @returns {Promise<ReplayOutcome>} Settles after final release or abort cleanup.
 */
/**
 * Cancel onset/release work and release only this run's owned handles, using the
 * short release envelope. Idempotent; old run cleanup must not touch a new run.
 * @callback StopReplay
 * @returns {Promise<void>}
 */
/**
 * @typedef {Object} PianoSequencer
 * @property {PlaySequence} play
 * @property {StopReplay} stop
 */
/**
 * One transport owner; recording/playback mutually exclusive. Starting playback
 * first clears live input, then disables live note-on until run cleanup finishes.
 * Use one AbortController and unique run ID per run; no concurrent Play sessions.
 * Speed changes apply to the next run. Unmount cancels pending work and disposes.
 * @typedef {Object} PianoTransport
 * @property {function(): TransportState} getState
 * @property {function(): RecordedSequence} getEvents
 * @property {function(): void} startRecording Capture performance.now() internally.
 * @property {function(): RecordedSequence} stopRecording Finalize/release held live notes.
 * @property {function(PlaybackSpeed): Promise<ReplayOutcome>} play
 * @property {StopReplay} stopSequence
 * @property {function(): void} clearRecording Idle only.
 * @property {function(): Promise<void>} dispose
 */

export {};
