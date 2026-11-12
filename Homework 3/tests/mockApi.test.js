import test from 'node:test';
import assert from 'node:assert/strict';
import { createMockClaimService, createDemoSession } from '../src/api/mockApi.js';
import { createDrops } from '../src/data/fixtures.js';

function setup(t, stock = 2) {
  let clock = 1_800_000_000_000;
  t.mock.method(Date, 'now', () => clock);
  const timers = new Map();
  let nextId = 0;
  t.mock.method(globalThis, 'setTimeout', (callback, ms) => {
    timers.set(++nextId, { callback, ms }); return nextId;
  });
  t.mock.method(globalThis, 'clearTimeout', (id) => timers.delete(id));
  const drops = createDrops(clock);
  drops[0].remainingStock = stock;
  const api = createMockClaimService(drops, { latencyMs: 100 });
  const signals = [];
  function request(patch = {}) {
    const controller = new AbortController();
    const attached = new Set();
    const add = controller.signal.addEventListener.bind(controller.signal);
    const remove = controller.signal.removeEventListener.bind(controller.signal);
    t.mock.method(controller.signal, 'addEventListener', (type, listener, options) => {
      if (type === 'abort') attached.add(listener); add(type, listener, options);
    });
    t.mock.method(controller.signal, 'removeEventListener', (type, listener) => {
      if (type === 'abort') attached.delete(listener); remove(type, listener);
    });
    signals.push(attached);
    return { controller, value: { dropId: drops[0].id, claimId: `claim-${signals.length}`, scenario: 'success', signal: controller.signal, ...patch } };
  }
  function flush() {
    for (const { callback } of [...timers.values()]) callback();
  }
  t.after(() => {
    assert.equal(timers.size, 0, 'all timers removed');
    assert.ok(signals.every((listeners) => listeners.size === 0), 'all abort listeners removed');
  });
  return { api, drops, request, flush, timers, advance: (ms) => { clock += ms; } };
}

test('service: delayed success returns stock; inputs/read results cannot mutate inventory', async (t) => {
  const h = setup(t);
  const pending = h.api.claim(h.request().value);
  assert.equal(h.api.readDrops()[0].remainingStock, 2);
  assert.equal([...h.timers.values()][0].ms, 100);
  h.drops[0].remainingStock = 99;
  h.api.readDrops()[0].remainingStock = 77;
  h.flush();
  assert.equal((await pending).remainingStock, 1);
  assert.equal(h.api.readDrops()[0].remainingStock, 1);
});

test('service: last-item contention allows only one deduction', async (t) => {
  const h = setup(t, 1);
  const results = Promise.allSettled([h.api.claim(h.request().value), h.api.claim(h.request().value)]);
  h.flush();
  const [success, conflict] = await results;
  assert.equal(success.value.remainingStock, 0);
  assert.equal(conflict.reason.status, 409);
  assert.equal(conflict.reason.remainingStock, 0);
  assert.equal(h.api.readDrops()[0].remainingStock, 0);
});

test('service: concurrent/completed duplicate IDs deduct once and return immutable cached result', async (t) => {
  const h = setup(t);
  const req = h.request().value;
  const both = Promise.all([h.api.claim(req), h.api.claim(h.request({ claimId: req.claimId }).value)]);
  h.flush();
  const [a, b] = await both;
  assert.deepEqual(a, b);
  assert.ok(Object.isFrozen(a));
  h.advance(400_000);
  const retry = h.api.claim(req);
  h.flush();
  assert.deepEqual(await retry, a);
  assert.equal(h.api.readDrops()[0].remainingStock, 1);
});

test('service: claim ID reuse for another drop rejected even during first delay', async (t) => {
  const h = setup(t);
  const req = h.request().value;
  const first = h.api.claim(req);
  await assert.rejects(h.api.claim(h.request({ claimId: req.claimId, dropId: h.drops[1].id }).value), { status: 400 });
  h.flush(); await first;
});

test('service: explicit conflict returns authoritative exhausted stock', async (t) => {
  const h = setup(t);
  const rejected = assert.rejects(h.api.claim(h.request({ scenario: 'conflict' }).value), { status: 409, remainingStock: 0 });
  h.flush(); await rejected;
  assert.equal(h.api.readDrops()[0].remainingStock, 0);
});

test('service: network error preserves stock and same-drop ID can retry', async (t) => {
  const h = setup(t);
  const req = h.request({ scenario: 'network-error' }).value;
  const rejected = assert.rejects(h.api.claim(req), (error) => error.status === undefined && /network/.test(error.message));
  h.flush(); await rejected;
  assert.equal(h.api.readDrops()[0].remainingStock, 2);
  const retry = h.api.claim({ ...req, scenario: 'success' });
  h.flush(); assert.equal((await retry).remainingStock, 1);
});

test('service: expiry at completion rejects without deduction', async (t) => {
  const h = setup(t);
  const rejected = assert.rejects(h.api.claim(h.request().value), { status: 410 });
  h.advance(300_000); h.flush(); await rejected;
  assert.equal(h.api.readDrops()[0].remainingStock, 2);
});

test('service: opening is validated after latency, unknown drops rejected', async (t) => {
  const h = setup(t);
  const early = assert.rejects(h.api.claim(h.request({ dropId: h.drops[1].id }).value), { status: 409, remainingStock: 80 });
  h.flush(); await early;
  const opening = h.api.claim(h.request({ dropId: h.drops[1].id }).value);
  h.advance(30_000); h.flush(); assert.equal((await opening).remainingStock, 79);
  const unknown = assert.rejects(h.api.claim(h.request({ dropId: 'unknown' }).value), { status: 404 });
  h.flush(); await unknown;
});

test('service: already aborted and mid-delay abort cancel without mutation', async (t) => {
  const h = setup(t);
  const first = h.request(); first.controller.abort();
  await assert.rejects(h.api.claim(first.value), { name: 'AbortError' });
  assert.equal(h.timers.size, 0);
  const second = h.request();
  const cancelled = assert.rejects(h.api.claim(second.value), { name: 'AbortError' });
  second.controller.abort(); await cancelled;
  assert.equal(h.api.readDrops()[0].remainingStock, 2);
});

test('service: aborting one duplicate does not cancel the other; late abort does not roll back', async (t) => {
  const h = setup(t);
  const first = h.request();
  const rejected = assert.rejects(h.api.claim(first.value), { name: 'AbortError' });
  const second = h.request({ claimId: first.value.claimId });
  const pending = h.api.claim(second.value);
  first.controller.abort(); await rejected;
  h.flush(); assert.equal((await pending).remainingStock, 1);
  second.controller.abort(); assert.equal(h.api.readDrops()[0].remainingStock, 1);
});

test('service: reset factories have independent stock, cache and timestamps', async (t) => {
  const h = setup(t);
  const first = createDemoSession(Date.now(), { latencyMs: 0 });
  const req = h.request().value;
  const pending = first.service.claim(req); h.flush(); await pending;
  h.advance(10_000);
  const second = createDemoSession(Date.now(), { latencyMs: 0 });
  assert.equal(first.service.readDrops()[0].remainingStock, 23);
  assert.equal(second.service.readDrops()[0].remainingStock, 24);
  assert.equal(second.drops[0].dropEpochMs - first.drops[0].dropEpochMs, 10_000);
  const fresh = second.service.claim(req); h.flush();
  assert.equal((await fresh).remainingStock, 23);
});

test('service: malformed requests/configuration rejected safely', async (t) => {
  const h = setup(t);
  for (const patch of [{ scenario: 'random' }, { claimId: '' }, { signal: null }]) {
    await assert.rejects(h.api.claim(h.request(patch).value), { status: 400 });
  }
  for (const latencyMs of [-1, NaN, Infinity, 0.5, 2_147_483_648]) {
    assert.throws(() => createMockClaimService(h.drops, { latencyMs }), TypeError);
  }
  assert.throws(() => createMockClaimService([{ ...h.drops[0], remainingStock: -1 }]), TypeError);
});
