import { Platform, ViewStyle } from 'react-native';
import { moderateScale, fontScale } from '../utils/responsive';

export const Colors = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#818CF8',
  primaryBg: 'rgba(99, 102, 241, 0.12)', 
  gradientPrimary: ['#6366F1', '#8B5CF6'] as const,
  gradientDark: ['#09090E', '#12121A'] as const,
  gradientAccent: ['#10B981', '#059669'] as const,
  accent: '#10B981',
  accentDark: '#059669',
  success: '#22C55E',
  successBg: 'rgba(34, 197, 94, 0.12)',
  warning: '#F59E0B',
  warningBg: 'rgba(245, 158, 11, 0.12)',
  error: '#EF4444',
  errorBg: 'rgba(239, 68, 68, 0.12)',
  info: '#3B82F6',
  infoBg: 'rgba(59, 130, 246, 0.12)',
  bg: '#09090E',
  surface: '#13131A',
  surfaceLight: '#1C1C24',
  surfaceAlt: '#23232E',
  border: '#272732',
  borderLight: '#353542',
  textPrimary: '#FAFAFA',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  textInverse: '#09090E',
  glassBg: 'rgba(19, 19, 26, 0.65)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassHighlight: 'rgba(255, 255, 255, 0.15)',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.6)',
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
  xxxl: moderateScale(32),
  full: 9999,
} as const;
export const Font = {
  regular: { fontWeight: '400' as const },
  medium: { fontWeight: '500' as const },
  semibold: { fontWeight: '600' as const },
  bold: { fontWeight: '700' as const },
  heavy: { fontWeight: '800' as const },
  
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
const makeShadow = (elevation: number, opacity: number, radius: number, offsetY: number): ViewStyle =>
  Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    default: {
      elevation,
    },
  }) as ViewStyle;

export const Shadow = {
  sm: makeShadow(2, 0.2, 8, 2),
  md: makeShadow(4, 0.25, 16, 6),
  lg: makeShadow(8, 0.3, 24, 10),
  glow: (color: string): ViewStyle =>
    Platform.select({
      ios: {
        shadowColor: color,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      default: {
        elevation: 8,
        shadowColor: color,
      },
    }) as ViewStyle,
} as const;