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
- Commit: not yet created. No additional defects are claimed to meet a quota.
