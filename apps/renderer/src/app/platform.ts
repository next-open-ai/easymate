import type { View } from './workspace.js';
import { featureForView } from './feature-registry.js';
import { isProductFeatureEnabled } from './product.js';

export function isDesktopShell(): boolean {
  return Boolean(window.easymateDesktop);
}

export function isWebRuntime(): boolean {
  return !isDesktopShell();
}

export function isViewAvailable(view: View): boolean {
  const feature = featureForView(view);
  if (!feature || !isProductFeatureEnabled(feature.id)) return false;
  return !feature.desktopOnly || isDesktopShell();
}
