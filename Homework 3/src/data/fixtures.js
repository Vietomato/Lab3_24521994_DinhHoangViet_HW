/** All records below are simulated demo content, not official PUBG data. */
export const DEMO_NOTICE = 'Dữ liệu mô phỏng cục bộ; không liên kết chính thức với PUBG. Không có vé, G-Coin, thanh toán thật hoặc kết quả esports trực tiếp.';

/** @type {ReadonlyArray<Readonly<import('../contracts.js').PubgVnSquadStanding>>} */
export const standings = Object.freeze([
  { squadId: 'demo-te', squadName: 'The Expendables', wwcdCount: 4, placementPts: 72, killPts: 98 },
  { squadId: 'demo-ces', squadName: 'Cerberus Esports', wwcdCount: 3, placementPts: 68, killPts: 104 },
  { squadId: 'demo-roy', squadName: 'Roy Esports', wwcdCount: 2, placementPts: 54, killPts: 77 },
  { squadId: 'demo-agg', squadName: 'AGG', wwcdCount: 1, placementPts: 41, killPts: 65 },
].map(Object.freeze));

/**
 * Fresh session data with stable drop identities. Same now => identical values.
 * The VIP drop opens 5 seconds before now and expires 5 minutes afterward;
 * the crate opens after 30 seconds and expires after 6 minutes.
 * @param {number} now Finite epoch milliseconds supplied by the session owner.
 * @returns {import('../contracts.js').PubgCrateDrop[]}
 */
export function createDrops(now) {
  if (!Number.isFinite(now) || Math.abs(now) > 8.64e15 - 360_000) {
    throw new TypeError('Thời gian khởi tạo demo không hợp lệ.');
  }
  return [
    {
      id: 'demo-pvs-vip', title: 'PVS Finals VIP Ticket — Mô phỏng',
      priceVnd: 1_200_000, remainingStock: 24,
      dropEpochMs: now - 5_000, expiresEpochMs: now + 300_000,
    },
    {
      id: 'demo-gcoin-crate', title: 'G-Coin Crate — Mô phỏng',
      priceVnd: 250_000, remainingStock: 80,
      dropEpochMs: now + 30_000, expiresEpochMs: now + 360_000,
    },
  ];
}

/**
 * Programmatic fixture, created once outside React rendering. Players are
 * fictional; victim belongs to a different squad. No random IDs or real feed.
 * @type {ReadonlyArray<Readonly<import('../contracts.js').KillEvent>>}
 */
export const killEvents = Object.freeze(Array.from({ length: 1_200 }, (_, index) => {
  const attackerSquad = standings[index % standings.length];
  const victimSquad = standings[(index + 1 + Math.floor(index / 4) % 3) % standings.length];
  return Object.freeze({
    id: `demo-kill-${String(index + 1).padStart(5, '0')}`,
    squadId: attackerSquad.squadId,
    attacker: `${attackerSquad.squadId}-player-${1 + Math.floor(index / 4) % 4}`,
    victim: `${victimSquad.squadId}-player-${1 + index % 4}`,
    weapon: ['M416', 'Beryl M762', 'Mini14', 'AWM', 'AKM'][index % 5],
  });
}));
