// Centralized theme configuration following Tailwind's naming conventions
export const colors = {
  // Slate scale - primary grays/backgrounds
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9', 
    200: '#e2e8f0', // Primary text color
    300: '#cbd5e1', // Secondary text
    400: '#94a3b8', // Timestamp values
    500: '#64748b', // Muted text, placeholders
    600: '#475569', // Borders, disabled text
    700: '#334155', // Lighter borders, section backgrounds
    800: '#1e293b', // Input backgrounds, main gradient end
    900: '#0f172a', // Container backgrounds, very dark
    950: '#0a0d14', // Darkest background, main gradient start
  },

  // Primary accent colors
  primary: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#00f5ff', // Main accent color
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
    950: '#083344',
  },

  // Secondary accent colors (purple gradient)
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#bf00ff', // Secondary accent color
    600: '#a855f7',
    700: '#9333ea',
    800: '#7c3aed',
    900: '#6b21a8',
    950: '#4c1d95',
  },

  // Error/danger colors
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626', // Error color
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },

  // Semantic color mappings
  background: {
    primary: '#0a0d14',     // slate.950
    secondary: '#1e293b',   // slate.800
    tertiary: '#334155',    // slate.700
    surface: '#0f172a',     // slate.900
  },

  text: {
    primary: '#e2e8f0',     // slate.200
    secondary: '#cbd5e1',   // slate.300
    muted: '#64748b',       // slate.500
    disabled: '#475569',    // slate.600
    accent: '#00f5ff',      // primary.500
    error: '#dc2626',       // red.600
    onAccent: '#0a0d14',    // For text on colored backgrounds
  },

  border: {
    default: '#475569',     // slate.600
    light: '#334155',       // slate.700
    focus: '#00f5ff',       // primary.500
    error: '#dc2626',       // red.600
  },

  // Gradient definitions
  gradients: {
    primary: ['#00f5ff', '#bf00ff'], // primary.500 to secondary.500
    background: ['#0a0d14', '#1e293b'], // slate.950 to slate.800
    section: ['#1e293b', '#334155'], // slate.800 to slate.700
    dark: ['#0f172a', '#1e293b'], // slate.900 to slate.800
  },

  // Component-specific colors
  button: {
    primary: {
      background: ['#00f5ff', '#bf00ff'],
      text: '#0a0d14',
      shadow: '#00f5ff',
    },
    secondary: {
      background: '#334155',
      border: '#475569',
      text: '#e2e8f0',
    },
    danger: {
      background: '#dc2626',
      text: '#ffffff',
      shadow: '#dc2626',
    },
    ghost: {
      background: 'transparent',
      border: '#00f5ff',
      text: '#00f5ff',
    },
  },

  input: {
    background: '#1e293b',
    border: '#475569',
    borderFocus: '#00f5ff',
    borderError: '#dc2626',
    text: '#e2e8f0',
    placeholder: '#64748b',
    label: '#e2e8f0',
  },

  // Loading and status colors
  loading: '#00f5ff',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6',
} as const;

// Shadow configurations
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  accent: {
    shadowColor: '#00f5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  danger: {
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
} as const;

// Typography scale
export const typography = {
  size: {
    xs: 11,
    sm: 12,
    base: 14,
    lg: 15,
    xl: 16,
    '2xl': 18,
    '3xl': 20,
    '4xl': 24,
    '5xl': 28,
  },
  weight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
} as const;

// Spacing scale (following Tailwind's 4px base)
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
} as const;

// Border radius scale
export const borderRadius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

// Export the complete theme
export const theme = {
  colors,
  shadows,
  typography,
  spacing,
  borderRadius,
} as const;

export default theme; 