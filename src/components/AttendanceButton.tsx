// ─── Attendance Button Component ───────────────────────────────────────────────
// Large button with multiple states: ready, blocked, loading, success, error.

import React, { useEffect, useRef } from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Font, Spacing, Radius, Shadow } from '../theme';
import { verticalScale } from '../utils/responsive';

const AnimatedView = Animated.View as any;
const PressableComp = Pressable as any;
const ActivityIndicatorComp = ActivityIndicator as any;
const TextComp = Text as any;
const LinearGradientComp = LinearGradient as any;

export type ButtonState = 'ready' | 'blocked_accuracy' | 'blocked_outside' | 'loading' | 'success' | 'error' | 'no_zone';

interface Props {
  state: ButtonState;
  onPress: () => void;
  errorMessage?: string;
}

const CONFIG: Record<ButtonState, { label: string; bg: string; disabled: boolean; gradient?: readonly [string, string] }> = {
  ready: { label: '📍  Mark Attendance', bg: Colors.success, disabled: false, gradient: ['#22C55E', '#16A34A'] },
  blocked_accuracy: { label: '⚠  GPS Too Inaccurate', bg: Colors.surfaceAlt, disabled: true },
  blocked_outside: { label: '🚫  Outside Zone', bg: Colors.surfaceAlt, disabled: true },
  loading: { label: 'Marking...', bg: Colors.primary, disabled: true, gradient: Colors.gradientPrimary },
  success: { label: '✅  Marked for Today', bg: Colors.success, disabled: true, gradient: ['#16A34A', '#15803D'] },
  error: { label: '❌  Failed — Tap to Retry', bg: Colors.error, disabled: false },
  no_zone: { label: 'Select a Zone First', bg: Colors.surfaceAlt, disabled: true },
};

export function AttendanceButton({ state, onPress, errorMessage }: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (state === 'ready') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.03, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [state, pulseAnim]);

  const config = CONFIG[state];

  const handlePress = () => {
    if (!config.disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  return (
    <>
      <AnimatedView style={[{ transform: [{ scale: pulseAnim }] }]}>
        <PressableComp
          style={({ pressed }: any) => [
            styles.buttonWrapper,
            { opacity: (config.disabled || pressed) ? 0.7 : 1 },
            state === 'ready' && Shadow.glow(Colors.success),
          ]}
          onPress={handlePress}
          disabled={config.disabled}
        >
          {config.gradient ? (
            <LinearGradientComp
              colors={config.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.button}
            >
              {state === 'loading' ? (
                <ActivityIndicatorComp color={Colors.white} size="small" />
              ) : (
                <TextComp style={[styles.label, config.disabled && state !== 'success' && styles.labelDisabled]}>
                  {config.label}
                </TextComp>
              )}
            </LinearGradientComp>
          ) : (
            <AnimatedView style={[styles.button, { backgroundColor: config.bg }]}>
              {state === 'loading' ? (
                <ActivityIndicatorComp color={Colors.white} size="small" />
              ) : (
                <TextComp style={[styles.label, config.disabled && state !== 'success' && styles.labelDisabled]}>
                  {config.label}
                </TextComp>
              )}
            </AnimatedView>
          )}
        </PressableComp>
      </AnimatedView>
      {errorMessage && state === 'error' && (
        <TextComp style={styles.errorMsg}>{errorMessage}</TextComp>
      )}
    </>
  ) as any;
}

const styles = StyleSheet.create({
  buttonWrapper: {
    marginVertical: Spacing.md,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  button: {
    height: verticalScale(60),
    width: '100%',
    borderRadius: Radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.7,
  },
  label: {
    color: Colors.white,
    fontSize: Font.size.lg,
    ...Font.bold,
  },
  labelDisabled: {
    color: Colors.textMuted,
  },
  errorMsg: {
    color: Colors.error,
    fontSize: Font.size.sm,
    textAlign: 'center',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.sm,
  },
});
