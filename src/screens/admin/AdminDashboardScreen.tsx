import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllAttendanceApi, AttendanceRecord, getAttendanceSummaryApi, AttendanceSummary } from '../../api/attendance';
import { AttendanceHistoryItem } from '../../components/AttendanceHistoryItem';
import { StatCard } from '../../components/StatCard';
import { EmptyState } from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { Colors, Font, Spacing } from '../../theme';

const ViewComp = View as any;
const TextComp = Text as any;
const FlatListComp = FlatList as any;
const RefreshControlComp = RefreshControl as any;
const ActivityIndicatorComp = ActivityIndicator as any;

export function AdminDashboardScreen() {
  const { user, logout } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [attRes, sumRes] = await Promise.all([
        getAllAttendanceApi({ limit: 30 }),
        getAttendanceSummaryApi(),
      ]);
      if (attRes.success) setRecords(attRes.data);
      if (sumRes.success) setSummary(sumRes.data);
    } catch {} finally { setLoading(false); }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  const renderHeader = () => (
    <ViewComp>
      <ViewComp style={styles.header}>
        <ViewComp>
          <TextComp style={styles.greeting}>Hello, {user?.name} 👋</TextComp>
          <TextComp style={styles.role}>Admin Dashboard</TextComp>
        </ViewComp>
        <TextComp style={styles.logoutBtn} onPress={logout}>Sign Out</TextComp>
      </ViewComp>

      <ViewComp style={styles.statsRow}>
        <StatCard icon="✅" label="Success" value={summary?.successful ?? 0} color={Colors.success} />
        <StatCard icon="❌" label="Failed" value={summary?.failed ?? 0} color={Colors.error} />
        <StatCard icon="📊" label="Total" value={summary?.total ?? 0} color={Colors.primary} />
      </ViewComp>

      <TextComp style={styles.listTitle}>Recent Attendance</TextComp>
    </ViewComp>
  );

  if (loading) {
    return (
      <ViewComp style={styles.loadingContainer}>
        <ActivityIndicatorComp size="large" color={Colors.primary} />
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
      ListEmptyComponent={!loading ? <EmptyState icon="📊" title="No Records" message="Attendance records will appear here." /> : null}
      refreshControl={<RefreshControlComp refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      renderItem={({ item }: { item: AttendanceRecord }) => (
        <AttendanceHistoryItem
          record={item}
          showUser={true}
        />
      )}
    />
  ) as any;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loadingContainer: { flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' },
  content: { padding: Spacing.lg, paddingTop: Spacing.huge },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xxl },
  greeting: { color: Colors.textPrimary, fontSize: Font.size.xl, ...Font.bold },
  role: { color: Colors.textSecondary, fontSize: Font.size.sm, marginTop: Spacing.xs },
  logoutBtn: { color: Colors.error, fontSize: Font.size.sm, ...Font.semibold },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xxl },
  listTitle: { color: Colors.textSecondary, fontSize: Font.size.sm, ...Font.medium, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.sm },
});
