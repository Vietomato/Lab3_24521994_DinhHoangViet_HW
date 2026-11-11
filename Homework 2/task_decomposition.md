# 88-Key Polyphonic Piano — Task Decomposition

## Scope

Create a React 19 piano spanning A0–C8 with eight-voice polyphony, FIFO voice stealing, isolated key rendering, FIFO recording, and abortable variable-speed replay. Use locally synthesized Web Audio sound; no external API or backend is required.

Read project_rules.md before every task. Checkboxes record only verified work; unchecked items remain planned. Paths are relative to `Homework 2/`. Preserve unrelated applications. The proposed 14 commits provide more than the minimum 10 meaningful commits; do not manufacture commits for already completed work.

## Suggested structure

```text
src/
  App.jsx
  music/notes.js
  audio/PolyphonicSynth.js
  components/PianoKeyboard.jsx
  components/PianoKey.jsx
  components/TransportControls.jsx
  hooks/usePianoAudio.js
  hooks/usePianoInput.js
  hooks/useRecorder.js
  hooks/usePlayback.js
  sequencer/recording.js
  sequencer/AudioTaskQueue.js
  styles/piano.css
project_rules.md
task_decomposition.md
PROMPT_LOG.md
AI_FAILURE_AUDIT.md
README.md
```

## Contract and timing decisions

| Item | Required definition |
| --- | --- |
| Notes | MIDI integers 21–108, A0–C8, frequency = 440 * 2 ** ((midi - 69) / 12) |
| Key props | midi, noteName, isBlack, isPressed; stable onNoteOn/onNoteOff |
| Voices | Map insertion order; maximum 8 allocated active voices; unique voice generation handles |
| Recording | Unique id, midi, freqHz, durationMs, deltaMs; monotonic measurements |
| deltaMs | Gap from previous onset; first measured from recording start; FIFO is onset order |
| Overlap | Note-off scheduling independent of subsequent onsets; chords must remain concurrent |
| Replay speed | Supported values 0.5, 1, 2; divide both onset gaps and durations by speed |
| Transport | idle, recording, playing; recording and replay mutually exclusive |
| Live input during replay | Disabled for this version; clear live notes before starting replay |
| Stop | AbortController plus run ID; cancel pending work; release voices with short click-free envelope |
| Render proof | Profile real update renders; distinguish normal single-note activity from FIFO stealing |

## Defined JSDoc contracts and ownership

The contract-only module [src/types.js](src/types.js) defines `PianoNote`,
`PianoKeyProps`, `VoiceHandle`, `RecordedNote`, `PianoAudioEngine`,
`PianoRecorder`, `PianoSequencer`, and `PianoTransport`, with their callbacks.
It contains typedefs and an empty module export only, not feature implementations.

- Generated note metadata is readonly; freeze it when generation is implemented.
- Native-key callbacks take MIDI plus an input owner ID and remain stable for
  React.memo. Input hooks retain the generation handle for each owner.
- One active allocation exists per distinct MIDI pitch, shared by current owners.
  Duplicate held owners do not allocate again. Releasing one owner leaves other
  owners sounding. FIFO stealing removes all owners of the oldest allocation;
  stolen held owners stay silent until released/repressed.
- Audio note-on returns a generation-specific handle asynchronously and accepts
  an optional AbortSignal for pending initialization. Early input release cancels
  pending work; stale note-off cannot release a replacement generation.
- Voice-end notifications finalize stolen recording events at logical removal,
  not at the later end of the approximately 40ms audio release tail.
- Recorder note-on reserves an onset-order slot and recording ID; note-off
  finalizes that slot. Published events are complete immutable snapshots.
- Transport owns `idle`, `recording`, and `playing`; a run owns its controller,
  run ID, timers, abort listeners, and voice handles. Stop cleans up only that
  run, with idempotent methods and handled abort outcomes.

## Recording and replay timing

All measured times use the same monotonic `performance.now()` domain.
For onset `t[i]`, recording start `r`, and note-off `u[i]`:

```text
deltaMs[0] = t[0] - r
deltaMs[i] = t[i] - t[i - 1]  (i > 0)
durationMs[i] = u[i] - t[i]
```

Do not replace onset gaps with silence-after-release gaps. Keep FIFO onset order
even if later notes finish first. Equal onsets have zero gap and preserve their
insertion order. Stop Recording finalizes held events at the stop timestamp,
releases live owners, and then publishes the sequence. Reject invalid MIDI,
inconsistent/nonfinite frequency, nonfinite/negative times, and unsupported speed.

Snapshot the saved sequence and selected speed `s` before starting replay.
With replay start `p`, compute each target from cumulative original gaps:

```text
onsetTarget[i] = p + sum(deltaMs[0..i]) / s
releaseTarget[i] = onsetTarget[i] + durationMs[i] / s
```

Schedule releases independently; never await one duration before scheduling the
next onset. Generation-specific handles prevent an old release from stopping a
retriggered pitch. Targets use the shared start clock to avoid chained-delay
drift. Both onsets and durations scale at 0.5x/1x/2x. Speed changes affect the next
run. More than eight simultaneous distinct pitches still obey FIFO voice stealing.

Worked example (milliseconds relative to record/replay start):

| Event | MIDI | Onset | Note-off | deltaMs | durationMs | 2x onset / note-off |
| --- | --- | --- | --- | --- | --- | --- |
| A | 60 | 100 | 400 | 100 | 300 | 50 / 200 |
| B | 64 | 150 | 200 | 50 | 50 | 75 / 100 |
| C | 67 | 150 | 350 | 0 | 200 | 75 / 175 |

Saved order is A, B, C; release order is B, C, A. At 0.5x, the respective onset /
note-off pairs are 200/800, 300/400, and 300/700. B and C remain concurrent
with A at every supported speed. Replay completes only after all logical
note-offs and owned release tails finish. An already-aborted signal allocates
nothing; stop cancels onset waits and release schedules, releases run-owned voices,
and resolves an expected aborted outcome without an unhandled rejection.
No old run may reset transport state or stop a newer run. Empty replay completes
without allocation; conflicts between recording and playback are rejected.

## Task 01 — Repository rules and hygiene

- [ ] Implement and verify this task.

**Scope:** Inspect existing instructions, configuration, package manager, and Git state. Adopt project_rules.md, maintain .gitignore, and start an honest PROMPT_LOG.md.

**Expected files:** project_rules.md, .gitignore, PROMPT_LOG.md. Include the actual prompt-log update.

**Acceptance:** Rules cover the piano requirements; unrelated work and secrets remain untouched.

**Verification:** Review ignore rules and staged diff.

**Suggested commit:** `docs: define polyphonic piano project rules`

## Task 02 — Task plan and contracts

- [x] Define and review the contract-only module and timing documentation (2026-11-12).

**Scope:** Adopt this plan. Define JSDoc for PianoNote, PianoKeyProps, VoiceHandle, RecordedNote, and transport/replay. Explicitly document deltaMs, durationMs, FIFO ordering, speed scaling, and generation-safe release.

**Expected files:** task_decomposition.md, contract definitions. Include the actual prompt-log update.

**Acceptance:** Contracts are defined before feature code and agree with project_rules.md.

**Verification:** Review note range, voice policy, recording semantics, and stop behavior.

Evidence: `src/types.js` syntax/contract-content checks and worked-example timing
assertions passed. No audio/recorder/replay behavior exists or was tested yet.

**Suggested commit:** `docs: define piano tasks and timing contracts`

## Task 03 — Application shell

- [x] Implement and verify this task (2026-11-12, restored after the earlier revert).

**Scope:** Reuse or prepare React 19 and Vite. Add semantic page regions and folders for components, audio, hooks, music data, and sequencing.

**Expected files:** App.jsx, entry point, base CSS, package files if needed. Include the actual prompt-log update.

**Acceptance:** Development server and production build work without an unnecessary nested application.

**Verification:** Run build and open the actual development page.

Evidence: reused the prior piano shell and npm lockfile directly in `Homework 2`.
React/React DOM 19.3.1 and Vite 8.3.8 verified. Production build and actual Edge
checks passed: header/main, 375px layout, visible skip-link focus, main navigation,
and no console/page/HTTP errors. Existing contracts remain unchanged. No piano
features implemented yet; the existing dev server is available on port 5175.

**Suggested commit:** `chore: set up polyphonic piano application`

## Task 04 — Algorithmic note generation

- [x] Implement and verify this task (2026-11-12).

**Scope:** Generate MIDI 21–108 metadata, correct note/octave names, black-key classification, and equal-temperament frequencies. Keep metadata stable outside component rendering.

**Expected files:** src/music/notes.js, focused generation tests. Include the actual prompt-log update.

**Acceptance:** 88 unique notes: 52 white and 36 black; endpoints A0/C8; MIDI 69 equals 440 Hz.

**Verification:** Test counts, bounds, uniqueness, naming, black-key pattern, and representative frequencies.

Evidence: `npm.cmd test` passed five focused tests covering 88 unique consecutive
notes, 52 white/36 black keys, A0/C8 endpoints and octave boundaries, accidental
pitch classes, representative frequencies including A4=440Hz, octave ratios,
deterministic generation, and frozen metadata. Production build passed. The
metadata is exported once at module scope; keyboard rendering is a later task.

**Suggested commit:** `feat: generate all 88 piano notes algorithmically`

## Task 05 — Accessible keyboard layout

- [x] Implement and verify the silent keyboard layout (2026-11-12).

**Scope:** Render notes from metadata with correct white/black placement and MIDI keys. Build native-button PianoKey and a contained horizontal piano viewport. Add labels, focus, pressed indicators, and keyboard navigation.

**Expected files:** PianoKeyboard.jsx, PianoKey.jsx, piano CSS. Include the actual prompt-log update.

**Acceptance:** All 88 notes reachable; controls fit 375px; scrolling remains inside the piano container.

**Verification:** Build, visual endpoint checks, narrow viewport, Tab/arrows where implemented, and focus visibility.

Evidence: five metadata tests and production build passed. Actual Edge checks
verified 88 native buttons, 52/36 white/black split, black-key boundary alignment,
Tab access and automatic scroll visibility for every MIDI 21–108, reverse Tab,
controlled pressed props, visible focus, and no document overflow at 375/1280px.
Inspected a 375px screenshot. Navigation is documented on the page. Audio/input
ownership and transport controls are not connected yet; their tests remain for
later tasks. PianoKey uses memo, but update-render profiling is still NOT VERIFIED.

**Suggested commit:** `feat: build accessible 88-key piano layout`

## Task 06 — Single-voice audio foundation

- [x] Implement and verify the single-voice foundation (2026-11-12).

**Scope:** Create the user-gesture AudioContext lifecycle, oscillator/gain chain, master gain, error handling, and ADSR envelope. Implement safe stop/disconnect and idempotent dispose.

**Expected files:** src/audio/PolyphonicSynth.js, audio lifecycle hook. Include the actual prompt-log update.

**Acceptance:** One voice can start/release cleanly; positive gain floor; no unusable engine after StrictMode cleanup/setup.

**Verification:** Build, focused lifecycle tests, real-browser sound and release check when available.

Evidence: `PolyphonicSynth` implements lazy gesture initialization/resume, a
triangle oscillator with ADSR, positive exponential-ramp floor, a 40ms release,
master headroom, node cleanup and idempotent disposal. `usePianoAudio` creates
fresh instances per effect setup; Audio setup exposes initialization/retry with
polite inline errors. All 11 tests passed (five metadata, six audio foundation).
Real Edge verified an actual 440Hz oscillator/nonzero waveform, release cleanup,
StrictMode unmount/remount, inline failures/retry, and repeated disposal. Build
passed. Manual listening/release-click quality remains NOT VERIFIED. Keys remain
silent; eight-voice FIFO allocation and full live input are still later tasks.

**Suggested commit:** `feat: implement piano synthesis and ADSR envelope`

## Task 07 — Eight-voice FIFO pool

- [x] Implement and verify this task (2026-11-12).

**Scope:** Add Map-based active allocation and generation-specific voice handles. At capacity release the oldest before starting the ninth distinct note. Handle duplicates, stale note-off, stolen held notes, and bounded release tails.

**Expected files:** PolyphonicSynth.js, voice-pool tests. Include the actual prompt-log update.

**Acceptance:** At most eight allocated active voices; deterministic oldest-first stealing; stale release cannot stop a replacement.

**Verification:** Test eight notes, ninth/tenth stealing, duplicate note-on, retriggered pitch, delayed release, and disposal.

Evidence: active allocations now use Map insertion order, capped at eight distinct
pitches, with separate resources for release tails and owner tracking for stolen
held inputs. Generation-safe handles, FIFO snapshots, and subscribeVoiceEnd
notifications are implemented. All 16 tests passed, including ninth/tenth stealing,
concurrent duplicates, shared owners, retrigger/stale release, late ended callbacks,
notifications, unsubscribe, reentrant disposal and full cleanup. Real Edge verified
eight simultaneous native voices/nonzero signal, ninth stealing, replacement
ownership and disposal without browser errors. Production build passed. Live-key
integration and audible quality remain for subsequent/manual checks.

**Suggested commit:** `feat: add eight-voice FIFO voice stealing`

## Task 08 — Live note input and state ownership

- [ ] Implement and verify this task.

**Scope:** Connect pointer and keyboard note-on/off to the engine. Track owners, capture/release/cancel, blur/hidden state, and stolen-note UI updates. Prevent synthetic-click duplicate activation.

**Expected files:** PianoKeyboard.jsx, PianoKey.jsx, input/audio hooks. Include the actual prompt-log update.

**Acceptance:** Sustained notes and chords work; release/cancel does not stick; each intended note starts once.

**Verification:** Pointer drag/release, cancellation, Enter/Space hold/release, blur, tab switching, multi-input, and real touch if available.

**Suggested commit:** `feat: connect live piano input and release handling`

## Task 09 — Memoized key isolation

- [ ] Implement and verify this task.

**Scope:** Wrap PianoKey in React.memo; stabilize callbacks and primitive props. Remove unnecessary object/collection props or changing inline handlers at the parent boundary.

**Expected files:** PianoKey.jsx, PianoKeyboard.jsx, pressed-state integration. Include the actual prompt-log update.

**Acceptance:** An ordinary single-note update affects that key only; other key component bodies do not rerender.

**Verification:** Record actual React DevTools Profiler update evidence after initial mount. Report unavailable profiling as NOT VERIFIED; separately inspect stealing transitions.

**Suggested commit:** `perf: isolate piano key updates with React memo`

## Task 10 — FIFO recording

- [ ] Implement and verify this task.

**Scope:** Add idle/recording transport and Record/Stop Recording/Clear controls. Use monotonic timestamps, preserve onset order, and finalize held or stolen notes correctly. Publish immutable RecordedNote events.

**Expected files:** src/sequencer/recording.js, recording hook, transport controls. Include the actual prompt-log update.

**Acceptance:** Events have finite nonnegative deltaMs/durationMs; overlaps and release order do not corrupt onset order; saved data is reusable.

**Verification:** Test simultaneous notes, out-of-order releases, stolen voices, stop with held notes, clear, and empty recording.

**Suggested commit:** `feat: record polyphonic notes into a FIFO sequence`

## Task 11 — Concurrent variable-speed replay

- [ ] Implement and verify this task.

**Scope:** Implement FIFO onset scheduling from cumulative target times. Schedule note-off independently with voice handles. Add 0.5x/1x/2x controls and transport ownership; disable live playing/recording during replay.

**Expected files:** src/sequencer/AudioTaskQueue.js, playback hook, transport controls. Include the actual prompt-log update.

**Acceptance:** Chords overlap; onset gaps and durations scale by speed; saved events are not consumed; completion waits for the final release.

**Verification:** Use fake timers/clock to test event ordering, overlapping durations, all speeds, empty/invalid input, and natural completion. Verify audible replay separately.

**Suggested commit:** `feat: replay recorded chords at variable speeds`

## Task 12 — Abort and replay race protection

- [ ] Implement and verify this task.

**Scope:** Add one AbortController and run ID per replay; cancel all waits and note-off work. Stop/unmount releases owned voices, removes listeners, and suppresses further note-ons. Prevent old cleanup affecting newer runs.

**Expected files:** AudioTaskQueue.js, playback hook, abort-focused tests. Include the actual prompt-log update.

**Acceptance:** Stop works during a gap or chord; repeated Stop is safe; rapid Stop/Play never creates overlapping runs or unhandled abort rejection.

**Verification:** Test already-aborted signal, abort during wait, abort during chord, unmount, rapid restart, and zero pending work after cleanup.

**Suggested commit:** `fix: make piano replay cancellation race safe`

## Task 13 — Integration, accessibility, and responsive fixes

- [ ] Implement and verify this task.

**Scope:** Review controls/labels, focus, contrast, transport feedback, reduced motion, signal levels, error handling, cleanup, and 375px layout. Fix observed integration defects.

**Expected files:** Relevant components/styles and integration checks. Include the actual prompt-log update.

**Acceptance:** No document-level overflow; all notes reachable; transport and live input policy consistent; no introduced console/build errors.

**Verification:** Run build/lint/tests, actual browser interaction, audible eight-note chords and stop behavior, and Lighthouse if available. Do not infer WCAG compliance from its score.

**Suggested commit:** `fix: resolve piano integration and accessibility issues`

## Task 14 — Documentation and verified audit

- [ ] Implement and verify this task.

**Scope:** Complete README.md, truthful PROMPT_LOG.md, and AI_FAILURE_AUDIT.md. Explain architecture, formula, Map FIFO, ADSR, memo props, recording/replay timing, cancellation, controls, and limitations. Update this plan from actual evidence.

**Expected files:** README.md, PROMPT_LOG.md, AI_FAILURE_AUDIT.md, task_decomposition.md. Include the actual prompt-log update.

**Acceptance:** Reproducible setup; actual results separated from pending manual checks; at least 10 genuine commits; defects and hashes never fabricated.

**Verification:** Review documentation against code, run final required checks, and inspect git log. Record a shortfall if fewer than three actual defects were found.

**Suggested commit:** `docs: complete piano verification and failure audit`

## Git procedure

The user reviews and commits each task unless explicitly delegating commits. Run these commands after verification, replacing placeholders with actual paths and the task message:

```bash
git status
git diff
git add <task-files>
git diff --cached
git commit -m "<task-message>"
git log --oneline -20
```

Do not stage unrelated work, dependencies, build output, or secrets. Do not create empty commits, rewrite history, or push without authorization. If initial documents were committed together, count that commit once; split later substantial work naturally when needed. If Task 13 finds no defect, do not invent a fix: use a truthful verification-documentation commit message when there is a real documentation change.

## Verification evidence

For each check, record PASS, FAIL, or NOT VERIFIED, with the command or reproduction procedure and actual result. Distinguish audio-mock assertions from heard playback and real-browser behavior. Minimum focused scenarios:

- MIDI range/count/color distribution/frequencies.
- Eight voices and deterministic ninth-note stealing.
- Stale delayed release after same-pitch retrigger.
- Chords recorded with reverse note-off order.
- Both onset and duration scaling at each speed.
- Stop during a silent gap and during sustained overlap.
- Rapid Stop/Play and unmount with pending work.
- StrictMode lifecycle and cleanup.
- Single-key React.memo update and expected stolen-key update.
- Keyboard access, touch when available, and 375px contained scrolling.

## Prompt-log template

- Task and date:
- Exact prompt actually received:
- Files changed:
- Checks run and real results:
- Remaining manual checks:
- Actual commit hash after commit:

## Failure-audit template

- Observed defect and expected behavior:
- Exact reproduction steps:
- Root cause and affected files:
- Fix:
- Actual verification evidence:
- Commit reference:

Document at least three actual verified defects if found. State any shortfall; never invent defects or evidence to fill the audit.
