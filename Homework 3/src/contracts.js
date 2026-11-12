/**
 * Domain contracts for the local PUBG Vietnam Airdrop Arena demo.
 * These definitions describe validated data; they do not perform validation.
 * IDs and human-readable strings must be nonempty after trimming. Record IDs
 * must be stable and unique within their collection. Invalid input must result
 * in an inline error with claiming disabled, never an assumed eligible phase.
 *
 * @typedef {'WARMUP' | 'AIRDROP_LIVE' | 'LOOTED_OUT' | 'EXPIRED'} DropPhase
 */

/**
 * A local demo drop. Prices are finite nonnegative VND numbers; stock is a
 * nonnegative integer. Both timestamps are finite epoch milliseconds, with
 * expiresEpochMs strictly greater than dropEpochMs.
 *
 * Phase precedence using now = Date.now() + serverOffsetMs and confirmed stock:
 * EXPIRED at/after expiry; otherwise WARMUP before opening; otherwise
 * LOOTED_OUT at zero confirmed stock; otherwise AIRDROP_LIVE.
 *
 * @typedef {Object} PubgCrateDrop
 * @property {string} id
 * @property {string} title
 * @property {number} priceVnd
 * @property {number} remainingStock Confirmed authoritative stock, not optimistic stock.
 * @property {number} dropEpochMs Opening deadline.
 * @property {number} expiresEpochMs Explicit extension defining the expiry boundary.
 */

/**
 * Demo squad statistics. All counts and points are nonnegative integers.
 * Selectors must preserve source data and use squadId to break metric ties.
 *
 * @typedef {Object} PubgVnSquadStanding
 * @property {string} squadId
 * @property {string} squadName
 * @property {number} wwcdCount
 * @property {number} placementPts
 * @property {number} killPts
 */

/**
 * One deterministic demo feed event; squadId references a known demo squad.
 *
 * @typedef {Object} KillEvent
 * @property {string} id Stable unique event ID, also used as the React key.
 * @property {string} squadId
 * @property {string} attacker
 * @property {string} victim
 * @property {string} weapon
 */

/**
 * Explicit deterministic service modes, displayed as Success, 409 Conflict,
 * and Network error. Reject values outside this union.
 * @typedef {'success' | 'conflict' | 'network-error'} ClaimScenario
 */

/**
 * One-item claim. Latency is configured on the service (finite, nonnegative
 * milliseconds). The service delays, then checks opening, expiry and stock
 * immediately before an atomic deduction with no intervening await.
 *
 * A successful claimId is bound to its dropId. Repeated or concurrent requests
 * with that pair deduct at most once; reuse for another drop is rejected.
 * Abort before mutation cancels this mock operation. Expiry while waiting
 * rejects the claim. Real HTTP abort does not guarantee server-side rollback.
 *
 * @typedef {Object} ClaimRequest
 * @property {string} dropId
 * @property {string} claimId Unique operation ID within the demo session.
 * @property {ClaimScenario} scenario
 * @property {AbortSignal} signal Signal owned by this operation's controller.
 */

/**
 * Successful authoritative result, cached for idempotent retries.
 * @typedef {Object} ClaimResponse
 * @property {string} claimId Matches the request's claimId.
 * @property {number} remainingStock Authoritative nonnegative integer after claiming.
 */

/**
 * Error-shaped failure contract. Transport failures and aborts need no HTTP
 * status. An abort uses name='AbortError'. A 409 may supply authoritative stock;
 * validate that stock before reconciliation. Every message is readable text.
 *
 * @typedef {Object} ClaimError
 * @property {string} message
 * @property {string} [name]
 * @property {number} [status] Integer HTTP-style error status when applicable.
 * @property {number} [remainingStock] Optional authoritative nonnegative integer.
 */

/**
 * Claim UI ownership policy:
 * - Acquire the per-drop ref lock synchronously before state changes/await.
 * - Keep confirmed serverStock separate from the one-item pending deduction.
 * - displayedStock = Math.max(0, serverStock - (pending ? 1 : 0)).
 * - Reconcile success/409 from authoritative stock; other errors only remove
 *   this operation's deduction, without restoring an old object snapshot.
 * - Only the owning request/session may update state or release its lock.
 * - Reset creates fresh timestamps and a fresh service together, aborting and
 *   remounting old card sessions. Unmount also aborts owned requests.
 */

export {};
