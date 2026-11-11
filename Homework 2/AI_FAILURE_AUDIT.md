# Verified recording/replay defects

## Stage 1 — Stop accepted a timestamp before a finalized release

- Reproduction: start at 100ms, note-on at 110ms, note-off at 130ms, stop at 120ms.
- Expected: reject backward session time. Initial result: stop succeeded and
  published a note ending after the recording's reported stop.
- Cause: stop validated only the latest onset, ignoring finalized release times.
- Fix: track the most recent accepted timing operation and validate note-on,
  note-off, and stop against it before mutation.
- Evidence: `stop cannot precede an already finalized note-off` first failed with
  “Missing expected exception (RangeError)”; after the fix it passes with the full
  recorder suite. Valid reverse release order remains supported.
- Files: `src/sequencer/recording.js`, `test/recording.test.js`.
- Commit: `c012e08` (Stage 1 recording).

## Stage 2 — Replay started audio without updating pressed visuals

- Reproduction: record a two-note chord, play it, and inspect aria-pressed.
- Expected: the two replayed notes show pressed state while sounding.
  Initial browser result: expected two pressed keys, observed zero.
- Cause: live input refreshed its state after note-on, but replay invoked the
  engine directly and only end notifications refreshed the interface.
- Fix: notify a stable refresh callback after each replay allocation. The
  existing voice-end subscription still handles release and stealing.
- Regression: `playback.spec.js` checks replayed chord visuals at all three
  speeds, natural completion, guarded live input and unchanged saved data.
- Commit: Stage 2 pending. No unobserved defects are added to meet a quota.

## Stage 2 — Lifecycle stop misreported initialization teardown as a playback error

- Reproduction: begin replay with pending audio initialization, call lifecycle
  stop, then let initialization resolve false during teardown.
- Expected: the cancelled operation resolves `aborted` without allocating notes.
  Initial regression result was an “Enable audio before replaying” error.
- Cause: initialization failure was checked before the run's cancelled state.
- Fix: recognize lifecycle cancellation before reporting initialization failure.
- Evidence: `lifecycle stop while initialization is pending resolves an expected
  aborted outcome` failed before the fix and passes afterward.
- Commit: Stage 2 pending. This does not claim the Stage 3 AbortSignal/UI work is done.
