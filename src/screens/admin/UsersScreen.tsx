import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  RefreshControl, 
  Pressable, 
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { 
  Users, 
  ShieldCheck, 
  Briefcase, 
  User, 
  ChevronRight 
} from 'lucide-react-native';

import { getUsersApi } from '../../api/users';
import { AuthUser } from '../../api/auth';
import { EmptyState } from '../../components/EmptyState';
import { Colors, Font, Spacing, Radius } from '../../theme';


const ROLE_CONFIG: Record<string, { color: string; Icon: any; label: string }> = {
  admin: { color: Colors.primary, Icon: ShieldCheck, label: 'Admin' },
  supervisor: { color: Colors.warning, Icon: Briefcase, label: 'Supervisor' },
  client: { color: Colors.success || '#10B981', Icon: User, label: 'Client' },
};


const DEFAULT_ROLE = { color: Colors.textMuted, Icon: User, label: 'User' };

export function UsersScreen() {
  const navigation = useNavigation<any>(); 

  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadUsers = useCallback(async () => {
    try { 
      const res = await getUsersApi(); 
      if (res.success) setUsers(res.data); 
    } catch (error) {

    } finally { 
      setLoading(false); 
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [loadUsers])
  );

  const onRefresh = async () => { 
    setRefreshing(true); 
    await loadUsers(); 
    setRefreshing(false); 
  };

  const renderUser = ({ item }: { item: AuthUser }) => {
    const config = ROLE_CONFIG[item.role.toLowerCase()] || DEFAULT_ROLE;
    const RoleIcon = config.Icon;
    const initial = item.name ? item.name.charAt(0).toUpperCase() : '?';

    return (
      <Pressable 
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed
        ]} 
        onPress={() => {
          Haptics.selectionAsync();
          navigation.navigate('UserDetail', { 
            userId: item.id, 
            userName: item.name, 
            userEmail: item.email 
          });
        }}
      >

        <View style={[styles.avatar, { backgroundColor: config.color + '15' }]}>
          <Text style={[styles.avatarText, { color: config.color }]}>{initial}</Text>
        </View>


        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
        </View>


        <View style={styles.rightContent}>
          <View style={[styles.badge, { backgroundColor: config.color + '15' }]}>
            <RoleIcon color={config.color} size={12} strokeWidth={2.5} />
            <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
          </View>
          <ChevronRight color={Colors.textMuted} size={20} strokeWidth={2} />
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading Directory...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <FlatList 
        contentContainerStyle={styles.content} 
        data={users} 
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Directory</Text>
            <View style={styles.userCountBadge}>
              <Users color={Colors.primary} size={14} strokeWidth={2.5} />
              <Text style={styles.userCountText}>{users.length} Total</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState 
              icon={Users} 
              title="Directory is Empty" 
              message="Invite users, supervisors, and clients to start collaborating." 
            />
          ) : null
        }
        renderItem={renderUser}
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
    padding: Spacing.lg, 
    paddingTop: Spacing.xl, 
    paddingBottom: 100, 

  },
  header: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: { 
    color: Colors.textPrimary, 
    fontSize: Font.size.xxl, 
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  userCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
    gap: 6,
  },
  userCountText: {
    color: Colors.primary,
    fontSize: Font.size.xs,
    fontWeight: '700',
  },
  card: { 
    backgroundColor: Colors.surface, 
    borderRadius: Radius.xl, 
    padding: Spacing.md, 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: Colors.border, 
    marginBottom: Spacing.sm,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: Colors.surfaceAlt,
    borderColor: Colors.border + '80', 

  },
  avatar: { 
    width: 48, 
    height: 48, 
    borderRadius: Radius.lg, 

    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: Spacing.md,
  },
  avatarText: { 
    fontSize: Font.size.lg, 
    fontWeight: '800',
  },
  info: { 
    flex: 1, 
    paddingRight: Spacing.sm,
  },
  name: { 
    color: Colors.textPrimary, 
    fontSize: Font.size.md, 
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  email: { 
    color: Colors.textSecondary, 
    fontSize: Font.size.sm, 
    fontWeight: '400',
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  badge: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm, 
    paddingVertical: 6, 
    borderRadius: Radius.full,
    gap: 4,
  },
  badgeText: { 
    fontSize: 11, 
    fontWeight: '700', 
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});