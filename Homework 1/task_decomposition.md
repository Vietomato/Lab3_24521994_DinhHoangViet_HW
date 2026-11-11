# Production Studio Drum Kit — Task Decomposition

## Goal

Build a responsive, accessible seven-pad React drum studio with synthesized audio, physical keyboard shortcuts, bounded hit history, and an audio signal meter.

All tasks start unchecked. This document is a plan, not evidence of completed work. Read `project_rules.md` before implementation. Suggested paths are adaptable to the existing repository; preserve unrelated applications.

## Proposed structure

```text
src/
  App.jsx
  components/DrumPad.jsx
  components/DrumControls.jsx
  components/HitHistory.jsx
  components/AudioMeter.jsx
  hooks/useDrumKeyboard.js
  hooks/useDrumAudio.js
  audio/DrumAudioEngine.js
  config/drumPads.js
  styles/drum-studio.css
project_rules.md
task_decomposition.md
PROMPT_LOG.md
AI_FAILURE_AUDIT.md
README.md
```

## Contracts to define before feature implementation

Use JSDoc; TypeScript migration is not required.

| Contract | Fields or behavior |
| --- | --- |
| DrumPadConfig | id: string; label: string; code: string; sound: supported synthesis identifier/configuration |
| DrumPadProps | pad: DrumPadConfig; isActive: boolean; activation/release callbacks with documented input-source handling |
| HitEvent | id: unique string; padId: string; label: string; timestampMs: number |
| Audio engine | trigger(sound); setVolume(normalizedLevel); meter access; dispose() |
| Keyboard hook | padMap; activation/release callbacks; isEnabled; all listeners cleaned up |
| Shared activation | A successful activation triggers one sound and one history event; ignored events create neither |

Pad codes: KeyW, KeyA, KeyS, KeyD, KeyJ, KeyK, KeyL. The configuration must contain exactly seven unique IDs and codes. Choose seven distinct labels and synthesis sounds during configuration.

## Task 01 — Project rules and repository hygiene

- [ ] Inspect the existing repository, instructions, package manager, and working tree.
- [ ] Adopt `project_rules.md`; exclude dependencies, builds, and secrets in .gitignore.
- [ ] Start PROMPT_LOG.md using actual interactions only.

Files: project_rules.md, .gitignore, PROMPT_LOG.md.

Acceptance: constraints are explicit; unrelated files remain intact; no secrets or generated dependencies are staged.

Verification: inspect ignore rules, git status, and the staged diff.

Commit: `docs: define drum studio project rules`

## Task 02 — Task plan and contracts

- [ ] Adopt this task plan and define the JSDoc contracts above in an appropriate documentation or source location.
- [ ] Specify scope, input behavior, acceptance criteria, and verification before implementation.

Files: task_decomposition.md, contract definitions, PROMPT_LOG.md.

Acceptance: each feature has a clear contract and independently reviewable task.

Verification: review definitions against project_rules.md; ensure no completion evidence is invented.

Commit: `docs: add task breakdown and drum studio contracts`

## Task 03 — React application shell

- [ ] Prepare React 19 and Vite, reusing the existing setup and lockfile.
- [ ] Add folders and a semantic header/main shell; remove only relevant starter content.

Files: package configuration and lockfile if needed, application entry, App.jsx, base styles.

Acceptance: development server starts and production build succeeds; no unnecessary nested application.

Verification: run the package-manager equivalents of npm run build and npm run dev; inspect the actual rendered shell.

Commit: `chore: set up React drum studio application`

## Task 04 — Pad data

- [ ] Create one configuration array for seven distinct sounds and physical codes.
- [ ] Apply JSDoc contracts and stable identifiers.

Files: src/config/drumPads.js and related contract definitions.

Acceptance: exactly seven pads; unique IDs and codes; data independent of React rendering.

Verification: check count, uniqueness, and expected keyboard mappings.

Commit: `feat: add seven drum pad configurations`

## Task 05 — Semantic and responsive interface

- [ ] Render configuration through reusable native-button pads.
- [ ] Add labels, shortcut hints, controlled active states, and aria-pressed.
- [ ] Add focus, hover, and active styling with non-color feedback.

Files: App.jsx, DrumPad.jsx, drum-studio.css.

Acceptance: seven accessible buttons; visible keyboard focus; no page overflow at 375px.

Verification: production build, Tab navigation, desktop/narrow viewport inspection. Record unavailable browser checks as pending.

Commit: `feat: build responsive drum pad interface`

## Task 06 — Local audio engine

- [ ] Synthesize seven sounds using built-in Web Audio API; no external services or samples.
- [ ] Implement user-gesture initialization/resume, overlapping hits, master gain, node release, and idempotent disposal.
- [ ] Ensure lifecycle behavior works with StrictMode and later remounts.

Files: DrumAudioEngine.js, useDrumAudio.js.

Acceptance: engine follows its contract and exposes meaningful errors without alert calls.

Verification: build and available engine checks; verify heard playback only when integrated and actually tested. Inspect lifecycle cleanup.

Commit: `feat: implement synthesized drum audio engine`

## Task 07 — Pointer and native-button integration

- [ ] Connect the shared activation path to the audio engine.
- [ ] Support mouse, touch, pen, Enter, and Space without double hits.
- [ ] Release pointer states on cancellation and capture loss; display inline errors.

Files: DrumPad.jsx, App.jsx, audio hook as needed.

Acceptance: one intended activation produces one sound; released/cancelled inputs do not stick.

Verification: click, Enter/Space, drag/release, pointer cancellation, and touch where available. Note pending device checks.

Commit: `feat: connect drum pad interactions to audio`

## Task 08 — Physical keyboard hook

- [ ] Implement event.code mapping, keyup release, and event.repeat guard.
- [ ] Ignore editable controls and nested editable regions.
- [ ] Clear held states on blur and hidden tab; clean up listeners.
- [ ] Support mixed pointer/keyboard activity without stale states.

Files: useDrumKeyboard.js, integration and focused tests if appropriate.

Acceptance: all seven shortcuts work; ignored events do not play or log hits; StrictMode does not duplicate listeners.

Verification: held key, rapid distinct presses, editable-target checks, tab switching, blur, mixed input, and unmount cleanup.

Commit: `feat: add guarded physical keyboard shortcuts`

## Task 09 — Volume and shortcut controls

- [ ] Add labeled volume range and shortcut enable/disable controls using useId.
- [ ] Connect volume to master gain and show its value.
- [ ] Disabling shortcuts clears keyboard states while preserving pointer/native-button activation.

Files: DrumControls.jsx, App.jsx, audio integration.

Acceptance: controls are accessible and shortcuts do not fire during editing.

Verification: volume minimum/maximum, mute behavior, enable/disable during a held key, label association, and build.

Commit: `feat: add volume and keyboard shortcut controls`

## Task 10 — Hit history and announcements

- [ ] Record stable IDs, labels, pad IDs, and timestamps through the shared activation path.
- [ ] Retain only 20 events using immutable updates.
- [ ] Announce the latest hit in output with aria-live="polite"; keep full history separate.
- [ ] Clear history without interrupting audio.

Files: HitHistory.jsx, App.jsx.

Acceptance: one history entry per valid hit; ignored events create none; ordering and cap are correct.

Verification: more than 20 hits, clear action, fast input, duplicate prevention, and accessibility-tree/manual screen-reader checks when available.

Commit: `feat: add hit history and accessible announcements`

## Task 11 — Audio signal meter

- [ ] Measure the digital signal with AnalyserNode.
- [ ] Avoid whole-application rendering every frame; add accessible naming.
- [ ] Handle silence, reduced motion, and lifecycle cleanup.
- [ ] Label any decibel value as digital dBFS; do not claim environmental loudness measurement.

Files: AudioMeter.jsx, engine meter access, meter styles.

Acceptance: visualization follows real signal activity, does not flood live announcements, and stops updating on disposal.

Verification: silence, single and overlapping hits, volume changes, reduced-motion setting, and unmount.

Commit: `feat: add audio signal meter`

## Task 12 — Integration review, documentation, and audit

- [ ] Run build, existing lint, and relevant behavioral checks.
- [ ] Review all input paths, focus, labels, live output, 375px layout, StrictMode, and cleanup.
- [ ] Run Lighthouse Accessibility when available, targeting 100; record actual environment/results and remaining manual WCAG checks.
- [ ] Fix confirmed defects; use separate fix commits if substantial.
- [ ] Complete README.md, truthful PROMPT_LOG.md, and AI_FAILURE_AUDIT.md.
- [ ] Record at least three actual verified defects if found; state any shortfall honestly.
- [ ] Update task statuses from real evidence and inspect the commit history.

Files: README.md, AI_FAILURE_AUDIT.md, PROMPT_LOG.md, task_decomposition.md, and any confirmed fixes.

Acceptance: reproducible setup, honest verification results, clear limitations, and at least 10 meaningful commits for this implementation.

Verification: production build, manual checklist, recorded evidence, git log, and staged-diff review. Never mark unavailable checks as passed.

Commit: `docs: complete drum studio verification and audit`

## Commit procedure

The user reviews and commits each step unless explicitly delegating commits. Suggested messages above are plans, not existing history.

```bash
git status
git diff
git add <files-for-this-task>
git diff --cached
git commit -m "<task-specific-message>"
git log --oneline -15
```

Replace angle-bracket placeholders with real paths/messages. Stage named files where unrelated changes exist. Do not create empty commits or rewrite history to meet a quota. If these documents are already committed together, count that actual commit once and split later implementation into additional meaningful tasks as needed. Do not push without authorization.

## Evidence templates

### Prompt log entry

- Task and date:
- Exact prompt received:
- Files changed:
- Checks actually run and results:
- Manual checks still pending:
- Actual commit hash (fill after commit):

### Failure audit entry

- Observed defect:
- Reproduction steps:
- Expected and actual behavior:
- Root cause:
- Fix and affected files:
- Verification evidence:
- Actual commit reference:
