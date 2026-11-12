# PUBG Vietnam Airdrop Arena

Local React 19 + Vite + JavaScript demo. No official PUBG affiliation, real
payments, inventory service or live esports results.

## Run

Use Node.js 22.12+ (or 24 LTS) and npm. From `Homework 3`:

```sh
npm ci
npm run dev
npm run build
npm test
npm run preview
```

On Windows PowerShell with restricted script execution, use `npm.cmd`.

Current scope: semantic shell, demo notices and deterministic local fixtures.
`createDrops(now)` creates a VIP ticket drop open since 5 seconds before `now`,
expiring after 5 minutes, and a G-Coin crate opening after 30 seconds, expiring
after 6 minutes. Each call returns fresh records and stock; identical inputs
produce identical data. A future session reset must create data and service
together; a reset UI is not implemented yet.

Four squads have fictional points; 1,200 fictional kill events are generated
once outside rendering with stable IDs. These points are sample standings, not
an aggregate of the independent feed fixture. All inventory and prices are
simulated. No external API, credentials, backend or payment integration is used.

`npm test` uses Node's built-in runner to verify fixture validity, reset timing,
determinism and invalid-data rejection. No lint script exists. Claim service,
Full browser accessibility
verification remains pending; limited card checks are recorded below.

Drop cards now connect the timer to semantic articles and definition lists,
showing VND prices, confirmed demo stock, phase text and an opening or expiry
countdown. Claim buttons are enabled only for eligible live drops without a pending claim;
countdown updates are outside live regions. Cards reflow to one column on mobile
and two on wider screens. Edge checks verified no page overflow at 375px,
desktop columns, skip-link Tab/Enter focus and warmup/live/expired transitions.
This is limited verification, not a complete accessibility or Lighthouse audit.

## Timer and phase utilities

`usePubgAirdropTimer(targetEpochMs, serverOffsetMs = 0)` returns
`{ nowEpochMs, remainingMs, error }`. It recalculates from `Date.now() + offset`
every 250ms, immediately on input changes and when the document becomes visible.
Cleanup removes the interval/listener. Invalid inputs return null times and
readable error text. It continues refreshing after zero so a caller can derive
both opening and expiry from `nowEpochMs`; DropCard uses that shared clock.
Timestamp arithmetic avoids accumulated callback drift but still depends on
the device clock and configured offset.

`getDropPhase(drop, nowEpochMs, confirmedStock)` returns EXPIRED at expiry,
otherwise WARMUP before opening, otherwise LOOTED_OUT at zero confirmed stock,
otherwise AIRDROP_LIVE. Invalid timing/stock returns null, which callers must
display as an error with claiming disabled. Optimistic stock is not phase input.
`formatRemainingTime` formats a duration separately from phase determination.

Tests distinguish pure utilities from an actual React hook mounted with
react-dom in jsdom. The latter controls Date.now, timer callbacks and visibility
to verify delayed refresh, prop changes, StrictMode and cleanup; it is not a
real-browser background-tab or accessibility check.

`src/contracts.js` holds JSDoc contracts. Feature folders are `components/`,
`hooks/`, `api/`, `data/` (fixtures), and `lib/` (pure utilities).

## Local mock claim service

`createMockClaimService(drops, { latencyMs: 800 })` clones inventory into a
private per-instance map. `claim({ dropId, claimId, scenario, signal })` accepts
`success`, `conflict` or `network-error`; `readDrops()` returns detached copies.
Latency is configurable from 0 to 2147483647 integer milliseconds. After the
delay, opening/expiry/stock checks and deduction run synchronously. Expiry at
completion rejects with 410; unknown drops use 404, warmup/sellout use 409.
The conflict scenario simulates another claimant exhausting stock and reports
authoritative zero; network failure leaves stock unchanged.

Claim IDs are bound to one drop for the lifetime of the service, including
failed attempts. Same-drop failed attempts may retry. Completed successes are
cached; repeated/concurrent successful requests return the original frozen
result and deduct at most once. A cached successful retry returns its original
stock snapshot even after expiry; new operations must pass current eligibility.
Each duplicate caller owns its own delay and cancellation.

An already-aborted signal rejects immediately. Abort before mutation cancels
this mock operation; abort after success does not undo it. Aborting a real HTTP
request would not guarantee server rollback. Timers and abort listeners are
removed on completion/cancellation. This simulation provides no cross-browser
inventory protection or real transactions.

`createDemoSession(now, options)` creates fresh timestamps, stock and service
together. Future reset UI must abort old requests and remount old card sessions;
the helper does not cancel existing sessions automatically. App's reset now
creates a new session and remounts cards, whose cleanup aborts old operations.
Node service tests use controlled clocks,
captured timer callbacks and listener tracking, not real HTTP/browser tests.

## Optimistic claims

Choose Success, 409 Conflict or Network error in the labeled demo selector.
Each eligible claim synchronously locks its drop, rechecks the current clock,
creates a unique claim ID/AbortController and temporarily displays
`Math.max(0, serverStock - (pending ? 1 : 0))`. Confirmed stock stays separate;
speculative zero is not a confirmed sellout. Success applies authoritative stock,
409 applies authoritative error stock if valid, and other errors only remove
the pending deduction. No stale object snapshot is restored.

Request/session identity guards responses and finally blocks. Unmount/reset
aborts old operations and stale responses cannot clear a fresh session's lock.
Always remount a card when replacing its drop/session; App uses session-version
keys. Pending/success/error text is politely announced separately from countdown.

`npm test` includes seven claim hook/jsdom tests. Headless Edge checks cover
pending/success, network retry, keyboard Space, conflict sellout and reset while
pending at 375px. AI_FAILURE_AUDIT.md records the actual defect shortfall rather
than treating intentional simulated errors as defects.

DemoControls associates its selector label and explanatory text using useId.
It explicitly explains that these controls simulate server outcomes. A request
snapshots the scenario at start; changing selection affects only later claims.
Reset Demo retains the selected scenario, creates fresh drops/service together,
advances session-version keys, clears old card status/pending and politely
announces the new session. A scenario change alone does not remount cards.

The reset handler creates the session before calling the state updater; the
updater only combines it with the next version and remains pure under StrictMode.
Reset tests cover idle, pending, success, conflict and expired sessions in both
hook/jsdom checks and a headless Edge interaction check. Full screen-reader
verification remains pending.

## Squad leaderboard

The leaderboard filters trimmed case-insensitive squad names and sorts WWCD,
placement or kill points in either direction. Ties always use ascending squadId.
The pure selector filters into a fresh array before sorting; fixtures remain
unchanged. The component derives results during render, without effect-synced
copies. Controls use useId labels; table has a caption, row/column headers,
aria-sort, an empty-result row and a keyboard-focusable horizontal scroll region.

“Cập nhật điểm mô phỏng” adds a deterministic fictional scoring round on demand,
with immutable records and a polite confirmation. No update timer or external
stream is used. Reset Demo also resets leaderboard scores/search/sort through
the session key. Nine pure tests cover all metric/direction combinations, ties,
search/empty results, immutability and deterministic updates. Edge checked the
controls, keyboard refresh and 375px layout; a full accessibility audit is pending.

## Virtual kill feed

KillFeed filters the 1,200 deterministic events by squad before calculating a
window. Fixed geometry: row height 72px, viewport height 360px, overscan 3 rows
on each side. Each row contains two single-line blocks with 24px line-height,
10px vertical padding and a border; long text is ellipsized and remains in the
accessible text. CSS must preserve this geometry for correct offsets.

The pure window helper clamps scrollTop, returns start/end (exclusive), total
height and row offset. A separate spacer creates full scroll height; only the
slice is rendered as a semantic ul/li list with stable event IDs and
aria-posinset/aria-setsize. There are at most 12 rows for this geometry, not
1,200 CSS-hidden rows. Rows are not interactive. The viewport is labeled,
focusable and supports native keyboard scrolling without live announcements.

Changing filters resets both DOM scrollTop and React scroll state. No-result
data shows an empty message. Reset Demo remounts the feed too. Five pure tests
cover boundaries, huge/fractional offsets, filters and empty lists. Edge checks
verified first/last rows, bounded DOM, filter after scroll, 72px row geometry,
PageDown, empty component rendering and 375px no page overflow.
