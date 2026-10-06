import { z } from 'zod';

export const ProductFeatureIdSchema = z.enum(['chat', 'employees', 'projects', 'capabilities', 'knowledge', 'automations', 'assets', 'data', 'remote', 'environment', 'docs', 'settings']);
export type ProductFeatureId = z.infer<typeof ProductFeatureIdSchema>;

export const ProductManifestV1Schema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().regex(/^[a-z][a-z0-9-]{1,62}$/),
  name: z.string().min(1).max(80),
  description: z.string().max(240).default(''),
  brand: z.object({ shortName: z.string().min(1).max(24), accent: z.string().regex(/^#[0-9a-fA-F]{6}$/) }),
  runtime: z.object({ apiPort: z.number().int().min(1024).max(65535), rendererPort: z.number().int().min(1024).max(65535), dataDirName: z.string().regex(/^\.[a-zA-Z0-9._-]+$/) }),
  features: z.object({ enabled: z.array(ProductFeatureIdSchema).min(1), home: ProductFeatureIdSchema }).superRefine((value, context) => {
    if (!value.enabled.includes(value.home)) context.addIssue({ code: z.ZodIssueCode.custom, message: 'features.home must be enabled', path: ['home'] });
    if (new Set(value.enabled).size !== value.enabled.length) context.addIssue({ code: z.ZodIssueCode.custom, message: 'features.enabled contains duplicates', path: ['enabled'] });
  }),
}).strict();
export type ProductManifestV1 = z.infer<typeof ProductManifestV1Schema>;

export const DEFAULT_PRODUCT_MANIFEST: ProductManifestV1 = parseProductManifest({
  schemaVersion: 1, id: 'easymate', name: 'EasyMate', description: 'Cross-platform local AI workspace.',
  brand: { shortName: 'EasyMate', accent: '#4566db' },
  runtime: { apiPort: 49832, rendererPort: 49831, dataDirName: '.easymate' },
  features: { enabled: ['chat', 'employees', 'projects', 'capabilities', 'knowledge', 'automations', 'assets', 'data', 'remote', 'environment', 'docs', 'settings'], home: 'chat' },
});

export function parseProductManifest(input: unknown): ProductManifestV1 { return ProductManifestV1Schema.parse(input); }
