import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_PRODUCT_MANIFEST, parseProductManifest } from '../product-manifest.js';

test('default product manifest preserves the EasyMate baseline', () => {
  const value = parseProductManifest(DEFAULT_PRODUCT_MANIFEST);
  assert.equal(value.runtime.apiPort, 49832);
  assert.ok(value.features.enabled.includes(value.features.home));
});

test('manifest rejects duplicate features and a disabled home', () => {
  assert.throws(() => parseProductManifest({ ...DEFAULT_PRODUCT_MANIFEST, features: { enabled: ['chat', 'chat'], home: 'projects' } }));
});
