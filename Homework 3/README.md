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
determinism and invalid-data rejection. No lint script exists. Countdown,
claim service, interactive standings and virtual feed are pending. Browser
accessibility and 375px layout are not verified.

`src/contracts.js` holds JSDoc contracts. Feature folders are `components/`,
`hooks/`, `api/`, `data/` (fixtures), and `lib/` (pure utilities).
