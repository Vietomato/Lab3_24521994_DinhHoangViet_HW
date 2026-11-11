# Verified failure audit — 2026-11-12

These are observed defects, not invented failures to meet a quota. The first two
were reproduced during this review; the third was verified in an earlier task's
prompt log. Current fixes are uncommitted unless a history reference is stated.

## 1. Native held Enter generated repeated hits

- Reproduction: focus Kick Drum; send Enter keydown three times before keyup.
- Expected: one activation/history event for the held press. Observed before fix:
  three history entries.
- Cause: native button auto-repeat generated detail-zero clicks; the click handler
  treated each as a fresh assistive/native activation.
- Fix: track native Enter/Space key ownership, reject repeat keydowns, and suppress
  the browser click already accounted for by the shared activation path.
- Evidence: `test/studio.spec.js`, test “native Enter/Space holds expose pressed
  state and do not repeat hits”, passes for both keys, including no duplicate on
  release and retained assistive click support.
- Files: `src/components/DrumPad.jsx`, browser regression test. Commit: uncommitted.

## 2. Native held keys did not expose their active state

- Reproduction: focus a pad and hold Enter. Before fix, the observed
  `aria-pressed` remained false; the native click activated and released in the
  same event. Space followed the same click-only path.
- Expected: controlled pressed state reflects a held native activation.
- Cause: native input did not own state between keydown and keyup.
- Fix: activate on initial native keydown and release on keyup. Clear ownership
  on focus loss, window blur, document hiding, and unmount. Preserve default native
  keyboard behavior and keep separate pointer/global-key ownership.
- Evidence: the same regression test asserts true while held, false on release,
  cleanup after window blur, and a successful subsequent press. The complete
  interaction suite also passes.
- Files: `src/components/DrumPad.jsx`, browser regression test. Commit: uncommitted.

## 3. Browser requested a missing favicon (earlier confirmed fix)

- Reproduction in the earlier localhost check: load the page in fresh Edge.
- Observed: console 404 with URL `/favicon.ico`. Expected: no missing page assets.
- Cause: the initial shell had no favicon declaration or asset.
- Fix: add `public/favicon.svg` and reference it from `index.html`.
- Evidence: the 2026-11-12 localhost prompt-log entry records the failing request
  and a clean fresh-browser rerun after the fix. Current browser tests reject HTTP
  failures/console errors and pass; Lighthouse reports no run warnings.
- This is a historical defect, not a new failure in this review. See actual Git
  history for the favicon change; no new commit was made during this audit.

The test-runner shutdown restriction and temporary harness mistakes are tooling
limitations, not additional product defects. Full WCAG compliance and audible
quality are not inferred from the automated results.
