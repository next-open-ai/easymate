import { DEFAULT_PRODUCT_MANIFEST, parseProductManifest, type ProductFeatureId, type ProductManifestV1 } from '@easymate/contracts';

function loadProductManifest(): ProductManifestV1 {
  const raw = import.meta.env.VITE_EASYMATE_PRODUCT_MANIFEST;
  if (!raw) return DEFAULT_PRODUCT_MANIFEST;
  try { return parseProductManifest(JSON.parse(raw)); }
  catch (cause) {
    console.error('Invalid product manifest; using EasyMate defaults.', cause);
    return DEFAULT_PRODUCT_MANIFEST;
  }
}

export const productManifest = loadProductManifest();
const enabledFeatures = new Set<ProductFeatureId>(productManifest.features.enabled);
export function isProductFeatureEnabled(feature: ProductFeatureId): boolean { return enabledFeatures.has(feature); }
export function applyProductIdentity(): void {
  document.title = productManifest.name;
  document.documentElement.style.setProperty('--product-accent', productManifest.brand.accent);
  document.documentElement.dataset.product = productManifest.id;
}
