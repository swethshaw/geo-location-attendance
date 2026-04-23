// ─── Geofence Status Component ─────────────────────────────────────────────────
// Shows inside/outside status with distance from center.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Font, Spacing, Radius } from '../theme';

interface Props {
  distance: number | null;
  isInside: boolean;
  radiusMeters: number;
  zoneName?: string;
}

const ViewComp = View as any;
const TextComp = Text as any;

export function GeofenceStatus({ distance, isInside, radiusMeters, zoneName }: Props) {
  if (distance === null) {
    return (
      <ViewComp style={[styles.container, styles.neutral]}>
        <TextComp style={styles.icon}>📍</TextComp>
        <ViewComp style={styles.info}>
          <TextComp style={styles.status}>Calculating distance...</TextComp>
          <TextComp style={styles.detail}>Waiting for GPS data</TextComp>
        </ViewComp>
      </ViewComp>
    ) as any;
  }

  const roundedDist = Math.round(distance);

  return (
    <ViewComp style={[styles.container, isInside ? styles.inside : styles.outside]}>
      <TextComp style={styles.icon}>{isInside ? '✅' : '❌'}</TextComp>
      <ViewComp style={styles.info}>
        <TextComp style={[styles.status, { color: isInside ? Colors.success : Colors.error }]}>
          {isInside ? 'Inside Zone' : 'Outside Zone'}
        </TextComp>
        <TextComp style={styles.detail}>
          {roundedDist}m from center{zoneName ? ` · ${zoneName}` : ''}{' '}
          <TextComp style={styles.dim}>(radius: {radiusMeters}m)</TextComp>
        </TextComp>
        {!isInside && (
          <TextComp style={styles.hint}>
            Move {roundedDist - radiusMeters}m closer to mark attendance
          </TextComp>
        )}
      </ViewComp>
    </ViewComp>
  ) as any;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  inside: {
    backgroundColor: Colors.successBg,
    borderColor: Colors.success + '30',
  },
  outside: {
    backgroundColor: Colors.errorBg,
    borderColor: Colors.error + '30',
  },
  neutral: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  icon: {
    fontSize: 28,
  },
  info: {
    flex: 1,
  },
  status: {
    fontSize: Font.size.lg,
    ...Font.bold,
    marginBottom: 2,
  },
  detail: {
    color: Colors.textSecondary,
    fontSize: Font.size.sm,
  },
  dim: {
    color: Colors.textMuted,
  },
  hint: {
    color: Colors.warning,
    fontSize: Font.size.xs,
    ...Font.medium,
    marginTop: 4,
  },
});
