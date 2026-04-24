import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  RefreshControl, 
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Pressable
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { 
  Users, 
  CheckCircle2, 
  ClipboardList, 
  Briefcase 
} from 'lucide-react-native';

import { getAllAttendanceApi, AttendanceRecord } from '../../api/attendance';
import { getUsersApi } from '../../api/users';
import { AuthUser } from '../../api/auth';
import { AttendanceHistoryItem } from '../../components/AttendanceHistoryItem';
import { StatCard } from '../../components/StatCard';
import { EmptyState } from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { Colors, Font, Spacing, Radius } from '../../theme';

export function SupervisorDashboardScreen() {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [clients, setClients] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [attRes, usersRes] = await Promise.all([
        getAllAttendanceApi({ limit: 30 }),
        getUsersApi(),
      ]);
      if (attRes.success) setRecords(attRes.data);
      if (usersRes.success) setClients(usersRes.data);
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

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = records.filter(r => r.marked_at.startsWith(todayStr) && r.status === 'success');

  const renderHeader = () => (
    <View style={styles.headerContainer}>

      <View style={styles.topBar}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>Hello, {user?.name || 'Supervisor'} 👋</Text>
          <View style={styles.roleBadge}>
            <Briefcase color={Colors.warning} size={12} strokeWidth={2.5} />
            <Text style={styles.roleText}>Supervisor Dashboard</Text>
          </View>
        </View>
      </View>


      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsScrollContent}
        style={styles.statsWrapper}
      >
        <StatCard 
          icon={Users} 
          label="Team Members" 
          value={clients.length} 
          color={Colors.primary} 
        />
        <StatCard 
          icon={CheckCircle2} 
          label="Present Today" 
          value={todayRecords.length} 
          color={Colors.success} 
        />
        <StatCard 
          icon={ClipboardList} 
          label="Total Records" 
          value={records.length} 
          color={Colors.warning} 
        />
      </ScrollView>


      <View style={styles.listHeaderRow}>
        <ClipboardList color={Colors.textSecondary} size={18} strokeWidth={2.5} />
        <Text style={styles.listTitle}>Recent Team Attendance</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Syncing Dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <FlatList
        data={records}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !loading ? (
            <EmptyState 
              icon={ClipboardList} 
              title="No Team Records" 
              message="Attendance records from your team will appear here once they start scanning in." 
            />
          ) : null
        }
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={Colors.primary} 
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
  content: { 
    paddingHorizontal: Spacing.lg, 
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl, 
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
    marginBottom: 4,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roleText: { 
    color: Colors.textSecondary, 
    fontSize: Font.size.sm, 
    fontWeight: '600',
  },
  statsWrapper: {
    marginHorizontal: -Spacing.lg, 

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