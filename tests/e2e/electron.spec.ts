import { _electron as electron, expect, test } from '@playwright/test';
import { mkdtempSync, rmSync } from 'node:fs'; import os from 'node:os'; import path from 'node:path';
test('Electron launches with isolated data and exposes the safe preload bridge', async () => {
  const dataDir = mkdtempSync(path.join(os.tmpdir(), 'easymate-e2e-electron-'));
  const app = await electron.launch({ args: ['apps/desktop/src/main/index.cjs'], cwd: process.cwd(), env: { ...process.env, EASYMATE_DATA_DIR: dataDir, EASYMATE_API_PORT: '49832', EASYMATE_ORCH_RUNNER: 'echo', EASYMATE_E2E: '1' } });
  try { const page = await app.firstWindow(); await expect(page).toHaveTitle('EasyMate'); await expect(page.getByRole('heading', { name: '初始化本地管理员' })).toBeVisible(); expect(await page.evaluate(() => Boolean(window.easymateDesktop))).toBe(true); }
  finally { await app.close(); rmSync(dataDir, { recursive: true, force: true }); }
});
