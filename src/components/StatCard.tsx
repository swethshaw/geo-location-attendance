import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LucideIcon } from 'lucide-react-native';
import { Colors, Font, Spacing, Radius, Shadow } from '../theme';
import { scale, verticalScale, moderateScale, fontScale } from '../utils/responsive';

interface Props {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: string;
  subtitle?: string;
}

export function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color = Colors.primary, 
  subtitle 
}: Props) {
  return (
    <BlurView 
      intensity={30} // Slightly higher intensity for a richer frost effect
      tint="dark" 
      style={[styles.container, Shadow.sm]}
    >
      {/* Subtle top inner-highlight to simulate glass edge */}
      <View style={styles.glassHighlight} />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconBg, { backgroundColor: color + '20' }]}>
            <Icon color={color} size={moderateScale(20)} strokeWidth={2.5} />
          </View>
        </View>

        <View style={styles.dataContainer}>
          <Text style={[styles.value, { color }]} numberOfLines={1} adjustsFontSizeToFit>
            {value}
          </Text>
          <Text style={styles.label}>{label}</Text>
          
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(30, 30, 48, 0.5)', // Slightly adjusted for better contrast
    borderRadius: Radius.xl, // Rounder corners for modern feel
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)', // White-ish border looks more like glass than dark border
    flex: 1,
    minWidth: scale(140), // Slightly wider to accommodate left-alignment
    overflow: 'hidden',
    position: 'relative',
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Creates a shiny top edge
  },
  content: {
    padding: Spacing.lg,
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: verticalScale(12),
  },
  iconBg: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(12), // Squircle shape instead of perfect circle
    justifyContent: 'center',
    alignItems: 'center',
  },
  dataContainer: {
    alignItems: 'flex-start', // Left aligned for better scannability
  },
  value: {
    fontSize: fontScale(28),
    fontWeight: '800',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'], // Prevents jitter if the number changes dynamically
    marginBottom: verticalScale(2),
  },
  label: {
    color: Colors.textMuted,
    fontSize: fontScale(12),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: scale(0.5),
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: fontScale(11),
    fontWeight: '500',
    marginTop: verticalScale(6),
    opacity: 0.8,
  },
});