import { test, expect } from '@playwright/test';

// CDP measures actual JavaScript function invocations, not DOM mutations or
// guessed render timings. This is separate from the React DevTools Profiler UI.
for (const strict of [true, false]) {
  test(`key-body isolation during press, release and FIFO steal (StrictMode ${strict})`, async ({ page }, testInfo) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (['error', 'warning'].includes(message.type())) errors.push(message.text()); });
    const session = await page.context().newCDPSession(page);
    await session.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 10 });
    await session.send('Profiler.enable');
    await session.send('Profiler.startPreciseCoverage', { callCount: true, detailed: true });
    const measured = [];
    const take = async label => {
      const { result } = await session.send('Profiler.takePreciseCoverage');
      const calls = result.filter(script => script.url.includes('/src/components/PianoKey.jsx'))
        .flatMap(script => script.functions.filter(fn => fn.functionName === 'PianoKey'))
        .reduce((sum, fn) => sum + fn.ranges[0].count, 0);
      measured.push({ label, calls });
      return calls;
    };
    const factor = strict ? 2 : 1;
    try {
      await page.goto(`/test/render-isolation.html?strict=${strict}`);
      const first = page.locator('[data-midi="21"]');
      await expect(page.locator('.piano-key')).toHaveCount(88);
      expect(await take('initial mount')).toBe(88 * factor);
      await first.focus(); await page.keyboard.down('Enter');
      await expect(first).toHaveAttribute('aria-pressed', 'true');
      expect(await take('single-note press')).toBe(factor);
      await page.keyboard.up('Enter');
      await expect(first).toHaveAttribute('aria-pressed', 'false');
      expect(await take('single-note release')).toBe(factor);

      await first.focus(); await page.keyboard.down('Enter');
      await expect(first).toHaveAttribute('aria-pressed', 'true');
      await take('setup shared owner');
      await first.hover(); await page.mouse.down();
      await page.waitForTimeout(100); // Observe an interval after async owner resolution.
      expect(await take('second owner, same pitch')).toBe(0);
      await page.mouse.up(); await page.keyboard.up('Enter');
      await expect(first).toHaveAttribute('aria-pressed', 'false');
      await take('reset before chord');

      await first.scrollIntoViewIfNeeded();
      const midis = [21,23,24,26,28,29,31,33,35];
      const points = [];
      for (const [id, midi] of midis.entries()) {
        const bounds = await page.locator(`[data-midi="${midi}"]`).boundingBox();
        points.push({ id, x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height * 0.8 });
      }
      await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points.slice(0, 8) });
      await expect(page.locator('.piano-key[aria-pressed="true"]')).toHaveCount(8);
      expect(await take('eight-note chord')).toBe(8 * factor);
      await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points });
      await expect(first).toHaveAttribute('aria-pressed', 'false');
      await expect(page.locator('[data-midi="35"]')).toHaveAttribute('aria-pressed', 'true');
      expect(await take('ninth-note FIFO steal')).toBe(2 * factor);
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await expect(page.locator('.piano-key[aria-pressed="true"]')).toHaveCount(0);
      expect(await take('chord release')).toBe(8 * factor);
      expect(errors).toEqual([]);
    } finally {
      await session.send('Profiler.stopPreciseCoverage');
      await testInfo.attach('measured-key-body-calls', {
        body: JSON.stringify({ strict, measured, commits: await page.evaluate(() => window.pianoCommits ?? []) }, null, 2),
        contentType: 'application/json',
      });
    }
  });
}
