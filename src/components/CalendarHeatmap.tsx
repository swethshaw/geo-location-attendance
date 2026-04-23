// ─── Calendar Heatmap Component ────────────────────────────────────────────────
// Monthly calendar showing attendance days with color coding.

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Colors, Font, Spacing, Radius } from '../theme';

interface AttendanceDay {
  date: string; // YYYY-MM-DD
  status: string;
  count: number;
}

interface Props {
  attendanceDays: AttendanceDay[];
  onDayPress?: (date: string) => void;
}

export function CalendarHeatmap({ attendanceDays, onDayPress }: Props) {
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    attendanceDays.forEach(({ date, status }) => {
      let color: string = Colors.success;
      if (status === 'outside_radius') color = Colors.error;
      else if (status === 'low_accuracy') color = Colors.warning;
      else if (status === 'failed') color = Colors.error;

      marks[date] = {
        selected: true,
        selectedColor: color + '40',
        dotColor: color,
        marked: true,
      };
    });

    return marks;
  }, [attendanceDays]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📅 Monthly Overview</Text>
      <Calendar
        markedDates={markedDates}
        onDayPress={(day: DateData) => onDayPress?.(day.dateString)}
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
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 12,
        }}
        style={styles.calendar}
      />
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
          <Text style={styles.legendText}>Present</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.warning }]} />
          <Text style={styles.legendText}>Low Accuracy</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.error }]} />
          <Text style={styles.legendText}>Failed</Text>
        </View>
      </View>
    </View>
  );
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
  calendar: {
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: Colors.textSecondary,
    fontSize: Font.size.xs,
    ...Font.medium,
  },
});
