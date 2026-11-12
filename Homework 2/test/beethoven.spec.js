import { test, expect } from '@playwright/test';

test('built-in Beethoven plays without recording, lights keys, stops and restarts', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  const play = page.getByRole('button', { name: 'Play Beethoven Virus', exact: true });
  const stop = page.getByRole('button', { name: 'Stop', exact: true });
  await expect(play).toBeEnabled();
  await play.click();
  await expect(play).toBeDisabled();
  await expect(stop).toBeEnabled();
  await expect.poll(() => page.locator('.piano-key[aria-pressed="true"]').count()).toBeGreaterThan(0);
  await expect(page.getByRole('button', { name: 'Record', exact: true })).toBeDisabled();
  await stop.click();
  await expect(play).toBeEnabled();
  await expect(page.locator('.piano-key[aria-pressed="true"]')).toHaveCount(0);
  await expect(page.locator('.recorded-notes li')).toHaveCount(0);
  await play.click(); await stop.click();
  await expect(play).toBeEnabled();
  expect(errors).toEqual([]);
});
