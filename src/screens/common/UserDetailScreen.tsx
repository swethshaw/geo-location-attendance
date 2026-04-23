import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { getAllAttendanceApi, getAttendanceSummaryApi, AttendanceRecord, AttendanceSummary } from '../../api/attendance';
import { AttendanceHistoryItem } from '../../components/AttendanceHistoryItem';
import { CalendarHeatmap } from '../../components/CalendarHeatmap';
import { EmptyState } from '../../components/EmptyState';
import { Colors, Font, Spacing, Radius } from '../../theme';

const ViewComp = View as any;
const TextComp = Text as any;
const FlatListComp = FlatList as any;
const ActivityIndicatorComp = ActivityIndicator as any;

export function UserDetailScreen() {
  const route = useRoute() as any;
  const navigation = useNavigation() as any;
  const { userId, userName, userEmail } = route.params;

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [recRes, sumRes] = await Promise.all([
        getAllAttendanceApi({ user_id: userId, limit: 100 }),
        getAttendanceSummaryApi(userId)
      ]);

      if (recRes.success) setRecords(recRes.data);
      if (sumRes.success) setSummary(sumRes.data);
    } catch (err) {
      console.error('Failed to fetch user details:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [userId])
  );

  useEffect(() => {
    navigation.setOptions({ title: userName || 'User Details' });
  }, [userName]);

  if (loading) {
    return (
      <ViewComp style={styles.loading}>
        <ActivityIndicatorComp size="large" color={Colors.primary} />
      </ViewComp>
    ) as any;
  }

  // Group summary data for heatmap
  const heatmapData = summary ? Object.entries(
    summary.last_30_days.reduce((acc: Record<string, { status: string; count: number }>, r) => {
      const date = r.marked_at.split('T')[0];
      if (!acc[date]) acc[date] = { status: r.status, count: 1 };
      else { acc[date].count++; if (r.status === 'success') acc[date].status = 'success'; }
      return acc;
    }, {})
  ).map(([date, data]) => ({
    date,
    status: data.status,
    count: data.count
  })) : [];

  return (
    <FlatListComp
      data={records}
      keyExtractor={(item: any) => item.id}
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshing={refreshing}
      onRefresh={() => { setRefreshing(true); fetchData(); }}
      ListHeaderComponent={
        <>
          <ViewComp style={styles.header}>
            <TextComp style={styles.name}>{userName}</TextComp>
            <TextComp style={styles.email}>{userEmail}</TextComp>
          </ViewComp>

          {summary && (
            <ViewComp style={styles.statsGrid}>
              <ViewComp style={styles.statCard}>
                <TextComp style={styles.statVal}>{summary.total}</TextComp>
                <TextComp style={styles.statLabel}>Total</TextComp>
              </ViewComp>
              <ViewComp style={styles.statCard}>
                <TextComp style={[styles.statVal, { color: Colors.success }]}>{summary.successful}</TextComp>
                <TextComp style={styles.statLabel}>Success</TextComp>
              </ViewComp>
              <ViewComp style={styles.statCard}>
                <TextComp style={[styles.statVal, { color: Colors.error }]}>{summary.failed}</TextComp>
                <TextComp style={styles.statLabel}>Failed</TextComp>
              </ViewComp>
            </ViewComp>
          )}

          <TextComp style={styles.sectionTitle}>Activity Heatmap</TextComp>
          <CalendarHeatmap attendanceDays={heatmapData as any} />

          <TextComp style={styles.sectionTitle}>Recent History</TextComp>
        </>
      }
      renderItem={({ item }: { item: AttendanceRecord }) => <AttendanceHistoryItem record={item} showUser={false} />}
      ListEmptyComponent={<EmptyState icon="🕒" title="No Records" message="This user hasn't marked any attendance yet." />}
    />
  ) as any;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg },
  loading: { flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: Spacing.xl },
  name: { color: Colors.textPrimary, fontSize: Font.size.xxl, ...Font.bold },
  email: { color: Colors.textSecondary, fontSize: Font.size.md },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xl },
  statCard: { flex: 1, backgroundColor: Colors.surface, padding: Spacing.md, borderRadius: Radius.md, alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: Colors.border },
  statVal: { color: Colors.textPrimary, fontSize: Font.size.xl, ...Font.bold },
  statLabel: { color: Colors.textMuted, fontSize: Font.size.xs, marginTop: 2, textTransform: 'uppercase' },
  sectionTitle: { color: Colors.textPrimary, fontSize: Font.size.lg, ...Font.bold, marginTop: Spacing.lg, marginBottom: Spacing.md },
});
