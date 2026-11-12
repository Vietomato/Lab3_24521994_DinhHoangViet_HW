# Prompt log

## 2026-11-12 — Prompt 1 / Stage A: rules, contracts and plan

Exact prompt received (including its original fence):

````text
```sql
Build PUBG Vietnam Airdrop Arena using React 19, Vite, and JavaScript.

Read project.rules, task_decomposition.md, and any AGENTS.md instructions. Inspect the repository, package manager, and Git status. Preserve unrelated files and uncommitted changes.

Stage A:
Review the project rules and define JSDoc contracts for:
- DropPhase: WARMUP, AIRDROP_LIVE, LOOTED_OUT, EXPIRED.
- PubgCrateDrop: id, title, priceVnd, remainingStock, dropEpochMs.
- expiresEpochMs as an explicit extension.
- PubgVnSquadStanding: squadId, squadName, wwcdCount, placementPts, killPts.
- KillEvent.
- ClaimRequest, ClaimResponse, and ClaimError.

Update task_decomposition.md to match this ten-prompt workflow with eleven planned commits. Preserve all feature requirements and verification criteria.
```
````

Work performed:

- Read project.rules.md (the actual rules filename) and task_decomposition.md.
- Inspected workspace/ancestor instructions, repository status/history/diffs and sibling package manifests/lockfiles. No applicable AGENTS.md found. Homework 3 had only three untracked documents and no app configuration. Sibling projects use npm.
- Added src/contracts.js with all requested JSDoc contracts, explicit expiry, scenario values, validation constraints and timing/idempotency/ownership semantics. Runtime validation is planned, not implemented here.
- Regrouped the existing 12 tasks into 10 prompts and 11 planned commits while retaining task scopes, acceptance criteria, verification criteria and final checklist. Later prompt groupings are proposed because only Stage A has been received.
- Updated the rules' workflow count to match the plan. Task 02 is complete; Task 01 remains open for ignore-file hygiene.

Files changed: src/contracts.js, task_decomposition.md, project.rules.md, PROMPT_LOG.md.

Verification:

- PASS: `node --check "Homework 3/src/contracts.js"` (exit 0).
- PASS: Node assertion check counted 10 prompt rows, 11 planned commits, all 12 task headings and their acceptance/verification sections, required contract names and explicit expiry. `git diff --check` exited 0; it does not inspect these currently untracked files. Final Git status still showed only untracked Homework 3 content and no staged changes.
- PASS: reviewed contract fields, phase precedence, expiry constraints, authoritative stock, deterministic scenarios and abort/idempotency semantics against the rules.
- PASS: inspected `git status --short`, `git diff --stat`, `git diff --cached --stat`; initial status contained only untracked Homework 3 files, with no tracked/staged changes.
- Tool limitation: Python executable was inaccessible during a text-edit attempt; no document writes occurred from that attempt. Applied the changes using PowerShell instead.
- NOT VERIFIED: production build, lint, runtime validation and browser behavior; Stage A has no package.json, app or test infrastructure yet. JavaScript syntax checking does not type-check JSDoc or verify runtime behavior.
- Pending manual checks: review contracts and proposed grouping for future prompts; application accessibility/layout checks follow implementation.

Actual commit hash: none; no files staged or committed (manual user review is the default).

## 2026-11-12 — Commit Stage A

Exact prompt received:

````text
```yaml
Commit:
docs: define arena rules and domain contracts

commit dùm
```
````

- Action: user explicitly authorized committing the four Stage A files in Homework 3 with the supplied message.
- Files: project.rules.md, task_decomposition.md, src/contracts.js and this log.
- Checks: reviewed Git status, working diff and staged diff before staging; no unrelated changes were present. Contract syntax was checked again before commit. Staged content is reviewed before committing.
- Build/browser checks remain pending application setup.
- Commit reference: this entry is included in the commit titled `docs: define arena rules and domain contracts`; use Git history for its hash.

## 2026-11-12 — Application shell

Exact prompt received:

````text
```sql
Prepare the React application shell, reusing the existing setup when available. Add semantic header/main regions and folders for components, hooks, API, data, and pure utilities.

Maintain .gitignore and remove only relevant starter content.
Run the production build.
```
````

Work performed:

- Inspected rules, task plan, Git status, existing sibling npm setup and workspace instructions. Initial working tree was clean; no AGENTS.md found. Homework 3 had no existing app or starter content to remove.
- Reused sibling dependency version ranges and npm convention, creating an independent React 19/Vite JavaScript package and lockfile without modifying sibling projects.
- Added index.html, Vite config, StrictMode/createRoot entry point, App.jsx and responsive base CSS. Shell includes header/main/footer, skip link, labeled sections and explicit local-demo/no-affiliation notices. Sections truthfully indicate features are pending.
- Added tracked placeholder files for components, hooks, api, data and lib (pure utilities).
- Reused Homework 2 ignore patterns locally for dependencies, build/cache output, environment files and credentials. Added README setup/build instructions and current limitations.
- Task 01 hygiene is now complete. Task 03 is partially complete: shell/build are ready; deterministic fixtures and development-server/browser verification remain pending. No feature tasks are claimed complete.

Files changed: .gitignore, README.md, index.html, package.json, package-lock.json, vite.config.js, src/App.jsx, src/main.jsx, src/index.css, five folder .gitkeep files, task_decomposition.md and this log.

Verification and tooling:

- PASS: `npm.cmd install --cache .npm-cache --no-audit --no-fund` installed 19 packages and generated package-lock.json.
- PASS: `npm.cmd run build`, Vite 8.3.8, 16 transformed modules, exit 0; generated dist/index.html plus CSS/JS assets.
- PASS: `git check-ignore node_modules/ dist/ .npm-cache/ .env credentials.json` matched every supplied path.
- PASS: `git diff --check`; Git status contains only intended Homework 3 changes; generated folders are ignored. No staged changes or commits made.
- Tooling issues corrected: PowerShell blocked npm.ps1, so used npm.cmd. Initial copy used a path relative to the wrong working directory; corrected it without overwriting unrelated files. Initial npm install could not write system cache (EPERM); retry used the ignored project-local cache successfully.
- NOT VERIFIED: browser rendering, keyboard/375px layout and Lighthouse. No lint/test scripts or feature tests exist yet; no test scores claimed.

Commit: pending user review; no automatic commit authorized by this prompt.

## 2026-11-12 — Commit application shell

Exact prompt received:

````text
```yaml
Commit:
chore: initialize React arena application
```
````

- User authorized committing the application shell with the supplied message.
- Scope: React/Vite package and lockfile, HTML/React/CSS shell, feature-folder placeholders, .gitignore, README, task progress and prompt log.
- Verification: production build passed in the preceding implementation; reviewed Git status, working diff/check and staged content before commit. Generated dependencies, cache and dist remain ignored.
- Browser checks remain pending; no unrelated files included.
- Commit reference: the commit containing this entry, titled `chore: initialize React arena application`; hash available in Git history.

## 2026-11-12 — Deterministic arena demo data

Exact prompt received (literal backslashes retained):

```text
Read project.rules and the current contracts.\
\
Create deterministic demo data for:\
\- A PVS Finals VIP ticket drop.\
\- A G-Coin crate drop.\
\- The Expendables, Cerberus Esports, Roy Esports, and AGG standings.\
\- At least 1,000 kill-feed events with stable unique IDs.\
\
Requirements:\
\- Use createDrops(now) so resetting the demo creates fresh opening and expiry timestamps.\
\- Include one initially live drop and one opening shortly afterward.\
\- Use nonnegative integer stock and valid prices.\
\- Generate the kill feed programmatically without random IDs during rendering.\
\- Validate unique IDs, timestamps, and fixture consistency.\
\- Clearly label all data as simulated and avoid claiming official affiliation.\
\- No external API, API key, backend, or payment integration is required.\
\
Add a visible demo notice to the application.\
\
Update PROMPT_LOG.md, run relevant checks and the production build, and commit:\
feat: add deterministic arena demo data\
\
Report the actual verification results and commit hash.
```

Work performed:

- Read project.rules.md and current JSDoc contracts; initial Git status was clean. No workspace AGENTS.md found.
- Added src/data/fixtures.js: two independent fresh-timestamp drops from createDrops(now), four required demo squads and 1,200 generated immutable feed records with deterministic unique IDs. VIP opens 5 seconds before the supplied clock and expires 5 minutes after; crate opens 30 seconds after and expires 6 minutes after.
- Added pure validateFixtures with inline-safe error strings for malformed records, duplicate/empty IDs, invalid numbers, expiry order and unknown squad references. UI renders validation errors instead of drop summaries if fixtures are invalid; no claim button exists yet.
- Reused and strengthened the visible demo notice, connected simple fixture summaries and formatted VND prices. No full feed rendering or feature implementation introduced.
- Added eight Node test cases, npm test script and documentation. Standings and feed are independent simulated fixtures, not an aggregate of each other. Reset UI/service remains future work.

Files changed: src/data/fixtures.js, src/lib/validateFixtures.js, src/App.jsx, tests/data.test.js, package.json, README.md, task_decomposition.md and PROMPT_LOG.md.

Verification:

- PASS: `npm.cmd test` — 8 tests, 8 passed, 0 failed. Covers required teams/1,200 unique events, repeatability across module evaluations, fresh reset timestamps/stock isolation, initial live/upcoming timing, invalid clocks, duplicate/empty IDs, invalid prices/stock/deadlines and broken fixture references.
- PASS: `npm.cmd run build` — Vite 8.3.8, 18 transformed modules, exit 0.
- NOT VERIFIED: actual browser rendering, accessibility, 375px layout and reset interaction. Pure fixture tests do not verify rendered behavior. No lint script exists.
- Commit authorized explicitly by this prompt. Review working/staged diffs and exclude generated files before committing.
- Commit reference: commit containing this entry, titled `feat: add deterministic arena demo data`; obtain hash from Git history after creation.

## 2026-11-12 — Timestamp countdown and drop phases

Exact prompt received (literal escapes retained):

```text
Implement usePubgAirdropTimer(targetEpochMs, serverOffsetMs = 0) and pure drop utilities.\
\
Requirements:\
\- Calculate remaining time using:\
&#x20; Math.max(0, targetEpochMs - (Date.now() + serverOffsetMs)).\
\- Never implement countdown by decrementing previous seconds.\
\- Recalculate immediately when target or offset changes.\
\- Resynchronize when the document becomes visible.\
\- Clean up the update timer and visibilitychange listener.\
\- Handle invalid timestamps safely.\
\
Derive phases using current time and confirmed stock:\
1\. EXPIRED when now >= expiresEpochMs.\
2\. WARMUP when now < dropEpochMs.\
3\. LOOTED_OUT when confirmed stock is zero.\
4\. AIRDROP_LIVE otherwise.\
\
Keep opening and expiry separate. Expose enough current-time information for the interface to calculate both correctly.\
\
Add focused tests for phase boundaries, invalid input, delayed callbacks, offset changes, visibility resynchronization, and cleanup using suitable existing tools. Distinguish pure-function checks from hook/browser checks.\
\
Update PROMPT_LOG.md, run relevant checks and the production build, and commit:\
feat: implement timestamp countdown and drop phases
```

Work performed:

- Reviewed project rules, contracts, Task 04 and current test infrastructure. Initial working tree clean; no workspace AGENTS.md found.
- Added pure drop.js functions for validated timestamps, clock snapshots, phase precedence with explicit confirmed stock and time formatting. Invalid phase input returns null rather than an eligible phase.
- Added usePubgAirdropTimer: clock-based refresh every 250ms, fresh values on first changed-input render, effect resync, visible-document resync and cleanup. Returns nowEpochMs alongside remainingMs/error to keep opening and expiry separate. Clock continues after remainingMs reaches zero.
- Used existing Node test runner and react-dom; added jsdom as a dev-only dependency to mount and test the real hook without a browser. No deprecated React test renderer used.
- Updated README and Task 04 status. Hook is ready for the next drop-card UI; not yet imported into App, so production bundle does not exercise it.

Files changed: src/lib/drop.js, src/hooks/usePubgAirdropTimer.js, tests/drop.test.js, tests/timer-hook.test.js, package.json, package-lock.json, README.md, task_decomposition.md and PROMPT_LOG.md.

Actual verification:

- PASS: `npm.cmd test` — 13 tests, 13 passed, 0 failed. Eight existing fixture tests, four pure drop-utility tests, one React hook/jsdom integration test with multiple lifecycle assertions.
- Pure checks cover before/at opening and expiry, phase precedence for zero stock, invalid timing/stock, delayed clock snapshots, offsets, clamping and duration formatting.
- Hook/jsdom check uses controlled Date.now and captured interval callbacks (no real waits): delayed callback, immediate target/offset and offset-only changes, hidden/visible events, invalid target recovery, continuing clock after zero, StrictMode single-resource ownership and unmount cleanup.
- PASS: `npm.cmd run build` — Vite 8.3.8, 18 modules transformed, exit 0.
- NOT VERIFIED: real-browser visibility/throttling, rendered countdown UI and accessibility. jsdom dispatches controlled visibility events; it does not emulate actual background-tab scheduling. No lint script exists.
- User explicitly authorized commit. Relevant changes are reviewed/staged without dependencies, cache or dist.
- Commit reference: the commit containing this entry, titled `feat: implement timestamp countdown and drop phases`; hash obtained from Git history after creation.

## 2026-11-12 — Responsive airdrop cards

Exact prompt received (literal escapes retained):

```text
Build DropCard and the airdrop section using existing data and timer utilities.\
\
Display:\
\- Drop title.\
\- VND price formatted through Intl.NumberFormat('vi-VN').\
\- Stock.\
\- Current phase.\
\- Opening countdown before launch and expiry countdown afterward.\
\- A native claim button.\
\
Requirements:\
\- Use semantic article, heading, and definition-list elements where appropriate.\
\- Provide clear text for every phase.\
\- Keep claim buttons disabled until claim integration is implemented.\
\- Do not announce countdown ticks through an aria-live region.\
\- Provide visible focus and readable contrast.\
\- Do not communicate phase through color alone.\
\- At 375px, cards and controls must fit without page-level horizontal overflow.\
\
Run the production build. Inspect keyboard navigation and responsive layout if browser tools are available; otherwise mark those checks as pending.\
\
Update PROMPT_LOG.md and commit:\
feat: build responsive airdrop cards
```

Work performed:

- Reviewed rules, existing App/CSS, timer and pure utilities. Initial Git status clean.
- Added DropCard with article/h3/dl, useId associations, vi-VN VND prices, confirmed stock, text for all four phases, and opening-versus-expiry countdown from one hook clock sample. Invalid data displays an inline error; all claim buttons remain natively disabled with explanatory text.
- Connected cards to App's existing fixtures and added mobile-first grid, wrapping, readable dark-theme text and controls. Countdown is not a live region. Existing visible focus/skip link retained; no animation introduced.
- Updated task progress and README. No claim behavior implemented.

Files changed: src/components/DropCard.jsx, src/App.jsx, src/index.css, task_decomposition.md, README.md, PROMPT_LOG.md.

Actual verification:

- PASS: `npm.cmd test` — 13/13 existing pure/fixture/hook-jsdom tests. These do not independently test DropCard rendering.
- PASS: `npm.cmd run build` — Vite 8.3.8, 21 transformed modules, exit 0; timer/card now included in application.
- PASS: headless Edge via existing Homework 2 Playwright installation against Homework 3 Vite server on localhost:5177. At 375x812, document scrollWidth <= innerWidth and all card/button bounds within viewport. At 1280x800, cards occupy two columns.
- PASS: real browser Tab focused visible skip link (3px outline); Enter moved focus to main. Both claim controls were native disabled buttons. No card aria-live/status regions and no pageerror events.
- PASS: controlled browser clock advanced 31 seconds then another 330 seconds: initial live/upcoming fixtures transitioned to live and then both expired. Phase attributes were asserted; text for each phase/deadline reviewed in source. LOOTED_OUT and invalid-data card rendering were not exercised in the browser during this check.
- Tooling correction: first browser-check script passed through PowerShell stdin lost Vietnamese regex encoding and failed to parse before launching. Repeated using ASCII phase-attribute assertions; all checks passed. No application defect observed from that tooling issue.
- NOT VERIFIED: full WCAG audit, Lighthouse score, screen-reader output, all keyboard paths and other browser engines. No lint script exists.
- Commit explicitly authorized. Relevant working/staged diffs checked; generated files excluded. Commit reference: commit containing this entry, titled `feat: build responsive airdrop cards`.

## 2026-11-12 — Branch organization

Actual user messages received after the card commit:

```text
nãy g mình ch commit vào 1 folder riêng tên Homework 3 trên github
```

```text
tôi muốn mình commit ra 1 folder Homework 3 riêng, đừng dính j tới các bài còn lại
```

Clarification answer received:

```text
Tạo branch Homework-3 trong repository hiện tại
```

- User chose a separate branch in the existing repository, rather than a new repository.
- Initial working tree clean; only Homework-2 and master branches existed.
- Created and switched to Homework-3 at a909a71, preserving all existing files and history. Homework-2 was not moved or rewritten; previous commits remain shared history.
- This log update is left uncommitted for the next authorized commit. No push performed.

### Separate prior Homework 3 commits from Homework-2

Exact subsequent user messages:

```text
lịch sử trc đó từ lúc làm prompt đầu để làm project Homework 3 thì bạn đưa vào folder homework 3 đi
```

After clarification that this means removing Homework 3 commits from the local
Homework-2 branch while keeping them on Homework-3, the user confirmed:

```text
đúng r
```

- Verified the first Homework 3 commit is 19bbab4 and its parent is 4a16fa4.
- Moved only the local Homework-2 branch pointer back to 4a16fa4. Current branch Homework-3 retains all five Homework 3 commits through a909a71.
- Working files and existing uncommitted log changes preserved. No remote push or remote history changes performed. This additional log entry remains uncommitted.

## 2026-11-12 — Abortable idempotent mock claim service

Exact prompt received (literal escapes retained):

```text
Implement an isolated in-browser mock claim service.\
\
Requirements:\
\- Keep authoritative stock separate from React display state.\
\- Support explicit Success, 409 Conflict, and Network error scenarios.\
\- Use configurable latency with AbortSignal support.\
\- Handle an already-aborted signal.\
\- Remove timers and abort listeners on every settle path.\
\- Validate the drop's opening time, expiry, and stock after the delay.\
\- Perform final validation and stock mutation atomically without awaiting between them.\
\- Return authoritative remainingStock on success.\
\- Return authoritative stock on 409 when available.\
\- Make repeated or concurrent successful requests with the same claimId and dropId deduct stock at most once.\
\- Reject claimId reuse for a different drop.\
\- Reject unknown drops and claims completed after expiry.\
\- Provide a fresh service instance for each reset session.\
\
Document that abort before mutation cancels this mock operation, while aborting a real HTTP request would not guarantee server rollback.\
\
Test success, last-item contention, duplicate claim IDs, conflict, network failure, expiry during latency, and cancellation.\
\
Update PROMPT_LOG.md, run relevant checks and the build, and commit:\
feat: add abortable idempotent mock claim service
```

Work performed:

- Reviewed rules, contracts, drop utilities and Task 06. Current branch Homework-3; preserved prior uncommitted branch-organization log entries and included them in this authorized commit.
- Added api/mockApi.js with private cloned inventory, request validation, configured latency, AbortSignal cancellation, centralized timer/listener cleanup, and synchronous post-delay eligibility/mutation/cache handling.
- Added claim-ID/drop bindings and immutable successful result cache. Concurrent duplicates own separate cancellation; only the first successful completion deducts. Successful cached retries return original results even after expiry. Failed attempts may retry the same drop; different-drop reuse is rejected.
- Added createDemoSession to generate fresh data/service together. Existing sessions are not reset in place. UI abort/remount and claim integration remain future work; disabled card buttons unchanged.
- Added 12 Node service tests and README semantics; marked Task 06 complete. No observed application defect to audit in this task.

Files changed: src/api/mockApi.js, tests/mockApi.test.js, README.md, task_decomposition.md and PROMPT_LOG.md (including prior branch-log updates).

Actual verification:

- PASS: `npm.cmd test` — 25 tests passed, 0 failed (12 new service checks plus 13 existing checks).
- New tests cover delayed success, detached stock, last-item contention, repeated/concurrent IDs, cross-drop ID rejection, explicit 409/network modes, retry, expiry at completion, opening at completion, unknown drops, already-aborted/mid-delay signals, independent duplicate cancellation, late abort, session isolation and invalid inputs/configuration.
- Every service test checks no remaining mock timer and no tracked abort listener at teardown. Controlled Date.now/captured timer callbacks avoid real delays.
- PASS: `npm.cmd run build` — Vite 8.3.8, 21 transformed modules, exit 0. Service is not imported into the UI yet; tests exercise it directly.
- NOT VERIFIED: service integration with React claiming/reset, real HTTP behavior or browser inventory concurrency; no production inventory claim made. No lint script exists.
- Reviewed working/staged diffs before commit. No push or further branch-history changes authorized/performed.
- Commit reference: commit containing this entry, titled `feat: add abortable idempotent mock claim service`; actual hash reported after creation.

## 2026-11-12 — Optimistic claims and conflict reconciliation

Exact prompt received (literal escapes retained):

```text
Implement useClaim and connect DropCard to the mock service.\
\
Requirements:\
\- Acquire an immediate per-drop ref lock before setting state or awaiting.\
\- Recheck current eligibility inside the click handler.\
\- Keep confirmed serverStock separate from the pending optimistic deduction.\
\- Calculate displayed stock as:\
&#x20; Math.max(0, serverStock - (pending ? 1 : 0)).\
\- Use unique claim IDs and an AbortController.\
\- Disable duplicate claims while pending.\
\- On success, reconcile authoritative stock.\
\- On 409, remove the pending deduction and apply authoritative error stock when available.\
\- On other failures, remove only the pending deduction.\
\- Never restore a stale whole-object snapshot.\
\- Never display negative stock.\
\- Do not treat speculative zero stock as confirmed LOOTED_OUT.\
\- Guard responses and finally blocks using request/session ownership.\
\- Abort requests on unmount and prevent obsolete state updates.\
\- Provide accessible pending, success, and error feedback.\
\
Test rapid double clicks, success, final-item success, 409 rollback, network failure/retry, and expiry while pending.\
\
Update PROMPT_LOG.md and record actual discovered defects in AI_FAILURE_AUDIT.md. Run relevant checks and the build, then commit:\
feat: implement optimistic claims and conflict reconciliation
```

Work performed:

- Reviewed existing service, timer, cards and rules; started clean on Homework-3.
- Added useClaim with synchronous ref lock, fresh eligibility validation, unique UUID/controller, separate confirmed stock/pending deduction, authoritative success/409 handling and ownership-safe finally/cleanup. Invalid responses cannot replace confirmed stock.
- Connected App's isolated service and card eligibility, optimistic stock and polite transport status. Countdown remains outside the live region. Added labeled scenario selector and reset button; session-version keys remount cards and abort old claims.
- Added seven hook integration tests using React StrictMode, jsdom, controlled Date.now and captured service timers. Updated README and task statuses; the user's combined prompt completes Tasks 07–08 together.
- Created AI_FAILURE_AUDIT.md: zero verified application defects discovered in this task, explicitly recording the shortfall from three rather than inventing defects or counting intentional mock errors.

Files changed: src/hooks/useClaim.js, src/components/DropCard.jsx, src/App.jsx, src/index.css, tests/claim-hook.test.js, README.md, task_decomposition.md, AI_FAILURE_AUDIT.md and PROMPT_LOG.md.

Actual verification:

- PASS: `npm.cmd test` — 32 tests, 32 passed, 0 failed (seven new hook tests plus 25 existing). Covers same-tick double clicks, last-item pending vs confirmed phase, success, 409, network/retry, expiry while pending, reset/unmount cancellation and stale success/finally unable to alter newer operation.
- PASS: `npm.cmd run build` — Vite 8.3.8, 23 modules transformed, exit 0; service/hook now included in production app.
- PASS: headless Edge using existing sibling Playwright against local Vite server, viewport 375x812, controlled clock: pending disables button and displays 23 while confirmed stock starts at 24; success confirms 23; network error rolls back deduction; Space activates retry; conflict reconciles to zero/LOOTED_OUT; reset restores fresh 24; reset during pending stays 24 after old delay.
- PASS: Edge found no page overflow, no countdown inside live/status region and no pageerror events. This is not a screen-reader or full accessibility audit.
- NOT VERIFIED: full WCAG, Lighthouse, other browser engines, production HTTP rollback. No lint script exists.
- Commit explicitly authorized; relevant working/staged diffs checked. No push. Commit reference: commit containing this entry, titled `feat: implement optimistic claims and conflict reconciliation`.

## 2026-11-12 — Scenario controls and safe demo reset

Exact prompt received (literal escapes retained):

```text
Add accessible demo controls for claim scenarios and session reset.\
\
Requirements:\
\- Provide a labeled selector for Success, 409 Conflict, and Network error.\
\- Snapshot the selected scenario when each request starts.\
\- Add Reset Demo.\
\- Reset must create fresh drop timestamps, stock, and a new mock service together.\
\- Abort or unmount old claim sessions.\
\- Ensure old responses cannot modify the new session.\
\- Clear old pending states and messages.\
\- Use stable session identity and appropriate React keys.\
\- Associate controls and labels using useId.\
\- Clearly explain that the controls simulate server outcomes.\
\
Test resetting while idle, while pending, after success, after conflict, and after expiry. Check StrictMode lifecycle behavior.\
\
Update PROMPT_LOG.md, run relevant checks and the production build, and commit:\
feat: add scenario controls and safe demo reset
```

Work performed:

- Started clean on Homework-3. Reused existing service factory, session-version keys and ownership/abort cleanup rather than recreating them.
- Extracted DemoControls with useId-associated label/help, three scenarios, explicit simulation/snapshot/reset explanation, Reset Demo button and polite reset confirmation. Reset keeps scenario selection while clearing card messages/pending through keyed remounts.
- Explicitly stored the selected scenario on each operation before dispatch. Scenario changes affect only subsequent claims.
- Moved fresh-session creation outside the state updater so the updater is pure during StrictMode checks.
- Added six hook tests for scenario snapshot and reset idle/pending/success/conflict/expired. Existing obsolete-response and cleanup tests remain in force.

Files changed: src/components/DemoControls.jsx, src/App.jsx, src/hooks/useClaim.js, tests/claim-hook.test.js, README.md and PROMPT_LOG.md.

Actual verification:

- PASS: `npm.cmd test` — 38 tests, 38 passed, 0 failed. Six new checks use React StrictMode/jsdom with controlled time and timer callbacks; every reset verifies empty message, idle status, no pending/timers, fresh stock/deadlines and successful next claim.
- PASS: `npm.cmd run build` — Vite 8.3.8, 24 transformed modules, exit 0.
- PASS: headless Edge via existing sibling Playwright, local Vite server, 375x812 and controlled clock: selector label/help association; selection changed during pending retains original success; next conflict uses new selection; reset idle/success/conflict/pending/expired clears card status and refreshes phases; Enter activates reset; no page overflow.
- NOT VERIFIED: full screen-reader/WCAG audit, Lighthouse and other browser engines. No lint script exists.
- User explicitly authorized commit; relevant diffs reviewed, generated files excluded. No push. Commit reference: the commit containing this entry, titled `feat: add scenario controls and safe demo reset`.
