// ─── Design System ─────────────────────────────────────────────────────────────
// Centralized theme: colors, typography, spacing, shadows, and radii.
import { moderateScale, fontScale } from '../utils/responsive';

export const Colors = {
  // Primary palette
  primary: '#6C63FF',
  primaryDark: '#5A52D5',
  primaryLight: '#8B85FF',
  primaryBg: 'rgba(108, 99, 255, 0.08)',
  
  // Premium Gradients
  gradientPrimary: ['#6C63FF', '#8B85FF'] as const,
  gradientDark: ['#1A1A2E', '#0F0F1A'] as const,
  gradientAccent: ['#00D9A6', '#00B88A'] as const,

  // Accent
  accent: '#00D9A6',
  accentDark: '#00B88A',

  // Status
  success: '#22C55E',
  successBg: 'rgba(34, 197, 94, 0.1)',
  warning: '#F59E0B',
  warningBg: 'rgba(245, 158, 11, 0.1)',
  error: '#EF4444',
  errorBg: 'rgba(239, 68, 68, 0.1)',

  // Neutrals (dark mode)
  bg: '#0F0F1A',
  surface: '#1A1A2E',
  surfaceLight: '#25253D',
  surfaceAlt: '#2D2D47',
  border: '#3A3A5C',
  borderLight: '#4A4A6A',

  // Text
  textPrimary: '#F0F0FF',
  textSecondary: '#A0A0C0',
  textMuted: '#6A6A8A',
  textInverse: '#0F0F1A',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

export const Spacing = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(12),
  lg: moderateScale(16),
  xl: moderateScale(20),
  xxl: moderateScale(24),
  xxxl: moderateScale(32),
  huge: moderateScale(48),
} as const;

export const Radius = {
  sm: moderateScale(8),
  md: moderateScale(12),
  lg: moderateScale(16),
  xl: moderateScale(20),
  xxl: moderateScale(24),
  full: 9999,
} as const;

export const Font = {
  regular: { fontWeight: '400' as const },
  medium: { fontWeight: '500' as const },
  semibold: { fontWeight: '600' as const },
  bold: { fontWeight: '700' as const },
  size: {
    xs: fontScale(11),
    sm: fontScale(13),
    md: fontScale(15),
    lg: fontScale(17),
    xl: fontScale(20),
    xxl: fontScale(24),
    xxxl: fontScale(32),
    hero: fontScale(40),
  },
} as const;

import { Platform } from 'react-native';

const makeShadow = (elevation: number, opacity: number, radius: number, offsetY: number) =>
  Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    default: {
      elevation,
    },
  })!;

export const Shadow = {
  sm: makeShadow(2, 0.15, 4, 2),
  md: makeShadow(4, 0.2, 8, 4),
  lg: makeShadow(8, 0.25, 16, 8),
  glow: (color: string) =>
    Platform.select({
      ios: {
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      default: {
        elevation: 6,
      },
    })!,
} as const;
