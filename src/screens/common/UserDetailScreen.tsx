import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator,
  ScrollView,
  StatusBar
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect, RouteProp } from '@react-navigation/native';
import { 
  User, 
  Mail, 
  CalendarDays, 
  History, 
  Activity, 
  CheckCircle2, 
  XOctagon 
} from 'lucide-react-native';

import { getAllAttendanceApi, getAttendanceSummaryApi, AttendanceRecord, AttendanceSummary } from '../../api/attendance';
import { AttendanceHistoryItem } from '../../components/AttendanceHistoryItem';
import { CalendarHeatmap } from '../../components/CalendarHeatmap';
import { StatCard } from '../../components/StatCard';
import { EmptyState } from '../../components/EmptyState';
import { Colors, Font, Spacing, Radius } from '../../theme';


type UserDetailRouteProp = RouteProp<Record<string, { userId: string; userName: string; userEmail: string }>, string>;


type HeatmapStatus = 'success' | 'low_accuracy' | 'outside_radius' | 'failed';

export function UserDetailScreen() {
  const route = useRoute<UserDetailRouteProp>();
  const navigation = useNavigation();
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
  }, [userName, navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }


  const heatmapData = summary ? Object.entries(
    summary.last_30_days.reduce((acc: Record<string, { status: HeatmapStatus; count: number }>, r) => {
      const date = r.marked_at.split('T')[0];
      

      let mappedStatus: HeatmapStatus = 'failed';
      if (r.status === 'success') mappedStatus = 'success';
      if (r.status === 'low_accuracy') mappedStatus = 'low_accuracy';
      if (r.status === 'outside_radius') mappedStatus = 'outside_radius';

      if (!acc[date]) {
        acc[date] = { status: mappedStatus, count: 1 };
      } else { 
        acc[date].count++; 
        if (mappedStatus === 'success') acc[date].status = 'success'; 
      }
      return acc;
    }, {})
  ).map(([date, data]) => ({
    date,
    status: data.status,
    count: data.count
  })) : [];

  const initial = userName ? userName.charAt(0).toUpperCase() : '?';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <FlatList
        data={records}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); fetchData(); }}
        ListHeaderComponent={
          <>

            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.name} numberOfLines={1}>{userName}</Text>
                <View style={styles.emailRow}>
                  <Mail color={Colors.textMuted} size={14} />
                  <Text style={styles.email} numberOfLines={1}>{userEmail}</Text>
                </View>
              </View>
            </View>


            {summary && (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.statsScrollContent}
                style={styles.statsWrapper}
              >
                <StatCard 
                  icon={Activity} 
                  label="Total Scans" 
                  value={summary.total ?? 0} 
                  color={Colors.primary} 
                />
                <StatCard 
                  icon={CheckCircle2} 
                  label="Successful" 
                  value={summary.successful ?? 0} 
                  color={Colors.success} 
                />
                <StatCard 
                  icon={XOctagon} 
                  label="Failed" 
                  value={summary.failed ?? 0} 
                  color={Colors.error} 
                />
              </ScrollView>
            )}


            <View style={styles.sectionHeader}>
              <CalendarDays color={Colors.textSecondary} size={20} strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>Activity Heatmap</Text>
            </View>
            <CalendarHeatmap attendanceDays={heatmapData} />


            <View style={[styles.sectionHeader, { marginTop: Spacing.xxl }]}>
              <History color={Colors.textSecondary} size={20} strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>Recent History</Text>
            </View>
          </>
        }
        renderItem={({ item }) => <AttendanceHistoryItem record={item} showUser={false} />}
        ListEmptyComponent={
          <EmptyState 
            icon={History} 
            title="No Activity Yet" 
            message={`${userName} hasn't marked any attendance on the system yet.`} 
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
  content: { 
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl, 
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
  

  profileHeader: { 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    color: Colors.primary,
    fontSize: Font.size.xxl,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: { 
    color: Colors.textPrimary, 
    fontSize: Font.size.xl, 
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  email: { 
    color: Colors.textSecondary, 
    fontSize: Font.size.sm,
    fontWeight: '500',
  },


  statsWrapper: {
    marginHorizontal: -Spacing.lg, 

    marginBottom: Spacing.xxl,
  },
  statsScrollContent: { 
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md, 
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
});