// Start production preview on port 4177 first. Requires Microsoft Edge.
const { chromium, expect } = require('@playwright/test');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
    const errors = []; page.on('pageerror', (e) => errors.push(e.message));
    await page.clock.install({ time: new Date('2026-11-12T09:00:00Z') });
    await page.goto(process.env.TEST_BASE_URL || 'http://127.0.0.1:4177/');
    const cards = page.locator('article'); await expect(cards).toHaveCount(2);
    const first = cards.first(), stock = first.locator('dd').nth(1), claim = first.locator('button');
    const reset = page.locator('.demo-controls button'), scenario = page.locator('.demo-controls select');
    const phase = () => first.locator('[data-phase]').getAttribute('data-phase');
    const price = await page.evaluate(() => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(1200000));
    assert.equal(await first.locator('dd').first().innerText(), price);
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('.skip-link').evaluate((el) => el === document.activeElement), true);
    assert.equal(await page.locator('.skip-link').evaluate((el) => getComputedStyle(el).outlineWidth), '3px');
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('main').evaluate((el) => el === document.activeElement), true);
    assert.equal(await page.locator('input,select').evaluateAll((els) => els.every((el) => el.labels.length === 1)), true);
    await claim.evaluate((el) => { el.click(); el.click(); });
    assert.equal(await stock.innerText(), '23');
    await scenario.selectOption('conflict'); await page.clock.runFor(1000);
    assert.equal(await stock.innerText(), '23');
    await claim.click(); await page.clock.runFor(1000);
    assert.equal(await stock.innerText(), '0'); assert.equal(await phase(), 'LOOTED_OUT');
    await reset.click(); await scenario.selectOption('network-error');
    await claim.click(); await page.clock.runFor(1000); assert.equal(await stock.innerText(), '24');
    await scenario.selectOption('success'); await claim.focus(); await page.keyboard.press('Space');
    await page.clock.runFor(1000); assert.equal(await stock.innerText(), '23');
    await claim.click(); await reset.click(); await page.clock.runFor(1000); assert.equal(await stock.innerText(), '24');
    for (let i = 0; i < 23; i++) { await claim.click(); await page.clock.runFor(800); }
    await claim.click(); assert.equal(await stock.innerText(), '0'); assert.equal(await phase(), 'AIRDROP_LIVE');
    await page.clock.runFor(800); assert.equal(await phase(), 'LOOTED_OUT');
    await reset.click(); await page.clock.runFor(299500); await claim.click(); await page.clock.runFor(800);
    assert.equal(await phase(), 'EXPIRED'); assert.equal(await stock.innerText(), '24'); await reset.click();
    const controls = page.locator('.leaderboard-controls');
    await controls.locator('input').fill('  cErBeRuS  '); await expect(page.locator('tbody tr')).toHaveCount(1);
    await controls.locator('input').fill('unknown'); assert.equal(await page.locator('tbody td').getAttribute('colspan'), '4');
    await controls.locator('input').fill('');
    for (const metric of ['wwcdCount', 'placementPts', 'killPts']) {
      await controls.locator('select').first().selectOption(metric);
      for (const dir of ['asc', 'desc']) {
        await controls.locator('select').nth(1).selectOption(dir);
        assert.equal(await page.locator(`thead [aria-sort="${dir === 'asc' ? 'ascending' : 'descending'}"]`).count(), 1);
      }
    }
    const view = page.locator('.feed-viewport'); await view.evaluate((el) => { el.scrollTop = 1e12; });
    await expect(page.locator('.feed-row').last()).toHaveAttribute('data-event-id', 'demo-kill-01200');
    assert.ok(await page.locator('.feed-row').count() <= 12);
    await page.locator('.feed-controls select').selectOption('demo-ces');
    await expect(page.locator('.feed-row').first()).toHaveAttribute('data-event-id', 'demo-kill-00002');
    assert.equal(await view.evaluate((el) => el.scrollTop), 0);
    await view.focus(); await page.keyboard.press('PageDown');
    await expect.poll(() => view.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
    assert.equal(await page.locator('.countdown').evaluateAll((els) => els.some((el) => el.closest('[aria-live],[role="status"]'))), false);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.deepEqual(errors, []);
    console.log('PASS Edge production: VND, keyboard/focus/labels, double-click, success/409/network/retry, last item, expiry pending, reset, leaderboard, virtual feed, 375px.');
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
