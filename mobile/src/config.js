// API Configuration
// For development on a physical device, use your machine's local IP address
// For emulator, use 10.0.2.2 (Android) or localhost (iOS)

import { Platform } from 'react-native';

// Your computer's local IP address for mobile device testing
// When running backend on this computer and app on your phone,
// use your computer's LAN IP (e.g., 192.168.x.x)
const YOUR_LOCAL_IP = '192.168.4.136';

const DEV_API_HOST = Platform.select({
  android: `http://${YOUR_LOCAL_IP}:8000`,
  ios: `http://${YOUR_LOCAL_IP}:8000`,
  default: 'http://localhost:8000',
});

// For release builds, use the same local backend.
// Update this to your production API URL when deploying.
const PROD_API_HOST = `http://${YOUR_LOCAL_IP}:8000`;

export const API_BASE_URL = __DEV__ ? DEV_API_HOST : PROD_API_HOST;

export const ENDPOINTS = {
  TRANSCRIBE: '/api/transcribe',
  HISTORY: '/api/history',
  TRANSCRIPTION: (fileId) => `/api/transcription/${fileId}`,
  HEALTH: '/api/health',
};

export const COLORS = {
  primary: '#2563eb',       // blue-600
  primaryLight: '#dbeafe',  // blue-100
  primaryDark: '#1e40af',   // blue-800
  secondary: '#6b7280',     // gray-500
  success: '#16a34a',       // green-600
  successLight: '#f0fdf4',  // green-50
  error: '#dc2626',         // red-600
  errorLight: '#fef2f2',    // red-50
  warning: '#f59e0b',       // amber-500
  background: '#f8fafc',    // slate-50
  white: '#ffffff',
  textPrimary: '#111827',   // gray-900
  textSecondary: '#6b7280', // gray-500
  textTertiary: '#9ca3af',  // gray-400
  border: '#d1d5db',        // gray-300
  borderLight: '#e5e7eb',   // gray-200
  cardShadow: '#00000010',
};

export const FONTS = {
  regular: undefined, // Uses system default
  medium: undefined,
  bold: undefined,
};

export const SIZES = {
  // Global sizes
  base: 8,
  small: 12,
  font: 14,
  medium: 16,
  large: 18,
  extraLarge: 24,
  xxl: 32,

  // Spacing
  padding: 16,
  paddingLarge: 24,
  margin: 16,
  marginLarge: 24,
  borderRadius: 12,
  borderRadiusSm: 8,
};