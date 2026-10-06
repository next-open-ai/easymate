import type { FastifyPluginAsync } from 'fastify';
import { zipSync, strToU8 } from 'fflate';
import { requireAdmin } from '../auth/service.js';
import { lifecycleState, recentAudit } from './service.js';

export const operationsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/operations/status', async (request) => { requireAdmin(request); return { lifecycle: lifecycleState(), auditEvents: recentAudit(2_000).length }; });
  app.get('/operations/diagnostics', async (request, reply) => {
    const auth = requireAdmin(request);
    const generatedAt = new Date().toISOString();
    const metadata = { schemaVersion: 1, generatedAt, service: 'easymate-api', node: process.version, platform: process.platform, arch: process.arch, uptimeSeconds: Math.round(process.uptime()), orgId: auth.orgId, lifecycle: lifecycleState(), environment: { apiHost: process.env.EASYMATE_API_HOST || '127.0.0.1', apiPort: Number(process.env.EASYMATE_API_PORT || 49832), runner: process.env.EASYMATE_ORCH_RUNNER || 'pi' } };
    const archive = zipSync({ 'metadata.json': strToU8(JSON.stringify(metadata, null, 2)), 'audit-recent.json': strToU8(JSON.stringify(recentAudit(500), null, 2)), 'README.txt': strToU8('EasyMate diagnostic bundle. Secrets, request bodies, prompts and user files are intentionally excluded.\n') });
    return reply.type('application/zip').header('content-disposition', `attachment; filename="easymate-diagnostics-${Date.now()}.zip"`).send(Buffer.from(archive));
  });
};
