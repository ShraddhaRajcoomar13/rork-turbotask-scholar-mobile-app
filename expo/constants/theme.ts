export const COLORS = {
  primary: '#22354d',
  accent: '#fc2a75',
  secondary: '#fed24c',
  background: '#f8fafc',
  surface: '#ffffff',
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
    light: '#94a3b8',
  },
  border: '#e2e8f0',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  // Teacher-specific colors
  education: {
    primary: '#4f46e5',
    secondary: '#7c3aed',
    light: '#a78bfa',
    background: '#f3f4f6',
  },
  grade: {
    excellent: '#059669',
    good: '#0891b2',
    average: '#d97706',
    needsWork: '#dc2626',
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const TYPOGRAPHY = {
  h1: { fontSize: 32, fontWeight: 'bold' as const },
  h2: { fontSize: 24, fontWeight: 'bold' as const },
  h3: { fontSize: 20, fontWeight: '600' as const },
  h4: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: 'normal' as const },
  bodyLarge: { fontSize: 18, fontWeight: 'normal' as const },
  caption: { fontSize: 14, fontWeight: 'normal' as const },
  small: { fontSize: 12, fontWeight: 'normal' as const },
  // Teacher-specific typography
  lesson: { fontSize: 16, fontWeight: '500' as const },
  grade: { fontSize: 14, fontWeight: '600' as const },
  subject: { fontSize: 15, fontWeight: '500' as const },
} as const;