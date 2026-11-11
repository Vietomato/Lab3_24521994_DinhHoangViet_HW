import { test, expect } from '@playwright/test';

test('replays a recorded chord at all speeds, guards transport/live input and preserves recording', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (['error','warning'].includes(message.type())) errors.push(message.text()); });
  await page.addInitScript(() => {
    window.replayStarts = [];
    window.replayPressedCounts = [];
    document.addEventListener('DOMContentLoaded', () => {
      new MutationObserver(() => replayPressedCounts.push(document.querySelectorAll('.piano-key[aria-pressed="true"]').length))
        .observe(document.body, { subtree: true, attributes: true, attributeFilter: ['aria-pressed'] });
    });
    const Native = AudioContext;
    window.AudioContext = class extends Native {
      constructor() {
        super();
        const create = this.createOscillator.bind(this);
        this.createOscillator = () => {
          const oscillator = create(); const start = oscillator.start.bind(oscillator);
          oscillator.start = (...args) => { replayStarts.push(oscillator.frequency.value); return start(...args); };
          return oscillator;
        };
      }
    };
  });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Play Sequence' })).toBeDisabled();
  await page.getByRole('button', { name: 'Record', exact: true }).click();
  const first = page.locator('[data-midi="21"]');
  await first.scrollIntoViewIfNeeded();
  const points = [];
  for (const [id,midi] of [21,24].entries()) {
    const box = await page.locator(`[data-midi="${midi}"]`).boundingBox();
    points.push({ id, x: box.x + box.width / 2, y: box.y + box.height * 0.8 });
  }
  const session = await page.context().newCDPSession(page);
  await session.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 10 });
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points });
  await expect(page.locator('.piano-key[aria-pressed="true"]')).toHaveCount(2);
  await page.waitForTimeout(150);
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.getByRole('button', { name: 'Stop Recording' }).evaluate(button => button.click());
  const saved = await page.locator('.recorded-notes li').allTextContents();
  expect(saved).toHaveLength(2);

  for (const speed of ['0.5','1','2']) {
    await page.getByLabel('Replay speed', { exact: true }).selectOption(speed);
    const before = await page.evaluate(() => replayStarts.length);
    await page.evaluate(() => { replayPressedCounts.length = 0; });
    await page.getByRole('button', { name: 'Play Sequence' }).click();
    await expect(page.getByRole('button', { name: 'Record', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Clear', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Play Sequence' })).toBeDisabled();
    await expect(page.locator('.piano-key:disabled')).toHaveCount(88);
    await page.getByLabel('Replay speed', { exact: true }).selectOption(speed === '2' ? '0.5' : '2');
    // Synthetic events must also fail the live-input gate, not only disabled UI.
    await first.dispatchEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true });
    await first.dispatchEvent('keyup', { key: 'Enter', code: 'Enter', bubbles: true });
    await expect(page.getByRole('button', { name: 'Record', exact: true })).toBeEnabled();
    // Observe all state transitions: at 2x a short chord can fall between polls.
    expect(await page.evaluate(() => replayPressedCounts.includes(2))).toBe(true);
    await expect(page.locator('.piano-key:disabled')).toHaveCount(0);
    await expect(page.locator('.piano-key[aria-pressed="true"]')).toHaveCount(0);
    expect(await page.evaluate(() => replayStarts.length)).toBe(before + 2);
    expect(await page.locator('.recorded-notes li').allTextContents()).toEqual(saved);
  }

  // A live held note must be cleared when Play starts, even without a focus blur.
  await first.focus(); await page.keyboard.down('Enter');
  await expect(first).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Play Sequence' }).evaluate(button => button.click());
  await expect(page.locator('.piano-key:disabled')).toHaveCount(88);
  await page.keyboard.up('Enter');
  await expect(page.getByRole('button', { name: 'Record', exact: true })).toBeEnabled();
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
