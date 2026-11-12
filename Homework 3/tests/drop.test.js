import test from 'node:test';
import assert from 'node:assert/strict';
import { getDropPhase, getTimerSnapshot, formatRemainingTime } from '../src/lib/drop.js';

const drop = { dropEpochMs: 1_000, expiresEpochMs: 2_000, remainingStock: 2 };

test('pure: phase boundaries and precedence use confirmed stock', () => {
  for (const [now, stock, phase] of [
    [999, 2, 'WARMUP'], [999, 0, 'WARMUP'], [1_000, 2, 'AIRDROP_LIVE'],
    [1_999, 2, 'AIRDROP_LIVE'], [1_000, 0, 'LOOTED_OUT'],
    [2_000, 2, 'EXPIRED'], [2_000, 0, 'EXPIRED'], [2_001, 2, 'EXPIRED'],
  ]) assert.equal(getDropPhase(drop, now, stock), phase);
});

test('pure: invalid phase input is never eligible', () => {
  for (const patch of [{ dropEpochMs: NaN }, { expiresEpochMs: Infinity },
    { expiresEpochMs: 1_000 }, { remainingStock: -1 }, { remainingStock: 0.5 }]) {
    assert.equal(getDropPhase({ ...drop, ...patch }, 1_500), null);
  }
  assert.equal(getDropPhase(null, 1_500), null);
  assert.equal(getDropPhase(drop, NaN), null);
});

test('pure: timestamp snapshots handle delayed refresh, offsets and invalid inputs', () => {
  assert.equal(getTimerSnapshot(10_000, 100, 1_000).remainingMs, 8_900);
  assert.equal(getTimerSnapshot(10_000, -100, 7_500).remainingMs, 2_600);
  assert.equal(getTimerSnapshot(10_000, 0, 20_000).remainingMs, 0);
  for (const args of [[NaN, 0, 0], [0, Infinity, 0], [0, 0, NaN], ['1000', 0, 0], [8.64e15 + 1, 0, 0]]) {
    const result = getTimerSnapshot(...args);
    assert.equal(result.remainingMs, null);
    assert.equal(result.nowEpochMs, null);
    assert.ok(result.error);
  }
});

test('pure: formatting handles fractional seconds, long durations and invalid input', () => {
  assert.equal(formatRemainingTime(1), '00:00:01');
  assert.equal(formatRemainingTime(3_600_000), '01:00:00');
  assert.equal(formatRemainingTime(90_000_000), '25:00:00');
  assert.equal(formatRemainingTime(0), '00:00:00');
  assert.equal(formatRemainingTime(NaN), '—');
  assert.equal(formatRemainingTime(-1), '—');
});
