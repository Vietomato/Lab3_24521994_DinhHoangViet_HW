# AI failure audit

## 2026-11-12 — Optimistic claim integration

Verified AI application defects discovered in this task: **0**. The target of
three actual verified defects has not been met. No defects are invented here.
The tested failure scenarios below are intentionally simulated service behavior,
not evidence of an AI defect.

Evidence: `npm.cmd test` passed 32/32 tests, including seven new React hook/jsdom
checks for same-tick double claims, speculative last-item zero, authoritative
409 reconciliation, network retry, expiry while pending, reset cancellation and
obsolete success/finally ownership. Existing 25 tests also passed.

Headless Edge at 375x812 verified optimistic/pending/success UI, network retry,
Space activation, conflict sellout, reset while pending, countdown outside live
regions, no page overflow and no pageerror events. Production build passed.

Limits: this does not establish absence of defects. Full screen-reader/WCAG
audit, Lighthouse, other browser engines and production HTTP semantics remain
unverified. Prior shell-command/tooling errors documented in PROMPT_LOG.md are
not counted as verified application defects.

Commit reference: `feat: implement optimistic claims and conflict reconciliation`
(the commit introducing this audit; see Git history for its hash).

Future actual defect entries must record observed vs expected behavior,
reproduction, root cause, fix/files, verification evidence and commit reference.
