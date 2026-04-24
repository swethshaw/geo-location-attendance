import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  RefreshControl, 
  Pressable, 
  ActivityIndicator,
  StatusBar
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { MapPinOff, AlertCircle, MapPin, Target, Radar } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';

import { verticalScale } from '../../utils/responsive';
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
        setAlreadyMarked(true);
      }
    } catch {

    }
  };


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
      } else {
        throw new Error(res.error || 'Failed');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err.message || 'Failed to mark attendance';
      setMarkState('error');
      setMarkError(msg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Promise.all([refresh(), loadZones(), checkTodayAttendance()]);
    setRefreshing(false);
  };


  if (locError && !location) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
        <EmptyState
          icon={MapPinOff}
          title={locError === 'permission_denied' ? 'Location Required' : 'Signal Lost'}
          message={errorMessage || 'We need access to your location to verify your attendance.'}
          actionLabel="Retry"
          onAction={refresh}
          iconColor={Colors.error}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={Colors.primary} 
          />
        }
      >

        <View style={styles.header}>
          <Text style={styles.title}>Mark Attendance</Text>
          <Text style={styles.subtitle}>Verify your location to check in</Text>
        </View>


        {zones.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <MapPin color={Colors.textSecondary} size={16} strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>Select Workspace</Text>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.zoneScrollWrapper}
              contentContainerStyle={styles.zoneScrollContent}
            >
              {zones.map((z) => {
                const isActive = selectedZone?.id === z.id;
                return (
                  <Pressable
                    key={z.id}
                    style={({ pressed }) => [
                      styles.zoneChip, 
                      isActive && styles.zoneChipActive,
                      pressed && { transform: [{ scale: 0.96 }] }
                    ]}
                    onPress={() => {
                      if (!isActive) Haptics.selectionAsync();
                      setSelectedZone(z);
                    }}
                  >
                    <View style={[styles.zoneIconWrapper, isActive && styles.zoneIconWrapperActive]}>
                      <MapPin color={isActive ? Colors.primary : Colors.textMuted} size={14} strokeWidth={3} />
                    </View>
                    <View>
                      <Text style={[styles.zoneChipText, isActive && styles.zoneChipTextActive]}>
                        {z.name}
                      </Text>
                      <Text style={[styles.zoneChipRadius, isActive && styles.zoneChipRadiusActive]}>
                        Radius: {z.radius_meters}m
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {zones.length === 0 && !zonesLoading && (
          <EmptyState 
            icon={AlertCircle} 
            title="No Zones Available" 
            message="An administrator needs to create geographic zones before you can mark attendance." 
          />
        )}


        {selectedZone && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Radar color={Colors.textSecondary} size={16} strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>Live Telemetry</Text>
            </View>
            
            <View style={styles.telemetryStack}>
              <LocationCard location={location} isLoading={locLoading} />
              <AccuracyGauge accuracy={location?.accuracy ?? null} />
            </View>
          </View>
        )}


        {selectedZone && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Target color={Colors.textSecondary} size={16} strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>Boundary Status</Text>
            </View>
            <GeofenceStatus
              distance={distance}
              isInside={isInside}
              radiusMeters={selectedZone.radius_meters}
              zoneName={selectedZone.name}
            />
          </View>
        )}


        <View style={styles.actionContainer}>
          <AttendanceButton state={markState} onPress={handleMark} errorMessage={markError} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.bg 
  },
  content: { 
    padding: Spacing.lg, 
    paddingTop: Spacing.xl, 
    paddingBottom: verticalScale(120), 

  },
  header: { 
    marginBottom: Spacing.xl 
  },
  title: { 
    color: Colors.textPrimary, 
    fontSize: Font.size.xxl, 
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: { 
    color: Colors.textSecondary, 
    fontSize: Font.size.md, 
    marginTop: 4,
    fontWeight: '500',
  },
  
  section: { 
    marginBottom: Spacing.xl 
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  sectionTitle: { 
    color: Colors.textSecondary, 
    fontSize: Font.size.sm, 
    fontWeight: '700', 
    textTransform: 'uppercase', 
    letterSpacing: 0.5 
  },
  
  // Zone Chips
  zoneScrollWrapper: {
    marginHorizontal: -Spacing.lg, 

  },
  zoneScrollContent: { 
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  zoneChip: { 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface, 
    borderRadius: Radius.xl, 
    paddingHorizontal: Spacing.md, 
    paddingVertical: 12, 
    borderWidth: 1, 
    borderColor: Colors.border, 
    gap: 10,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  zoneChipActive: { 
    backgroundColor: Colors.primary + '10', 
    borderColor: Colors.primary,
  },
  zoneIconWrapper: {
    backgroundColor: Colors.surfaceAlt,
    padding: 6,
    borderRadius: Radius.full,
  },
  zoneIconWrapperActive: {
    backgroundColor: Colors.primary + '20',
  },
  zoneChipText: { 
    color: Colors.textPrimary, 
    fontSize: Font.size.sm, 
    fontWeight: '700' 
  },
  zoneChipTextActive: { 
    color: Colors.primary 
  },
  zoneChipRadius: { 
    color: Colors.textSecondary, 
    fontSize: 11, 
    fontWeight: '500',
    marginTop: 2 
  },
  zoneChipRadiusActive: {
    color: Colors.primary,
    opacity: 0.8,
  },


  telemetryStack: {
    gap: Spacing.md,
  },


  actionContainer: {
    marginTop: Spacing.sm,
  },
});