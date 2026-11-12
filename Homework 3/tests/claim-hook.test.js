import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { act, createElement, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createDrops } from '../src/data/fixtures.js';
import { createMockClaimService } from '../src/api/mockApi.js';
import { getDropPhase } from '../src/lib/drop.js';
import { useClaim } from '../src/hooks/useClaim.js';

async function harness(t, stock = 2) {
  const dom = new JSDOM('<div id="root"></div>');
  const previous = new Map(['window', 'document', 'IS_REACT_ACT_ENVIRONMENT'].map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true });
  let clock = 1_800_000_000_000;
  t.mock.method(Date, 'now', () => clock);
  let nextId = 0;
  const timers = new Map();
  t.mock.method(globalThis, 'setTimeout', (callback) => { timers.set(++nextId, callback); return nextId; });
  t.mock.method(globalThis, 'clearTimeout', (id) => timers.delete(id));
  const drop = createDrops(clock)[0]; drop.remainingStock = stock;
  const service = createMockClaimService([drop], { latencyMs: 800 });
  let value;
  let props = { drop, service, scenario: 'success' };
  let key = 0;
  function Probe(options) {
    value = useClaim(options);
    return createElement('button', { disabled: value.pending, onClick: value.claim }, value.displayedStock);
  }
  const root = createRoot(document.getElementById('root'));
  const render = () => act(() => root.render(createElement(StrictMode, null, createElement(Probe, { ...props, key }))));
  await render();
  t.after(async () => {
    await act(() => root.unmount());
    assert.equal(timers.size, 0);
    t.mock.restoreAll(); dom.window.close();
    for (const [name, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name];
    }
  });
  return {
    drop, service, timers, get value() { return value; },
    start: () => act(() => { void value.claim(); }),
    flush: () => act(async () => { for (const callback of [...timers.values()]) callback(); }),
    advance: (ms) => { clock += ms; },
    render: async (patch, remount = false) => { props = { ...props, ...patch }; if (remount) key++; await render(); },
    double: () => act(() => { void value.claim(); void value.claim(); }),
  };
}

test('claim hook: same-tick rapid clicks lock immediately; success reconciles', async (t) => {
  const h = await harness(t);
  await h.double();
  assert.equal(h.timers.size, 1);
  assert.equal(h.value.pending, true);
  assert.equal(h.value.serverStock, 2);
  assert.equal(h.value.displayedStock, 1);
  await h.flush();
  assert.equal(h.value.serverStock, 1);
  assert.equal(h.value.pending, false);
  assert.equal(h.value.status, 'success');
});

test('claim hook: speculative last-item zero remains live until confirmed', async (t) => {
  const h = await harness(t, 1);
  await h.start();
  assert.equal(h.value.displayedStock, 0);
  assert.equal(getDropPhase(h.drop, Date.now(), h.value.serverStock), 'AIRDROP_LIVE');
  await h.flush();
  assert.equal(h.value.displayedStock, 0);
  assert.equal(getDropPhase(h.drop, Date.now(), h.value.serverStock), 'LOOTED_OUT');
  await h.start(); assert.equal(h.timers.size, 0);
});

test('claim hook: 409 reconciles stock and removes pending deduction', async (t) => {
  const h = await harness(t);
  await h.render({ scenario: 'conflict' }); await h.start(); await h.flush();
  assert.equal(h.value.serverStock, 0);
  assert.equal(h.value.displayedStock, 0);
  assert.equal(h.value.pending, false);
  assert.equal(h.value.status, 'error');
});

test('claim hook: network failure preserves confirmed stock and retry succeeds', async (t) => {
  const h = await harness(t);
  await h.render({ scenario: 'network-error' }); await h.start(); await h.flush();
  assert.equal(h.value.displayedStock, 2);
  assert.equal(h.value.pending, false);
  await h.render({ scenario: 'success' }); await h.start(); await h.flush();
  assert.equal(h.value.serverStock, 1);
  assert.equal(h.value.status, 'success');
});

test('claim hook: expiry while pending fails; handler rejects stale live eligibility', async (t) => {
  const h = await harness(t);
  await h.start(); h.advance(300_000); await h.flush();
  assert.equal(h.value.status, 'error');
  assert.equal(h.value.serverStock, 2);
  assert.equal(h.value.pending, false);
  await h.start(); assert.equal(h.timers.size, 0);
});

test('claim hook: reset/unmount aborts old request; fresh session retains its stock', async (t) => {
  const h = await harness(t);
  await h.start();
  const drop = { ...h.drop, remainingStock: 5 };
  const service = createMockClaimService([drop]);
  await h.render({ drop, service }, true);
  assert.equal(h.timers.size, 0);
  assert.equal(h.value.serverStock, 5);
  assert.equal(h.value.pending, false);
  assert.equal(h.service.readDrops()[0].remainingStock, 2);
  await h.start(); await h.flush(); assert.equal(h.value.serverStock, 4);
});

test('claim hook: obsolete success/finally cannot clear a newer request', async (t) => {
  const h = await harness(t);
  let resolveOld;
  let oldRequest;
  const oldService = { claim: (request) => { oldRequest = request; return new Promise((resolve) => { resolveOld = resolve; }); } };
  await h.render({ service: oldService }, true); await h.start();
  await h.render({ service: h.service }, true); await h.start();
  assert.equal(oldRequest.signal.aborted, true);
  await act(async () => resolveOld({ claimId: oldRequest.claimId, remainingStock: 0 }));
  assert.equal(h.value.pending, true);
  assert.equal(h.value.serverStock, 2);
  await h.flush(); assert.equal(h.value.serverStock, 1);
});

test('claim hook: scenario is snapshotted at request start, next request uses new selection', async (t) => {
  const h = await harness(t);
  await h.start();
  await h.render({ scenario: 'conflict' });
  await h.flush();
  assert.equal(h.value.status, 'success');
  assert.equal(h.value.serverStock, 1);
  await h.start();
  await h.render({ scenario: 'success' });
  await h.flush();
  assert.equal(h.value.status, 'error');
  assert.equal(h.value.serverStock, 0);
});

for (const stage of ['idle', 'pending', 'success', 'conflict', 'expired']) {
  test(`claim hook: StrictMode reset while ${stage} clears messages/stock/pending and refreshes deadlines`, async (t) => {
    const h = await harness(t);
    if (stage === 'conflict') await h.render({ scenario: 'conflict' });
    if (['pending', 'success', 'conflict'].includes(stage)) await h.start();
    if (['success', 'conflict'].includes(stage)) await h.flush();
    h.advance(stage === 'expired' ? 400_000 : 5_000);
    const freshDrop = createDrops(Date.now())[0];
    const freshService = createMockClaimService([freshDrop]);
    await h.render({ drop: freshDrop, service: freshService, scenario: 'success' }, true);
    assert.equal(h.value.pending, false);
    assert.equal(h.value.status, 'idle');
    assert.equal(h.value.message, '');
    assert.equal(h.value.serverStock, 24);
    assert.equal(h.timers.size, 0);
    assert.ok(freshDrop.dropEpochMs > h.drop.dropEpochMs);
    assert.ok(freshDrop.expiresEpochMs > h.drop.expiresEpochMs);
    assert.equal(getDropPhase(freshDrop, Date.now()), 'AIRDROP_LIVE');
    await h.start(); await h.flush();
    assert.equal(h.value.serverStock, 23);
    assert.equal(h.value.status, 'success');
  });
}
