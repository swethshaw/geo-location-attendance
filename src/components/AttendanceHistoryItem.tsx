import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { 
  CheckCircle2, 
  MapPinOff, 
  AlertTriangle, 
  XOctagon, 
  MapPin, 
  Target, 
  LocateFixed, 
  User,
  LucideIcon
} from 'lucide-react-native';
import { Colors, Font, Spacing, Radius } from '../theme';
import { AttendanceRecord } from '../api/attendance';

interface Props {
  record: AttendanceRecord;
  showUser?: boolean;
}

// Semantic Configuration with Vector Icons
const STATUS_CONFIG: Record<string, { label: string; color: string; Icon: LucideIcon }> = {
  success: { label: 'Present', color: '#10B981', Icon: CheckCircle2 },
  outside_radius: { label: 'Outside Zone', color: '#EF4444', Icon: MapPinOff },
  low_accuracy: { label: 'Low GPS', color: '#F59E0B', Icon: AlertTriangle },
  failed: { label: 'System Error', color: '#EF4444', Icon: XOctagon },
};

export function AttendanceHistoryItem({ record, showUser }: Props) {
  const { status, marked_at, distance_from_center, accuracy_meters, geo_fence_locations, users } = record;
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.failed;
  
  const date = new Date(marked_at);
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <View style={styles.container}>
      {/* Visual Anchor: Status Icon Container */}
      <View style={[styles.iconContainer, { backgroundColor: config.color + '15' }]}>
        <config.Icon color={config.color} size={24} strokeWidth={2.5} />
      </View>

      <View style={styles.content}>
        {/* Top Row: Location & Time */}
        <View style={styles.headerRow}>
          <Text style={styles.location} numberOfLines={1}>
            {geo_fence_locations?.name || 'Unknown Zone'}
          </Text>
          <Text style={styles.time}>{timeStr}</Text>
        </View>

        {/* Date Context */}
        <Text style={styles.date}>{dateStr}</Text>

        {/* Admin View: User Information */}
        {showUser && users && (
          <View style={styles.userRow}>
            <User color={Colors.textSecondary} size={14} />
            <Text style={styles.userName}>
              {users.name} <Text style={styles.userEmail}>({users.email})</Text>
            </Text>
          </View>
        )}

        {/* Bottom Row: Telemetry & Status Badge */}
        <View style={styles.footerRow}>
          <View style={styles.metricsGroup}>
            <View style={styles.metric}>
              <Target color={Colors.textMuted} size={12} />
              <Text style={styles.metricText}>{Math.round(distance_from_center)}m</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metric}>
              <LocateFixed color={Colors.textMuted} size={12} />
              <Text style={styles.metricText}>±{Math.round(accuracy_meters)}m</Text>
            </View>
          </View>

          <View style={[styles.badge, { backgroundColor: config.color + '15' }]}>
            <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    // Subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  location: {
    color: Colors.textPrimary,
    fontSize: Font.size.md,
    fontWeight: '700',
    flex: 1,
    paddingRight: Spacing.sm,
  },
  time: {
    color: Colors.textPrimary,
    fontSize: Font.size.sm,
    fontWeight: '600',
  },
  date: {
    color: Colors.textMuted,
    fontSize: Font.size.xs,
    marginBottom: Spacing.sm,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    gap: 6,
  },
  userName: {
    color: Colors.textPrimary,
    fontSize: Font.size.sm,
    fontWeight: '600',
  },
  userEmail: {
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  metricsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    color: Colors.textSecondary,
    fontSize: Font.size.xs,
    fontWeight: '500',
  },
  metricDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textMuted,
    marginHorizontal: 8,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontSize: Font.size.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});