import { createApp } from './app.js';
import { requestParentSecrets } from './modules/orchestration/secrets.js';

async function bootstrap() {
  const port = Number(process.env.EASYMATE_API_PORT ?? 49832);
  const host = process.env.EASYMATE_API_HOST || '127.0.0.1';
  // Kick off secrets early, but do not block /api/health on the full 4s parent
  // IPC timeout — that raced Electron's waitForApi and left Vite ECONNREFUSED.
  const secretsReady = requestParentSecrets().catch(() => undefined);
  await Promise.race([
    secretsReady,
    new Promise<void>((resolve) => setTimeout(resolve, 750)),
  ]);
  const app = await createApp();
  await app.listen({ port, host });
  void secretsReady;

  const close = async () => {
    await app.close();
    process.exit(0);
  };
  process.once('SIGINT', close);
  process.once('SIGTERM', close);
}

void bootstrap();
