import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Pressable, ActivityIndicator,StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { getUsersApi } from '../../api/users';
import { getAttendanceSummaryApi, AttendanceSummary } from '../../api/attendance';
import { AuthUser } from '../../api/auth';
import { EmptyState } from '../../components/EmptyState';
import { Colors, Font, Spacing, Radius } from '../../theme';
import { 
  Users
} from 'lucide-react-native';
const PressableComp = Pressable as any;
const ViewComp = View as any;
const TextComp = Text as any;
const FlatListComp = FlatList as any;
const RefreshControlComp = RefreshControl as any;
const ActivityIndicatorComp = ActivityIndicator as any;

export function TeamScreen() {
  const navigation = useNavigation() as any;
  const [clients, setClients] = useState<(AuthUser & { summary?: AttendanceSummary })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await getUsersApi();
      if (res.success) {
        const withSummary = await Promise.all(
          res.data.map(async (u) => {
            try {
              const sRes = await getAttendanceSummaryApi(u.id);
              return { ...u, summary: sRes.success ? sRes.data : undefined };
            } catch { return u; }
          })
        );
        setClients(withSummary);
      }
    } catch {} finally { setLoading(false); }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  const renderItem = ({ item }: { item: AuthUser & { summary?: AttendanceSummary } }) => {
    const rate = item.summary && item.summary.total > 0 ? Math.round((item.summary.successful / item.summary.total) * 100) : 0;
    return (
      <PressableComp 
        style={({ pressed }: any) => [
          styles.card,
          { opacity: pressed ? 0.7 : 1 }
        ]}
        onPress={() => navigation.navigate('UserDetail', { 
          userId: item.id, 
          userName: item.name, 
          userEmail: item.email 
        })}
      >
        <ViewComp style={styles.cardHeader}>
          <ViewComp style={styles.avatar}><TextComp style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</TextComp></ViewComp>
          <ViewComp style={styles.info}><TextComp style={styles.name}>{item.name}</TextComp><TextComp style={styles.email}>{item.email}</TextComp></ViewComp>
        </ViewComp>
        {item.summary && (
          <ViewComp style={styles.stats}>
            <ViewComp style={styles.stat}><TextComp style={styles.statValue}>{item.summary.total}</TextComp><TextComp style={styles.statLabel}>Total</TextComp></ViewComp>
            <ViewComp style={styles.stat}><TextComp style={[styles.statValue, { color: Colors.success }]}>{item.summary.successful}</TextComp><TextComp style={styles.statLabel}>Success</TextComp></ViewComp>
            <ViewComp style={styles.stat}><TextComp style={[styles.statValue, { color: Colors.error }]}>{item.summary.failed}</TextComp><TextComp style={styles.statLabel}>Failed</TextComp></ViewComp>
            <ViewComp style={styles.stat}><TextComp style={[styles.statValue, { color: rate >= 80 ? Colors.success : rate >= 50 ? Colors.warning : Colors.error }]}>{rate}%</TextComp><TextComp style={styles.statLabel}>Rate</TextComp></ViewComp>
          </ViewComp>
        )}
      </PressableComp>
    );
  };

  if (loading) {
    return (
      <ViewComp style={styles.loadingContainer}>
        <ActivityIndicatorComp size="large" color={Colors.primary} />
      </ViewComp>
    ) as any;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <FlatList
        contentContainerStyle={styles.content} 
        data={clients} 
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={Colors.primary} 
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>My Team</Text>
            <View style={styles.countBadge}>
              <Users color={Colors.primary} size={14} strokeWidth={2.5} />
              <Text style={styles.countText}>{clients.length} Clients</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState 
              icon={Users} 
              title="No Team Members" 
              message="Your team directory is currently empty. Invite clients to get started." 
            />
          ) : null
        }
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loadingContainer: { flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' },
  content: { padding: Spacing.lg, paddingTop: Spacing.huge },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xxl },
  title: { color: Colors.textPrimary, fontSize: Font.size.xxxl, ...Font.bold },
  count: { color: Colors.textMuted, fontSize: Font.size.sm },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  avatarText: { color: Colors.primary, fontSize: Font.size.md, ...Font.bold },
  info: { flex: 1 },
  name: { color: Colors.textPrimary, fontSize: Font.size.md, ...Font.semibold },
  email: { color: Colors.textSecondary, fontSize: Font.size.xs },
  stats: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.md },
  stat: { alignItems: 'center' },
  statValue: { color: Colors.textPrimary, fontSize: Font.size.lg, ...Font.bold },
  statLabel: { color: Colors.textMuted, fontSize: Font.size.xs, marginTop: 2 },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    gap: 6,
  },
  countText: { 
    color: Colors.primary, 
    fontSize: Font.size.xs, 
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
