import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const json = (relative) => JSON.parse(read(relative));

assert.equal(json('package.json').name, '@next-open-ai/easymate');
assert.equal(json('apps/desktop/package.json').build.appId, 'com.easymate.desktop');
assert.equal(json('apps/desktop/package.json').build.productName, 'EasyMate');
assert.deepEqual(json('apps/desktop/package.json').build.extraResources.map((item) => item.to), ['api', 'python-runtime']);

const stream = read('packages/agent-core/src/stream-reply.ts');
assert.match(stream, /from '\.\/pi-runtime\.js'/);
assert.doesNotMatch(stream, /agentscope|\/dsh|execution-backend/i);
assert.match(read('apps/api/src/modules/orchestration/context-assembler.ts'), /const engine = 'pi' as const/);

const requirements = read('runtimes/python-runtime/requirements.txt');
const installedRequirements = requirements.split('\n').map((line) => line.trim()).filter((line) => line && !line.startsWith('#'));
assert.deepEqual(installedRequirements, []);
for (const manifest of ['package.json', 'packages/agent-core/package.json', 'apps/api/package.json', 'apps/desktop/package.json']) {
  assert.doesNotMatch(read(manifest), /agentscope|deepseek-harness|dsh-sdk/i, `${manifest} contains a multi-engine dependency`);
}

assert.match(read('apps/renderer/package.json'), /--port 49831 --strictPort/);
assert.match(read('apps/api/src/main.ts'), /EASYMATE_API_PORT \?\? 49832/);
console.log('EASYMATE-PRODUCT PASS: isolated brand, ports, single Pi execution, slim Python packaging.');
