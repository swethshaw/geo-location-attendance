// ─── Accuracy Gauge Component ──────────────────────────────────────────────────
// Visual meter showing GPS accuracy: green (<20m), yellow (20-50m), red (>50m).

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Font, Spacing, Radius } from '../theme';
import { getAccuracyLevel, GPS_ACCURACY_THRESHOLD } from '../utils/constants';

interface Props {
  accuracy: number | null;
}

const ViewComp = View as any;
const TextComp = Text as any;

export function AccuracyGauge({ accuracy }: Props) {
  if (accuracy === null) {
    return (
      <ViewComp style={styles.container}>
        <TextComp style={styles.label}>GPS Accuracy</TextComp>
        <ViewComp style={styles.barBg}>
          <ViewComp style={[styles.barFill, { width: '0%', backgroundColor: Colors.textMuted }]} />
        </ViewComp>
        <TextComp style={styles.value}>Waiting for signal...</TextComp>
      </ViewComp>
    ) as any;
  }

  const level = getAccuracyLevel(accuracy);
  // Map accuracy to percentage (0m = 100%, 100m+ = 0%)
  const pct = Math.max(0, Math.min(100, ((100 - accuracy) / 100) * 100));
  const blocked = accuracy > GPS_ACCURACY_THRESHOLD;

  return (
    <ViewComp style={styles.container}>
      <ViewComp style={styles.header}>
        <TextComp style={styles.label}>GPS Accuracy</TextComp>
        <ViewComp style={[styles.badge, { backgroundColor: level.color + '20' }]}>
          <TextComp style={[styles.badgeText, { color: level.color }]}>{level.label}</TextComp>
        </ViewComp>
      </ViewComp>

      <ViewComp style={styles.barBg}>
        <ViewComp
          style={[
            styles.barFill,
            {
              width: `${pct}%`,
              backgroundColor: level.color,
            },
          ]}
        />
      </ViewComp>

      <ViewComp style={styles.footer}>
        <TextComp style={[styles.value, { color: level.color }]}>
          ±{Math.round(accuracy)}m
        </TextComp>
        {blocked && (
          <TextComp style={styles.blocked}>
            ⚠ Must be ≤{GPS_ACCURACY_THRESHOLD}m to mark attendance
          </TextComp>
        )}
      </ViewComp>
    </ViewComp>
  ) as any;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: Font.size.sm,
    ...Font.medium,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontSize: Font.size.xs,
    ...Font.semibold,
  },
  barBg: {
    height: 8,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  barFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  value: {
    fontSize: Font.size.md,
    ...Font.bold,
  },
  blocked: {
    color: Colors.error,
    fontSize: Font.size.xs,
    ...Font.medium,
    flex: 1,
    textAlign: 'right',
    marginLeft: Spacing.sm,
  },
});
