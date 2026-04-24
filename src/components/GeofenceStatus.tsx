import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { CheckCircle2, MapPin, Navigation, Radar } from 'lucide-react-native';
import { Colors, Font, Spacing, Radius } from '../theme';

interface Props {
  distance: number | null;
  isInside: boolean;
  radiusMeters: number;
  zoneName?: string;
}

export function GeofenceStatus({ distance, isInside, radiusMeters, zoneName }: Props) {
  // Pulse animation for the scanning/calculating state
  const pulseAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (distance === null) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.5, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
    }
  }, [distance, pulseAnim]);

  // 1. Loading / Calculating State
  // 1. Loading / Calculating State
  if (distance === null) {
    return (
      <View style={[styles.container, styles.neutral]}>
        <Animated.View style={[styles.iconWrapper, { opacity: pulseAnim, backgroundColor: Colors.textMuted + '20' }]}>
          <Radar color={Colors.textSecondary} size={28} strokeWidth={2} />
        </Animated.View>
        <View style={styles.info}>
          <Text style={styles.statusNeutral}>Acquiring GPS Signal...</Text>
          <Text style={styles.detail}>Locking onto your exact location</Text>
        </View>
      </View>
    );
  }

  const roundedDist = Math.round(distance);
  const distanceToMove = Math.max(0, roundedDist - radiusMeters);

  // 2. Resolved State (Inside or Outside)
  return (
    <View style={[
      styles.container, 
      isInside ? styles.inside : styles.outside,
      // Add a subtle shadow for elevation
      styles.shadow
    ]}>
      
      {/* Dynamic Icon Wrapper */}
      <View style={[
        styles.iconWrapper, 
        { backgroundColor: (isInside ? Colors.success : Colors.error) + '15' }
      ]}>
        {isInside ? (
          <CheckCircle2 color={Colors.success} size={28} strokeWidth={2.5} />
        ) : (
          <MapPin color={Colors.error} size={28} strokeWidth={2.5} />
        )}
      </View>

      <View style={styles.info}>
        {/* Header & Status */}
        <View style={styles.headerRow}>
          <Text style={[styles.status, { color: isInside ? Colors.success : Colors.error }]}>
            {isInside ? 'Inside Zone' : 'Outside Zone'}
          </Text>
        </View>

        {/* Telemetry & Context */}
        <View style={styles.telemetryRow}>
          <Text style={styles.detail}>
            <Text style={styles.boldDetail}>{roundedDist}m</Text> from center
          </Text>
          <View style={styles.dotSeparator} />
          <Text style={styles.detail}>
            Radius: {radiusMeters}m
          </Text>
        </View>
        
        {zoneName && (
          <Text style={styles.zoneName}>📍 {zoneName}</Text>
        )}

        {/* Actionable Hint (Only when outside) */}
        {!isInside && distanceToMove > 0 && (
          <View style={styles.hintBox}>
            <Navigation color={Colors.warning} size={14} strokeWidth={3} />
            <Text style={styles.hintText}>
              Move <Text style={styles.boldHint}>{distanceToMove}m</Text> closer to mark attendance
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    gap: Spacing.md,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inside: {
    backgroundColor: Colors.surface, // Keep surface clean, use border/icons for color
    borderColor: Colors.success + '40',
  },
  outside: {
    backgroundColor: Colors.surface,
    borderColor: Colors.error + '40',
  },
  neutral: {
    backgroundColor: Colors.surfaceAlt,
    borderColor: Colors.border,
    borderStyle: 'dashed', // Dashed border implies a pending/loading state
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  status: {
    fontSize: Font.size.lg,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statusNeutral: {
    fontSize: Font.size.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  telemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detail: {
    color: Colors.textSecondary,
    fontSize: Font.size.sm,
    fontWeight: '500',
  },
  boldDetail: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textMuted,
    marginHorizontal: 8,
  },
  zoneName: {
    color: Colors.textSecondary,
    fontSize: Font.size.xs,
    fontWeight: '600',
    marginTop: 2,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.md,
    marginTop: Spacing.sm,
    gap: 6,
    alignSelf: 'flex-start',
  },
  hintText: {
    color: Colors.warning, // Assuming warning is an orange/amber color
    fontSize: Font.size.xs,
    fontWeight: '600',
  },
  boldHint: {
    fontWeight: '800',
  },
});