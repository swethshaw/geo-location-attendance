import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, Pressable, Alert, ActivityIndicator as RNActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const ViewComp = View as any;
const TextComp = Text as any;
const ScrollViewComp = ScrollView as any;
const PressableComp = Pressable as any;
const RefreshControlComp = RefreshControl as any;
import * as Haptics from 'expo-haptics';
import { useLocation } from '../../hooks/useLocation';
import { useGeofence } from '../../hooks/useGeofence';
import { LocationCard } from '../../components/LocationCard';
import { AccuracyGauge } from '../../components/AccuracyGauge';
import { GeofenceStatus } from '../../components/GeofenceStatus';
import { AttendanceButton, ButtonState } from '../../components/AttendanceButton';
import { EmptyState } from '../../components/EmptyState';
import { getLocationsApi, GeoFenceLocation } from '../../api/locations';
import { markAttendanceApi, getMyAttendanceApi } from '../../api/attendance';
import { cacheAttendance } from '../../utils/storage';
import { GPS_ACCURACY_THRESHOLD } from '../../utils/constants';
import { Colors, Font, Spacing, Radius } from '../../theme';

export function AttendanceScreen() {
  const { location, error: locError, errorMessage, isLoading: locLoading, refresh } = useLocation();
  const [zones, setZones] = useState<GeoFenceLocation[]>([]);
  const [selectedZone, setSelectedZone] = useState<GeoFenceLocation | null>(null);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [markState, setMarkState] = useState<ButtonState>('no_zone');
  const [markError, setMarkError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [alreadyMarked, setAlreadyMarked] = useState(false);

  const { distance, isInside } = useGeofence(location, selectedZone);

  // Load zones
  const loadZones = useCallback(async () => {
    try {
      const res = await getLocationsApi();
      if (res.success) {
        setZones(res.data);
        if (res.data.length > 0 && !selectedZone) {
          setSelectedZone(res.data[0]);
        }
      }
    } catch {
      // Silently fail — zones will be empty
    } finally {
      setZonesLoading(false);
    }
  }, [selectedZone]);

  useFocusEffect(
    useCallback(() => {
      loadZones();
      checkTodayAttendance();
    }, [loadZones])
  );

  const checkTodayAttendance = async () => {
    try {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      
      const res = await getMyAttendanceApi({ from: today.toISOString() });
      if (res.success && res.data.length > 0) {
        // Find if any record was successful or just any record for today? 
        // User requirements say "can mark attendance one per day", 
        // so if they marked (even failed) they might be blocked? 
        // Usually, we block if they have a 'success' or just any record.
        // Let's block if they have any record to be safe and match the backend logic.
        setAlreadyMarked(true);
      }
    } catch {
      // Ignore
    }
  };

  // Determine button state
  useEffect(() => {
    if (alreadyMarked) { setMarkState('success'); return; }
    if (!selectedZone) { setMarkState('no_zone'); return; }
    if (!location) { setMarkState('no_zone'); return; }
    if (location.accuracy !== null && location.accuracy > GPS_ACCURACY_THRESHOLD) { setMarkState('blocked_accuracy'); return; }
    if (!isInside) { setMarkState('blocked_outside'); return; }
    setMarkState('ready');
  }, [location, selectedZone, isInside, alreadyMarked]);

  const handleMark = async () => {
    if (!location || !selectedZone) return;
    setMarkState('loading');
    setMarkError('');

    try {
      const res = await markAttendanceApi({
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy_meters: location.accuracy ?? 999,
        location_id: selectedZone.id,
      });

      if (res.success) {
        setMarkState('success');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Cache locally
        await cacheAttendance({
          id: res.data?.record?.id,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy_meters: location.accuracy ?? 0,
          distance_from_center: distance ?? 0,
          status: 'success',
          location_name: selectedZone.name,
          marked_at: new Date().toISOString(),
          synced: true,
        });
        setAlreadyMarked(true);
        // Remove the reset timer so it stays 'success' for the day
      } else {
        throw new Error(res.error || 'Failed');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err.message || 'Failed to mark attendance';
      setMarkState('error');
      setMarkError(msg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // Also cache failed attempt locally
      await cacheAttendance({
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy_meters: location.accuracy ?? 0,
        distance_from_center: distance ?? 0,
        status: 'failed',
        location_name: selectedZone.name,
        marked_at: new Date().toISOString(),
        synced: false,
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refresh(), loadZones(), checkTodayAttendance()]);
    setRefreshing(false);
  };

  // Location error state
  if (locError && !location) {
    return (
      <ViewComp style={styles.container}>
        <EmptyState
          icon="🚫"
          title={locError === 'permission_denied' ? 'Location Permission Required' : 'Location Unavailable'}
          message={errorMessage || 'Unable to access your location.'}
          actionLabel="Retry"
          onAction={refresh}
        />
      </ViewComp>
    ) as any;
  }

  return (
    <ScrollViewComp
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControlComp refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      {/* Header */}
      <ViewComp style={styles.header}>
        <TextComp style={styles.title}>Mark Attendance</TextComp>
        <TextComp style={styles.subtitle}>Verify your location to check in</TextComp>
      </ViewComp>

      {/* Zone Selector */}
      {zones.length > 0 && (
        <ViewComp style={styles.section}>
          <TextComp style={styles.sectionTitle}>Select Zone</TextComp>
          <ScrollViewComp horizontal showsHorizontalScrollIndicator={false} style={styles.zoneScroll}>
            {zones.map((z) => (
              <PressableComp
                key={z.id}
                style={({ pressed }: any) => [
                  styles.zoneChip, 
                  selectedZone?.id === z.id && styles.zoneChipActive,
                  { opacity: pressed ? 0.7 : 1 }
                ]}
                onPress={() => setSelectedZone(z)}
              >
                <TextComp style={[styles.zoneChipText, selectedZone?.id === z.id && styles.zoneChipTextActive]}>
                  📍 {z.name}
                </TextComp>
                <TextComp style={[styles.zoneChipRadius, selectedZone?.id === z.id && styles.zoneChipTextActive]}>
                  {z.radius_meters}m
                </TextComp>
              </PressableComp>
            ))}
          </ScrollViewComp>
        </ViewComp>
      )}

      {zones.length === 0 && !zonesLoading && (
        <EmptyState icon="📍" title="No Zones Available" message="An admin needs to create geo-fence zones first." />
      )}

      {/* Location Info */}
      <ViewComp style={styles.section}>
        <LocationCard location={location} isLoading={locLoading} />
      </ViewComp>

      {/* Accuracy Gauge */}
      <ViewComp style={styles.section}>
        <AccuracyGauge accuracy={location?.accuracy ?? null} />
      </ViewComp>

      {/* Geofence Status */}
      {selectedZone && (
        <ViewComp style={styles.section}>
          <GeofenceStatus
            distance={distance}
            isInside={isInside}
            radiusMeters={selectedZone.radius_meters}
            zoneName={selectedZone.name}
          />
        </ViewComp>
      )}

      {/* Mark Button */}
      <ViewComp style={styles.section}>
        <AttendanceButton state={markState} onPress={handleMark} errorMessage={markError} />
      </ViewComp>
    </ScrollViewComp>
  ) as any;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, paddingTop: Spacing.huge },
  header: { marginBottom: Spacing.xxl },
  title: { color: Colors.textPrimary, fontSize: Font.size.xxxl, ...Font.bold },
  subtitle: { color: Colors.textSecondary, fontSize: Font.size.md, marginTop: Spacing.xs },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { color: Colors.textSecondary, fontSize: Font.size.sm, ...Font.medium, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  zoneScroll: { flexDirection: 'row' },
  zoneChip: { backgroundColor: Colors.surface, borderRadius: Radius.full, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, marginRight: Spacing.sm, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  zoneChipActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
  zoneChipText: { color: Colors.textSecondary, fontSize: Font.size.sm, ...Font.medium },
  zoneChipTextActive: { color: Colors.primary },
  zoneChipRadius: { color: Colors.textMuted, fontSize: Font.size.xs, marginTop: 2 },
});
