import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  RefreshControl, 
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { 
  ClipboardList, 
  CalendarDays, 
  History 
} from 'lucide-react-native';

import { getMyAttendanceApi, AttendanceRecord, getAttendanceSummaryApi } from '../../api/attendance';
import { AttendanceHistoryItem } from '../../components/AttendanceHistoryItem';
import { CalendarHeatmap } from '../../components/CalendarHeatmap';
import { EmptyState } from '../../components/EmptyState';
import { Colors, Font, Spacing } from '../../theme';
import { verticalScale } from '../../utils/responsive';


type HeatmapStatus = 'success' | 'low_accuracy' | 'outside_radius' | 'failed';

export function HistoryScreen() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [calendarDays, setCalendarDays] = useState<{ 
    date: string; 
    status: HeatmapStatus; 
    count: number 
  }[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [attRes, summaryRes] = await Promise.all([
        getMyAttendanceApi({ limit: 50 }),
        getAttendanceSummaryApi(),
      ]);

      if (attRes.success) setRecords(attRes.data);

      if (summaryRes.success) {

        const dayMap: Record<string, { status: HeatmapStatus; count: number }> = {};
        
        summaryRes.data.last_30_days.forEach((r) => {
          const date = r.marked_at.split('T')[0];
          

          let mappedStatus: HeatmapStatus = 'failed';
          if (r.status === 'success') mappedStatus = 'success';
          if (r.status === 'low_accuracy') mappedStatus = 'low_accuracy';
          if (r.status === 'outside_radius') mappedStatus = 'outside_radius';

          if (!dayMap[date]) {
            dayMap[date] = { status: mappedStatus, count: 1 };
          } else { 
            dayMap[date].count++; 
            if (mappedStatus === 'success') dayMap[date].status = 'success'; 
          }
        });

        setCalendarDays(
          Object.entries(dayMap).map(([date, { status, count }]) => ({
            date, 
            status, 
            count,
          }))
        );
      }
    } catch (error) {

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadData();
    setRefreshing(false);
  };

  const renderHeader = () => (
    <View>

      <View style={styles.header}>
        <Text style={styles.title}>Attendance Logs</Text>
        <Text style={styles.subtitle}>Review your recent check-in activity</Text>
      </View>


      <View style={styles.sectionHeader}>
        <CalendarDays color={Colors.textSecondary} size={20} strokeWidth={2.5} />
        <Text style={styles.sectionTitle}>Activity Heatmap</Text>
      </View>
      
      <View style={styles.heatmapWrapper}>
        <CalendarHeatmap attendanceDays={calendarDays} />
      </View>


      <View style={[styles.sectionHeader, { marginTop: Spacing.md }]}>
        <History color={Colors.textSecondary} size={20} strokeWidth={2.5} />
        <Text style={styles.sectionTitle}>Recent Records</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading History...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.content}
        data={records}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={Colors.primary} 
          />
        }
        renderItem={({ item }: { item: AttendanceRecord }) => (
          <AttendanceHistoryItem
            record={item}
            showUser={false}
          />
        )}
        ListEmptyComponent={
          <EmptyState 
            icon={ClipboardList} 
            title="No Records Found" 
            message="Your attendance records will appear here after you check in." 
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.bg 
  },
  loadingContainer: { 
    flex: 1, 
    backgroundColor: Colors.bg, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: Font.size.sm,
    fontWeight: '500',
    marginTop: Spacing.md,
  },
  content: { 
    padding: Spacing.lg, 
    paddingTop: Spacing.xl, 
    paddingBottom: verticalScale(120), 

  },
  header: { 
    marginBottom: Spacing.xxl 
  },
  title: { 
    color: Colors.textPrimary, 
    fontSize: Font.size.xxl, 
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: { 
    color: Colors.textSecondary, 
    fontSize: Font.size.md, 
    fontWeight: '500',
    marginTop: 4, 
  },
  

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: 8,
  },
  sectionTitle: { 
    color: Colors.textPrimary, 
    fontSize: Font.size.lg, 
    fontWeight: '800', 
    letterSpacing: -0.3, 
  },
  heatmapWrapper: { 
    marginBottom: Spacing.xl 
  },
});