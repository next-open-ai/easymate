import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', timeout: 45_000, fullyParallel: false, retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['line'], ['html', { open: 'never', outputFolder: 'test-results/html' }]] : 'line', outputDir: 'test-results/artifacts',
  use: { baseURL: 'http://127.0.0.1:44600', trace: 'retain-on-failure', screenshot: 'only-on-failure', video: 'retain-on-failure' },
  projects: [{ name: 'web-chromium', testMatch: /web\.spec\.ts/, use: { ...devices['Desktop Chrome'] } }, { name: 'electron', testMatch: /electron\.spec\.ts/ }],
  webServer: { command: 'node scripts/e2e-web-server.mjs', url: 'http://127.0.0.1:44600/api/health', reuseExistingServer: false, timeout: 30_000 },
});
