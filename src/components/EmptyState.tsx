import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LucideIcon } from 'lucide-react-native';
import { Colors, Font, Spacing, Radius } from '../theme';

interface Props {
  icon: LucideIcon;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Optional: Override the default primary color for context (e.g., Colors.error for an error state) */
  iconColor?: string; 
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  message, 
  actionLabel, 
  onAction,
  iconColor = Colors.primary 
}: Props) {
  // Smooth entrance animation for a premium feel
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 60,
      friction: 8,
    }).start();
  }, [animValue]);

  const handlePress = () => {
    if (onAction) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onAction();
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: animValue,
          transform: [{
            scale: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, 1], // Subtle scale up
            })
          }]
        }
      ]}
    >
      {/* Soft Icon Illustration Container */}
      <View style={[styles.iconWrapper, { backgroundColor: iconColor + '15' }]}>
        <Icon color={iconColor} size={40} strokeWidth={2} />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>

      {actionLabel && onAction && (
        <Pressable 
          onPress={handlePress}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed
          ]}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensures it takes up available space to center properly
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.huge,
  },
  iconWrapper: {
    width: 88,
    height: 88,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Font.size.xl,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  message: {
    color: Colors.textSecondary,
    fontSize: Font.size.md,
    textAlign: 'center',
    lineHeight: 22, // Increased line height for better readability
    maxWidth: '85%', // Prevents text from stretching too wide on tablets/large phones
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    // Subtle shadow for the action button
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonPressed: {
    transform: [{ scale: 0.96 }], // Tactile squish effect
    opacity: 0.9,
  },
  buttonText: {
    color: Colors.white,
    fontSize: Font.size.md,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});