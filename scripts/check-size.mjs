import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const limits = [{ file: 'apps/renderer/dist/assets', maxBytes: 6_000_000, label: 'renderer assets total' }];
const largestEntryBudget = 4_000_000;

function sizeOf(target) {
  if (!existsSync(target)) return 0;
  const stat = statSync(target);
  if (stat.isFile()) return stat.size;
  return readdirSync(target, { withFileTypes: true })
    .reduce((total, entry) => total + sizeOf(path.join(target, entry.name)), 0);
}

let failed = false;
for (const limit of limits) {
  const bytes = await sizeOf(limit.file);
  const mb = (bytes / 1_000_000).toFixed(2);
  console.log(`${limit.label}: ${mb} MB / ${(limit.maxBytes / 1_000_000).toFixed(2)} MB`);
  if (bytes > limit.maxBytes) failed = true;
}
if (failed) process.exitCode = 1;

const assetsDir = 'apps/renderer/dist/assets';
if (existsSync(assetsDir)) {
  const javascript = readdirSync(assetsDir).filter((file) => file.endsWith('.js')).map((file) => ({ file, bytes: statSync(path.join(assetsDir, file)).size })).sort((a, b) => b.bytes - a.bytes);
  const largest = javascript[0];
  if (largest) {
    console.log(`largest renderer JS: ${largest.file} ${(largest.bytes / 1_000_000).toFixed(2)} MB / ${(largestEntryBudget / 1_000_000).toFixed(2)} MB`);
    if (largest.bytes > largestEntryBudget) process.exitCode = 1;
  }
}
