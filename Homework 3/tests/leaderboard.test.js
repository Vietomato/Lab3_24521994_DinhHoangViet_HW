import test from 'node:test';
import assert from 'node:assert/strict';
import { selectStandings, simulateStandingsRound } from '../src/lib/leaderboard.js';
import { standings } from '../src/data/fixtures.js';

test('leaderboard: trimmed case-insensitive search, whitespace and empty results', () => {
  assert.deepEqual(selectStandings(standings, '  cErBeRuS  ').map((s) => s.squadId), ['demo-ces']);
  assert.equal(selectStandings(standings, '  ').length, 4);
  assert.deepEqual(selectStandings(standings, 'unknown'), []);
  assert.deepEqual(selectStandings([], ''), []);
});

for (const metric of ['wwcdCount', 'placementPts', 'killPts']) {
  for (const direction of ['asc', 'desc']) {
    test(`leaderboard: ${metric} ${direction} with ascending ID tie-breaker and immutable source`, () => {
      const rows = Object.freeze([
        Object.freeze({ squadId: 'c', squadName: 'C', [metric]: 2 }),
        Object.freeze({ squadId: 'b', squadName: 'B', [metric]: 1 }),
        Object.freeze({ squadId: 'a', squadName: 'A', [metric]: 1 }),
      ]);
      const before = structuredClone(rows);
      const result = selectStandings(rows, '', metric, direction);
      assert.deepEqual(result.map((s) => s.squadId), direction === 'asc' ? ['a', 'b', 'c'] : ['c', 'a', 'b']);
      assert.deepEqual(rows, before);
      assert.notEqual(result, rows);
      assert.ok(result.every((row) => rows.includes(row)));
    });
  }
}

test('leaderboard: demo metrics use distinct expected order and filter before sorting', () => {
  assert.equal(selectStandings(standings, '', 'wwcdCount')[0].squadId, 'demo-te');
  assert.equal(selectStandings(standings, '', 'placementPts')[0].squadId, 'demo-te');
  assert.equal(selectStandings(standings, '', 'killPts')[0].squadId, 'demo-ces');
  assert.deepEqual(selectStandings(standings, 'esports', 'killPts', 'asc').map((s) => s.squadId), ['demo-roy', 'demo-ces']);
});

test('leaderboard: simulated rounds are deterministic and preserve input records', () => {
  const before = structuredClone(standings);
  const next = simulateStandingsRound(standings, 1);
  assert.deepEqual(next, simulateStandingsRound(standings, 1));
  assert.deepEqual(standings, before);
  assert.equal(next[0].wwcdCount, standings[0].wwcdCount + 1);
  assert.ok(next.every((row, i) => row !== standings[i] && row.killPts > standings[i].killPts));
  assert.throws(() => simulateStandingsRound(standings, 0), TypeError);
  assert.throws(() => selectStandings(standings, '', 'bad'), TypeError);
});
