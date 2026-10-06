import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { FastifyRequest } from 'fastify';

export interface AuditEvent { id: string; at: string; action: string; method: string; path: string; statusCode: number; orgId?: string; userId?: string; sessionId?: string; requestId?: string }
const MAX_AUDIT_BYTES = 5 * 1024 * 1024;
function dataDir() { return process.env.EASYMATE_DATA_DIR || path.join(os.homedir(), '.easymate'); }
function auditFile() { return path.join(dataDir(), 'logs', 'audit.jsonl'); }
function lifecycleFile() { return path.join(dataDir(), 'runtime-lifecycle.json'); }
function ensureParent(file: string) { fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 }); }
function safePath(raw: string) { return raw.split('?')[0].replace(/\/[0-9a-f]{8}-[0-9a-f-]{27,}/gi, '/:id').slice(0, 240); }
function rotateAudit() {
  const file = auditFile();
  try { if (fs.statSync(file).size >= MAX_AUDIT_BYTES) fs.renameSync(file, `${file}.1`); } catch {}
}
export function appendAudit(request: FastifyRequest, statusCode: number): void {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) return;
  const file = auditFile(); ensureParent(file); rotateAudit();
  const event: AuditEvent = { id: randomUUID(), at: new Date().toISOString(), action: `${request.method} ${safePath(request.url)}`, method: request.method, path: safePath(request.url), statusCode, ...(request.auth ? { orgId: request.auth.orgId, userId: request.auth.userId, sessionId: request.auth.sessionId } : {}), ...(request.id ? { requestId: String(request.id) } : {}) };
  fs.appendFileSync(file, `${JSON.stringify(event)}\n`, { encoding: 'utf8', mode: 0o600 });
}
export function recentAudit(limit = 500): AuditEvent[] {
  try { return fs.readFileSync(auditFile(), 'utf8').trim().split('\n').slice(-Math.max(1, Math.min(limit, 2_000))).map((line) => JSON.parse(line) as AuditEvent); } catch { return []; }
}
export interface LifecycleState { instanceId: string; startedAt: string; cleanExit: boolean; previousUncleanExit: boolean; stoppedAt?: string }
let lifecycle: LifecycleState | null = null;
export function markRuntimeStarted(): LifecycleState {
  let previous: LifecycleState | null = null;
  try { previous = JSON.parse(fs.readFileSync(lifecycleFile(), 'utf8')) as LifecycleState; } catch {}
  lifecycle = { instanceId: randomUUID(), startedAt: new Date().toISOString(), cleanExit: false, previousUncleanExit: Boolean(previous && !previous.cleanExit) };
  ensureParent(lifecycleFile()); fs.writeFileSync(lifecycleFile(), JSON.stringify(lifecycle, null, 2), { mode: 0o600 }); return lifecycle;
}
export function markRuntimeStopped(): void { if (!lifecycle) return; lifecycle = { ...lifecycle, cleanExit: true, stoppedAt: new Date().toISOString() }; fs.writeFileSync(lifecycleFile(), JSON.stringify(lifecycle, null, 2), { mode: 0o600 }); }
export function lifecycleState(): LifecycleState | null { return lifecycle; }
