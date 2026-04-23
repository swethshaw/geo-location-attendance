import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Pressable, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { sendInvitationApi, getInvitationsApi, Invitation } from '../../api/users';
import { EmptyState } from '../../components/EmptyState';
import { Colors, Font, Spacing, Radius } from '../../theme';
import * as Clipboard from 'expo-clipboard';

const ViewComp = View as any;
const TextComp = Text as any;
const FlatListComp = FlatList as any;
const RefreshControlComp = RefreshControl as any;
const PressableComp = Pressable as any;
const TextInputComp = TextInput as any;
const ModalComp = Modal as any;
const ActivityIndicatorComp = ActivityIndicator as any;

export function InvitationsScreen() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'supervisor' | 'client'>('client');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try { const res = await getInvitationsApi(); if (res.success) setInvitations(res.data); } catch {} finally { setLoading(false); }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const handleSend = async () => {
    if (!email.trim()) { Alert.alert('Error', 'Enter an email'); return; }
    setSaving(true);
    try {
      const res = await sendInvitationApi(email.trim().toLowerCase(), role);
      if (res.success) {
        Alert.alert('Invitation Sent', `Invite link: ${res.data.invite_link}`);
        setModalVisible(false);
        setEmail('');
        load();
      }
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed');
    } finally { setSaving(false); }
  };

  const renderItem = ({ item }: { item: Invitation }) => {
    const isExpired = new Date(item.expires_at) < new Date();
    const isAccepted = !!item.accepted_at;
    const status = isAccepted ? 'Accepted' : isExpired ? 'Expired' : 'Pending';
    const statusColor = isAccepted ? Colors.success : isExpired ? Colors.error : Colors.warning;

    return (
      <ViewComp style={styles.card}>
        <ViewComp style={styles.cardInfo}>
          <TextComp style={styles.cardEmail}>{item.email}</TextComp>
          <TextComp style={styles.cardRole}>{item.role}</TextComp>
        </ViewComp>
        <ViewComp style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <TextComp style={[styles.statusText, { color: statusColor }]}>{status}</TextComp>
        </ViewComp>
      </ViewComp>
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
    <ViewComp style={styles.container}>
      <FlatListComp contentContainerStyle={styles.content} data={invitations} keyExtractor={(i: any) => i.id}
        refreshControl={<RefreshControlComp refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ListHeaderComponent={
          <ViewComp style={styles.header}>
            <TextComp style={styles.title}>Invitations</TextComp>
            <PressableComp 
              style={({ pressed }: any) => [styles.addBtn, { opacity: pressed ? 0.8 : 1 }]} 
              onPress={() => setModalVisible(true)}
            >
              <TextComp style={styles.addBtnText}>+ Invite</TextComp>
            </PressableComp>
          </ViewComp>
        }
        ListEmptyComponent={!loading ? <EmptyState icon="✉️" title="No Invitations" message="Send your first invitation." actionLabel="Invite" onAction={() => setModalVisible(true)} /> : null}
        renderItem={renderItem}
      />

      <ModalComp visible={modalVisible} animationType="slide" transparent>
        <ViewComp style={styles.modalOverlay}>
          <ViewComp style={styles.modal}>
            <TextComp style={styles.modalTitle}>Send Invitation</TextComp>
            <TextComp style={styles.label}>Email</TextComp>
            <TextInputComp style={styles.input} value={email} onChangeText={setEmail} placeholder="user@example.com" placeholderTextColor={Colors.textMuted} keyboardType="email-address" autoCapitalize="none" />
            <TextComp style={styles.label}>Role</TextComp>
            <ViewComp style={styles.roleRow}>
              {(['supervisor', 'client'] as const).map(r => (
                <PressableComp 
                  key={r} 
                  style={({ pressed }: any) => [
                    styles.roleChip, 
                    role === r && styles.roleChipActive,
                    { opacity: pressed ? 0.8 : 1 }
                  ]} 
                  onPress={() => setRole(r)}
                >
                  <TextComp style={[styles.roleChipText, role === r && styles.roleChipTextActive]}>{r}</TextComp>
                </PressableComp>
              ))}
            </ViewComp>
            <ViewComp style={styles.actions}>
              <PressableComp 
                style={({ pressed }: any) => [styles.cancelBtn, { opacity: pressed ? 0.8 : 1 }]} 
                onPress={() => setModalVisible(false)}
              >
                <TextComp style={styles.cancelText}>Cancel</TextComp>
              </PressableComp>
              <PressableComp 
                style={({ pressed }: any) => [styles.saveBtn, (saving || pressed) && { opacity: 0.6 }]} 
                onPress={handleSend} 
                disabled={saving}
              >
                <TextComp style={styles.saveText}>{saving ? 'Sending...' : 'Send'}</TextComp>
              </PressableComp>
            </ViewComp>
          </ViewComp>
        </ViewComp>
      </ModalComp>
    </ViewComp>
  ) as any;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loadingContainer: { flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' },
  content: { padding: Spacing.lg, paddingTop: Spacing.huge },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xxl },
  title: { color: Colors.textPrimary, fontSize: Font.size.xxxl, ...Font.bold },
  addBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.full },
  addBtnText: { color: Colors.white, fontSize: Font.size.sm, ...Font.bold },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm },
  cardInfo: { flex: 1 },
  cardEmail: { color: Colors.textPrimary, fontSize: Font.size.md, ...Font.semibold },
  cardRole: { color: Colors.textMuted, fontSize: Font.size.xs, textTransform: 'uppercase', marginTop: 2 },
  statusBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full },
  statusText: { fontSize: Font.size.xs, ...Font.bold },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: Colors.overlay },
  modal: { backgroundColor: Colors.surface, borderTopLeftRadius: Radius.xxl, borderTopRightRadius: Radius.xxl, padding: Spacing.xxl },
  modalTitle: { color: Colors.textPrimary, fontSize: Font.size.xl, ...Font.bold, marginBottom: Spacing.lg },
  label: { color: Colors.textSecondary, fontSize: Font.size.sm, ...Font.medium, marginBottom: Spacing.xs, marginTop: Spacing.md },
  input: { backgroundColor: Colors.surfaceLight, borderRadius: Radius.md, padding: Spacing.md, color: Colors.textPrimary, fontSize: Font.size.md, borderWidth: 1, borderColor: Colors.border },
  roleRow: { flexDirection: 'row', gap: Spacing.sm },
  roleChip: { flex: 1, backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  roleChipActive: { backgroundColor: Colors.primaryBg, borderWidth: 1, borderColor: Colors.primary },
  roleChipText: { color: Colors.textMuted, fontSize: Font.size.sm, ...Font.semibold, textTransform: 'capitalize' },
  roleChipTextActive: { color: Colors.primary },
  actions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xxl },
  cancelBtn: { flex: 1, backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  cancelText: { color: Colors.textSecondary, fontSize: Font.size.md, ...Font.semibold },
  saveBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  saveText: { color: Colors.white, fontSize: Font.size.md, ...Font.bold },
});
