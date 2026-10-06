import type { ProductFeatureId } from '@easymate/contracts';
import type { View } from './workspace.js';
import { isProductFeatureEnabled } from './product.js';

export type FeatureIcon = 'chat' | 'employees' | 'capabilities' | 'knowledge' | 'automations' | 'assets' | 'data' | 'projects' | 'remote' | 'docs';
export interface RendererFeature { id: ProductFeatureId; view: View; navigation?: { labelKey: string; icon: FeatureIcon; order: number }; desktopOnly?: boolean }
export const rendererFeatures: readonly RendererFeature[] = [
  { id: 'chat', view: 'chat', navigation: { labelKey: 'nav.workspace', icon: 'chat', order: 10 } },
  { id: 'employees', view: 'employees', navigation: { labelKey: 'nav.employees', icon: 'employees', order: 20 } },
  { id: 'projects', view: 'projects', navigation: { labelKey: 'nav.projects', icon: 'projects', order: 30 } },
  { id: 'capabilities', view: 'capabilities', navigation: { labelKey: 'nav.capabilities', icon: 'capabilities', order: 40 } },
  { id: 'knowledge', view: 'knowledge', navigation: { labelKey: 'nav.knowledge', icon: 'knowledge', order: 50 } },
  { id: 'automations', view: 'automations', navigation: { labelKey: 'nav.automations', icon: 'automations', order: 60 } },
  { id: 'assets', view: 'assets', navigation: { labelKey: 'nav.assets', icon: 'assets', order: 70 } },
  { id: 'data', view: 'data', navigation: { labelKey: '数据工作台', icon: 'data', order: 80 } },
  { id: 'remote', view: 'remote', navigation: { labelKey: 'nav.remote', icon: 'remote', order: 90 } },
  { id: 'docs', view: 'docs', navigation: { labelKey: 'nav.docs', icon: 'docs', order: 100 } },
  { id: 'environment', view: 'env' }, { id: 'settings', view: 'settings' },
] as const;
export function featureForView(view: View): RendererFeature | undefined { return rendererFeatures.find((feature) => feature.view === view); }
export function visibleNavigationFeatures(): RendererFeature[] { return rendererFeatures.filter((feature) => feature.navigation && isProductFeatureEnabled(feature.id)).sort((a, b) => a.navigation!.order - b.navigation!.order); }
