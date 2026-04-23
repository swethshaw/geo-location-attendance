import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Font, Spacing, Radius } from '../theme';

const ViewComp = View as any;
const TextComp = Text as any;

import { AttendanceRecord } from '../api/attendance';

interface Props {
  record: AttendanceRecord;
  showUser?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  success: { label: 'Present', color: Colors.success, icon: '✅' },
  outside_radius: { label: 'Outside', color: Colors.error, icon: '❌' },
  low_accuracy: { label: 'Low GPS', color: Colors.warning, icon: '⚠️' },
  failed: { label: 'Failed', color: Colors.error, icon: '💥' },
};

export function AttendanceHistoryItem({ record, showUser }: Props) {
  const { status, marked_at, distance_from_center, accuracy_meters, geo_fence_locations, users } = record;
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.failed;
  const date = new Date(marked_at);
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <ViewComp style={styles.container}>
      <ViewComp style={styles.left}>
        <TextComp style={styles.icon}>{config.icon}</TextComp>
      </ViewComp>
      <ViewComp style={styles.middle}>
        {showUser && users && (
          <TextComp style={styles.userName}>{users.name} <TextComp style={styles.userEmail}>({users.email})</TextComp></TextComp>
        )}
        <TextComp style={styles.location}>{geo_fence_locations?.name || 'Unknown Zone'}</TextComp>
        <TextComp style={styles.detail}>{Math.round(distance_from_center)}m · ±{Math.round(accuracy_meters)}m</TextComp>
        <TextComp style={styles.time}>{dateStr} at {timeStr}</TextComp>
      </ViewComp>
      <ViewComp style={[styles.badge, { backgroundColor: config.color + '20' }]}>
        <TextComp style={[styles.badgeText, { color: config.color }]}>{config.label}</TextComp>
      </ViewComp>
    </ViewComp>
  ) as any;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  left: { marginRight: Spacing.md },
  icon: { fontSize: 24 },
  middle: { flex: 1 },
  userName: { color: Colors.textPrimary, fontSize: Font.size.sm, ...Font.bold, marginBottom: 2 },
  userEmail: { color: Colors.textMuted, fontSize: Font.size.xs, ...Font.regular },
  location: { color: Colors.textPrimary, fontSize: Font.size.md, ...Font.semibold, marginBottom: 2 },
  detail: { color: Colors.textSecondary, fontSize: Font.size.xs },
  time: { color: Colors.textMuted, fontSize: Font.size.xs, marginTop: 2 },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.full, marginLeft: Spacing.sm },
  badgeText: { fontSize: Font.size.xs, ...Font.bold },
});
