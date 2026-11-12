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
