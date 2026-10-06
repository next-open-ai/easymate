export const baseThemeTokens = Object.freeze({
  color: { accent: '#4566db', success: '#10b981', warning: '#f59e0b', danger: '#e11d48' },
  radius: { sm: '8px', md: '10px', lg: '16px' },
  spacing: { xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '24px' },
  typography: { body: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', mono: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
});
export type ThemeTokens = typeof baseThemeTokens;
export function themeTokensToCssVariables(tokens: ThemeTokens = baseThemeTokens): Record<string, string> {
  return { '--product-accent': tokens.color.accent, '--status-success': tokens.color.success, '--status-warning': tokens.color.warning, '--status-danger': tokens.color.danger, '--radius-sm': tokens.radius.sm, '--radius-md': tokens.radius.md, '--radius-lg': tokens.radius.lg, '--font-body': tokens.typography.body, '--font-mono': tokens.typography.mono };
}
