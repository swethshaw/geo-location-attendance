import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MapPin, LocateFixed, Ruler, Edit2, Trash2 } from 'lucide-react-native';
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

export function ZoneCard({ 
  name, 
  latitude, 
  longitude, 
  radiusMeters, 
  isActive, 
  onEdit, 
  onDelete 
}: Props) {

  const handleEdit = () => {
    if (onEdit) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onEdit();
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      onDelete();
    }
  };

  return (
    <View style={[styles.container, !isActive && styles.containerInactive]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[
            styles.iconWrapper, 
            { backgroundColor: isActive ? Colors.primary + '15' : Colors.textMuted + '15' }
          ]}>
            <MapPin 
              color={isActive ? Colors.primary : Colors.textMuted} 
              size={20} 
              strokeWidth={2.5} 
            />
          </View>
          <Text style={[styles.name, !isActive && styles.textInactive]} numberOfLines={1}>
            {name}
          </Text>
        </View>

        <View style={[
          styles.statusBadge, 
          { backgroundColor: isActive ? Colors.success + '15' : Colors.surfaceAlt }
        ]}>
          <Text style={[
            styles.statusText, 
            { color: isActive ? Colors.success : Colors.textMuted }
          ]}>
            {isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      {/* Telemetry / Details Grid */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <LocateFixed color={Colors.textMuted} size={14} strokeWidth={2.5} />
          <Text style={styles.detailText}>
            {latitude.toFixed(6)}°, {longitude.toFixed(6)}°
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ruler color={Colors.textMuted} size={14} strokeWidth={2.5} />
          <Text style={styles.detailText}>
            Radius: <Text style={styles.detailTextBold}>{radiusMeters}m</Text>
          </Text>
        </View>
      </View>

      {/* Contextual Actions Footer */}
      {(onEdit || onDelete) && (
        <View style={styles.actions}>
          {onEdit && (
            <Pressable 
              style={({ pressed }) => [
                styles.actionBtn, 
                styles.editBtn,
                pressed && styles.btnPressed
              ]} 
              onPress={handleEdit}
            >
              <Edit2 color={Colors.primary} size={16} strokeWidth={2.5} />
              <Text style={styles.editText}>Edit</Text>
            </Pressable>
          )}
          
          {onDelete && (
            <Pressable 
              style={({ pressed }) => [
                styles.actionBtn, 
                styles.deleteBtn,
                pressed && styles.btnPressed
              ]} 
              onPress={handleDelete}
            >
              <Trash2 color={Colors.error} size={16} strokeWidth={2.5} />
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    backgroundColor: Colors.surface, 
    borderRadius: Radius.xl, 
    padding: Spacing.lg, 
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
  containerInactive: { 
    backgroundColor: Colors.surfaceAlt, // Soften background instead of dimming opacity
    borderColor: Colors.border + '80',
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: Spacing.md,
  },
  headerLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: Spacing.sm,
    flex: 1,
    paddingRight: Spacing.sm,
  },
  iconWrapper: {
    padding: 8,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: { 
    color: Colors.textPrimary, 
    fontSize: Font.size.md, 
    fontWeight: '700',
    flexShrink: 1,
    letterSpacing: -0.3,
  },
  textInactive: {
    color: Colors.textSecondary,
  },
  statusBadge: { 
    paddingHorizontal: Spacing.md, 
    paddingVertical: 4, 
    borderRadius: Radius.full, 
  },
  statusText: { 
    fontSize: Font.size.xs, 
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  details: { 
    marginBottom: Spacing.md,
    gap: Spacing.xs,
    paddingLeft: Spacing.xs, // Slight indent to align with the text above
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: { 
    color: Colors.textSecondary, 
    fontSize: Font.size.sm,
    fontWeight: '500',
  },
  detailTextBold: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  actions: { 
    flexDirection: 'row', 
    gap: Spacing.sm, 
    borderTopWidth: 1, 
    borderTopColor: Colors.border, 
    paddingTop: Spacing.md,
  },
  actionBtn: {
    flex: 1, // Makes buttons equal width if both exist
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10, 
    borderRadius: Radius.lg,
    gap: 6,
  },
  btnPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.8,
  },
  editBtn: { 
    backgroundColor: Colors.primary + '10', // 10% opacity for a ghost-button look
  },
  editText: { 
    color: Colors.primary, 
    fontSize: Font.size.sm, 
    fontWeight: '600',
  },
  deleteBtn: { 
    backgroundColor: Colors.error + '10', 
  },
  deleteText: { 
    color: Colors.error, 
    fontSize: Font.size.sm, 
    fontWeight: '600',
  },
});