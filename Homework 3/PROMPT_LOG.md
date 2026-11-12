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
