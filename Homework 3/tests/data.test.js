import test from 'node:test';
import assert from 'node:assert/strict';
import { createDrops, standings, killEvents } from '../src/data/fixtures.js';
import { validateFixtures } from '../src/lib/validateFixtures.js';

const now = 1_800_000_000_000;
const fixture = () => ({ drops: createDrops(now), standings, killEvents });

test('fixtures are valid with four required squads and 1,200 unique events', () => {
  assert.deepEqual(validateFixtures(fixture()), []);
  assert.deepEqual(standings.map((s) => s.squadName), ['The Expendables', 'Cerberus Esports', 'Roy Esports', 'AGG']);
  assert.equal(killEvents.length, 1_200);
  assert.equal(new Set(killEvents.map((event) => event.id)).size, 1_200);
});

test('same clock gives deterministic drops; reset shifts both deadlines with isolated stock', () => {
  const first = createDrops(now);
  assert.deepEqual(first, createDrops(now));
  const reset = createDrops(now + 60_000);
  first.forEach((drop, i) => {
    assert.equal(reset[i].id, drop.id);
    assert.equal(reset[i].dropEpochMs - drop.dropEpochMs, 60_000);
    assert.equal(reset[i].expiresEpochMs - drop.expiresEpochMs, 60_000);
  });
  first[0].remainingStock = 0;
  assert.equal(reset[0].remainingStock, 24);
});

test('one drop is initially live, the other opens shortly afterward, both expire later', () => {
  const [vip, crate] = createDrops(now);
  assert.ok(vip.dropEpochMs <= now && now < vip.expiresEpochMs && vip.remainingStock > 0);
  assert.equal(crate.dropEpochMs - now, 30_000);
  assert.ok(crate.expiresEpochMs > crate.dropEpochMs);
});

test('feed generation is reproducible across module evaluations with immutable records', async () => {
  const again = await import('../src/data/fixtures.js?determinism');
  assert.deepEqual(again.killEvents, killEvents);
  assert.ok(Object.isFrozen(killEvents) && killEvents.every(Object.isFrozen));
  assert.ok(Object.isFrozen(standings) && standings.every(Object.isFrozen));
});

test('invalid clocks are rejected', () => {
  for (const value of [NaN, Infinity, -Infinity, '123', undefined, 8.64e15, -8.64e15]) {
    assert.throws(() => createDrops(value), TypeError);
  }
});

test('validation rejects duplicate and missing IDs in every collection', () => {
  for (const [key, id] of [['drops', 'id'], ['standings', 'squadId'], ['killEvents', 'id']]) {
    const data = fixture();
    data[key] = [{ ...data[key][0] }, { ...data[key][0] }];
    assert.ok(validateFixtures(data).length > 0);
    data[key] = [{ ...data[key][0], [id]: ' ' }];
    assert.ok(validateFixtures(data).length > 0);
  }
});

test('validation rejects bad stock, prices, timestamps and expiry boundaries', () => {
  for (const patch of [
    { remainingStock: -1 }, { remainingStock: 1.5 }, { priceVnd: -1 },
    { priceVnd: NaN }, { dropEpochMs: Infinity }, { expiresEpochMs: now - 5_000 },
    { expiresEpochMs: now - 6_000 }, { title: '' },
  ]) {
    const data = fixture();
    Object.assign(data.drops[0], patch);
    assert.ok(validateFixtures(data).length > 0, JSON.stringify(patch));
  }
});

test('validation rejects broken references, malformed collections and invalid points', () => {
  for (const patch of [
    { killEvents: [{ ...killEvents[0], squadId: 'unknown' }] },
    { killEvents: [{ ...killEvents[0], victim: killEvents[0].attacker }] },
    { standings: [{ ...standings[0], killPts: -1 }] },
    { drops: null }, { killEvents: [null] },
  ]) assert.ok(validateFixtures({ ...fixture(), ...patch }).length > 0);
});
