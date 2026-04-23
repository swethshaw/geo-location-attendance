import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getUsersApi, assignSupervisorApi } from '../../api/users';
import { useNavigation } from '@react-navigation/native';
import { AuthUser } from '../../api/auth';
import { EmptyState } from '../../components/EmptyState';
import { Colors, Font, Spacing, Radius } from '../../theme';

const PressableComp = Pressable as any;
const ViewComp = View as any;
const TextComp = Text as any;
const FlatListComp = FlatList as any;
const RefreshControlComp = RefreshControl as any;
const ActivityIndicatorComp = ActivityIndicator as any;

const ROLE_COLORS: Record<string, string> = { admin: Colors.primary, supervisor: Colors.warning, client: Colors.accent };

export function UsersScreen() {
  const navigation = useNavigation() as any;
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadUsers = useCallback(async () => {
    try { const res = await getUsersApi(); if (res.success) setUsers(res.data); } catch {} finally { setLoading(false); }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [loadUsers])
  );

  const onRefresh = async () => { setRefreshing(true); await loadUsers(); setRefreshing(false); };

  const renderUser = ({ item }: { item: AuthUser }) => {
    const roleColor = ROLE_COLORS[item.role] || Colors.textMuted;
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
        <ViewComp style={styles.avatar}><TextComp style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</TextComp></ViewComp>
        <ViewComp style={styles.info}><TextComp style={styles.name}>{item.name}</TextComp><TextComp style={styles.email}>{item.email}</TextComp></ViewComp>
        <ViewComp style={[styles.badge, { backgroundColor: roleColor + '20' }]}><TextComp style={[styles.badgeText, { color: roleColor }]}>{item.role}</TextComp></ViewComp>
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
    <FlatListComp 
      style={styles.container} 
      contentContainerStyle={styles.content} 
      data={users} 
      keyExtractor={(i: any) => i.id}
      refreshControl={<RefreshControlComp refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      ListHeaderComponent={<ViewComp style={styles.header}><TextComp style={styles.title}>Users</TextComp></ViewComp>}
      ListEmptyComponent={!loading ? <EmptyState icon="👥" title="No Users" message="Invite users to get started." /> : null}
      renderItem={renderUser}
    />
  ) as any;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loadingContainer: { flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' },
  content: { padding: Spacing.lg, paddingTop: Spacing.huge },
  header: { marginBottom: Spacing.xxl },
  title: { color: Colors.textPrimary, fontSize: Font.size.xxxl, ...Font.bold },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  avatarText: { color: Colors.primary, fontSize: Font.size.lg, ...Font.bold },
  info: { flex: 1 },
  name: { color: Colors.textPrimary, fontSize: Font.size.md, ...Font.semibold },
  email: { color: Colors.textSecondary, fontSize: Font.size.xs },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full },
  badgeText: { fontSize: Font.size.xs, ...Font.bold, textTransform: 'uppercase' },
});
