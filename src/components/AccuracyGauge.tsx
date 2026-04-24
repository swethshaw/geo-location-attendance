import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Font, Spacing, Radius } from '../theme';
import { getAccuracyLevel, GPS_ACCURACY_THRESHOLD } from '../utils/constants';

interface Props {
  accuracy: number | null;
}

export function AccuracyGauge({ accuracy }: Props) {
  // Animation value for smooth bar transitions
  const animatedWidth = React.useRef(new Animated.Value(0)).current;

  const level = accuracy !== null ? getAccuracyLevel(accuracy) : null;
  const isBlocked = accuracy !== null && accuracy > GPS_ACCURACY_THRESHOLD;
  
  // Calculate percentage: 100% (best) to 0% (poor)
  const pct = accuracy === null 
    ? 0 
    : Math.max(5, Math.min(100, ((100 - accuracy) / 100) * 100));

  useEffect(() => {
    Animated.spring(animatedWidth, {
      toValue: pct,
      useNativeDriver: false, // Width requires layout engine
      bounciness: 4,
    }).start();
  }, [pct]);

  return (
    <View style={[styles.container, isBlocked && styles.containerWarning]}>
      {/* Header with Semantic Status */}
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>Signal Strength</Text>
          <Text style={styles.subLabel}>
            {accuracy === null ? 'Searching for satellites...' : `Precision: ±${Math.round(accuracy)}m`}
          </Text>
        </View>
        {level && (
          <View style={[styles.badge, { backgroundColor: level.color + '15' }]}>
            <View style={[styles.dot, { backgroundColor: level.color }]} />
            <Text style={[styles.badgeText, { color: level.color }]}>{level.label}</Text>
          </View>
        )}
      </View>

      {/* Modern Gradient-style Progress Track */}
      <View style={styles.track}>
        <Animated.View 
          style={[
            styles.fill, 
            { 
              width: animatedWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%']
              }),
              backgroundColor: level?.color ?? Colors.textMuted 
            }
          ]} 
        />
        {/* Threshold Marker */}
        <View style={[styles.thresholdMarker, { left: `${100 - GPS_ACCURACY_THRESHOLD}%` }]} />
      </View>

      {/* Contextual Action/Warning Footer */}
      <View style={styles.footer}>
        {accuracy === null ? (
          <Text style={styles.infoText}>Move to an open area for faster locking</Text>
        ) : isBlocked ? (
          <Text style={styles.errorText}>
            Too far (Max {GPS_ACCURACY_THRESHOLD}m). Move closer to your location.
          </Text>
        ) : (
          <Text style={styles.successText}>✓ Location verified for attendance</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl, // Softer corners
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    // Subtle Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  containerWarning: {
    borderColor: Colors.error + '30',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  label: {
    color: Colors.textPrimary,
    fontSize: Font.size.md,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subLabel: {
    color: Colors.textSecondary,
    fontSize: Font.size.xs,
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  track: {
    height: 10,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.full,
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  thresholdMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: Colors.surface, // Creates a 'cut' in the bar
    opacity: 0.5,
  },
  footer: {
    marginTop: Spacing.sm,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    fontWeight: '600',
  },
  successText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '600',
  },
});