import React, { useEffect, useRef } from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, Animated, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { LucideIcon, MapPin, AlertCircle, CheckCircle2, XCircle, Loader2, LocateFixed } from 'lucide-react-native';
import { Colors, Font, Spacing, Radius, Shadow } from '../theme';
import { verticalScale } from '../utils/responsive';

export type ButtonState = 'ready' | 'blocked_accuracy' | 'blocked_outside' | 'loading' | 'success' | 'error' | 'no_zone';

interface Props {
  state: ButtonState;
  onPress: () => void;
  errorMessage?: string;
}

// Semantic Configuration with Icons
const CONFIG: Record<ButtonState, { 
  label: string; 
  colors: readonly [string, string, ...string[]]; 
  disabled: boolean; 
  Icon: LucideIcon;
  haptic: Haptics.ImpactFeedbackStyle | null;
}> = {
  ready: { 
    label: 'Mark Attendance', 
    colors: ['#22C55E', '#16A34A'], 
    disabled: false, 
    Icon: MapPin,
    haptic: Haptics.ImpactFeedbackStyle.Heavy 
  },
  blocked_accuracy: { 
    label: 'Low GPS Accuracy', 
    colors: ['#94A3B8', '#64748B'], 
    disabled: true, 
    Icon: LocateFixed,
    haptic: null 
  },
  blocked_outside: { 
    label: 'Outside Designated Zone', 
    colors: ['#94A3B8', '#64748B'], 
    disabled: true, 
    Icon: AlertCircle,
    haptic: null 
  },
  loading: { 
    label: 'Verifying...', 
    colors: Colors.gradientPrimary || ['#6366F1', '#4F46E5'], 
    disabled: true, 
    Icon: Loader2,
    haptic: null 
  },
  success: { 
    label: 'Attendance Marked', 
    colors: ['#10B981', '#059669'], 
    disabled: true, 
    Icon: CheckCircle2,
    haptic: Haptics.ImpactFeedbackStyle.Medium 
  },
  error: { 
    label: 'Retry Marking', 
    colors: ['#EF4444', '#DC2626'], 
    disabled: false, 
    Icon: XCircle,
    haptic: Haptics.ImpactFeedbackStyle.Medium 
  },
  no_zone: { 
    label: 'Select Location Zone', 
    colors: ['#E2E8F0', '#CBD5E1'], 
    disabled: true, 
    Icon: MapPin,
    haptic: null 
  },
};

export function AttendanceButton({ state, onPress, errorMessage }: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const config = CONFIG[state];
  const Icon = config.Icon;

  useEffect(() => {
    if (state === 'ready') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.02, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      Animated.spring(pulseAnim, { toValue: 1, useNativeDriver: true }).start();
    }
  }, [state]);

  const handlePress = () => {
    if (!config.disabled) {
      if (config.haptic) Haptics.impactAsync(config.haptic);
      onPress();
    }
  };

  return (
    <View style={styles.outerContainer}>
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <Pressable
          onPress={handlePress}
          disabled={config.disabled}
          style={({ pressed }) => [
            styles.buttonWrapper,
            state === 'ready' && Shadow.glow(Colors.success),
            pressed && { transform: [{ scale: 0.98 }] }
          ]}
        >
          <LinearGradient
            colors={config.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.button, config.disabled && state !== 'success' && styles.disabledOverlay]}
          >
            <View style={styles.contentRow}>
              {state === 'loading' ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Icon color={config.disabled && state !== 'success' ? Colors.textMuted : Colors.white} size={22} strokeWidth={2.5} />
              )}
              
              <Text style={[
                styles.label, 
                config.disabled && state !== 'success' && styles.labelDisabled
              ]}>
                {config.label}
              </Text>
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>

      {state === 'error' && errorMessage && (
        <View style={styles.errorContainer}>
          <AlertCircle color={Colors.error} size={14} />
          <Text style={styles.errorMsg}>{errorMessage}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    marginVertical: Spacing.lg,
    width: '100%',
  },
  buttonWrapper: {
    borderRadius: Radius.xl,
    backgroundColor: 'transparent',
  },
  button: {
    height: verticalScale(64),
    width: '100%',
    borderRadius: Radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  disabledOverlay: {
    opacity: 0.85,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  label: {
    color: Colors.white,
    fontSize: Font.size.md,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  labelDisabled: {
    color: Colors.textMuted,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    gap: 4,
  },
  errorMsg: {
    color: Colors.error,
    fontSize: Font.size.xs,
    fontWeight: '600',
  },
});