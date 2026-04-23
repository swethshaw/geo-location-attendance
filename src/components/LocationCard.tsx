// ─── Location Card Component ───────────────────────────────────────────────────
// Displays current lat, lng, accuracy in a card.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Font, Spacing, Radius } from '../theme';
import { LocationData } from '../hooks/useLocation';

interface Props {
  location: LocationData | null;
  isLoading: boolean;
}

const ViewComp = View as any;
const TextComp = Text as any;

export function LocationCard({ location, isLoading }: Props) {
  return (
    <ViewComp style={styles.container}>
      <TextComp style={styles.title}>📡 Current Location</TextComp>
      {isLoading ? (
        <TextComp style={styles.loading}>Acquiring GPS signal...</TextComp>
      ) : location ? (
        <ViewComp style={styles.grid}>
          <ViewComp style={styles.item}>
            <TextComp style={styles.label}>Latitude</TextComp>
            <TextComp style={styles.value}>{location.latitude.toFixed(6)}°</TextComp>
          </ViewComp>
          <ViewComp style={styles.item}>
            <TextComp style={styles.label}>Longitude</TextComp>
            <TextComp style={styles.value}>{location.longitude.toFixed(6)}°</TextComp>
          </ViewComp>
          <ViewComp style={styles.item}>
            <TextComp style={styles.label}>Accuracy</TextComp>
            <TextComp style={styles.value}>
              ±{location.accuracy !== null ? Math.round(location.accuracy) : '?'}m
            </TextComp>
          </ViewComp>
          <ViewComp style={styles.item}>
            <TextComp style={styles.label}>Altitude</TextComp>
            <TextComp style={styles.value}>
              {location.altitude !== null ? `${Math.round(location.altitude)}m` : 'N/A'}
            </TextComp>
          </ViewComp>
        </ViewComp>
      ) : (
        <TextComp style={styles.loading}>No location data available</TextComp>
      )}
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
  title: {
    color: Colors.textPrimary,
    fontSize: Font.size.md,
    ...Font.semibold,
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  item: {
    width: '46%',
  },
  label: {
    color: Colors.textMuted,
    fontSize: Font.size.xs,
    ...Font.medium,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    color: Colors.textPrimary,
    fontSize: Font.size.md,
    ...Font.bold,
  },
  loading: {
    color: Colors.textMuted,
    fontSize: Font.size.sm,
    fontStyle: 'italic',
  },
});
