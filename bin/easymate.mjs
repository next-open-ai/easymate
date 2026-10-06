#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { startWebLauncher } from '../scripts/lib/web-launcher.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
const command = process.argv[2] || 'start';

function printDoctor() {
  process.stdout.write(`EasyMate ${packageJson.version}\n`);
  process.stdout.write(`projectRoot: ${projectRoot}\n`);
  process.stdout.write(`engine: pi\n`);
  process.stdout.write(`dataDir: ${process.env.EASYMATE_DATA_DIR || '~/.easymate'}\n`);
}

switch (command) {
  case 'version':
  case '--version':
  case '-v':
    process.stdout.write(`${packageJson.version}\n`);
    break;
  case 'doctor':
    printDoctor();
    break;
  case 'init': {
    process.stdout.write('EasyMate uses the in-process Pi engine; no agent sidecar installation is required.\n');
    break;
  }
  case 'start':
  default:
    await startWebLauncher(projectRoot);
    break;
}
