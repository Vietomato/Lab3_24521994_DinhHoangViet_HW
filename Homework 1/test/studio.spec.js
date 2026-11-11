import { test, expect } from '@playwright/test';
import { drumPads } from '../src/config/drumPads.js';

const errorsByPage = new WeakMap();
test.beforeEach(async ({ page }) => {
  const errors = [];
  errorsByPage.set(page, errors);
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (['error', 'warning'].includes(message.type())) errors.push(message.text());
  });
  page.on('response', response => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  await page.addInitScript(() => {
    window.hitIds = [];
    const uuid = crypto.randomUUID.bind(crypto);
    crypto.randomUUID = () => { const id = uuid(); hitIds.push(id); return id; };
    window.audioStats = { contexts: [], starts: 0, immediateStops: 0, closes: 0, reads: 0 };
    const NativeContext = window.AudioContext;
    window.AudioContext = class extends NativeContext {
      constructor() {
        super();
        audioStats.contexts.push(this);
        this.testNodes = [];
        for (const method of ['createGain', 'createAnalyser', 'createOscillator', 'createBufferSource', 'createBiquadFilter']) {
          const original = this[method].bind(this);
          this[method] = (...args) => {
            const node = original(...args);
            this.testNodes.push(node);
            if (method === 'createGain' && !this.testMaster) this.testMaster = node;
            const disconnect = node.disconnect.bind(node);
            node.testDisconnected = false;
            node.disconnect = (...values) => { node.testDisconnected = true; return disconnect(...values); };
            if (node instanceof AudioScheduledSourceNode) {
              const start = node.start.bind(node);
              node.start = (...values) => { audioStats.starts++; return start(...values); };
              const stop = node.stop.bind(node);
              node.stop = (...values) => { if (!values.length) audioStats.immediateStops++; return stop(...values); };
            }
            if (node instanceof AnalyserNode) {
              const read = node.getFloatTimeDomainData.bind(node);
              node.getFloatTimeDomainData = values => { audioStats.reads++; read(values); };
            }
            return node;
          };
        }
        const close = this.close.bind(this);
        this.close = () => { audioStats.closes++; return close(); };
      }
    };
  });
});
test.afterEach(async ({ page }) => {
  expect(errorsByPage.get(page), 'console warnings/errors, uncaught errors, and HTTP failures').toEqual([]);
});

const pads = page => page.locator('button.drum-pad');
const entries = page => page.locator('.hit-history li');

test('seven configured native pads, focus, semantics, and narrow layout', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Production Studio Drum Kit');
  await expect(pads(page)).toHaveCount(7);
  for (let i = 0; i < drumPads.length; i++) {
    await expect(pads(page).nth(i)).toHaveAttribute('type', 'button');
    await expect(pads(page).nth(i)).toHaveAttribute('aria-pressed', 'false');
    await expect(pads(page).nth(i)).toContainText(drumPads[i].label);
    await expect(pads(page).nth(i).locator('kbd')).toHaveText(drumPads[i].code.slice(3));
  }
  await pads(page).first().focus();
  expect(await pads(page).first().evaluate(node => getComputedStyle(node).outlineStyle)).not.toBe('none');
  await page.keyboard.press('Tab');
  await expect(pads(page).nth(1)).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.setViewportSize({ width: 1280, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole('main')).toHaveCount(1);
  expect(await page.evaluate(() => audioStats.contexts.length)).toBe(0);
});

test('all physical shortcuts activate once and release; held repeats are ignored', async ({ page }) => {
  await page.goto('/');
  for (let i = 0; i < drumPads.length; i++) {
    const letter = drumPads[i].code.slice(3).toLowerCase();
    await page.keyboard.down(letter);
    await expect(pads(page).nth(i)).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.down(letter);
    await page.keyboard.up(letter);
    await expect(pads(page).nth(i)).toHaveAttribute('aria-pressed', 'false');
    await expect(entries(page)).toHaveCount(i + 1);
    await expect(entries(page).first()).toContainText(drumPads[i].label);
  }
  expect(await page.evaluate(() => audioStats.starts)).toBe(11);
});

test('editable targets and browser keys are ignored without preventing defaults', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    const host = document.createElement('div');
    host.innerHTML = '<input><textarea></textarea><select><option>x</option></select><div contenteditable="true"><span id="nested-edit">text</span><span contenteditable="false" id="nested-false">nested</span></div>';
    document.body.append(host);
    const targets = host.querySelectorAll('input, textarea, select, #nested-edit, #nested-false');
    const prevented = [];
    for (const target of targets) {
      const event = new KeyboardEvent('keydown', { code: 'KeyW', bubbles: true, composed: true, cancelable: true });
      target.dispatchEvent(event);
      prevented.push(event.defaultPrevented);
    }
    for (const code of ['Tab', 'Enter', 'Space', 'KeyQ']) {
      const event = new KeyboardEvent('keydown', { code, bubbles: true, cancelable: true });
      document.body.dispatchEvent(event);
      prevented.push(event.defaultPrevented);
    }
    host.remove();
    return prevented;
  });
  expect(result.every(value => !value)).toBe(true);
  await expect(entries(page)).toHaveCount(0);
  expect(await page.evaluate(() => audioStats.starts)).toBe(0);
});

test('pointer and keyboard ownership, cancellation, blur, and native buttons', async ({ page }) => {
  await page.goto('/');
  const kick = pads(page).first();
  await page.keyboard.down('w');
  await kick.hover(); await page.mouse.down();
  await expect(entries(page)).toHaveCount(2);
  await page.keyboard.up('w');
  await expect(kick).toHaveAttribute('aria-pressed', 'true');
  await page.mouse.up();
  await expect(kick).toHaveAttribute('aria-pressed', 'false');
  await expect(entries(page)).toHaveCount(2);
  await kick.focus(); await page.keyboard.press('Enter'); await page.keyboard.press('Space');
  await expect(entries(page)).toHaveCount(4);
  await kick.hover(); await page.mouse.down();
  await kick.dispatchEvent('pointercancel', { pointerId: 1 });
  await expect(kick).toHaveAttribute('aria-pressed', 'false');
  await page.mouse.up();
  await page.keyboard.down('w');
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(kick).toHaveAttribute('aria-pressed', 'false');
  await page.keyboard.up('w');
  await page.keyboard.down('w');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(kick).toHaveAttribute('aria-pressed', 'false');
  await page.keyboard.up('w');
});

test('volume reaches master gain and shortcut toggle preserves other inputs', async ({ page }) => {
  await page.goto('/');
  const slider = page.getByRole('slider', { name: 'Volume' });
  const toggle = page.getByRole('checkbox', { name: 'Enable keyboard shortcuts' });
  const kick = pads(page).first();
  expect(await slider.evaluate(node => node.labels.length)).toBe(1);
  expect(await toggle.evaluate(node => node.labels.length)).toBe(1);
  await slider.focus(); await page.keyboard.press('Home'); await page.keyboard.press('w');
  await expect(page.locator('.volume-control output')).toHaveText('0%');
  await expect(entries(page)).toHaveCount(0);
  await kick.click();
  expect(await page.evaluate(() => audioStats.contexts[0].testMaster.gain.value)).toBe(0);
  await slider.focus(); await page.keyboard.press('End');
  await expect(page.locator('.volume-control output')).toHaveText('100%');
  await expect.poll(() => page.evaluate(() => audioStats.contexts[0].testMaster.gain.value)).toBeCloseTo(0.18, 3);
  await kick.focus(); await page.keyboard.down('w');
  await toggle.evaluate(node => node.click());
  await expect(kick).toHaveAttribute('aria-pressed', 'false');
  await page.keyboard.up('w'); await page.keyboard.press('a');
  await expect(entries(page)).toHaveCount(2);
  await kick.click(); await kick.focus(); await page.keyboard.press('Enter'); await page.keyboard.press('Space');
  await expect(entries(page)).toHaveCount(5);
  await toggle.check(); await kick.focus(); await page.keyboard.press('w');
  await expect(entries(page)).toHaveCount(6);
});

test('history retains newest 20, timestamps descend, clear does not stop audio', async ({ page }) => {
  await page.goto('/');
  const letters = ['w', 'a', 's', 'd', 'j', 'k', 'l'];
  for (let i = 0; i < 25; i++) await page.keyboard.press(letters[i % 7]);
  await expect(entries(page)).toHaveCount(20);
  expect(await page.evaluate(() => hitIds.length === 25 && new Set(hitIds).size === 25)).toBe(true);
  expect(await entries(page).locator(':scope > span').allTextContents())
    .toEqual(Array.from({ length: 20 }, (_, i) => drumPads[(24 - i) % 7].label));
  const timestamps = await page.locator('.hit-history time').evaluateAll(nodes => nodes.map(node => Date.parse(node.dateTime)));
  expect(timestamps.every((time, i) => Number.isFinite(time) && (!i || time <= timestamps[i - 1]))).toBe(true);
  const live = page.locator('output[aria-live="polite"]');
  await expect(live).toContainText(drumPads[24 % 7].label);
  expect(await page.locator('.hit-history').evaluate(node => node.closest('[aria-live]'))).toBeNull();
  await pads(page).nth(3).click();
  const before = await page.evaluate(() => [audioStats.immediateStops, audioStats.closes]);
  await page.getByRole('button', { name: 'Clear history' }).evaluate(node => node.click());
  await expect(entries(page)).toHaveCount(0);
  expect(await page.evaluate(() => [audioStats.immediateStops, audioStats.closes])).toEqual(before);
  await expect(live).toHaveText('No hits recorded.');
});

test('meter measures real overlap, silence, reduced motion, and cleanup without React commits', async ({ page }) => {
  await page.goto('/test/lifecycle.html');
  const meter = page.getByRole('meter', { name: 'Digital audio level' });
  await expect(meter).toHaveAttribute('aria-valuetext', 'Silence');
  await expect(meter).toHaveAttribute('aria-describedby', /.+/);
  await page.keyboard.down('w'); await page.keyboard.down('a'); await page.keyboard.down('d');
  await expect.poll(() => meter.evaluate(node => node.value)).toBeGreaterThan(0);
  await page.keyboard.up('w'); await page.keyboard.up('a'); await page.keyboard.up('d');
  await expect.poll(() => meter.evaluate(node => node.value)).toBe(0);
  const commits = await page.evaluate(() => window.commits);
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => window.commits)).toBe(commits);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const before = await page.evaluate(() => audioStats.reads);
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => audioStats.reads) - before).toBeLessThanOrEqual(3);
  await page.evaluate(() => window.testRoot.unmount());
  await expect.poll(() => page.evaluate(() => audioStats.contexts.every(context => context.state === 'closed'))).toBe(true);
  expect(await page.evaluate(() => audioStats.contexts.every(context => context.testNodes.every(node => node.testDisconnected)))).toBe(true);
  const stopped = await page.evaluate(() => audioStats.reads);
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => audioStats.reads)).toBe(stopped);
});

test('device failure is reported inline and does not create unhandled errors', async ({ page }) => {
  await page.addInitScript(() => { window.AudioContext = class { constructor() { throw new Error('Simulated device failure'); } }; });
  await page.goto('/');
  await pads(page).first().click();
  await expect(page.getByRole('alert')).toContainText('Unable to play');
  await expect(entries(page)).toHaveCount(1);
});

test('local reference audio decodes and plays after user activation', async ({ page }) => {
  await page.goto('/test/manual.html');
  const audio = page.locator('audio');
  await expect.poll(() => audio.evaluate(node => node.readyState)).toBeGreaterThanOrEqual(1);
  expect(await audio.evaluate(node => node.duration)).toBeCloseTo(0.7, 2);
  await audio.click();
  await audio.evaluate(node => node.play());
  await expect.poll(() => audio.evaluate(node => node.currentTime)).toBeGreaterThan(0);
  expect(await audio.evaluate(node => node.error)).toBeNull();
});

test.describe('emulated touch', () => {
  test.use({ hasTouch: true });
  test('one tap produces one hit and releases the pad', async ({ page }) => {
    await page.goto('/');
    await pads(page).first().tap();
    await expect(entries(page)).toHaveCount(1);
    await expect(pads(page).first()).toHaveAttribute('aria-pressed', 'false');
    expect(await page.evaluate(() => audioStats.starts)).toBe(1);
  });
});

test('keyboard hook keeps latest callbacks without re-registering and removes all listeners', async ({ page }) => {
  await page.goto('/test/keyboard-lifecycle.html');
  await expect(page.locator('#root p')).toHaveText('1');
  const registrations = await page.evaluate(() => keyboardRegistrations.length);
  await page.keyboard.down('w');
  await page.evaluate(() => renderKeyboard(true, 2));
  await expect(page.locator('#root p')).toHaveText('2');
  await page.keyboard.up('w');
  expect(await page.evaluate(() => keyboardCalls.at(-1))).toEqual(['up', 'kick', 2]);
  expect(await page.evaluate(() => keyboardRegistrations.length)).toBe(registrations);
  await page.keyboard.down('w');
  await page.evaluate(() => renderKeyboard(false, 3));
  await expect(page.locator('#root p')).toHaveText('3');
  expect(await page.evaluate(() => keyboardCalls.at(-1))).toEqual(['up', 'kick', 3]);
  await page.keyboard.up('w');
  const calls = await page.evaluate(() => keyboardCalls.length);
  await page.keyboard.press('w');
  expect(await page.evaluate(() => keyboardCalls.length)).toBe(calls);
  await page.evaluate(() => keyboardRoot.unmount());
  expect(await page.evaluate(() => keyboardRegistrations.filter(x => x === 'add').length
    === keyboardRegistrations.filter(x => x === 'remove').length)).toBe(true);
});

test('native Enter/Space holds expose pressed state and do not repeat hits', async ({ page }) => {
  await page.goto('/');
  const kick = pads(page).first();
  await kick.focus();
  for (const key of ['Enter', 'Space']) {
    const before = await entries(page).count();
    await page.keyboard.down(key);
    await expect(kick).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.down(key); await page.keyboard.down(key);
    await expect(entries(page)).toHaveCount(before + 1);
    await page.keyboard.up(key);
    await expect(kick).toHaveAttribute('aria-pressed', 'false');
    await expect(entries(page)).toHaveCount(before + 1);
  }
  await page.keyboard.down('Enter');
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(kick).toHaveAttribute('aria-pressed', 'false');
  await page.keyboard.up('Enter');
  const before = await entries(page).count();
  await page.keyboard.press('Enter');
  await expect(entries(page)).toHaveCount(before + 1);
  await kick.evaluate(node => node.click());
  await expect(entries(page)).toHaveCount(before + 2);
});
