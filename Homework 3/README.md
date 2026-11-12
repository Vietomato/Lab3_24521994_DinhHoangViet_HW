# PUBG Vietnam Airdrop Arena

Local React 19 + Vite + JavaScript demo. No official PUBG affiliation, real
payments, inventory service or live esports results.

## Run

Use Node.js 22.12+ (or 24 LTS) and npm. From `Homework 3`:

```sh
npm ci
npm run dev
npm run build
npm run preview
```

On Windows PowerShell with restricted script execution, use `npm.cmd`.

Current scope: semantic application shell and demo notices. Drop fixtures,
countdowns, claims, standings and virtual feed are pending. There is currently
no lint or test script. Browser accessibility and 375px layout are not verified.

`src/contracts.js` holds JSDoc contracts. Feature folders are `components/`,
`hooks/`, `api/`, `data/` (fixtures), and `lib/` (pure utilities).
