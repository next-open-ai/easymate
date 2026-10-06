import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';

export function apiEntry(projectRoot) {
  return path.join(projectRoot, 'apps', 'api', 'dist', 'main.cjs');
}

export function staticDir(projectRoot) {
  return path.join(projectRoot, 'apps', 'renderer', 'dist');
}

function canListen(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.on('error', () => resolve(false));
    server.listen({ host: '127.0.0.1', port }, () => server.close(() => resolve(true)));
  });
}

export async function choosePort(basePort) {
  for (let offset = 0; offset < 20; offset += 1) {
    const port = basePort + offset;
    if (await canListen(port)) return port;
  }
  throw new Error(`No available port found near ${basePort}.`);
}

export async function startWebLauncher(projectRoot, options = {}) {
  const entry = apiEntry(projectRoot);
  const staticRoot = staticDir(projectRoot);
  const requestedPort = Number(options.port || process.env.EASYMATE_API_PORT || '49832');
  const host = options.host || process.env.EASYMATE_API_HOST || '127.0.0.1';
  if (!existsSync(entry)) throw new Error(`Missing API build: ${entry}. Run \`pnpm build\` first.`);
  if (!existsSync(path.join(staticRoot, 'index.html'))) throw new Error(`Missing renderer build: ${staticRoot}/index.html. Run \`pnpm --filter @easymate/renderer build\` first.`);

  const extraEnv = {
    EASYMATE_AGENT_ENGINE: 'pi',
    ...(options.dataDir || process.env.EASYMATE_DATA_DIR
      ? { EASYMATE_DATA_DIR: options.dataDir || process.env.EASYMATE_DATA_DIR }
      : {}),
  };

  const port = await choosePort(requestedPort);
  const child = spawn(process.execPath, [entry], {
    cwd: projectRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      ...extraEnv,
      EASYMATE_API_PORT: String(port),
      EASYMATE_API_HOST: host,
      EASYMATE_WEB_STATIC_DIR: staticRoot,
    },
  });
  child.once('spawn', () => {
    process.stdout.write(`EasyMate Web is starting at http://${host}:${port}\n`);
  });
  child.once('exit', (code) => process.exit(code ?? 0));
  return { port, child };
}
