import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const dataDir = mkdtempSync(path.join(os.tmpdir(), 'easymate-e2e-web-'));
const child = spawn(process.execPath, ['apps/api/dist/main.cjs'], { cwd: process.cwd(), stdio: 'inherit', env: { ...process.env, EASYMATE_DATA_DIR: dataDir, EASYMATE_API_PORT: '44600', EASYMATE_WEB_STATIC_DIR: path.resolve('apps/renderer/dist'), EASYMATE_ORCH_RUNNER: 'echo' } });
const stop = () => { child.kill('SIGTERM'); rmSync(dataDir, { recursive: true, force: true }); };
process.once('SIGINT', stop); process.once('SIGTERM', stop); process.once('exit', () => rmSync(dataDir, { recursive: true, force: true })); child.once('exit', (code) => process.exit(code ?? 0));
