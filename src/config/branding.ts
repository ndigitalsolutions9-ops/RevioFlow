export const branding = {
  name: 'ReviewFlow',
  tagline: 'Turn customer experiences into better reviews.',
  domain: 'reviewflow.app',
  colors: {
    primary: '#2563eb',
    primaryDark: '#1d4ed8',
    primaryLight: '#3b82f6',
    accent: '#0ea5e9',
    success: '#16a34a',
    warning: '#d97706',
    error: '#dc2626',
  },
} as const;

export type Branding = typeof branding;
