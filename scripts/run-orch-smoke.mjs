import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const port = String(44_000 + (process.pid % 1_000));
const token = `smoke-${process.pid}-${Date.now()}`;
const dataDir = mkdtempSync(path.join(os.tmpdir(), 'easymate-orch-smoke-'));
const api = spawn(process.execPath, ['apps/api/dist/main.cjs'], {
  cwd: process.cwd(), stdio: ['ignore', 'ignore', 'inherit'],
  env: { ...process.env, EASYMATE_ORCH_RUNNER: 'memory-approval', EASYMATE_DATA_DIR: dataDir, EASYMATE_API_PORT: port, EASYMATE_INTERNAL_TOKEN: token },
});

async function waitForApi() {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    try { if ((await fetch(`http://127.0.0.1:${port}/api/health`)).ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 80));
  }
  throw new Error('Timed out waiting for isolated smoke API.');
}

try {
  await waitForApi();
  const smoke = spawn(process.execPath, ['scripts/headless-gateway-smoke.mjs'], { cwd: process.cwd(), stdio: 'inherit', env: { ...process.env, EASYMATE_API_PORT: port, EASYMATE_INTERNAL_TOKEN: token } });
  const code = await new Promise((resolve) => smoke.once('exit', resolve));
  if (code !== 0) process.exitCode = typeof code === 'number' ? code : 1;
} finally {
  api.kill('SIGTERM');
  await Promise.race([new Promise((resolve) => api.once('exit', resolve)), new Promise((resolve) => setTimeout(resolve, 2_000))]);
  rmSync(dataDir, { recursive: true, force: true });
}
