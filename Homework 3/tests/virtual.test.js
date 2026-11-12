import test from 'node:test';
import assert from 'node:assert/strict';
import { getVirtualWindow, filterKillEvents } from '../src/lib/virtual.js';
import { killEvents } from '../src/data/fixtures.js';

test('virtual: first and last windows, negative and huge offsets are clamped', () => {
  assert.deepEqual(getVirtualWindow({ count: 1_200, scrollTop: 0 }),
    { start: 0, end: 8, totalHeight: 86_400, offsetTop: 0, scrollTop: 0 });
  const last = getVirtualWindow({ count: 1_200, scrollTop: 1e12 });
  assert.equal(last.end, 1_200);
  assert.equal(last.start, 1_192);
  assert.equal(last.scrollTop, 86_040);
  assert.equal(getVirtualWindow({ count: 1_200, scrollTop: -99 }).start, 0);
});

test('virtual: empty and short lists never create out-of-range indexes', () => {
  assert.deepEqual(getVirtualWindow({ count: 0, scrollTop: 100 }),
    { start: 0, end: 0, totalHeight: 0, offsetTop: 0, scrollTop: 0 });
  assert.equal(getVirtualWindow({ count: 2, scrollTop: 999 }).end, 2);
});

test('virtual: arbitrary fractional offsets keep rendered count bounded', () => {
  for (let scrollTop = 0; scrollTop <= 90_000; scrollTop += 35.5) {
    const w = getVirtualWindow({ count: 1_200, scrollTop });
    assert.ok(w.start >= 0 && w.end <= 1_200 && w.start <= w.end);
    assert.ok(w.end - w.start <= 12);
    assert.equal(w.offsetTop, w.start * 72);
  }
});

test('virtual: filter first, correct fixture count and fresh window after filtering', () => {
  const before = structuredClone(killEvents);
  const filtered = filterKillEvents(killEvents, 'demo-ces');
  assert.equal(filtered.length, 300);
  assert.ok(filtered.every((event) => event.squadId === 'demo-ces'));
  const w = getVirtualWindow({ count: filtered.length, scrollTop: 0 });
  assert.equal(w.totalHeight, 21_600);
  assert.equal(filtered.slice(w.start, w.end)[0].id, 'demo-kill-00002');
  assert.deepEqual(filterKillEvents(killEvents, 'unknown'), []);
  assert.deepEqual(killEvents, before);
});

test('virtual: invalid geometry rejected', () => {
  for (const patch of [{ count: -1 }, { rowHeight: 0 }, { viewportHeight: NaN }, { scrollTop: Infinity }, { overscan: -1 }]) {
    assert.throws(() => getVirtualWindow({ count: 10, scrollTop: 0, ...patch }), TypeError);
  }
});
