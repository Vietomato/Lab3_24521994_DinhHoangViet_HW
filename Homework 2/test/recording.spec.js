import { test, expect } from '@playwright/test';

test('records held notes once, stops/releases them, guards Clear, and handles empty recording', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Record', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Clear', exact: true })).toBeDisabled();
  const key = page.locator('[data-midi="21"]');
  await key.focus(); await page.keyboard.down('Enter');
  await expect(key).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.down('Enter');
  await page.getByRole('button', { name: 'Stop Recording' }).evaluate(button => button.click());
  await expect(page.locator('.piano-key[aria-pressed="true"]')).toHaveCount(0);
  await page.keyboard.up('Enter');
  await expect(page.locator('.recorded-notes li')).toHaveCount(1);
  await expect(page.locator('.recorded-notes li')).toContainText('MIDI 21');
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(page.locator('.recorded-notes li')).toHaveCount(0);
  await page.getByRole('button', { name: 'Record', exact: true }).click();
  await page.getByRole('button', { name: 'Stop Recording' }).click();
  await expect(page.locator('.recorded-notes li')).toHaveCount(0);
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('touch chord records FIFO onsets and finalizes stolen input before recording stop', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Record', exact: true }).click();
  const midis = [21,23,24,26,28,29,31,33,35];
  await page.locator('[data-midi="21"]').scrollIntoViewIfNeeded();
  const points = [];
  for (const [id, midi] of midis.entries()) {
    const box = await page.locator(`[data-midi="${midi}"]`).boundingBox();
    points.push({ id, x: box.x + box.width / 2, y: box.y + box.height * 0.8 });
  }
  const session = await page.context().newCDPSession(page);
  await session.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 10 });
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points.slice(0,8) });
  await expect(page.locator('.piano-key[aria-pressed="true"]')).toHaveCount(8);
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points });
  await expect(page.locator('[data-midi="21"]')).toHaveAttribute('aria-pressed', 'false');
  await page.waitForTimeout(80);
  await page.getByRole('button', { name: 'Stop Recording' }).evaluate(button => button.click());
  await expect(page.locator('.piano-key[aria-pressed="true"]')).toHaveCount(0);
  const texts = await page.locator('.recorded-notes li').allTextContents();
  expect(texts).toHaveLength(9);
  expect(texts.map(text => Number(text.match(/MIDI (\d+)/)[1]))).toEqual(midis);
  const duration = text => Number(text.match(/duration ([\d.]+)/)[1]);
  expect(duration(texts[0])).toBeLessThan(duration(texts[1]));
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
});
