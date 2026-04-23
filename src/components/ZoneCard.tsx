import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Font, Spacing, Radius } from '../theme';

interface Props {
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isActive: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ZoneCard({ name, latitude, longitude, radiusMeters, isActive, onEdit, onDelete }: Props) {
  return (
    <View style={[styles.container, !isActive && styles.inactive]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.icon}>📍</Text>
          <Text style={styles.name}>{name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: isActive ? Colors.success + '20' : Colors.textMuted + '20' }]}>
          <Text style={[styles.statusText, { color: isActive ? Colors.success : Colors.textMuted }]}>
            {isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      <View style={styles.details}>
        <Text style={styles.coords}>{latitude.toFixed(6)}°, {longitude.toFixed(6)}°</Text>
        <Text style={styles.radius}>Radius: {radiusMeters}m</Text>
      </View>
      {(onEdit || onDelete) && (
        <View style={styles.actions}>
          {onEdit && (
            <Pressable 
              style={({ pressed }) => [styles.editBtn, { opacity: pressed ? 0.8 : 1 }]} 
              onPress={onEdit}
            >
              <Text style={styles.editText}>Edit</Text>
            </Pressable>
          )}
          {onDelete && (
            <Pressable 
              style={({ pressed }) => [styles.deleteBtn, { opacity: pressed ? 0.8 : 1 }]} 
              onPress={onDelete}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  ) as any;
}

const styles = StyleSheet.create({
  container: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm },
  inactive: { opacity: 0.6 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  icon: { fontSize: 20 },
  name: { color: Colors.textPrimary, fontSize: Font.size.md, ...Font.bold },
  statusBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full },
  statusText: { fontSize: Font.size.xs, ...Font.semibold },
  details: { marginBottom: Spacing.sm },
  coords: { color: Colors.textSecondary, fontSize: Font.size.sm },
  radius: { color: Colors.textMuted, fontSize: Font.size.xs, marginTop: 2 },
  actions: { flexDirection: 'row', gap: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm },
  editBtn: { backgroundColor: Colors.primaryBg, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.md },
  editText: { color: Colors.primary, fontSize: Font.size.sm, ...Font.semibold },
  deleteBtn: { backgroundColor: Colors.errorBg, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.md },
  deleteText: { color: Colors.error, fontSize: Font.size.sm, ...Font.semibold },
});
