# 88-Key Polyphonic Piano — Project Rules

## 1. Goal and stack

Build an 88-key piano with eight-voice polyphony, FIFO voice stealing, recording, and abortable asynchronous replay using React 19, Vite, and modern JavaScript. Use function components and Hooks; document contracts with JSDoc. Reuse existing project configuration and package manager. Keep the implementation understandable to a student.

Read this file and task_decomposition.md before each task. Implement one small task at a time. Preserve unrelated applications and working-tree changes.

The piano application belongs in `Homework 2/`; these root instruction documents
and `PROMPT_LOG.md` remain the piano's references. `Homework 1/` is the separate
drum studio. Determine the piano package manager from its own lockfile when one
exists; do not treat a sibling application's lockfile as piano configuration.

## 2. Required behavior

- Generate MIDI notes 21 through 108 inclusively: A0 through C8, exactly 88 keys, 52 white and 36 black. Never hardcode 88 JSX elements.
- Calculate frequency with `440 * 2 ** ((midi - 69) / 12)`; A4 (MIDI 69) is 440 Hz.
- Use the browser's built-in Web Audio API. No external API keys, paid services, audio downloads, or backend are required.
- Support eight allocated active voices. Starting a ninth distinct note steals the oldest active voice in FIFO order.
- Record note timing into a FIFO sequence and replay at 0.5x, 1x, or 2x.
- Stop Sequence cancels pending waits/schedules and releases replay voices immediately, using a short click-free release ramp.
- Isolate key rendering with React.memo and stable props. Pressing one otherwise inactive note must not render all 88 key components.

## 3. Domain and timing contracts

Define JSDoc before implementation:
- PianoNote: midi, noteName, isBlack, freqHz; immutable generated metadata.
- PianoKeyProps: midi, noteName, isBlack, isPressed, stable onNoteOn/onNoteOff callbacks.
- VoiceHandle: unique generation/voice ID, midi, oscillator, gain, start order, and release status.
- RecordedNote: unique id plus midi, freqHz, durationMs, deltaMs.
- Sequencer: play(events, speed, signal), stop(), documented run ownership and cleanup.

Recording convention: deltaMs is the onset gap from the preceding note onset, with the first event measured from recording start. Measure durations from note-on to note-off with performance.now(). Store events in onset order, not release order. Simultaneous onsets may have zero delta. Preserve overlapping durations during replay; do not serialize chords by awaiting each note's full duration. Scale both onset gaps and durations by dividing by playback speed.

Use explicit transport states such as idle, recording, and playing. Disallow conflicting recording/playback sessions in this version. Disable live note input during playback and clear live held notes when playback begins. This keeps voice ownership simple; document the choice in the UI. Changing speed affects the next replay, not a running sequence.

## 4. React and performance

- No class-based React components, ReactDOM.render, component defaultProps, KeyboardEvent.keyCode, or window.alert. A plain non-React audio-engine class is allowed.
- Keep audio nodes, controller instances, ownership tracking, and mutable engine structures outside render-time construction, using refs or dedicated engine instances.
- Update React state immutably. Derive display values during rendering instead of synchronizing redundant state with useEffect.
- Memoize PianoKey with React.memo and keep callback identities stable. Pass each key its own boolean isPressed, not the entire pressed collection or a new object/function on every parent render.
- Prefer default shallow prop comparison; do not hide stale callbacks with an unsafe custom comparator.
- Use stable MIDI keys for piano components and unique IDs for recorded events.
- Verify actual update renders in React DevTools Profiler after mounting. Account for StrictMode development behavior. When a note is stolen, the new key and the stolen key may both legitimately change; distinguish this from a normal single-note press.

## 5. Audio engine and FIFO ownership

- Create or resume AudioContext after user interaction; handle suspended contexts and failures with inline errors.
- Track allocated active voices with Map insertion order. On a new distinct note at capacity, remove/release the oldest before allocating the replacement. Ignore duplicate note-on from the same owner.
- Return or retain generation-specific handles so a delayed old note-off cannot stop a newer voice for the same MIDI pitch.
- Keep logical active allocation and releasing audio tails separate. A short release tail may overlap the new oscillator; do not misreport this as a ninth allocated active voice.
- Use a master GainNode and conservative per-voice gains to reduce clipping. Eight voices alone do not guarantee clipping prevention.
- Implement attack, decay, sustain, and release. Exponential gain ramps must use a positive floor such as 0.0001, never zero. A release around 40 ms is a reasonable default.
- Stop and disconnect completed nodes; bound release-tail lifetime. Make stop/dispose idempotent and robust under StrictMode setup/cleanup/remount.
- Synchronize visible pressed state when voices end or are stolen. Define how still-held stolen input behaves: it stays silent until released and pressed again.

## 6. Input and recording

- Use native buttons with readable note names and aria-pressed.
- Handle pointer down/up, pointercancel, lost capture, blur, and hidden tabs without stuck voices. Track input ownership for multiple pointers or simultaneous input sources.
- Preserve Tab and native keyboard operation. Define keydown/keyup behavior for sustained Enter/Space and prevent a following synthetic click from duplicating sound. If letter shortcuts are added, use event.code, ignore repeats and editable targets, and provide an explicit mapping; mapping all 88 notes to letters is not required.
- Record intended live note-on/note-off events once each, including an appropriate end time when a voice is stolen. On Stop Recording, finalize still-held events before publishing the immutable sequence and release held notes.
- Reject or safely handle invalid MIDI values, nonfinite timing, negative gaps/durations, invalid speeds, and empty replay. Do not destructively consume the saved sequence during playback.

## 7. Abortable concurrent FIFO replay

- Snapshot the saved events and speed before each replay. Use one AbortController per run and a unique run ID.
- Process onsets in FIFO order against cumulative target times derived from performance.now() or the audio clock; avoid accumulating drift from chained relative delays.
- Schedule note-off independently so overlapping notes and chords remain polyphonic. Protect releases with generation-specific voice handles.
- Every wait must respond to an already-aborted signal and remove its timer/listener on settle. Check cancellation before allocating a voice.
- Stop/unmount cancels onset waits and pending release work, silences owned voices with the short release envelope, and prevents subsequent notes.
- Abort is an expected outcome, not an unhandled rejection. Clear all resources in finally without letting an old run reset or silence a new run.
- Return to idle only after the last note is released or cancellation finishes. Repeated Play/Stop actions must not create concurrent replay runs.

## 8. Accessibility and responsive layout

- Use semantic sections, headings, native controls, and labels associated through useId.
- Provide visible focus, adequate contrast, and non-color pressed indicators. Avoid rapidly announcing every note through live regions; announce transport status/errors politely.
- Make all notes reachable with a documented keyboard-navigation approach. If using roving tabindex, implement arrow keys and Home/End consistently.
- Keep document-level horizontal overflow absent at 375px. The full piano may scroll horizontally inside a clearly labeled, keyboard-accessible container; all 88 keys must remain reachable and controls must reflow.
- Respect prefers-reduced-motion. Target WCAG 2.2 AA and Lighthouse Accessibility 100; automated scores alone do not prove compliance.

## 9. Verification and records

Run production build after implementation changes, plus existing lint and relevant tests. Prioritize behavioral tests for key generation, FIFO stealing, stale releases, overlapping replay, timing speed, cancellation, and cleanup. Mock audio APIs only as needed; passing mocks does not prove sound quality.

Manually verify audible chords, release clicks, fast repeats, cancellation, touch interaction, focus, 375px layout, and Profiler renders when tools are available. Report PASS, FAIL, or NOT VERIFIED with actual evidence. Do not fabricate results, screenshots, defects, or measured latency.

Maintain PROMPT_LOG.md with actual prompts and work. Maintain AI_FAILURE_AUDIT.md with actual defects, reproduction, cause, fix, and verification; target at least three verified defects without inventing any. README.md must explain timing semantics, eight-voice policy, controls, run commands, manual checks, and limitations.

## 10. Git workflow

Create at least 10 meaningful atomic commits; task_decomposition.md proposes 14. Review git status, git diff, and git diff --cached. Stage only relevant files. Exclude node_modules, dist, local environment secrets, and temporary outputs.

The user reviews and commits each task unless explicitly delegating commits. Do not push or rewrite history without authorization. Never create empty commits or fictional history to satisfy a quota. Record actual commit hashes only after commits exist.
