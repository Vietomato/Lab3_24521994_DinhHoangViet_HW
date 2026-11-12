# 88-Key Polyphonic Piano — Prompt Log

## 2026-11-12 — Project instructions and initial inspection

### Exact prompt received

```text
We are building an 88-Key Polyphonic Piano.\
First, read project_rules.md, task_decomposition.md,  before making changes.For every task:\
- Inspect existing code and preserve unrelated changes.\
- Implement only the requested scope.\
- Keep the code readable and easy for a student to explain.\
- Run relevant checks and report actual results.\
- Update PROMPT_LOG.md with the exact prompt received, changes made, and verification results.\
- Never fabricate tests, bugs, screenshots, profiling results, or completed actions.\
- Do not commit automatically. I will review and commit each step.\
- Do not push or rewrite Git history.

Update prompt and your recommend, your results in PROMPT_LOG.md
```

### Inspection and results

- PASS: read root project_rules.md and task_decomposition.md in full before editing.
- PASS: inspected repository root, Homework 2 contents, and git status --short. Homework 2 is empty; no piano application code or package configuration exists there. Root project_rules.md, task_decomposition.md, and PROMPT_LOG.md are untracked.
- Changed only this root PROMPT_LOG.md. Preserved Homework 1 and both piano instruction documents.
- No application implementation, dependency installation, build, browser tests, screenshots, profiling, commits, pushes, or history changes performed in this task.
- Build/audio/performance/accessibility results: NOT VERIFIED for the piano; no implementation exists yet. Drum studio results are unrelated and are not evidence for the piano.

### Recommendations

- Follow the existing plan in small steps: begin Task 01 (piano repository hygiene), then Task 02 (JSDoc and timing contracts), before setting up the application shell.
- Keep piano application files in Homework 2 and preserve the drum studio in Homework 1. Keep these root instruction files and this root log as the current piano references unless the user requests relocation.
- Before feature implementation, make onset-order recording, eight-voice FIFO allocation, generation-safe release, and abort/run ownership explicit in contracts.
- Verify each implemented step with focused checks; record audible playback, Profiler evidence, screen-reader behavior, and physical-device checks only when actually observed.
- Leave all planned implementation tasks unchecked for now. The user reviews and commits; do not push or rewrite history.

### Assistant response

I’ve read both instruction files and recorded your prompt, recommendations, and inspection results in `PROMPT_LOG.md`.

`Homework 2` is empty. I recommend starting with repository hygiene, then defining the JSDoc and timing contracts before application setup. No application code or Git history was changed.

## 2026-11-12 — Piano repository inspection and hygiene

### Exact prompt received

```text
Inspect the repository, package manager, existing source files, and Git status.\
\
Review project_rules.md for the 88-Key Polyphonic Piano. Ensure it covers:\
- React 19 function components and Hooks.\
- Algorithmic generation of 88 notes.\
- Eight-voice polyphony and FIFO voice stealing.\
- React.memo render isolation.\
- FIFO recording and concurrent replay.\
- AbortController cancellation and resource cleanup.\
- Accessibility and responsive layout.\
- Honest verification and atomic commits.\
\
Ensure .gitignore excludes node_modules, dist, secrets, and temporary output.\
\
Do not implement application features yet.\
Report any inconsistencies and update PROMPT_LOG.md.
```

### Inspection and findings

- Read root project_rules.md and task_decomposition.md before edits. Inspected repository files, tracked paths, Git status, existing drum-studio package.json/package-lock.json, and its scoped .gitignore.
- PASS: rules already require React 19 functions/Hooks; algorithmic MIDI 21–108 generation (88 keys, 52 white/36 black); eight allocated voices with Map FIFO stealing; React.memo/stable props and honest profiling; onset-order recording/concurrent variable-speed replay; AbortController/run ownership and cleanup; accessibility/375px contained piano scrolling; honest checks and meaningful atomic commits.
- No conflicting feature requirements found. Release tails are explicitly distinguished from allocated active voices, and pending manual verification is not treated as completed work.
- Inconsistency/gap: no root .gitignore existed. Homework 1/.gitignore does not protect Homework 2 or root files. Added repository-wide coverage.
- Scope ambiguity: suggested source paths did not explicitly locate the new piano. Clarified project_rules.md: app in Homework 2, root piano instructions/log remain references, Homework 1 stays the separate drum studio, and package-manager selection uses the piano's own lockfile.
- Homework 2 is empty: no piano source, package.json, lockfile, or runnable scripts. The only existing app/lockfile belongs to Homework 1 and uses npm; it is not reused as piano configuration. Available tools: Node v24.18.0, npm 11.16.0 via npm.cmd. No piano package manager was installed or initialized.
- At inspection, root PROMPT_LOG.md, project_rules.md, and task_decomposition.md were untracked; no tracked application changes were present. Nothing staged.

### Changes made

- Created root .gitignore for nested dependencies/builds, caches, test/coverage output, local environments, local credential/private-key patterns, logs, editor temporary state, and OS metadata.
- Preserved source files, package/lockfiles, test source, shared editor settings, sanitized environment templates, and the root prompt log in ignore-rule checks.
- Clarified application/document locations and lockfile ownership in project_rules.md.
- Appended this entry. Did not edit Homework 1, implement piano features, or change task-decomposition completion statuses.

### Verification results

- Initial ignore-rule assertions found that the root-only .aws/credentials pattern did not cover nested Homework 2 credentials. Corrected this and nested editor-specific patterns to use **/ prefixes.
- PASS: git check-ignore --no-index assertions for 24 ignored paths and 14 visible paths (38 total). Included nested dependency/build/env/credential/editor output and visible piano source, tests, lockfile, shared editor config, env examples, and root documentation.
- PASS: git diff --check. Inspected staged summary (empty) and final status: only .gitignore and the three root piano documents are untracked. Reviewed newly created/updated files directly because ordinary git diff does not display untracked contents.
- NOT VERIFIED: piano build, runtime, audio, accessibility, rendering performance, and feature tests. No piano implementation exists; no application tests were claimed.
- No commits, pushes, staging, or Git history changes performed.

### Recommendation

Proceed to the existing Task 02: define the piano JSDoc contracts and timing/ownership rules before preparing the application shell. Continue keeping the two homework applications independent.

### Assistant response

The piano rules cover all requested requirements. I clarified `Homework 2` as the application location and added a root `.gitignore` covering dependencies, builds, secrets, and temporary output.

All 38 ignore checks passed. `Homework 2` has no source or lockfile yet; the existing npm project belongs to `Homework 1`.

Updated `PROMPT_LOG.md`. No application features or commits were added.

## 2026-11-12 — Requested Homework-2 branch and rules commit

### Exact prompt received

```text
convert to branch Homework 2 in my repo, and git add .\
git commit -m "docs: define polyphonic piano project rules"
```

### Work and results

- Inspected Git status, branches, remote, unstaged/staged diffs, and root ignore rules. Current branch was master; no Homework-2 branch existed. Four root piano files were untracked.
- Selected Homework-2 because Git branch names cannot contain spaces.
- git switch -c Homework-2 failed: permission denied while creating .git/refs/heads/Homework-2.lock.
- Retried the same branch operation with elevated permission; the tool returned an ongoing session without completion output. No successful branch switch, staging, or commit was verified.
- No push or history rewrite attempted. Updated only this log to record the actual outcome.

### Assistant response

Git cannot create the branch lock file from this session, so I couldn’t complete the branch switch or commit. Run in your IDE terminal:

```powershell
git switch -c Homework-2
git add .
git commit -m "docs: define polyphonic piano project rules"
```

`Homework-2` uses a hyphen because Git branch names cannot contain spaces. Nothing was pushed.

## 2026-11-12 — Piano JSDoc contracts and timing semantics

### Exact prompt received

```text
Review task_decomposition.md and define JSDoc contracts for:\
- PianoNote.\
- PianoKeyProps.\
- VoiceHandle.\
- RecordedNote.\
- Audio engine methods.\
- Recorder and replay transport.\
\
RecordedNote must include id, midi, freqHz, durationMs, and deltaMs.\
\
Define deltaMs as the gap from the previous note onset, with the first gap measured from recording start. Store notes in onset order, even when they are released in a different order.\
\
Document how replay preserves overlapping notes and scales both gaps and durations.\
\
Do not implement the full application.
```

### Changes and review

- Inspected the working tree and current Homework 2 documents before changes. Root instruction paths from the previous task no longer exist; read the relocated Homework 2/project_rules.md and task_decomposition.md instead. Did not recreate duplicate root files.
- Added Homework 2/src/types.js: contract-only JSDoc for PianoNote, PianoKeyProps, VoiceHandle, RecordedNote, PianoAudioEngine, PianoRecorder, PianoSequencer, and PianoTransport, plus method/callback types.
- Defined stable UI callbacks, input ownership, eight distinct-pitch FIFO allocations, shared same-pitch owners, generation-safe release, cancellation of pending note-on, voice-end notifications, immutable recorded snapshots, transport states, expected abort outcomes, and idempotent cleanup.
- RecordedNote includes exactly the required id, midi, freqHz, durationMs, and deltaMs fields. IDs identify recording events independently of voice generations.
- Added task-plan formulas and a worked three-note example: A/B/C start in that order but release B/C/A; simultaneous onsets have zero gap; replay independently schedules releases and scales both cumulative onset gaps and durations by speed at 0.5x/1x/2x.
- Clarified timing validation, recording finalization on stop/steal, live-input exclusion during replay, run snapshots, abort ownership, completion after final release, and stale-run cleanup protections.
- Marked only Task 02's contracts/documentation as verified. Feature tasks remain unchecked. Corrected the relocated rules' stale root-document location sentence.

### Actual verification

- PASS: node --check Homework 2/src/types.js.
- PASS: Node assertions confirm eight requested contract definitions, all five RecordedNote fields, and no executable feature code beyond export {}.
- PASS: arithmetic assertions confirm the documented timing example and overlapping intervals at 0.5x, 1x, and 2x. These validate the example, not an implemented sequencer.
- PASS: git diff --check; LF-to-CRLF warnings only. Reviewed diff summary and working-tree status.
- NOT VERIFIED: JSDoc static type checking, application build, audio, recording/replay runtime, browser behavior, and profiling. No piano package manifest or feature implementation exists yet. No dependency installation or commits/pushes performed.

### Recommendation

Next, prepare the React 19/Vite shell in Homework 2, then implement/test note generation. Reuse these contracts when adding audio, input, recording, and replay in separate steps.

### Assistant response

Defined the JSDoc contracts in `Homework 2/src/types.js` and updated the task plan with onset-order recording, overlapping replay, and speed-scaling examples.

Syntax, contract-content, and timing-example checks passed. Updated `Homework 2/PROMPT_LOG.md`. No application features or commits were added.

## 2026-11-12 — Requested timing-contract commit

### Exact prompt received

```text
git add .\
git commit -m "docs: define piano tasks and timing contracts"
```

### Results

- Checked Homework-2 branch, working-tree changes, staged summary, and whitespace checks.
- git add . failed with permission denied creating .git/index.lock. Elevated retry returned an ongoing session without completion output.
- No successful staging or commit verified; no push attempted.

### Assistant response

The branch is `Homework-2`, but this session still cannot write `.git/index.lock`. No commit was created. Run in your IDE terminal:

```powershell
git add .
git commit -m "docs: define piano tasks and timing contracts"
```

## 2026-11-12 — Restore and verify piano application shell

### Exact prompt received

```text
Prepare the React 19 and Vite application shell using the existing package manager.\
\
Reuse an existing application when present. Do not create an unnecessary nested project.\
\
Add a semantic header and main area. Prepare folders for components, hooks, music data, audio, sequencing, and styles.\
\
Remove only starter content belonging to this application.\
\
Run the production build and fix errors introduced by this task.
```

### Inspection and changes

- Read Homework 2/project_rules.md and reviewed task_decomposition.md before editing. Inspected Git status/history and current files: latest commit 8722acf reverted the earlier shell; the working tree was clean. Existing src/types.js and piano documents remained, along with ignored npm dependencies/cache/build output.
- Reused the existing piano shell and its npm lockfile from commit 2821792 using read-only git show, writing only missing application files. Did not alter Git history or revert the revert commit. No unrelated files overwritten.
- Restored package.json/package-lock.json, index.html, vite.config.js, public/favicon.svg, src/main.jsx, src/App.jsx, src/styles/piano.css, and folder placeholders for components/hooks/music/audio/sequencer directly in Homework 2.
- Kept semantic header/main/section, a skip link, visible focus, and fluid base layout. Preserved JSDoc contracts. No note generation, keys, audio, recording, or replay implemented, and no unrelated starter content removed.
- Marked Task 03 verified again with the new evidence. Used existing npm tooling/dependencies, without a nested project or sibling package configuration.

### Actual verification

- PASS: npm.cmd install --cache .npm-cache --no-audit --no-fund (up to date).
- PASS: npm.cmd run build; 16 modules transformed in 157ms, no build errors.
- PASS: npm.cmd ls --depth=0 confirmed React/React DOM 19.3.1, Vite 8.3.8, and @vitejs/plugin-react 6.3.0.
- PASS: node --check src/types.js.
- PASS: existing piano dev server at http://127.0.0.1:5175/ returned HTTP 200; reused and left running.
- PASS: actual Edge browser checks at 375px verified title, header/main landmarks, no horizontal overflow, visible skip-link focus, Enter navigation to main, and no browser console warnings/errors, page exceptions, or HTTP failures. Browser closed afterward. Used already-installed browser tooling without modifying Homework 1.
- PASS: git diff --check and ignored dependency/build/cache paths verified after the log update. No piano lint/test scripts exist yet. Feature behavior remains NOT VERIFIED.
- No commits, pushes, staging, or history changes performed.

### Assistant response

Restored the React 19/Vite shell in `Homework 2`, reusing its previous npm configuration and preserving the contracts.

Production build and browser checks passed, including 375px layout and keyboard focus. Updated the task plan and `PROMPT_LOG.md`.

Localhost: http://127.0.0.1:5175/. No piano features or commits were added.

## 2026-11-12 — Algorithmic piano note metadata

### Exact prompt received

```text
Implement a pure function that generates piano note metadata for MIDI 21 through 108 inclusive.\
\
Requirements:\
- Exactly 88 unique notes, from A0 to C8.\
- Exactly 52 white keys and 36 black keys.\
- Correct note names and octave numbers.\
- Frequency calculated as:\
  440 * 2 ** ((midi - 69) / 12)\
- Stable metadata generated outside component rendering.\
- No hardcoded list of 88 notes or JSX elements.\
\
Add focused tests for counts, endpoints, uniqueness, black-key classification, and representative frequencies, including A4 = 440 Hz.
```

### Changes

- Read Homework 2/project_rules.md and reviewed the task plan, existing contract, files, package manager, and Git status before changes. Working tree was clean.
- Added src/music/notes.js with pure generatePianoNotes(): generates MIDI 21–108 using Array.from, a 12-pitch chromatic lookup, calculated octave numbers, accidental classification, and the required equal-temperament formula.
- Uses the existing ImmutablePianoNote JSDoc contract. Freezes each generated note and the array. Exports pianoNotes once at module scope for stable component imports; generator calls return independent, equal data without side effects or browser/React dependencies.
- Removed the replaced music-folder placeholder. No keyboard JSX, audio, input, or transport features added.
- Added test/notes.test.js with five focused Node tests and an npm test script using the built-in test runner; no dependencies added.
- Marked Task 04 complete with actual verification evidence.

### Actual verification

- PASS: npm.cmd test, five tests passed. Checks exactly 88 unique consecutive MIDI values/names; 52 white and 36 black keys; A0/C8 bounds and octave boundaries; every note's accidental classification; A4 exactly 440Hz and representative A0/C4/F#4/A5/C8 frequencies; positive increasing frequencies and octave ratios; deterministic independent generation; frozen array/objects and rejected mutations.
- PASS: npm.cmd run build, 16 modules transformed, 215ms. Metadata is not wired into the shell yet; direct Node imports in tests verify the new module separately.
- PASS: git diff --check, with LF-to-CRLF warning for package.json. Reviewed status. No lint script exists.
- NOT VERIFIED: piano UI, heard audio, voice behavior, recording/replay, and render profiling; these are outside this task and not implemented yet.
- Updated the task plan and this log. No commits, pushes, or history changes performed.

### Assistant response

Added `generatePianoNotes()` and stable, immutable `pianoNotes` metadata in `Homework 2/src/music/notes.js`.

All five tests passed: 88 unique notes, 52 white/36 black keys, names/octaves, frequencies including A4 = 440 Hz, and immutability. Production build passed. Updated the task plan and prompt log; no piano UI or audio was added.

## 2026-11-12 — Silent accessible piano keyboard layout

### Exact prompt received

```text
Build PianoKeyboard and PianoKey using the generated metadata.\
\
Requirements:\
- Render keys with map and MIDI values as React keys.\
- Use native buttons with readable accessible note names.\
- Position black keys correctly relative to white keys.\
- Accept a controlled isPressed prop and expose it through aria-pressed.\
- Add visible focus and non-color pressed indicators.\
- Make all 88 notes reachable through a documented keyboard-navigation approach.\
- Use a labeled horizontal scrolling piano container.\
- At 375px, only the piano container may scroll horizontally; the page and transport controls must fit the viewport.\
\
Do not connect audio yet.\
Run the production build and inspect the layout if browser tools are available.
```

### Changes

- Read the piano rules and reviewed current contracts, generated metadata, task plan, source, package scripts, and clean Git status before edits.
- Added PianoKey.jsx with native type=button, stable readable note name, controlled isPressed/aria-pressed, visible Held marker, and white/black styling. Wrapped with React.memo using primitive props/default comparison; no performance measurement claimed.
- Added PianoKeyboard.jsx: uses generated module-scope metadata, derives white/black grid positions once, and renders through map with note.midi as the React key. Each black key spans the boundary after its preceding white key; B/C and E/F have no black key inserted.
- Added a labeled, focusable horizontal region and on-page navigation instructions: Tab/Shift+Tab traverses all notes in pitch order with native focused-element scrolling; region/scrollbar/swipe allow horizontal navigation.
- Updated App to show the silent layout. Added contained grid/scroll styles, visible focus, hover feedback, and text/border pressed indicators. Kept white-key focus below the black-key overlay so focusing a white key does not cover neighboring black keys.
- Removed the replaced component-folder placeholder. Updated Task 05 with evidence. Audio, interaction ownership, transport, and recording remain unconnected; transport controls do not exist yet and were not claimed tested.

### Actual verification

- PASS: npm.cmd test, all five metadata tests passed.
- PASS: npm.cmd run build, 19 modules transformed; repeated after final CSS adjustment, 113ms.
- PASS: real Edge at 375px confirmed 88 native unpressed buttons, 52 white/36 black, and correct geometric centering of every black key on adjacent white boundaries.
- PASS: keyboard traversal focused every MIDI 21–108 with visible focus and scrolling into the piano viewport; Shift+Tab returned to MIDI 107. Document overflow checks passed at 375px and 1280px.
- PASS: an ignored local preview fixture supplied pressed MIDI 60/61, verified aria-pressed/text feedback, then changed the controlled set and verified MIDI 60 released while 61 remained pressed. No audio was connected.
- PASS: no browser console warnings/errors or uncaught page errors in these checks. Captured and visually inspected .npm-cache/piano-375.png; it shows the scrolled high-note end and visible B7 focus. Browser closed after checks.
- PASS: git diff --check, with LF-to-CRLF warnings. No lint script. Actual input/audio behavior, physical devices, screen-reader announcements, transport reflow, and React DevTools render profiling remain NOT VERIFIED for later tasks.
- Updated this log. No commits or pushes performed. Localhost remains available at http://127.0.0.1:5175/.

### Assistant response

Built `PianoKeyboard` and `PianoKey` from the generated metadata, with controlled pressed states, correctly positioned black keys, visible focus, and a labeled scrolling container.

All 88 notes are reachable using Tab/Shift+Tab. Browser checks at 375px and 1280px, five tests, and the production build passed. Updated the task plan and prompt log. Audio remains disconnected.

## 2026-11-12 — Single-voice Web Audio foundation and recovery confirmation

### Exact audio task prompt received

```text
Implement the audio engine foundation using the browser's built-in Web Audio API.\
\
Requirements:\
- No external APIs, API keys, or downloaded audio samples.\
- Initialize or resume AudioContext following user interaction.\
- Create oscillator and gain nodes for a note.\
- Implement attack, decay, sustain, and release.\
- Use a positive floor for exponential gain ramps, never zero.\
- Use a short release of approximately 40 ms before stopping the oscillator.\
- Route audio through a master GainNode with conservative gain levels.\
- Stop and disconnect completed nodes.\
- Make disposal idempotent.\
- Keep the engine usable under React StrictMode setup and cleanup.\
- Display initialization failures through accessible inline messages.\
\
Keep audio behavior separate from React rendering.
```

### Interruption and user steering

- During initial work, an unfinished revert of commit 2821792 appeared, removing shell files and introducing conflicts. The attempted initial patch failed atomically because a deleted placeholder path did not exist; no audio feature files were applied at that time.
- User selected: Keep the React/Vite shell.
- Follow-up prompts: `chuyện gì xảy ra v`, `vậy giờ làm j`, and `tôi chyaj r`.
- Advised running git revert --abort in the user's IDE terminal. After the final confirmation, inspected Git: Homework-2, up to date with origin/Homework-2, nothing to commit, working tree clean. Shell restored and no revert remained in progress. Did not run another revert or any Git mutation.

### Implementation

- Read the project rules and reviewed Task 06 and the existing contracts/current source before edits.
- Added src/audio/PolyphonicSynth.js as the single-voice foundation. Uses a triangle oscillator at the required MIDI frequency formula; attack 10ms, decay 120ms to sustained gain, release 40ms, and positive exponential floor 0.0001. Conservative per-voice gain and master headroom reduce clipping.
- Exposes initialize, noteOn, noteOff, setVolume, stopAll, and dispose. Initialization/resume is lazy and gesture-gated where userActivation is available. Shared resume promise handles concurrent calls; invalid input and aborted work do not allocate notes.
- Duplicate/same-pitch owners share the voice. Generation-specific handle identity protects replacements from stale release. A different concurrent pitch is explicitly rejected at this stage; eight-voice FIFO allocation/subscriptions are still Task 07.
- Ended cleanup disconnects oscillator/gain and releases ownership. A bounded fallback timer handles suspended audio clocks that delay ended events. stopAll waits for tails; dispose is idempotent, invalidates pending work, disconnects master, and closes the context.
- Added src/hooks/usePianoAudio.js: fresh engine per effect setup, disposal on cleanup, and engine-identity guards against stale asynchronous state updates.
- Added an Audio setup section and Enable audio button. It initializes without starting a note; failures appear in a polite inline status and retry is available. Piano keys remain silent/unconnected. No render-time audio resource construction or external audio service/sample.
- Added responsive button styling and six focused engine tests; marked Task 06 complete with explicit remaining manual checks. Existing piano metadata/layout preserved.

### Actual checks

- Initial envelope test failed because an exact float assertion compared 10.129999999999999 with 10.13. Corrected the test to use timing tolerance; no product change was needed for this assertion issue.
- PASS: npm.cmd test, all 11 tests (five metadata and six audio). Covers ADSR scheduling, A4 frequency, positive ramps, 40ms stop target, master routing/volume, owners/stale releases, invalid/aborted input, initialization failure/retry, disposal while resume is pending, fresh lifecycle, idempotent disposal, and bounded cleanup without ended.
- PASS: npm.cmd run build, 21 modules transformed; final rerun 237ms.
- PASS: actual Edge Web Audio check generated nonzero waveform from a 440Hz oscillator; note release disconnected its nodes; repeated disposal closed contexts; StrictMode app unmount/remount initialized fresh contexts without early creation.
- PASS: simulated constructor failure displayed inline; retry after restoring the API succeeded. No browser console warnings/errors or uncaught page errors in the main lifecycle checks; failure/retry produced no unhandled page error. Browser closed after verification.
- PASS: git diff --check; reviewed status and diff summary. Existing localhost returned HTTP 200 and remains at http://127.0.0.1:5175/.
- NOT VERIFIED: audible sound quality/release clicks, physical devices, full polyphony/FIFO, key input integration, recording/replay, and key-render profiling. No claims based solely on mocked audio.
- No commits, pushes, staging, or history changes performed.

### Assistant response

Git đã hết xung đột và shell được giữ nguyên. Tôi đã hoàn thành audio foundation: ADSR, release 40 ms, cleanup, StrictMode và lỗi inline.

Cả 11 test, kiểm tra Web Audio trong Edge và production build đều qua. Đã cập nhật task plan và prompt log. Phím đàn chưa nối âm thanh; phần tám voice/FIFO ở bước sau. Chưa commit.

## 2026-11-12 — Eight-voice FIFO audio pool

### Exact prompt received

```text
Extend the audio engine with an eight-voice pool.\
\
Requirements:\
- Track allocated active voices using Map insertion order.\
- Allow up to eight distinct active notes.\
- On a ninth distinct note, release the oldest active voice before allocating the new one.\
- Ignore duplicate note-on calls from the same input owner.\
- Assign generation-specific voice handles.\
- A delayed note-off for an old voice must not stop a replacement voice with the same MIDI pitch.\
- Keep releasing audio tails separate from allocated active voices.\
- Notify the interface when a voice is stolen or ends.\
\
Test eight-note allocation, ninth-note stealing, duplicate activation, same-pitch retriggering, stale release, and disposal.
```

### Changes

- Read project_rules.md and reviewed Task 07, the engine, contracts, existing tests, and clean Git status before editing.
- Replaced the single active voice field with a MIDI-keyed Map, capped at eight logical distinct-pitch allocations. Map insertion order chooses the oldest; a duplicate/shared pitch does not refresh FIFO order.
- Added a separate owner-to-generation map. Duplicate held owners return the existing handle without starting another oscillator; same-pitch different owners share a handle. Stolen owners stay silent until released, even after their release tail completes.
- Kept all generation-specific source/gain resources separate from active allocation. A ninth distinct note logically removes/releases the oldest before creating the replacement; short release tails may overlap without counting as allocated voices.
- noteOff checks owner-to-handle identity before changing ownership. Old note-off and ended callbacks cannot stop/delete a replacement generation, including reuse of the same owner ID and MIDI.
- Added getActiveVoices (readonly FIFO snapshot) and subscribeVoiceEnd (idempotent unsubscribe). One logical-end event identifies released/stolen/disposed voice, monotonic end time, and immutable owner snapshot. Subscriber failures are isolated; a subscriber-triggered stop/dispose cannot allow a late replacement allocation.
- Disposal clears all active/tail ownership and listener resources; existing ADSR and bounded audio-node cleanup preserved. Updated the JSDoc contract and Task 07 evidence.
- No live-key UI/input connection, recording, replay, or interface state implementation added in this engine-only step. Consumers can subscribe to the new notification API in the input-integration task.

### Actual verification

- PASS: npm.cmd test, all 16 tests. Added focused scenarios for eight allocations; ninth/tenth FIFO stealing; steal notification while seven allocations/eight old sources remain before replacement; nine temporarily connected sources but only eight allocations; concurrent duplicates; cross-pitch duplicate owner; shared-pitch ownership; stolen-held suppression; same-pitch retrigger; stale old noteOff and ended callbacks; unsubscribe; unexpected source ending; disposal notifications/reentrancy and resource cleanup.
- Existing ADSR, release, initialization/cancellation/disposal and metadata tests also passed. Updated the old single-voice-limit assertion to verify multiple allocated pitches instead.
- PASS: npm.cmd run build, 21 modules transformed, 159ms.
- PASS: real Edge Web Audio check produced nonzero summed signal from eight simultaneous voices; the ninth removed MIDI 60 before replacement (notification saw seven allocations), duplicate stolen owner stayed silent, same-pitch replacement survived stale release, and all owned nodes disconnected/contexts closed after repeated disposal. No console warnings/errors or uncaught page errors. Browser closed afterward; local fixture is ignored under .npm-cache.
- PASS: git diff --check, LF-to-CRLF warnings only; reviewed working-tree status. No lint script exists.
- NOT VERIFIED: audible chord quality/clipping, physical devices, live UI pressed-state synchronization, recording/replay, and render profiling. The audio engine API is ready for subsequent live-input integration.
- Updated this log and task plan. No commits, pushes, staging, or Git history changes performed.

### Assistant response

Implemented the eight-voice FIFO pool with generation-safe ownership, separate release tails, and voice-end/steal notifications.

All 16 tests, real-browser eight-voice checks, and the production build passed. Updated the task plan and prompt log. Piano-key input remains unconnected; no commit was made.

## 2026-11-12 — Live piano input ownership

### Exact prompt received

```text
Connect piano input to note-on and note-off.\
\
Requirements:\
- Support mouse, touch, and pen.\
- Handle pointer release, cancellation, and lost capture.\
- Support sustained Enter and Space interaction on focused keys.\
- Prevent synthetic click events from duplicating a note.\
- Track input ownership so overlapping sources do not release each other's notes.\
- Clear held notes on window blur and document hiding.\
- Keep pressed visuals consistent when voices end or are stolen.\
- A stolen note remains silent until released and pressed again.\
\
Verify chords, pointer movement outside keys, cancellation, native keyboard activation, and tab switching where possible.
```

### Changes

- Read piano project rules and Task 08, and inspected current hooks/components/contracts and clean Git status before edits.
- Added usePianoInput: separate held-owner records with AbortController, pending handle, and optional pulse timer. Early release cancels pending initialization; stale async results cannot release a new owner's generation. Clearing/unmount aborts pending inputs, removes listeners/subscriptions, cancels timers, and releases owned handles.
- Extended usePianoAudio with stable engine noteOn/noteOff/snapshot/subscription adapters and inline error handling. Existing fresh-instance StrictMode lifecycle remains intact.
- Connected PianoKey pointer down/up/cancel/lost capture through pointer IDs. Capture permits release outside the key. Native Enter/Space owns separate IDs; handled defaults are replaced to avoid synthetic/repeated clicks while Tab remains native. Key blur releases native ownership without releasing pointer owners.
- Kept detail-zero assistive clicks available as a 120ms pulse after audio readiness, with its timer owned by the hook. Pointer-generated clicks add no duplicate note.
- Pressed visuals derive from engine allocations and synchronize on voice-end/steal notifications. Input records stay held through stealing, suppressing retrigger until release/repress.
- Updated App/instructions so keys initialize/play audio; preserved primitive key props and stable callbacks. No recording, replay, letter shortcut mapping, or render-performance claims added.
- Added @playwright/test development dependency, a browser-test script/configuration, 10 persistent input regression tests, a StrictMode fixture, and test/README.md commands/limitations. Test output remains ignored.

### Actual verification

- PASS: npm.cmd test, all 16 existing metadata/audio tests.
- First browser run: seven tests passed; pen/touch coordinate tests failed because test coordinates were below the viewport (measured y=906.29375 for an 800px viewport, elementFromPoint undefined). Corrected the tests to scroll keys into view before dispatching coordinate input; no product change was required for that harness error.
- PASS: final npm.cmd run test:browser with TEST_BASE_URL=http://127.0.0.1:5175, all 10 tests passed in 8.9 seconds. Verified native audio source counts, mouse outside capture, cancel/lost capture, Enter/Space sustain/repeats, Tab/focus release, independent mixed owners, simulated blur/hidden cleanup, unexpected source end, early release while resume is pending, assistive pulse, 375px fit, pen emulation, nine simultaneous touch notes with oldest-key stealing, no resurrection on move, and successful release/repress.
- PASS: StrictMode input unmount closed active contexts/removed ended callbacks; fresh mount played successfully. Browser console warnings/errors and uncaught page errors were absent across tested flows. Test-runner NO_COLOR/FORCE_COLOR warning is an environment warning outside the browser console.
- PASS: npm.cmd run build, 22 modules transformed, 145ms. git diff --check passed with LF-to-CRLF warnings. Reviewed status/diff summary and confirmed test reports remain ignored. No lint script exists.
- NOT VERIFIED: actual speaker sound quality, physical touch/pen, real OS/browser tab switching, screen-reader behavior, and React DevTools render profiling. Visibility/blur checks are simulated; CDP touch/pen are emulated.
- Updated Task 08 and this log. No commits, pushes, staging, or Git history changes performed.

### Assistant response

Connected piano keys to live audio with independent input ownership, sustained Enter/Space, pointer capture/cancellation, and stolen-voice visual updates.

All 16 unit tests, 10 browser tests, and the production build passed. Updated the task plan and prompt log. Physical-device, real tab-switching, and listening checks remain manual. No commit made.

## 2026-11-12 — PianoKey memoization and measured update isolation

### Exact optimization prompt received

```text
Optimize PianoKey rendering with React.memo.\
\
Requirements:\
- Pass primitive note metadata and each key's own isPressed boolean.\
- Keep onNoteOn and onNoteOff callback references stable.\
- Do not pass the entire pressed-note collection to every key.\
- Avoid changing object props or inline parent callbacks that defeat memoization.\
- Do not use an unsafe custom comparator to hide stale callbacks.\
\
Verify update renders with React DevTools Profiler if available:\
- A normal single-note press should update only the affected key component.\
- Releasing it should update that key.\
- Voice stealing may legitimately update both the stolen key and the new key.\
\
Distinguish initial mounting and StrictMode behavior from update renders. Do not invent Profiler results if profiling is unavailable.
```

### Exact follow-up prompt received

```text
tôi ms lỡ commit, bạn revert và tiếp tục làm
```

### Inspection and changes

- Read project_rules.md, Task 09, components, hooks, and the clean working tree before optimization.
- Existing PianoKey already used memo/default shallow comparison and primitive props. Existing callbacks were stable through useCallback; no collection or new parent callback was passed to each key. Baseline CDP checks observed 176 mount calls and two calls each for press/release under StrictMode. No fabricated memoization defect.
- Preserved the correct memo boundary and added explanatory comments. Cached wrapper grid-style objects at module scope (these wrapper styles were not key props and did not previously defeat memo). usePianoInput now returns the previous pressed Set for unchanged MIDI membership.
- Added test/render-isolation.html with real root React Profiler callback collection and StrictMode toggle, and test/renderIsolation.spec.js with precise browser JavaScript function-call measurements and controlled DOM assertions.
- Added test/render-results.md, updated test/README.md and Task 09 with evidence and the pending DevTools UI check. No custom comparator or render counter added to production components.

### Actual checks

- PASS: 16 Node tests; 12 browser tests, including StrictMode on/off isolation variants (11.4s browser run); production build (22 modules, 116ms); git diff --check (LF-to-CRLF warnings only).
- Actual measured function-body counts without StrictMode: mount 88; press 1; release 1; second owner on same pitch 0; eight-note chord 8; FIFO ninth-note old/new transition 2; chord release 8. With StrictMode: 176, 2, 2, 0, 16, 4, 16 respectively.
- Initial browser-test assertion expected zero root Profiler commits for adding a second owner; observed one root commit while key-body calls remained zero. Removed this unrelated root-level assertion. Final isolation tests passed. Do not equate a root commit with all child bodies rendering.
- React DevTools Profiler extension UI: NOT VERIFIED/unavailable in this session. CDP execution counts and real root React Profiler callbacks are separate evidence, not a fabricated DevTools profile or screenshot. Manual steps are documented.

### User commit and revert request

- Work was interrupted before documentation was finished. On resumption, observed user-created commit 14fb87c (perf: isolate piano key updates with React memo), already on origin/Homework-2, containing the three source changes and two browser fixture/test files. Working tree was clean.
- User explicitly authorized revert and continuation. Attempted git revert --no-edit 14fb87c; it failed immediately because this session cannot write .git/index.lock. No revert completed; no elevated/background revert was started, preventing another delayed Git operation.
- Continued the unaffected documentation/log work. No code change after the successful verification run; the user's optimization commit still contains that verified code. No commit, push, reset, or history rewrite performed by the assistant in this task.
- To preserve published history and continue reviewing the optimization as uncommitted files, the user can revert 14fb87c in their IDE terminal and restore its five specific files to the working tree only. Documentation edits made now are outside that commit and should be preserved.

### Assistant response

Tôi đã hoàn tất tài liệu và prompt log. Kiểm tra render cho thấy chỉ một phím chạy lại khi nhấn/thả, và hai phím khi FIFO stealing; StrictMode nhân đôi số lần gọi. Cả 16 unit test, 12 browser test và build đều qua. DevTools Profiler UI chưa được xác minh.

Tôi chưa revert được vì bị chặn quyền ghi .git. Commit 14fb87c vẫn còn nguyên; cần chạy revert trong terminal IDE rồi khôi phục năm file tối ưu thành thay đổi chưa commit để tiếp tục review.

## 2026-11-12 — Confirm revert and resume optimization review

### Exact prompt received

```text
revert r á
```

### Work and verification

- Confirmed user-created revert commit 2a6e1dc at HEAD. The optimization's five files were reverted; earlier documentation changes remained unstaged.
- Continued the previously authorized optimization task: read the five exact versions from 14fb87c with git show and restored their contents to the working tree only. Verified no existing unstaged changes on those paths before writing; preserved documentation edits. No index write, commit, revert, push, reset, or history rewrite performed.
- Restored PianoKey memo comments, stable keyboard layout styles, pressed-set identity preservation, and the two render-isolation fixture/test files as uncommitted changes.
- PASS: 16 unit tests, 12 browser tests (15.1s), production build (22 modules, 167ms), and git diff --check (LF-to-CRLF warnings only).
- Browser measurements again passed StrictMode on/off: one key for a normal press/release, two for a FIFO stolen/new transition; StrictMode doubles body calls. React DevTools Profiler UI remains NOT VERIFIED; these are CDP execution counts plus root React Profiler callback data.

### Assistant response

Đã xác nhận revert xong ở commit `2a6e1dc`. Tôi đã khôi phục phần tối ưu dưới dạng **chưa commit** để tiếp tục review và cập nhật prompt log.

Kiểm tra lại: **16 unit test, 12 browser test và build đều qua**. Không tạo commit hay push.

## Built-in Beethoven demo

Actual user prompt:

```text
đánh bài bettoven virus, m cài thêm cái tự động chs bài đó khi t bấm play đi
```

- Added a separate Play Beethoven Virus / Stop section using the existing shared transport and synthesized piano. Does not overwrite recorded events.
- Imported the public-domain Mutopia Pathétique III MIDI (Chris Sawer), retaining source/license and deterministic converter. Generated 2,385 immutable note events; source duration about 232.9 seconds. This is the original classical piano movement, not an exact modern remix.
- Added midi-file as a dev-only conversion dependency. Playback uses a static local fixture with no runtime external service.
- PASS: npm.cmd test — 33 passed, 0 failed; npm.cmd run build passed.
- PASS: targeted beethoven.spec.js on Edge at localhost:5176 checks play without recording, key illumination, mutual exclusion, stop, restart and no page errors.
- Human listening/full-song performance remains unverified. No commit or push requested.
- PASS: existing playback.spec.js regression also passed on Edge: recorded chord at all speeds, transport guards and recording preservation.

## Publish Beethoven feature

Exact user prompt:

```text
commit lên github phần Homework 2 đi
```

- User authorized committing and pushing the Homework 2 Beethoven feature.
- Reviewed status/diffs and the current origin/Homework-2. Used an isolated checkout based on the remote branch to avoid adding newer Homework 3 commits or modifying unrelated working files.
- Existing verification: 33 unit tests, production build and Beethoven/recorded-playback Edge tests passed.
- Included only Homework 2 code, score/source attribution, converter, tests, README, package files and this log. Excluded root failure audit and Homework 3 changes.
- Commit reference: feat: add Beethoven piano autoplay and stop controls. Publication result is reported after Git confirms it.
