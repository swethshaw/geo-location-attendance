import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getMyAttendanceApi, AttendanceRecord, getAttendanceSummaryApi } from '../../api/attendance';
import { AttendanceHistoryItem } from '../../components/AttendanceHistoryItem';
import { CalendarHeatmap } from '../../components/CalendarHeatmap';
import { EmptyState } from '../../components/EmptyState';
import { Colors, Font, Spacing } from '../../theme';

const ViewComp = View as any;
const TextComp = Text as any;
const FlatListComp = FlatList as any;
const RefreshControlComp = RefreshControl as any;
const ActivityIndicatorComp = ActivityIndicator as any;

export function HistoryScreen() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [calendarDays, setCalendarDays] = useState<{ date: string; status: string; count: number }[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [attRes, summaryRes] = await Promise.all([
        getMyAttendanceApi({ limit: 50 }),
        getAttendanceSummaryApi(),
      ]);

      if (attRes.success) setRecords(attRes.data);

      if (summaryRes.success) {
        // Group by date for calendar
        const dayMap: Record<string, { status: string; count: number }> = {};
        summaryRes.data.last_30_days.forEach((r) => {
          const date = r.marked_at.split('T')[0];
          if (!dayMap[date]) dayMap[date] = { status: r.status, count: 1 };
          else { dayMap[date].count++; if (r.status === 'success') dayMap[date].status = 'success'; }
        });
        setCalendarDays(
          Object.entries(dayMap).map(([date, { status, count }]) => ({
            date, status: status as any, count,
          }))
        );
      }
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderHeader = () => (
    <ViewComp>
      <ViewComp style={styles.header}>
        <TextComp style={styles.title}>Attendance History</TextComp>
        <TextComp style={styles.subtitle}>Your check-in records</TextComp>
      </ViewComp>
      <ViewComp style={styles.section}>
        <CalendarHeatmap attendanceDays={calendarDays} />
      </ViewComp>
      <TextComp style={styles.listTitle}>Recent Records</TextComp>
    </ViewComp>
  );

  if (loading) {
    return (
      <ViewComp style={styles.loadingContainer}>
        <ActivityIndicatorComp size="large" color={Colors.primary} />
      </ViewComp>
    ) as any;
  }

  if (records.length === 0) {
    return (
      <ViewComp style={styles.container}>
        {renderHeader()}
        <EmptyState icon="📋" title="No Records Yet" message="Your attendance records will appear here after you check in." />
      </ViewComp>
    ) as any;
  }

  return (
    <FlatListComp
      style={styles.container}
      contentContainerStyle={styles.content}
      data={records}
      keyExtractor={(item: any) => item.id}
      ListHeaderComponent={renderHeader}
      refreshControl={<RefreshControlComp refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      renderItem={({ item }: { item: AttendanceRecord }) => (
        <AttendanceHistoryItem
          record={item}
          showUser={false}
        />
      )}
    />
  ) as any;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loadingContainer: { flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' },
  content: { padding: Spacing.lg, paddingTop: Spacing.huge },
  header: { marginBottom: Spacing.xxl },
  title: { color: Colors.textPrimary, fontSize: Font.size.xxxl, ...Font.bold },
  subtitle: { color: Colors.textSecondary, fontSize: Font.size.md, marginTop: Spacing.xs },
  section: { marginBottom: Spacing.lg },
  listTitle: { color: Colors.textSecondary, fontSize: Font.size.sm, ...Font.medium, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.sm },
});
