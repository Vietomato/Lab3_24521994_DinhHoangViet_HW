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
interactive standings and virtual feed are pending. Full browser accessibility
verification remains pending; limited card checks are recorded below.

Drop cards now connect the timer to semantic articles and definition lists,
showing VND prices, confirmed demo stock, phase text and an opening or expiry
countdown. Claim buttons are natively disabled until claim integration exists;
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
