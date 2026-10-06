import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const port = String(45_000 + (process.pid % 1_000));
const dataDir = mkdtempSync(path.join(os.tmpdir(), 'easymate-auth-regression-'));
const base = `http://127.0.0.1:${port}/api`;
const api = spawn(process.execPath, ['apps/api/dist/main.cjs'], { cwd: process.cwd(), stdio: ['ignore', 'ignore', 'inherit'], env: { ...process.env, EASYMATE_DATA_DIR: dataDir, EASYMATE_API_PORT: port } });

async function waitForApi() {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    try { if ((await fetch(`${base}/health`)).ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 80));
  }
  throw new Error('Timed out waiting for auth regression API.');
}
async function request(pathname, init = {}) {
  const response = await fetch(`${base}${pathname}`, init);
  const body = await response.json().catch(() => ({}));
  return { response, body };
}

try {
  await waitForApi();
  const bootstrap = await request('/auth/bootstrap');
  assert.equal(bootstrap.body.needsSetup, true);
  const denied = await request('/settings/model');
  assert.equal(denied.response.status, 401);
  const created = await request('/auth/bootstrap', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ orgId: 'test-org', username: 'admin', displayName: 'Admin', password: 'safe-pass-123' }) });
  assert.equal(created.response.status, 200);
  assert.ok(created.body.token);
  const authorized = await request('/auth/me', { headers: { 'x-easymate-session': created.body.token } });
  assert.equal(authorized.response.status, 200);
  assert.equal(authorized.body.user.orgId, 'test-org');
  const badLogin = await request('/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username: 'admin', password: 'wrong-pass' }) });
  assert.equal(badLogin.response.status, 401);
  console.log('AUTH REGRESSION PASS: bootstrap, guard, session and invalid login.');
} finally {
  api.kill('SIGTERM');
  await Promise.race([new Promise((resolve) => api.once('exit', resolve)), new Promise((resolve) => setTimeout(resolve, 2_000))]);
  rmSync(dataDir, { recursive: true, force: true });
}
