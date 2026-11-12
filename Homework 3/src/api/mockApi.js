import { getDropPhase } from '../lib/drop.js';
import { validateFixtures } from '../lib/validateFixtures.js';
import { createDrops } from '../data/fixtures.js';

const scenarios = new Set(['success', 'conflict', 'network-error']);
const identifier = (value) => typeof value === 'string' && value.trim().length > 0;
const failure = (message, status, remainingStock) => Object.assign(new Error(message),
  status === undefined ? {} : { status }, remainingStock === undefined ? {} : { remainingStock });
const aborted = () => new DOMException('Mock claim cancelled before mutation.', 'AbortError');

/**
 * Isolated browser-local inventory, never React's display objects.
 * Abort before mutation cancels this mock operation; real HTTP abort would not
 * guarantee server rollback. No cross-browser or production stock protection.
 * @param {import('../contracts.js').PubgCrateDrop[]} drops
 * @param {{ latencyMs?: number }} options
 */
export function createMockClaimService(drops, { latencyMs = 800 } = {}) {
  const errors = validateFixtures({ drops, standings: [], killEvents: [] });
  if (errors.length) throw new TypeError(errors.join(' '));
  if (!Number.isInteger(latencyMs) || latencyMs < 0 || latencyMs > 2_147_483_647) {
    throw new TypeError('Latency must be an integer between 0 and 2147483647 milliseconds.');
  }
  const inventory = new Map(drops.map((drop) => [drop.id, { ...drop }]));
  const bindings = new Map();
  const completed = new Map();

  /** @param {import('../contracts.js').ClaimRequest} request */
  function claim(request) {
    // Snapshot request fields so caller mutation cannot change an operation.
    const { dropId, claimId, scenario, signal } = request ?? {};
    return new Promise((resolve, reject) => {
      if (!identifier(dropId) || !identifier(claimId) || !scenarios.has(scenario) ||
          !signal || typeof signal.aborted !== 'boolean' ||
          typeof signal.addEventListener !== 'function' || typeof signal.removeEventListener !== 'function') {
        reject(failure('Invalid claim request.', 400));
        return;
      }
      if (signal.aborted) { reject(aborted()); return; }
      if (bindings.has(claimId) && bindings.get(claimId) !== dropId) {
        reject(failure('Claim ID is already bound to a different drop.', 400));
        return;
      }
      bindings.set(claimId, dropId);
      let timer;
      let settled = false;
      const settle = (error, result) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        signal.removeEventListener('abort', onAbort);
        if (error) reject(error);
        else resolve(result);
      };
      const onAbort = () => settle(aborted());
      signal.addEventListener('abort', onAbort, { once: true });
      timer = setTimeout(() => {
        try {
          if (signal.aborted) throw aborted();
          // Successful retry returns its original result, even after expiry.
          // Each concurrent caller owns only its own cancellation/delay.
          if (completed.has(claimId)) { settle(null, completed.get(claimId)); return; }
          const drop = inventory.get(dropId);
          if (!drop) throw failure('Unknown drop.', 404);
          const phase = getDropPhase(drop, Date.now());
          if (phase === null) throw failure('Invalid server clock or inventory.', 400);
          if (phase === 'EXPIRED') throw failure('Drop expired before claim completion.', 410);
          if (phase === 'WARMUP') throw failure('Drop is not open yet.', 409, drop.remainingStock);
          if (phase === 'LOOTED_OUT') throw failure('Drop has no remaining stock.', 409, 0);
          if (scenario === 'network-error') throw failure('Simulated network error. Please retry.');
          if (scenario === 'conflict') {
            drop.remainingStock = 0;
            throw failure('Another simulated claimant exhausted the stock.', 409, 0);
          }
          // Final validation through mutation/cache is synchronous: no await.
          drop.remainingStock -= 1;
          const result = Object.freeze({ claimId, remainingStock: drop.remainingStock });
          completed.set(claimId, result);
          settle(null, result);
        } catch (error) { settle(error); }
      }, latencyMs);
    });
  }

  return Object.freeze({
    claim,
    /** Detached snapshots: callers cannot mutate authoritative inventory. */
    readDrops: () => [...inventory.values()].map((drop) => ({ ...drop })),
  });
}

/** Fresh data and a fresh isolated service must be created together on reset.
 * The UI must abort old requests/remount old cards when adopting a new session.
 */
export function createDemoSession(now = Date.now(), options = {}) {
  const drops = createDrops(now);
  return { drops, service: createMockClaimService(drops, options) };
}
