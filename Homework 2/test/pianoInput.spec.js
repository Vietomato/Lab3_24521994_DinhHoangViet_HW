import { test, expect } from '@playwright/test';

const errorsByPage = new WeakMap();
const key = (page, midi = 21) => page.locator(`[data-midi="${midi}"]`);
const pressed = page => page.locator('.piano-key[aria-pressed="true"]');

test.beforeEach(async ({ page }) => {
  const errors = [];
  errorsByPage.set(page, errors);
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (['error', 'warning'].includes(message.type())) errors.push(message.text()); });
  await page.addInitScript(() => {
    window.audioTest = { starts: 0, oscillators: [], contexts: [] };
    const Native = window.AudioContext;
    window.AudioContext = class extends Native {
      constructor() {
        super(); audioTest.contexts.push(this);
        const create = this.createOscillator.bind(this);
        this.createOscillator = () => {
          const oscillator = create(); audioTest.oscillators.push(oscillator);
          const start = oscillator.start.bind(oscillator);
          oscillator.start = (...args) => { audioTest.starts++; return start(...args); };
          return oscillator;
        };
      }
    };
    window.addEventListener('pointerdown', event => { window.lastPointerId = event.pointerId; }, true);
  });
});
test.afterEach(async ({ page }) => { expect(errorsByPage.get(page)).toEqual([]); });

test('mouse capture releases outside a key without a duplicate click', async ({ page }) => {
  await page.goto('/');
  await key(page).hover(); await page.mouse.down();
  await expect(key(page)).toHaveAttribute('aria-pressed', 'true');
  await page.mouse.move(1200, 20); await page.mouse.up();
  await expect(pressed(page)).toHaveCount(0);
  expect(await page.evaluate(() => audioTest.starts)).toBe(1);
  await key(page).click();
  await expect.poll(() => page.evaluate(() => audioTest.starts)).toBe(2);
  await expect(pressed(page)).toHaveCount(0);
});

test('pointer cancellation and lost capture release their owned note', async ({ page }) => {
  await page.goto('/');
  await key(page).hover(); await page.mouse.down();
  await expect(pressed(page)).toHaveCount(1);
  const pointerId = await page.evaluate(() => lastPointerId);
  await key(page).dispatchEvent('pointercancel', { pointerId });
  await expect(pressed(page)).toHaveCount(0); await page.mouse.up();
  await key(page).hover(); await page.mouse.down();
  await expect(pressed(page)).toHaveCount(1);
  await key(page).evaluate(node => node.releasePointerCapture(window.lastPointerId));
  await page.mouse.move(1200, 20);
  await expect(pressed(page)).toHaveCount(0); await page.mouse.up();
});

test('Enter and Space sustain, reject repeats/click duplication, and preserve Tab', async ({ page }) => {
  await page.goto('/'); await key(page).focus();
  for (const [index, activation] of ['Enter', 'Space'].entries()) {
    await page.keyboard.down(activation);
    await expect(key(page)).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.down(activation); await page.keyboard.down(activation);
    expect(await page.evaluate(() => audioTest.starts)).toBe(index + 1);
    await page.keyboard.up(activation);
    await expect(pressed(page)).toHaveCount(0);
  }
  await page.keyboard.down('Enter');
  await expect(pressed(page)).toHaveCount(1);
  await page.keyboard.press('Tab');
  await expect(key(page, 22)).toBeFocused();
  await expect(pressed(page)).toHaveCount(0); await page.keyboard.up('Enter');
});

test('overlapping native and pointer owners release independently', async ({ page }) => {
  await page.goto('/'); await key(page).focus();
  await page.keyboard.down('Enter');
  await expect(pressed(page)).toHaveCount(1);
  await key(page).hover(); await page.mouse.down();
  await page.keyboard.up('Enter');
  await expect(pressed(page)).toHaveCount(1);
  expect(await page.evaluate(() => audioTest.starts)).toBe(1);
  await page.mouse.up(); await expect(pressed(page)).toHaveCount(0);
  await key(page).hover(); await page.mouse.down();
  await expect(pressed(page)).toHaveCount(1);
  await page.keyboard.down('Space'); await page.mouse.up();
  await expect(pressed(page)).toHaveCount(1);
  await page.keyboard.up('Space'); await expect(pressed(page)).toHaveCount(0);
});

test('blur, hidden document and unexpected voice end clear visuals without retrigger', async ({ page }) => {
  await page.goto('/'); await key(page).focus(); await page.keyboard.down('Enter');
  await expect(pressed(page)).toHaveCount(1);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(pressed(page)).toHaveCount(0); await page.keyboard.up('Enter');
  await page.keyboard.down('Space'); await expect(pressed(page)).toHaveCount(1);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(pressed(page)).toHaveCount(0); await page.keyboard.up('Space');
  await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
  await page.keyboard.down('Enter'); await expect(pressed(page)).toHaveCount(1);
  await page.evaluate(() => audioTest.oscillators.at(-1).stop());
  await expect(pressed(page)).toHaveCount(0);
  const starts = await page.evaluate(() => audioTest.starts);
  await page.keyboard.down('Enter');
  expect(await page.evaluate(() => audioTest.starts)).toBe(starts);
  await page.keyboard.up('Enter'); await page.keyboard.down('Enter');
  await expect(pressed(page)).toHaveCount(1); await page.keyboard.up('Enter');
});

test('release during pending resume prevents a late note and a new press works', async ({ page }) => {
  await page.addInitScript(() => {
    const Native = window.AudioContext;
    window.AudioContext = class extends Native {
      pending = true;
      get state() { return this.pending ? 'suspended' : super.state; }
      resume() {
        return new Promise((resolve, reject) => {
          window.finishResume = () => super.resume().then(() => { this.pending = false; resolve(); }, reject);
        });
      }
    };
  });
  await page.goto('/'); await key(page).hover(); await page.mouse.down();
  await page.waitForFunction(() => window.finishResume);
  await page.mouse.up();
  await page.evaluate(() => finishResume());
  await expect(pressed(page)).toHaveCount(0);
  expect(await page.evaluate(() => audioTest.starts)).toBe(0);
  await key(page).hover(); await page.mouse.down();
  await expect(pressed(page)).toHaveCount(1); await page.mouse.up();
});

test('assistive click plays one bounded pulse and no page overflow at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Enable audio' }).click();
  await key(page).evaluate(node => node.click());
  await expect.poll(() => page.evaluate(() => audioTest.starts)).toBe(1);
  await expect(pressed(page)).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('pen uses the same captured pointer lifecycle', async ({ page }) => {
  await page.goto('/');
  await key(page).scrollIntoViewIfNeeded();
  const bounds = await key(page).boundingBox();
  const session = await page.context().newCDPSession(page);
  const point = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height * 0.8 };
  await session.send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', buttons: 1, clickCount: 1, pointerType: 'pen' });
  await expect(pressed(page)).toHaveCount(1);
  await session.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 1200, y: 20, button: 'left', buttons: 0, clickCount: 1, pointerType: 'pen' });
  await expect(pressed(page)).toHaveCount(0);
});

test('StrictMode input unmount closes active audio and a fresh mount can play', async ({ page }) => {
  await page.goto('/test/input-lifecycle.html');
  await key(page).focus(); await page.keyboard.down('Enter');
  await expect(pressed(page)).toHaveCount(1);
  await page.evaluate(() => testRoot.unmount());
  await expect.poll(() => page.evaluate(() => audioTest.contexts.every(context => context.state === 'closed'))).toBe(true);
  expect(await page.evaluate(() => audioTest.oscillators.every(oscillator => oscillator.onended === null))).toBe(true);
  await page.keyboard.up('Enter');
  await page.evaluate(() => mountPiano());
  await key(page).focus(); await page.keyboard.down('Space');
  await expect(pressed(page)).toHaveCount(1);
  await page.keyboard.up('Space'); await expect(pressed(page)).toHaveCount(0);
});

test.describe('touch chords', () => {
  test.use({ hasTouch: true });
  test('nine held notes steal the oldest; moving cannot resurrect it, repress can', async ({ page }) => {
    await page.goto('/');
    await key(page).scrollIntoViewIfNeeded();
    const midis = [21,23,24,26,28,29,31,33,35];
    const touchPoints = [];
    for (const [id, midi] of midis.entries()) {
      const bounds = await key(page, midi).boundingBox();
      touchPoints.push({ id, x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height * 0.8 });
    }
    const session = await page.context().newCDPSession(page);
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints });
    await expect(pressed(page)).toHaveCount(8);
    await expect(key(page, 21)).toHaveAttribute('aria-pressed', 'false');
    for (const midi of midis.slice(1)) await expect(key(page, midi)).toHaveAttribute('aria-pressed', 'true');
    expect(await page.evaluate(() => audioTest.starts)).toBe(9);
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints });
    await expect(key(page, 21)).toHaveAttribute('aria-pressed', 'false');
    expect(await page.evaluate(() => audioTest.starts)).toBe(9);
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect(pressed(page)).toHaveCount(0);
    await key(page, 21).tap();
    await expect.poll(() => page.evaluate(() => audioTest.starts)).toBe(10);
    await expect(pressed(page)).toHaveCount(0);
  });
});
