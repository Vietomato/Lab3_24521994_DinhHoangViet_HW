import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.js',
  workers: 1,
  retries: 0,
  outputDir: '../test-results',
  reporter: 'list',
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://127.0.0.1:5176',
    channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge',
    viewport: { width: 1280, height: 800 },
    trace: 'retain-on-failure',
  },
  webServer: process.env.TEST_BASE_URL ? undefined : {
    command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5176 --strictPort',
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    url: 'http://127.0.0.1:5176',
    reuseExistingServer: false,
  },
});
