import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Colors, Font, Spacing, Radius, Shadow } from '../../theme';

export function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || '?'}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: Colors.primaryBg }]}>
          <Text style={[styles.roleText, { color: Colors.primary }]}>{user?.role?.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Member Since</Text>
          <Text style={styles.infoValue}>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Account Status</Text>
          <Text style={[styles.infoValue, { color: user?.is_active ? Colors.success : Colors.error }]}>
            {user?.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, padding: Spacing.lg, paddingTop: Spacing.huge },
  header: { marginBottom: Spacing.xxl },
  title: { color: Colors.textPrimary, fontSize: Font.size.xxxl, ...Font.bold },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.xxl, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, ...Shadow.sm, marginBottom: Spacing.lg },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg },
  avatarText: { fontSize: Font.size.xxxl, color: Colors.primary, ...Font.bold },
  name: { color: Colors.textPrimary, fontSize: Font.size.xl, ...Font.bold, marginBottom: Spacing.xs },
  email: { color: Colors.textSecondary, fontSize: Font.size.md, marginBottom: Spacing.md },
  roleBadge: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs, borderRadius: Radius.full },
  roleText: { fontSize: Font.size.xs, ...Font.bold, letterSpacing: 1 },
  infoCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.xxl },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm },
  infoLabel: { color: Colors.textSecondary, fontSize: Font.size.sm },
  infoValue: { color: Colors.textPrimary, fontSize: Font.size.sm, ...Font.semibold },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.xs },
  logoutBtn: { backgroundColor: Colors.errorBg, borderRadius: Radius.md, padding: Spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.error + '30' },
  logoutText: { color: Colors.error, fontSize: Font.size.md, ...Font.bold },
});
