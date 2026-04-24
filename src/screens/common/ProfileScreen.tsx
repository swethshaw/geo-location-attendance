import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  Pressable,
  StatusBar
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { 
  LogOut, 
  CalendarDays, 
  ShieldCheck, 
  Briefcase, 
  User as UserIcon,
  Activity
} from 'lucide-react-native';

import { useAuth } from '../../context/AuthContext';
import { Colors, Font, Spacing, Radius } from '../../theme';
import { verticalScale } from '../../utils/responsive';


const ROLE_CONFIG: Record<string, { color: string; Icon: any; label: string }> = {
  admin: { color: Colors.primary, Icon: ShieldCheck, label: 'Administrator' },
  supervisor: { color: Colors.warning, Icon: Briefcase, label: 'Supervisor' },
  client: { color: '#10B981', Icon: UserIcon, label: 'Client' }, 

};

const DEFAULT_ROLE = { color: Colors.textMuted, Icon: UserIcon, label: 'User' };

export function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Sign Out', 
      'Are you sure you want to sign out of your account?', 
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive', 
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            logout();
          } 
        },
      ]
    );
  };

  const safeRole = user?.role?.toLowerCase() || 'client';
  const roleConfig = ROLE_CONFIG[safeRole] || DEFAULT_ROLE;
  const RoleIcon = roleConfig.Icon;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      

      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>


      <View style={styles.identityCard}>
        <View style={[styles.avatar, { backgroundColor: roleConfig.color + '15' }]}>
          <Text style={[styles.avatarText, { color: roleConfig.color }]}>
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
        
        <Text style={styles.name}>{user?.name || 'Unknown User'}</Text>
        <Text style={styles.email}>{user?.email || 'No email provided'}</Text>
        
        <View style={[styles.roleBadge, { backgroundColor: roleConfig.color + '15' }]}>
          <RoleIcon color={roleConfig.color} size={14} strokeWidth={2.5} />
          <Text style={[styles.roleText, { color: roleConfig.color }]}>
            {roleConfig.label}
          </Text>
        </View>
      </View>


      <View style={styles.detailsCard}>
        <View style={styles.infoRow}>
          <View style={styles.infoRowLeft}>
            <View style={styles.iconWrapper}>
              <CalendarDays color={Colors.textMuted} size={18} strokeWidth={2.5} />
            </View>
            <Text style={styles.infoLabel}>Member Since</Text>
          </View>
          <Text style={styles.infoValue}>
            {user?.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { 
              month: 'long', 
              year: 'numeric' 
            }) : 'N/A'}
          </Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.infoRow}>
          <View style={styles.infoRowLeft}>
            <View style={styles.iconWrapper}>
              <Activity color={Colors.textMuted} size={18} strokeWidth={2.5} />
            </View>
            <Text style={styles.infoLabel}>Account Status</Text>
          </View>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: user?.is_active ? Colors.success + '15' : Colors.error + '15' }
          ]}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: user?.is_active ? Colors.success : Colors.error }
            ]} />
            <Text style={[
              styles.statusText, 
              { color: user?.is_active ? Colors.success : Colors.error }
            ]}>
              {user?.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
      </View>


      <View style={styles.footer}>
        <Pressable 
          style={({ pressed }) => [
            styles.logoutBtn,
            pressed && styles.logoutBtnPressed
          ]} 
          onPress={handleLogout}
        >
          <LogOut color={Colors.error} size={20} strokeWidth={2.5} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.bg, 
    padding: Spacing.lg, 
    paddingTop: Spacing.huge, 
    paddingBottom: verticalScale(100) 
  },
  header: { 
    marginBottom: Spacing.xl 
  },
  title: { 
    color: Colors.textPrimary, 
    fontSize: Font.size.xxxl, 
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  

  identityCard: { 
    backgroundColor: Colors.surface, 
    borderRadius: Radius.xxl, 
    padding: Spacing.xxl, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: Colors.border, 
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  avatar: { 
    width: 88, 
    height: 88, 
    borderRadius: Radius.xl, 

    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: Spacing.lg,
  },
  avatarText: { 
    fontSize: 36, 
    fontWeight: '800',
  },
  name: { 
    color: Colors.textPrimary, 
    fontSize: Font.size.xl, 
    fontWeight: '700', 
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  email: { 
    color: Colors.textSecondary, 
    fontSize: Font.size.md, 
    marginBottom: Spacing.lg 
  },
  roleBadge: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg, 
    paddingVertical: 8, 
    borderRadius: Radius.full,
    gap: 6,
  },
  roleText: { 
    fontSize: Font.size.xs, 
    fontWeight: '700', 
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },


  detailsCard: { 
    backgroundColor: Colors.surface, 
    borderRadius: Radius.xl, 
    paddingHorizontal: Spacing.lg, 
    borderWidth: 1, 
    borderColor: Colors.border, 
    marginBottom: Spacing.xxl 
  },
  infoRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: Spacing.lg 
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconWrapper: {
    backgroundColor: Colors.surfaceAlt,
    padding: 8,
    borderRadius: Radius.md,
  },
  infoLabel: { 
    color: Colors.textSecondary, 
    fontSize: Font.size.sm,
    fontWeight: '500', 
  },
  infoValue: { 
    color: Colors.textPrimary, 
    fontSize: Font.size.sm, 
    fontWeight: '600' 
  },
  divider: { 
    height: 1, 
    backgroundColor: Colors.border,
  },
  

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: Font.size.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
  },


  footer: {
    marginTop: 'auto', 

  },
  logoutBtn: { 
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.error + '10', 

    borderRadius: Radius.xl, 
    padding: Spacing.lg, 
    borderWidth: 1, 
    borderColor: Colors.error + '30',
    gap: 8,
  },
  logoutBtnPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: Colors.error + '20',
  },
  logoutText: { 
    color: Colors.error, 
    fontSize: Font.size.md, 
    fontWeight: '700' 
  },
});