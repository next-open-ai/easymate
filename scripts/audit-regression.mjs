import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { unzipSync, strFromU8 } from 'fflate';

const port = String(46_000 + (process.pid % 1_000));
const dataDir = mkdtempSync(path.join(os.tmpdir(), 'easymate-audit-regression-'));
const base = `http://127.0.0.1:${port}/api`;
writeFileSync(path.join(dataDir, 'runtime-lifecycle.json'), JSON.stringify({ instanceId: 'previous', startedAt: new Date(0).toISOString(), cleanExit: false, previousUncleanExit: false }));
const api = spawn(process.execPath, ['apps/api/dist/main.cjs'], { cwd: process.cwd(), stdio: ['ignore', 'ignore', 'inherit'], env: { ...process.env, EASYMATE_DATA_DIR: dataDir, EASYMATE_API_PORT: port } });
async function waitForApi() { for (let i = 0; i < 120; i += 1) { try { if ((await fetch(`${base}/health`)).ok) return; } catch {} await new Promise((resolve) => setTimeout(resolve, 80)); } throw new Error('API timeout'); }
try {
  await waitForApi();
  const created = await fetch(`${base}/auth/bootstrap`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ orgId: 'audit-org', username: 'admin', displayName: 'Admin', password: 'never-log-this-password' }) });
  const { token } = await created.json();
  const headers = { 'x-easymate-session': token, 'content-type': 'application/json' };
  assert.equal((await fetch(`${base}/settings/runtime`, { method: 'PUT', headers, body: JSON.stringify({ maxConcurrentRunsGlobal: 3 }) })).status, 200);
  const status = await (await fetch(`${base}/operations/status`, { headers })).json();
  assert.ok(status.auditEvents >= 2);
  assert.equal(status.lifecycle.previousUncleanExit, true);
  const diagnosticResponse = await fetch(`${base}/operations/diagnostics`, { headers });
  assert.equal(diagnosticResponse.status, 200);
  const zip = unzipSync(new Uint8Array(await diagnosticResponse.arrayBuffer()));
  assert.ok(zip['metadata.json']); assert.ok(zip['audit-recent.json']); assert.ok(zip['README.txt']);
  const all = Object.values(zip).map(strFromU8).join('\n');
  assert.doesNotMatch(all, /never-log-this-password|x-easymate-session/i);
  const auditRaw = readFileSync(path.join(dataDir, 'logs', 'audit.jsonl'), 'utf8');
  assert.match(auditRaw, /PUT \/api\/settings\/runtime/);
  console.log('AUDIT REGRESSION PASS: bounded audit and redacted diagnostic bundle.');
} finally {
  api.kill('SIGTERM');
  await Promise.race([new Promise((resolve) => api.once('exit', resolve)), new Promise((resolve) => setTimeout(resolve, 2_000))]);
  rmSync(dataDir, { recursive: true, force: true });
}
