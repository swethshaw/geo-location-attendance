import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  RefreshControl, 
  ActivityIndicator,
  ScrollView,
  StatusBar
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { 
  CheckCircle2, 
  XOctagon, 
  Users, 
  ClipboardList, 
  ShieldCheck 
} from 'lucide-react-native';

import { getAllAttendanceApi, AttendanceRecord, getAttendanceSummaryApi, AttendanceSummary } from '../../api/attendance';
import { AttendanceHistoryItem } from '../../components/AttendanceHistoryItem';
import { StatCard } from '../../components/StatCard';
import { EmptyState } from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { Colors, Font, Spacing, Radius } from '../../theme';

export function AdminDashboardScreen() {
  const { user } = useAuth();
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
    await loadData(); 
    setRefreshing(false); 
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Top Bar: Greeting & Role */}
      <View style={styles.topBar}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>Hello, {user?.name || 'Admin'} 👋</Text>
          <Text style={styles.role}>System Administrator</Text>
        </View>
        <View style={styles.roleIconWrapper}>
          <ShieldCheck color={Colors.primary} size={24} strokeWidth={2} />
        </View>
      </View>

      {/* Stats Row (Horizontal Scroll for Glassmorphism Cards) */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsScrollContent}
        style={styles.statsWrapper}
      >
        <StatCard 
          icon={CheckCircle2} 
          label="Successful" 
          value={summary?.successful ?? 0} 
          color={Colors.success} 
        />
        <StatCard 
          icon={XOctagon} 
          label="Failed" 
          value={summary?.failed ?? 0} 
          color={Colors.error} 
        />
        <StatCard 
          icon={Users} 
          label="Total Scans" 
          value={summary?.total ?? 0} 
          color={Colors.primary} 
        />
      </ScrollView>

      {/* List Header */}
      <View style={styles.listHeaderRow}>
        <ClipboardList color={Colors.textSecondary} size={18} strokeWidth={2.5} />
        <Text style={styles.listTitle}>Recent Attendance Activity</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Syncing Data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !loading ? (
            <EmptyState 
              icon={ClipboardList} 
              title="No Activity Yet" 
              message="Attendance records from users will appear here once they start scanning in." 
            />
          ) : null
        }
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={Colors.primary} 
            colors={[Colors.primary]} // For Android
          />
        }
        renderItem={({ item }) => (
          <AttendanceHistoryItem
            record={item}
            showUser={true}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.bg,
  },
  loadingContainer: { 
    flex: 1, 
    backgroundColor: Colors.bg, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: Font.size.sm,
    fontWeight: '500',
    marginTop: Spacing.md,
  },
  listContent: { 
    paddingHorizontal: Spacing.lg, 
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl, // Extra padding for safe area bottom
  },
  headerContainer: {
    marginBottom: Spacing.md,
  },
  topBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: Spacing.xl, 
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: { 
    color: Colors.textPrimary, 
    fontSize: Font.size.xl, 
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  role: { 
    color: Colors.textSecondary, 
    fontSize: Font.size.sm, 
    fontWeight: '500',
    marginTop: 4, 
  },
  roleIconWrapper: {
    backgroundColor: Colors.primary + '15',
    padding: Spacing.sm,
    borderRadius: Radius.lg,
  },
  statsWrapper: {
    marginHorizontal: -Spacing.lg, // Allows the scroll to bleed to the screen edges
    marginBottom: Spacing.xxl,
  },
  statsScrollContent: { 
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md, 
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.md,
  },
  listTitle: { 
    color: Colors.textSecondary, 
    fontSize: Font.size.sm, 
    fontWeight: '700',
    textTransform: 'uppercase', 
    letterSpacing: 0.5, 
  },
});