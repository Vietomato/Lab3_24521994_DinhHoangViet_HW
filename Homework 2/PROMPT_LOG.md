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

## 2026-11-12 — React 19 and Vite piano shell

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

- Read the piano project rules and reviewed its task plan before edits. Inspected Homework 2 files, ignore rules, Git status, and available Node/npm versions. The working tree was clean at inspection.
- No piano app, manifest, or lockfile existed; Homework 2 contained documents and src/types.js only. Used available npm (11.16.0 on Node 24.18.0); created the application directly in Homework 2, without another nested project or reusing the drum studio's package configuration.
- Added package.json/package-lock.json, Vite React config, index.html, src/main.jsx, src/App.jsx, src/styles/piano.css, and public/favicon.svg. Installed React/React DOM 19.3.1, Vite 8.3.8, and @vitejs/plugin-react 6.3.0.
- Added dev/build/preview scripts. Used npm.cmd for compatibility with the machine's PowerShell script policy and the ignored local .npm-cache for install writes.
- Added semantic header/main/section, meaningful headings, a skip link, visible focus, and fluid layout. Added components/hooks/music/audio/sequencer folder placeholders; styles contains the actual base stylesheet.
- Preserved src/types.js and all existing documents. No starter application content existed to remove. No note generation, piano keys, audio, recorder, or replay implementation added.
- Marked only application-shell Task 03 completed with actual evidence. Homework 1 files were not changed.

### Verification results

- PASS: npm.cmd run build (16 modules transformed, 254ms).
- PASS: npm.cmd ls --depth=0 confirmed installed versions with no dependency-tree error.
- PASS: node --check src/types.js confirmed existing contract syntax remains valid.
- PASS: npm.cmd run dev -- --host 127.0.0.1 --port 5175 --strictPort; Vite ready in 190ms. Left server running at http://127.0.0.1:5175/.
- PASS: real Edge browser checks at 375px confirmed page title, semantic header/main/heading, no horizontal overflow, visible keyboard focus on the skip link, and Enter navigation to main. No browser console warnings/errors, page errors, or HTTP failures. Browser closed afterward.
- Browser tooling used the already installed Playwright package in Homework 1 without modifying that project or adding it as a piano runtime dependency.
- PASS: git diff --check and ignore checks for node_modules, dist, and .npm-cache. Reviewed working-tree status.
- No existing piano lint/test scripts. Feature behavior, sound, recording/replay, render isolation, and full accessibility remain NOT VERIFIED because those features do not exist yet.
- No commits, pushes, or Git history changes performed.

### Assistant response

Prepared the React 19/Vite shell directly in `Homework 2`, preserving the existing contracts and adding all requested folders.

Production build and browser checks passed, including 375px layout and keyboard focus. Updated the task plan and `PROMPT_LOG.md`.

The app is running at http://127.0.0.1:5175/. Piano features remain unimplemented.
