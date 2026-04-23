// ─── Stat Card Component ───────────────────────────────────────────────────────

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Font, Spacing, Radius, Shadow } from '../theme';
import { scale, verticalScale, moderateScale, fontScale } from '../utils/responsive';

interface Props {
  icon: string;
  label: string;
  value: string | number;
  color?: string;
  subtitle?: string;
}

const ViewComp = View as any;
const TextComp = Text as any;
const BlurViewComp = BlurView as any;

export function StatCard({ icon, label, value, color = Colors.primary, subtitle }: Props) {
  return (
    <BlurViewComp intensity={20} tint="dark" style={[styles.container, Shadow.sm]}>
      <ViewComp style={[styles.iconBg, { backgroundColor: color + '15' }]}>
        <TextComp style={styles.icon}>{icon}</TextComp>
      </ViewComp>
      <TextComp style={styles.label}>{label}</TextComp>
      <TextComp style={[styles.value, { color }]}>{value}</TextComp>
      {subtitle && <TextComp style={styles.subtitle}>{subtitle}</TextComp>}
    </BlurViewComp>
  ) as any;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(26, 26, 46, 0.6)', // Semi-transparent for blur effect
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(58, 58, 92, 0.4)', // Softer border for glass effect
    flex: 1,
    minWidth: scale(100),
    overflow: 'hidden',
  },
  iconBg: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  icon: {
    fontSize: fontScale(22),
  },
  label: {
    color: Colors.textMuted,
    fontSize: Font.size.xs,
    ...Font.medium,
    textTransform: 'uppercase',
    letterSpacing: scale(0.5),
    marginBottom: verticalScale(4),
  },
  value: {
    fontSize: Font.size.xxl,
    ...Font.bold,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Font.size.xs,
    ...Font.regular,
    marginTop: verticalScale(2),
  },
});
