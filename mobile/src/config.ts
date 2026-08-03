// HAKI Design System — React Native token map
// Source: stitch_haki_ga_transcription_app/haki_design_system/DESIGN.md

import { Platform } from 'react-native';

// ─── API ─────────────────────────────────────────────────────────────────────
const YOUR_LOCAL_IP = '192.168.4.136';

export const API_BASE_URL = Platform.select({
  android: `http://${YOUR_LOCAL_IP}:8000`,
  ios: `http://${YOUR_LOCAL_IP}:8000`,
  default: 'http://localhost:8000',
}) as string;

export const ENDPOINTS = {
  TRANSCRIBE: '/api/transcribe',
  HISTORY: '/api/history',
  TRANSCRIPTION: (id: string) => `/api/transcription/${id}`,
  HEALTH: '/api/health',
};

// ─── Colors ──────────────────────────────────────────────────────────────────
export const COLORS = {
  // Primary
  primary: '#004ac6',
  onPrimary: '#ffffff',
  primaryContainer: '#2563eb',
  onPrimaryContainer: '#eeefff',
  primaryFixed: '#dbe1ff',
  primaryFixedDim: '#b4c5ff',
  inversePrimary: '#b4c5ff',

  // Secondary
  secondary: '#006c49',
  onSecondary: '#ffffff',
  secondaryContainer: '#6cf8bb',
  onSecondaryContainer: '#00714d',
  secondaryFixed: '#6ffbbe',
  secondaryFixedDim: '#4edea3',

  // Tertiary
  tertiary: '#943700',
  onTertiary: '#ffffff',
  tertiaryContainer: '#bc4800',
  onTertiaryContainer: '#ffede6',

  // Error
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',

  // Surface
  background: '#faf8ff',
  onBackground: '#131b2e',
  surface: '#faf8ff',
  surfaceDim: '#d2d9f4',
  surfaceBright: '#faf8ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f2f3ff',
  surfaceContainer: '#eaedff',
  surfaceContainerHigh: '#e2e7ff',
  surfaceContainerHighest: '#dae2fd',
  onSurface: '#131b2e',
  onSurfaceVariant: '#434655',
  inverseSurface: '#283044',
  inverseOnSurface: '#eef0ff',
  surfaceTint: '#0053db',
  surfaceVariant: '#dae2fd',

  // Outline
  outline: '#737686',
  outlineVariant: '#c3c6d7',

  // White
  white: '#ffffff',
};

// ─── Typography sizes ─────────────────────────────────────────────────────────
export const TYPOGRAPHY = {
  displayLg: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40, letterSpacing: -0.64 },
  headlineMd: { fontSize: 24, fontWeight: '600' as const, lineHeight: 32, letterSpacing: -0.24 },
  headlineSm: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  bodyLg: { fontSize: 18, fontWeight: '400' as const, lineHeight: 28 },
  bodyMd: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodySm: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  labelMd: { fontSize: 12, fontWeight: '600' as const, lineHeight: 16, letterSpacing: 0.6 },
  transcriptionText: { fontSize: 18, fontWeight: '500' as const, lineHeight: 32, letterSpacing: 0.18 },
};

// ─── Spacing ──────────────────────────────────────────────────────────────────
export const SIZES = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  containerMargin: 16,
  gutter: 12,
  borderRadius: 12,
  borderRadiusSm: 8,
  borderRadiusFull: 9999,
};

// ─── Elevation shadow ─────────────────────────────────────────────────────────
export const SHADOW = {
  tonal: {
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
};
