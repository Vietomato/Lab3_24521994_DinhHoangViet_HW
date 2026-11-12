import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { act, createElement, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { usePubgAirdropTimer } from '../src/hooks/usePubgAirdropTimer.js';

test('React hook in jsdom: clock refresh, prop changes, visibility, StrictMode and cleanup', async (t) => {
  const dom = new JSDOM('<div id="root"></div>');
  const previous = new Map(['window', 'document', 'IS_REACT_ACT_ENVIRONMENT'].map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true });
  let clock = 1_000;
  t.mock.method(Date, 'now', () => clock);
  const timers = new Map();
  let timerId = 0;
  t.mock.method(globalThis, 'setInterval', (callback) => {
    timers.set(++timerId, callback);
    return timerId;
  });
  t.mock.method(globalThis, 'clearInterval', (id) => timers.delete(id));
  const listeners = new Set();
  const add = document.addEventListener.bind(document);
  const remove = document.removeEventListener.bind(document);
  t.mock.method(document, 'addEventListener', (type, callback, ...args) => {
    if (type === 'visibilitychange') listeners.add(callback);
    return add(type, callback, ...args);
  });
  t.mock.method(document, 'removeEventListener', (type, callback, ...args) => {
    if (type === 'visibilitychange') listeners.delete(callback);
    return remove(type, callback, ...args);
  });
  let visibility = 'visible';
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => visibility });
  let value;
  const renders = [];
  function Probe({ target, offset }) {
    value = usePubgAirdropTimer(target, offset);
    renders.push(value);
    return createElement('output', null, value.error ?? value.remainingMs);
  }
  const root = createRoot(document.getElementById('root'));
  const render = (target, offset = 0) => act(() => root.render(
    createElement(StrictMode, null, createElement(Probe, { target, offset })),
  ));
  try {
    await render(10_000);
    assert.equal(value.remainingMs, 9_000);
    assert.equal(timers.size, 1, 'StrictMode leaves exactly one timer');
    assert.equal(listeners.size, 1, 'StrictMode leaves exactly one listener');

    // Only one callback after a long stall: calculation must use elapsed clock.
    clock = 6_500;
    await act(() => [...timers.values()][0]());
    assert.equal(value.remainingMs, 3_500);
    assert.equal(value.nowEpochMs, 6_500);

    let first = renders.length;
    await render(20_000, 500);
    assert.equal(renders[first].remainingMs, 13_000, 'first render reflects both new props');
    first = renders.length;
    await render(20_000, -500);
    assert.equal(renders[first].nowEpochMs, 6_000, 'offset-only change refreshes immediately');
    assert.equal(timers.size, 1);
    assert.equal(listeners.size, 1);

    visibility = 'hidden';
    clock = 9_000;
    await act(() => document.dispatchEvent(new dom.window.Event('visibilitychange')));
    assert.equal(value.nowEpochMs, 6_000, 'hidden event does not force refresh');
    visibility = 'visible';
    await act(() => document.dispatchEvent(new dom.window.Event('visibilitychange')));
    assert.equal(value.nowEpochMs, 8_500);

    await render(NaN);
    assert.ok(value.error);
    assert.equal(value.remainingMs, null);
    await render(10_000);
    clock = 12_000;
    await act(() => [...timers.values()][0]());
    assert.equal(value.remainingMs, 0);
    clock = 15_000;
    await act(() => [...timers.values()][0]());
    assert.equal(value.nowEpochMs, 15_000, 'clock continues after opening reaches zero');
  } finally {
    await act(() => root.unmount());
    assert.equal(timers.size, 0, 'unmount clears timer');
    assert.equal(listeners.size, 0, 'unmount removes visibility listener');
    t.mock.restoreAll();
    dom.window.close();
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
