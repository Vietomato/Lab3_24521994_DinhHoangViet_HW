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
