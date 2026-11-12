# PUBG Vietnam Airdrop Arena — Task Decomposition

## Goal and working method

Build a React 19 + Vite + JavaScript demo for PVS ticket/G-Coin drops, anti-drift countdowns, optimistic claims with 409 reconciliation, squad standings, and a virtualized kill feed. No backend or real PUBG API is required. Read project.rules.md and existing repository instructions first.

All tasks below are initially unchecked. They are plans, not evidence of completed code or commits. Follow the task contracts, implement a bounded change, verify, inspect the diff, then commit. Default to manual user-reviewed commits; an explicit implementation prompt may authorize automatic commits.

## Ten-prompt workflow

| Prompt | Stage / tasks | Scope | Planned commits |
| --- | --- | --- | --- |
| 1 | A / 01–02 | Review rules/repository, define JSDoc contracts and update plan | 1 |
| 2 | B / 03 | React 19 + Vite app shell and deterministic fixtures | 1 |
| 3 | C / 04 | Timestamp countdown and phase logic | 1 |
| 4 | D / 05 | Responsive accessible drop cards | 1 |
| 5 | E / 06 | Isolated deterministic mock claim service | 1 |
| 6 | F / 07 | Locked optimistic claiming and success reconciliation | 1 |
| 7 | G / 08 | Failure reconciliation, expiry and session ownership | 1 |
| 8 | H / 09 | Filterable, sortable squad leaderboard | 1 |
| 9 | I / 10 | Virtualized filtered kill feed | 1 |
| 10 | J / 11–12 | Integration verification/fixes, then documentation/audit | 2 |
| **Total** | **12 tasks across 10 prompts** | | **11** |

Prompt 1 combines Tasks 01–02 into one cohesive contract-first commit. Prompt 10
keeps verification/fixes and final documentation as two separately reviewed
commits. All feature requirements and verification criteria below remain in
force. Stages B–J are proposed scope, not prompts already received or completed.
Default to manual user-reviewed commits; do not stage or commit automatically
without explicit delegation. Never create empty commits to satisfy the count.

Stage A review (2026-11-12): no applicable AGENTS.md was found in the workspace
or checked ancestor locations. Homework 3 initially contained only the three
untracked planning/log files, with no package.json or lockfile. Existing sibling
projects use npm/package-lock.json; use npm for the new app and preserve those
projects. The rules file on disk is project.rules.md (not project.rules).
JSDoc definitions are in src/contracts.js. Runtime validation, application setup
and browser behavior remained future work at Stage A. See task statuses below
for subsequent progress.

## Suggested structure

```text
src/
  App.jsx
  main.jsx
  index.css
  data.js
  contracts.js
  api/mockApi.js
  hooks/usePubgAirdropTimer.js
  hooks/useClaim.js
  lib/drop.js
  lib/leaderboard.js
  lib/virtual.js
  components/DropCard.jsx
  components/Leaderboard.jsx
  components/KillFeed.jsx
tests/
  drop.test.js
  mockApi.test.js
  leaderboard.test.js
  virtual.test.js
project.rules.md
task_decomposition.md
PROMPT_LOG.md
AI_FAILURE_AUDIT.md
README.md
```

Adapt locations to the existing project; do not recreate a working application unnecessarily. Use existing test infrastructure or Node's built-in test runner for pure modules. Browser interaction/hook tests may need an existing React-capable test setup; pure tests do not verify rendered behavior.

## Required contract decisions

| Area | Decision |
| --- | --- |
| Drop | id, title, priceVnd, remainingStock, dropEpochMs; add expiresEpochMs explicitly |
| Clock | now = Date.now() + serverOffsetMs; countdown recalculated from timestamp, not decremented |
| Phase order | EXPIRED, otherwise WARMUP, otherwise LOOTED_OUT, otherwise AIRDROP_LIVE |
| Eligibility | Live according to confirmed stock/time, positive stock, no pending operation |
| Optimism | Separate confirmed serverStock from a one-item pending deduction |
| Mock API | Per-session authoritative state; deterministic latency/scenarios; final validation and mutation atomic |
| Idempotency | Completed or concurrent reuse of a claim ID for the same drop never deducts twice |
| Abort | Mock abort before mutation cancels the operation; actual HTTP abort would not prove rollback |
| Expiry in flight | Service rechecks expiry at completion and rejects a claim completed too late |
| Reset | New drop timestamps plus new service instance; abort/remount old card session |
| Standings | Derived filter/sort with stable tie-breaker, never mutate source |
| Feed | Filter first; virtualize fixed-height rows with overscan; reset scroll on filter |
| Demo data | Four named squads, at least two drops, deterministic large kill-feed fixture |

## Task 01 — Project rules and repository hygiene

- [x] Implement and verify (ignore rules checked during application-shell setup).

**Scope:** Inspect existing repository instructions, package manager, working tree, and app structure. Adopt project.rules.md, maintain .gitignore, and start truthful prompt logging.

**Expected files:** project.rules.md, .gitignore, PROMPT_LOG.md. Update the actual prompt log with the task.

**Acceptance:** Rules agree with the requested arena scope; generated dependencies and secrets are excluded.

**Verification:** Inspect Git status and staged diff; preserve unrelated work.

**Planned commit (shared with Task 02, Prompt 1):** `docs: define arena rules contracts and implementation plan`

## Task 02 — Domain contracts and task plan

- [x] Implement and verify (Stage A contract/plan review; no commit created).

**Scope:** Adopt this plan and define JSDoc contracts for drops, expiry, squads, kill events, claim requests/responses/errors. Document phase precedence, timing, idempotency, and ownership.

**Expected files:** task_decomposition.md, src/contracts.js or documented JSDoc definitions. Update the actual prompt log with the task.

**Acceptance:** Contracts exist before feature implementation; EXPIRED has an explicit deadline.

**Verification:** Review valid/invalid values, phase order, and API response semantics.

**Planned commit (shared with Task 01, Prompt 1):** `docs: define arena rules contracts and implementation plan`

## Task 03 — Application shell and deterministic fixtures

- [ ] Implement and verify.

Progress (2026-11-12): React/Vite shell and deterministic fixtures are ready: two fresh-timestamp drops, four squads and 1,200 stable-ID kill events. Eight fixture tests and production build pass. Development-server/browser verification remains pending; this task is not yet fully verified.

**Scope:** Prepare React 19 and Vite using the existing package manager. Add semantic page regions, two demo drops, four squads, a large stable-ID feed fixture, and explicit demo labeling.

**Expected files:** package files if needed, App.jsx, main.jsx, data.js, base CSS. Update the actual prompt log with the task.

**Acceptance:** App starts and builds; fixtures are reproducible; createDrops(now) supports fresh reset timestamps.

**Verification:** Run development server and build; check unique IDs, stock values, timestamps, and demo notice.

**Suggested commit:** `chore: set up arena application and demo data`

## Task 04 — Timestamp countdown and phase logic

- [x] Implement and verify (pure tests plus React hook/jsdom checks pass; actual browser background-tab behavior remains unverified).

**Scope:** Implement usePubgAirdropTimer with offset, clock recalculation, visibility wake-up, invalid input handling, and cleanup. Add pure phase and time-format helpers.

**Expected files:** hooks/usePubgAirdropTimer.js, lib/drop.js, focused tests. Update the actual prompt log with the task.

**Acceptance:** No decrement-based drift; opening and expiry distinct; phase uses confirmed stock and documented precedence.

**Verification:** Test before/at opening and expiry, zero stock, target/offset changes, delayed callbacks, visibility resync, invalid data, and cleanup.

**Suggested commit:** `feat: implement timestamp-based airdrop countdown`

## Task 05 — Responsive drop cards

- [x] Implement and verify (build and existing tests pass; Edge checks cover 375px, desktop columns, skip-link keyboard/focus and clock-driven phase transitions).

**Scope:** Render title, VND price, confirmed/pending stock presentation, opening/expiry countdown, phase, and native claim button. Prepare a disabled placeholder until claim flow is connected.

**Expected files:** components/DropCard.jsx, App.jsx, index.css. Update the actual prompt log with the task.

**Acceptance:** Semantic cards with focus and phase text; claim eligibility clear; no whole-page overflow at 375px.

**Verification:** Build and inspect keyboard navigation, labels, deadline wording, and narrow layout where browser tools exist.

**Suggested commit:** `feat: build responsive airdrop cards and phase states`

## Task 06 — Deterministic mock claim service

- [x] Implement and verify (12 controlled-clock service tests pass, including timer/listener cleanup; UI integration remains Tasks 07–08).

**Scope:** Implement per-session authoritative stock, abortable latency, explicit success/409/network-error modes, atomic final validation/deduction, and idempotency. Add reset/session support.

**Expected files:** api/mockApi.js, abort utility if needed, service tests. Update the actual prompt log with the task.

**Acceptance:** Duplicate claim IDs deduct at most once; unknown/closed drops rejected; mock abort semantics explicit.

**Verification:** Test same-ID concurrent requests, inconsistent ID reuse, last-item concurrency, already-aborted signals, listener cleanup, expiry during delay, and each scenario.

**Suggested commit:** `feat: add deterministic mock claim service`

## Task 07 — Locked optimistic claiming

- [x] Implement and verify (hook/jsdom and Edge pending/success checks pass).

**Scope:** Implement useClaim with immediate per-drop ref lock, unique operation ID, AbortController, separate confirmed stock/pending deduction, success reconciliation, and accessible status.

**Expected files:** hooks/useClaim.js, DropCard.jsx, demo controls. Update the actual prompt log with the task.

**Acceptance:** Rapid double click starts one operation; pending deduction visible immediately; confirmed phase separate from speculative zero stock.

**Verification:** Check same-tick clicks, success, last-item success, disabled button, and no negative display stock.

**Suggested commit:** `feat: implement locked optimistic ticket and crate claims`

## Task 08 — Rollback and obsolete response protection

- [x] Implement and verify (409/network/expiry, StrictMode, reset cancellation and obsolete response ownership tests pass; completed with Task 07 in the user's combined prompt).

**Scope:** Handle 409 with authoritative stock, network failure with removal of pending deduction, and ownership-safe cleanup. Abort old sessions on reset/unmount. Implement explicit expiry completion policy.

**Expected files:** useClaim.js, session/reset integration, regression tests. Update the actual prompt log with the task.

**Acceptance:** No stale snapshot restoration; old responses/finally cannot modify a fresh session; pending clears on all owned completion paths.

**Verification:** Test 409 sellout, network failure/retry, expiry while pending, reset during request, unmount, and StrictMode lifecycle.

**Suggested commit:** `fix: reconcile failed claims and prevent stale stock updates`

## Task 09 — Leaderboard selectors and interface

- [ ] Implement and verify.

**Scope:** Build search, sort metric/direction controls, stable tie-breaker, and semantic standings table. Add clearly labeled manual or simulated standings updates if needed.

**Expected files:** components/Leaderboard.jsx, lib/leaderboard.js, selector tests. Update the actual prompt log with the task.

**Acceptance:** WWCD/placement/kills sortable both ways; source data unchanged; empty search result supported.

**Verification:** Test case-insensitive trimmed search, ties, direction changes, source immutability, control labels, and update-timer cleanup if used.

**Suggested commit:** `feat: add filterable and sortable squad leaderboard`

## Task 10 — Virtualized kill feed

- [ ] Implement and verify.

**Scope:** Implement squad filtering and a fixed-row-height virtual window with overscan, total scroll space, stable IDs, and accessible scroll viewport. Reset scroll on filter changes.

**Expected files:** components/KillFeed.jsx, lib/virtual.js, styles, tests. Update the actual prompt log with the task.

**Acceptance:** Rendered DOM row count bounded; filtered list drives all offsets; row content fits fixed height.

**Verification:** Test first/last windows, empty filter results, large scroll offsets, filter after scrolling, bounded rendered rows, keyboard scrolling, and 375px layout.

**Suggested commit:** `feat: add virtualized squad kill feed`

## Task 11 — Integration and quality verification

- [ ] Implement and verify.

**Scope:** Run build and relevant tests; inspect timing, claims, reset, table/feed, keyboard behavior, contrast, labels, focus, 375px layout, cleanup, and console. Fix observed defects.

**Expected files:** Relevant source/test files; VERIFICATION.md if needed. Update the actual prompt log with the task.

**Acceptance:** Each check labeled PASS/FAIL/NOT VERIFIED with real evidence; no unsupported claim of WCAG compliance.

**Verification:** Run actual browser/Lighthouse checks if tools exist; otherwise record manual checks as pending. Repeat affected checks after fixes.

**Suggested commit:** `fix: resolve arena integration and accessibility issues`

## Task 12 — Documentation and verified audit

- [ ] Implement and verify.

**Scope:** Complete README, prompt log, failure audit, and task status from actual work. Explain demo limits, API scenarios, phase/timer behavior, reconciliation, virtualization, commands, and manual checks.

**Expected files:** README.md, PROMPT_LOG.md, AI_FAILURE_AUDIT.md, task_decomposition.md. Update the actual prompt log with the task.

**Acceptance:** Reproducible project instructions; at least 10 genuine commits; audit includes actual defects and honest shortfalls only.

**Verification:** Compare documentation with code/results; inspect git log and count actual implementation commits.

**Suggested commit:** `docs: complete arena documentation and failure audit`

## Claim flow to implement

1. Recheck current eligibility and synchronously acquire the per-drop ref lock.
2. Create operation/claim ID and AbortController; set pending feedback.
3. Show max(0, confirmedStock - 1) without changing confirmed stock.
4. Await the mock service.
5. On success, apply authoritative stock; on 409, apply authoritative error stock if present; on other failure, retain confirmed stock.
6. Remove the pending deduction and unlock only if the operation still owns the current session.
7. Abort/obsolete work must not update an unmounted card or a replacement session.

## Commit procedure

```bash
git status
git diff
git add <files-for-this-task>
git diff --cached
git commit -m "<task-message>"
git log --oneline -15
```

Replace placeholders before running commands. Stage relevant files only. Do not commit dependencies, builds, secrets, unrelated work, or fictional results. Do not push or rewrite history without explicit authorization. If Task 11 finds no defect, use a truthful verification-documentation message for a real report change rather than inventing a fix. If initial documents are already committed together, count that commit once and split later real work where appropriate.

## Final manual checklist

- [ ] Initial demo notice and all four phase labels are understandable.
- [ ] Opening and expiry boundaries update correctly.
- [ ] Background tab returns to a correct countdown immediately.
- [ ] Success shows optimistic deduction then confirmed stock.
- [ ] Rapid double clicks do not duplicate a claim.
- [ ] Last-item success never displays negative stock.
- [ ] 409 removes optimism and reconciles server inventory.
- [ ] Network failure restores the confirmed-stock view; retry works.
- [ ] Claim expiring in flight follows the documented failure policy.
- [ ] Reset while pending leaves the new session unchanged by old work.
- [ ] Leaderboard filters/sorts both directions with deterministic ties.
- [ ] Feed scrolls to end and resets correctly after filtering.
- [ ] Large feed renders a bounded subset of rows.
- [ ] Tab, Enter, Space, labels, focus, and status announcements work.
- [ ] At 375px there is no page-level horizontal overflow.
- [ ] Build/tests pass and cleanup/StrictMode behavior is checked.
- [ ] Lighthouse results are recorded only if actually measured; remaining WCAG checks remain explicit.

## Evidence and document templates

### Verification record

- Check and environment:
- Command or reproduction steps:
- Status: PASS / FAIL / NOT VERIFIED
- Actual result or evidence:
- Remaining limitation:

### Prompt log entry

- Date and task:
- Exact prompt actually received:
- Files changed:
- Checks run and actual results:
- Pending manual checks:
- Actual commit hash, filled after commit:

### Failure audit entry

- Observed AI defect:
- Expected versus actual behavior:
- Reproduction steps:
- Root cause:
- Fix and affected files:
- Actual verification evidence:
- Commit reference:

Target at least three real verified AI defects. If fewer were observed, state that fact; never invent defects, prompts, screenshots, or results. README must include setup/build/test commands and clearly explain that mock inventory is local to one demo session, not a production stock system.
