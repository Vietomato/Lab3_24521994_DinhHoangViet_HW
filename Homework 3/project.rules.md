# PUBG Vietnam Airdrop Arena — Project Rules

## 1. Scope

Build a React 19 + Vite + JavaScript demonstration featuring ticket/G-Coin drops, timestamp countdowns, optimistic claims with 409 reconciliation, squad standings, and a virtualized kill feed. Use JSDoc contracts rather than requiring a TypeScript migration.

Use deterministic local mock data and an in-browser mock service. No PUBG API, credentials, payment integration, login, or backend is required. Label data and simulated updates as demo content; do not claim official affiliation or real-time esports results.

Read this file, task_decomposition.md, and existing AGENTS.md instructions before implementation. Preserve unrelated work and reuse the repository's package manager and configuration.

## 2. Domain contracts

Define JSDoc before feature generation:

| Contract | Required fields |
| --- | --- |
| DropPhase | WARMUP, AIRDROP_LIVE, LOOTED_OUT, EXPIRED |
| PubgCrateDrop | id, title, priceVnd, remainingStock, dropEpochMs |
| Expiry extension | expiresEpochMs, explicitly added so EXPIRED has a defined boundary |
| PubgVnSquadStanding | squadId, squadName, wwcdCount, placementPts, killPts |
| KillEvent | stable id, squadId, attacker, victim, weapon |
| ClaimRequest | dropId, claimId, deterministic scenario, AbortSignal |
| ClaimResponse | claimId, remainingStock; authoritative stock |
| ClaimError | status when applicable, readable message, optional authoritative remainingStock |

Validate finite timestamps, nonnegative integer stock, prices, allowed scenarios, and identifiers. Expiry must be after opening. Invalid data must produce a safe inline error rather than an enabled claim button.

Include The Expendables, Cerberus Esports, Roy Esports, and AGG as demo squads. Give every record a stable unique ID. Generate a large deterministic kill-feed fixture rather than hardcoding hundreds of elements.

## 3. React and state

- Use function components, Hooks, immutable updates, and stable record IDs as keys.
- Do not use class-based React components, ReactDOM.render, component defaultProps, KeyboardEvent.keyCode, window.alert, or unsafe HTML injection.
- Derive phase, filtered lists, and sorted lists from current inputs. Do not synchronize derived copies through useEffect.
- Never mutate source standings with Array.sort; copy first or use toSorted.
- Use deterministic sorting tie-breakers such as squadId.
- Use refs for immediate request locks and controller ownership, not as replacements for rendered state.
- Keep components, timer logic, pure selectors, and mock service separate without unnecessary abstractions.
- Every effect-owned timer, listener, or request must have cleanup and tolerate React StrictMode setup/cleanup/remount.

## 4. Clock and drop phases

Implement usePubgAirdropTimer(targetEpochMs, serverOffsetMs = 0). Calculate remaining time as:

```js
Math.max(0, targetEpochMs - (Date.now() + serverOffsetMs))
```

Never implement countdown by subtracting one from previous state. A timer only refreshes display; each refresh recalculates from the clock. Refresh immediately on target/offset change and when document.visibilityState becomes visible. Clean up interval and visibilitychange listener.

Derive phases in this exact order from current time and confirmed server stock:
1. EXPIRED when now >= expiresEpochMs.
2. WARMUP when now < dropEpochMs.
3. LOOTED_OUT when confirmed stock is zero.
4. AIRDROP_LIVE otherwise.

Opening and expiry are separate deadlines. Do not treat remainingMs === 0 as proof that a drop remains live indefinitely. Display whether the countdown means opening or expiry. A timestamp approach avoids accumulated callback drift but still depends on the client clock and configured offset; do not claim immunity to device-clock changes.

## 5. Mock service

Create a new isolated service per demo session with independent authoritative stock. Expose claim and any read/reset helpers needed by the UI.

- Provide explicit Success, 409 Conflict, and Network error scenarios with configurable latency.
- Delay first; then validate current server time and stock and perform the stock deduction atomically, with no await between final validation and mutation.
- Cache completed claims by claimId and dropId. Reusing a successful ID for the same drop returns its result without another deduction; reject inconsistent ID reuse. Concurrent duplicate requests must also deduct at most once.
- Reject unknown drops, closed drops, and unavailable stock.
- A deterministic 409 scenario may simulate another claimant exhausting stock; return the resulting authoritative count.
- Abort before mutation cancels this mock operation. Clean up timer and abort listener on every settle path, including an already-aborted signal.
- Do not imply that aborting an actual HTTP request guarantees server-side rollback. This implementation is an in-browser simulation, not cross-browser inventory protection.

## 6. Optimistic claim and reconciliation

Use one in-flight operation per drop. Acquire a ref lock synchronously before setting React state or awaiting; a disabled button alone does not prevent same-tick duplicate requests.

Keep confirmed serverStock separate from pending optimistic deduction. For a one-item claim:

```js
const displayedStock = Math.max(0, serverStock - (pending ? 1 : 0));
```

Claim only when the confirmed phase is AIRDROP_LIVE, confirmed stock is positive, and no request is pending. Recheck time inside the handler. Use a unique claimId and AbortController.

- Success: reconcile confirmed stock from the response, then clear pending.
- 409: clear the pending deduction and use authoritative error stock when provided.
- Other failures: clear only this operation's deduction; do not blindly restore an old whole-object snapshot.
- Never allow negative stock. Keep pending feedback distinct from LOOTED_OUT: optimistic zero does not prove confirmed sellout.
- Use request/session ownership to ignore obsolete responses and prevent old finally blocks from clearing newer locks or state.
- Abort on unmount. Reset must abort/remount old card sessions and create fresh data and service together.
- The mock validates eligibility at completion. A claim that expires while pending must fail according to the documented expiry policy; no silent late success.

## 7. Leaderboard and virtual kill feed

Leaderboard: filter by squad name; sort WWCD, placement points, and kill points in both directions. Trim search text, handle no results, and preserve original data. Use semantic table headers and associated control labels.

Kill feed: filter first, then compute a virtual window using fixed row height, viewport height, scrollTop, and overscan. Render only visible rows plus overscan; create total scroll height separately. Clamp window bounds and reset DOM scroll position and state when changing filters. Keep text within the documented row height so offsets remain correct. Use stable event IDs, meaningful list semantics, a keyboard-focusable labeled viewport, and an empty-result state. Avoid making recycled rows interactive unless focus preservation is handled.

Live-looking updates may be simulated with a cleaned-up timer. A manual refresh action is acceptable when clearly labeled; no external stream is required. Do not flood aria-live with feed events.

## 8. Accessibility and responsive design

- Use main, header, section, article, headings, dl, table, lists, and native buttons as appropriate.
- Associate inputs/selects with labels using useId. Use native disabled states and readable pending/error feedback.
- Announce claim/transport status politely; do not announce the countdown every tick.
- Provide visible focus, readable contrast, and text/icons in addition to status colors.
- Support Tab, Enter, and Space and respect prefers-reduced-motion.
- At 375px, cards and controls reflow with no page-level horizontal overflow. A table wrapper may scroll independently.
- Target WCAG 2.2 AA and Lighthouse Accessibility 100. A score alone is not proof of complete compliance.
- Format priceVnd through Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).

## 9. Verification and documentation

Run the production build after meaningful implementation changes. Run existing lint and relevant tests. Prioritize phase boundaries, delayed countdown refresh, abort cleanup, idempotency, double clicks, last-item claims, 409 reconciliation, expiry while pending, reset races, immutable selectors, and virtual window bounds.

Use controlled clocks/fake timers where supported to avoid flaky long waits. Distinguish pure logic tests from browser interaction checks. Report PASS, FAIL, or NOT VERIFIED with real evidence; never fabricate scores, screenshots, performance claims, or test results.

Maintain README.md, PROMPT_LOG.md, and AI_FAILURE_AUDIT.md. Audit at least three actual verified AI defects if found, including reproduction, cause, fix, and evidence. If fewer exist, record the shortfall rather than inventing defects. Prompt logs contain actual interactions only, not planned prompts presented as completed history.

## 10. Git workflow

Use contract-first tasks and at least 10 meaningful atomic commits; the plan proposes 11 grouped into ten implementation prompts. These files start as plans, not completed work.

Default to user-reviewed manual commits. If a prompt explicitly delegates automatic commits, commit each verified subtask separately. This authorization does not authorize pushing or rewriting history.

Review git status, git diff, and git diff --cached. Stage only relevant files. Exclude node_modules, dist, local secrets, and temporary files. Never create empty commits or fictional history to meet a count. If two initial documents already share a commit, count it once and add later commits only for real work.
