import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { 
  Satellite, 
  MapPin, 
  Map, 
  Target, 
  Mountain, 
  MapPinOff 
} from 'lucide-react-native';
import { Colors, Font, Spacing, Radius } from '../theme';
import { LocationData } from '../hooks/useLocation';

interface Props {
  location: LocationData | null;
  isLoading: boolean;
}

export function LocationCard({ location, isLoading }: Props) {
  // Pulse animation for the "Live" dot and the loading icon
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconWrapper}>
            <Satellite color={Colors.primary} size={20} strokeWidth={2} />
          </View>
          <Text style={styles.title}>Live Telemetry</Text>
        </View>
        
        {/* Live Status Indicator */}
        {!isLoading && location && (
          <View style={styles.liveIndicator}>
            <Animated.View style={[styles.liveDot, { opacity: pulseAnim }]} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>

      {/* Body Content */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.stateContainer}>
            <Animated.View style={{ opacity: pulseAnim }}>
              <Satellite color={Colors.textMuted} size={32} strokeWidth={1.5} />
            </Animated.View>
            <Text style={styles.stateTitle}>Acquiring Signal</Text>
            <Text style={styles.stateSubtitle}>Connecting to GPS satellites...</Text>
          </View>
        ) : location ? (
          <View style={styles.grid}>
            {/* Latitude */}
            <View style={styles.dataCard}>
              <View style={styles.dataHeader}>
                <Map color={Colors.textMuted} size={14} strokeWidth={2.5} />
                <Text style={styles.label}>Latitude</Text>
              </View>
              <Text style={styles.value}>{location.latitude.toFixed(6)}°</Text>
            </View>

            {/* Longitude */}
            <View style={styles.dataCard}>
              <View style={styles.dataHeader}>
                <MapPin color={Colors.textMuted} size={14} strokeWidth={2.5} />
                <Text style={styles.label}>Longitude</Text>
              </View>
              <Text style={styles.value}>{location.longitude.toFixed(6)}°</Text>
            </View>

            {/* Accuracy */}
            <View style={styles.dataCard}>
              <View style={styles.dataHeader}>
                <Target color={Colors.textMuted} size={14} strokeWidth={2.5} />
                <Text style={styles.label}>Accuracy</Text>
              </View>
              <Text style={styles.value}>
                ±{location.accuracy !== null ? Math.round(location.accuracy) : '?'}m
              </Text>
            </View>

            {/* Altitude */}
            <View style={styles.dataCard}>
              <View style={styles.dataHeader}>
                <Mountain color={Colors.textMuted} size={14} strokeWidth={2.5} />
                <Text style={styles.label}>Altitude</Text>
              </View>
              <Text style={styles.value}>
                {location.altitude !== null ? `${Math.round(location.altitude)}m` : 'N/A'}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.stateContainer}>
            <MapPinOff color={Colors.textMuted} size={32} strokeWidth={1.5} />
            <Text style={styles.stateTitle}>No Data Available</Text>
            <Text style={styles.stateSubtitle}>Ensure location services are enabled.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceAlt,
    backgroundColor: Colors.surface, // Or a very subtle gradient
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconWrapper: {
    backgroundColor: Colors.primary + '15',
    padding: 6,
    borderRadius: Radius.md,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Font.size.md,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  liveText: {
    color: Colors.success,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  content: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  dataCard: {
    width: '47%', // Allows two columns with a gap
    backgroundColor: Colors.surfaceAlt,
    padding: Spacing.md,
    borderRadius: Radius.lg,
  },
  dataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: Font.size.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    color: Colors.textPrimary,
    fontSize: Font.size.md,
    fontWeight: '700',
    fontVariant: ['tabular-nums'], // Keeps numbers monospaced so they don't jitter
  },
  stateContainer: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateTitle: {
    color: Colors.textPrimary,
    fontSize: Font.size.md,
    fontWeight: '600',
    marginTop: Spacing.md,
  },
  stateSubtitle: {
    color: Colors.textSecondary,
    fontSize: Font.size.sm,
    marginTop: 4,
  },
});