import assert from 'node:assert/strict';
import test from 'node:test';
import { MemoryStore, VersionedStore, migrateEnvelope } from '../index.js';

test('legacy values migrate without mutation', () => {
  const legacy = { name: 'old' };
  const migrations = new Map<number, (value: unknown) => unknown>([[0, (value) => ({ ...(value as object), enabled: true })], [1, (value) => ({ ...(value as object), name: 'new' })]]);
  assert.deepEqual(migrateEnvelope(legacy, 2, migrations), { schemaVersion: 2, value: { name: 'new', enabled: true } });
  assert.deepEqual(legacy, { name: 'old' });
});
test('versioned store persists an explicit envelope', async () => {
  const memory = new MemoryStore();
  const store = new VersionedStore<{ count: number }>(memory, 'state', 1, new Map([[0, () => ({ count: 0 })]]));
  await store.write({ count: 3 });
  assert.deepEqual(await store.read(), { schemaVersion: 1, value: { count: 3 } });
});
