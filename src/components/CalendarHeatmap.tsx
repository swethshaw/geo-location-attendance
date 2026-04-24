import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import * as Haptics from 'expo-haptics';
import { CalendarDays, CheckCircle2, AlertTriangle, XOctagon, MapPinOff } from 'lucide-react-native';
import { Colors, Font, Spacing, Radius } from '../theme';

interface AttendanceDay {
  date: string; // YYYY-MM-DD
  status: 'success' | 'low_accuracy' | 'outside_radius' | 'failed';
  count: number;
}

interface Props {
  attendanceDays: AttendanceDay[];
  onDayPress?: (date: string) => void;
}

// Map domain statuses to semantic colors and icons
const STATUS_CONFIG = {
  success: { label: 'Present', bg: '#10B981', text: '#FFFFFF', Icon: CheckCircle2 },
  low_accuracy: { label: 'Low Accuracy', bg: '#F59E0B', text: '#FFFFFF', Icon: AlertTriangle },
  outside_radius: { label: 'Outside Zone', bg: '#EF4444', text: '#FFFFFF', Icon: MapPinOff },
  failed: { label: 'System Error', bg: '#EF4444', text: '#FFFFFF', Icon: XOctagon },
};

export function CalendarHeatmap({ attendanceDays, onDayPress }: Props) {
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    attendanceDays.forEach(({ date, status }) => {
      const config = STATUS_CONFIG[status] || STATUS_CONFIG.failed;

      marks[date] = {
        customStyles: {
          container: {
            backgroundColor: config.bg,
            borderRadius: 8, // Soft rounded squares for a modern heatmap feel
            elevation: 1, // Subtle lift on Android
            shadowColor: config.bg, // Colored shadow on iOS
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 2,
          },
          text: {
            color: config.text,
            fontWeight: '700',
          },
        },
      };
    });

    return marks;
  }, [attendanceDays]);

  const handleDayPress = useCallback((day: DateData) => {
    Haptics.selectionAsync(); // Subtle haptic click
    onDayPress?.(day.dateString);
  }, [onDayPress]);

  return (
    <View style={styles.container}>
      {/* High-End Header */}
      <View style={styles.header}>
        <View style={styles.iconWrapper}>
          <CalendarDays color={Colors.primary} size={20} strokeWidth={2.5} />
        </View>
        <Text style={styles.title}>Monthly Overview</Text>
      </View>

      {/* Calendar Grid */}
      <Calendar
        markingType={'custom'}
        markedDates={markedDates}
        onDayPress={handleDayPress}
        enableSwipeMonths={true} // Fluid UX improvement
        theme={{
          backgroundColor: Colors.surface,
          calendarBackground: Colors.surface,
          textSectionTitleColor: Colors.textSecondary,
          selectedDayTextColor: Colors.textPrimary,
          todayTextColor: Colors.primary,
          dayTextColor: Colors.textPrimary,
          textDisabledColor: Colors.textMuted,
          monthTextColor: Colors.textPrimary,
          arrowColor: Colors.primary,
          textDayFontWeight: '500',
          textMonthFontWeight: '700',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 15,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 13,
          'stylesheet.calendar.header': {
            week: {
              marginTop: 10,
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 10, // Better alignment with the day cells
            },
          },
        } as any}
        style={styles.calendar}
      />

      {/* Polished Chip-Style Legend */}
      <View style={styles.legendWrapper}>
        <View style={styles.legend}>
          {Object.values(STATUS_CONFIG).map((item, index) => {
            // Skip rendering duplicate colors (e.g., Outside Zone and System Error use the same red)
            if (item.label === 'System Error') return null; 
            
            return (
              <View key={index} style={styles.legendChip}>
                <item.Icon color={item.bg} size={14} strokeWidth={3} />
                <Text style={styles.legendText}>{item.label}</Text>
              </View>
            );
          })}
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
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    gap: Spacing.sm,
  },
  iconWrapper: {
    backgroundColor: Colors.primary + '15', // 15% opacity tint
    padding: 8,
    borderRadius: Radius.md,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Font.size.lg,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  calendar: {
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  legendWrapper: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceAlt,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  legendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    gap: 6,
  },
  legendText: {
    color: Colors.textSecondary,
    fontSize: Font.size.xs,
    fontWeight: '600',
  },
});