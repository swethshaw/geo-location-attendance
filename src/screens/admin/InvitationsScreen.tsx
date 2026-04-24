import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  RefreshControl, 
  Pressable, 
  TextInput, 
  Modal, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { 
  Mail, 
  MailPlus, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  User, 
  Briefcase, 
  Copy, 
  X, 
  Send
} from 'lucide-react-native';

import { sendInvitationApi, getInvitationsApi, Invitation } from '../../api/users';
import { EmptyState } from '../../components/EmptyState';
import { Colors, Font, Spacing, Radius } from '../../theme';

export function InvitationsScreen() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'supervisor' | 'client'>('client');
  const [saving, setSaving] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const load = useCallback(async () => {
    try { 
      const res = await getInvitationsApi(); 
      if (res.success) setInvitations(res.data); 
    } catch (error) {

    } finally { 
      setLoading(false); 
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => { 
    setRefreshing(true); 
    await load(); 
    setRefreshing(false); 
  };

  const handleSend = async () => {
    if (!email.trim()) { 
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Invalid Input', 'Please enter a valid email address.'); 
      return; 
    }
    
    setSaving(true);
    try {
      const res = await sendInvitationApi(email.trim().toLowerCase(), role);
      if (res.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setGeneratedLink(res.data.invite_link);
        load(); // Refresh list in background
      }
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', err?.response?.data?.error || 'Failed to send invitation');
    } finally { 
      setSaving(false); 
    }
  };

  const copyToClipboard = async () => {
    if (generatedLink) {
      await Clipboard.setStringAsync(generatedLink);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert('Copied!', 'The invitation link has been copied to your clipboard.');
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => {
      setEmail('');
      setRole('client');
      setGeneratedLink(null);
    }, 300); // Reset after animation completes
  };

  const renderItem = ({ item }: { item: Invitation }) => {
    const isExpired = new Date(item.expires_at) < new Date();
    const isAccepted = !!item.accepted_at;
    
    let status = 'Pending';
    let statusColor: string = Colors.warning;
    let StatusIcon = Clock;

    if (isAccepted) {
      status = 'Accepted';
      statusColor = Colors.success;
      StatusIcon = CheckCircle2;
    } else if (isExpired) {
      status = 'Expired';
      statusColor = Colors.error;
      StatusIcon = XCircle;
    }

    return (
      <View style={styles.card}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardEmail}>{item.email}</Text>
          <View style={styles.roleContainer}>
            {item.role === 'supervisor' ? (
              <Briefcase color={Colors.textMuted} size={12} strokeWidth={2.5} />
            ) : (
              <User color={Colors.textMuted} size={12} strokeWidth={2.5} />
            )}
            <Text style={styles.cardRole}>{item.role}</Text>
          </View>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
          <StatusIcon color={statusColor} size={14} strokeWidth={2.5} />
          <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList 
        contentContainerStyle={styles.content} 
        data={invitations} 
        keyExtractor={(i) => i.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Invitations</Text>
            <Pressable 
              style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]} 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setModalVisible(true);
              }}
            >
              <MailPlus color={Colors.white} size={18} strokeWidth={2.5} />
              <Text style={styles.addBtnText}>Invite</Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState 
              icon={Mail} 
              title="No Invitations Sent" 
              message="Invite supervisors or clients to join your workspace." 
              actionLabel="Create Invitation" 
              onAction={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setModalVisible(true);
              }} 
            />
          ) : null
        }
        renderItem={renderItem}
      />

      {/* Premium Bottom Sheet Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modal}>
            {/* Drag Handle Indicator */}
            <View style={styles.modalHandle} />
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {generatedLink ? 'Invitation Created' : 'Send Invitation'}
              </Text>
              <Pressable onPress={closeModal} style={styles.closeBtn}>
                <X color={Colors.textSecondary} size={24} />
              </Pressable>
            </View>

            {generatedLink ? (
              // SUCCESS STATE
              <View style={styles.successContainer}>
                <View style={styles.successIconWrapper}>
                  <CheckCircle2 color={Colors.success} size={48} strokeWidth={2} />
                </View>
                <Text style={styles.successText}>
                  The invitation has been successfully generated for <Text style={styles.boldText}>{email}</Text>.
                </Text>
                
                <View style={styles.linkBox}>
                  <Text style={styles.linkText} numberOfLines={1} ellipsizeMode="tail">
                    {generatedLink}
                  </Text>
                  <Pressable 
                    style={({ pressed }) => [styles.copyBtn, pressed && { opacity: 0.7 }]}
                    onPress={copyToClipboard}
                  >
                    <Copy color={Colors.primary} size={18} />
                  </Pressable>
                </View>

                <Pressable 
                  style={styles.doneBtn} 
                  onPress={closeModal}
                >
                  <Text style={styles.doneBtnText}>Done</Text>
                </Pressable>
              </View>
            ) : (
              // FORM STATE
              <View>
                <Text style={styles.label}>Email Address</Text>
                <View style={[styles.inputContainer, isFocused && styles.inputFocused]}>
                  <Mail color={isFocused ? Colors.primary : Colors.textMuted} size={20} />
                  <TextInput 
                    style={styles.input} 
                    value={email} 
                    onChangeText={setEmail} 
                    placeholder="user@example.com" 
                    placeholderTextColor={Colors.textMuted} 
                    keyboardType="email-address" 
                    autoCapitalize="none"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                  />
                </View>

                <Text style={styles.label}>Assign Role</Text>
                <View style={styles.roleRow}>
                  {(['client', 'supervisor'] as const).map(r => (
                    <Pressable 
                      key={r} 
                      style={({ pressed }) => [
                        styles.roleChip, 
                        role === r && styles.roleChipActive,
                        pressed && { transform: [{ scale: 0.98 }] }
                      ]} 
                      onPress={() => {
                        Haptics.selectionAsync();
                        setRole(r);
                      }}
                    >
                      {r === 'supervisor' ? (
                        <Briefcase color={role === r ? Colors.primary : Colors.textMuted} size={16} />
                      ) : (
                        <User color={role === r ? Colors.primary : Colors.textMuted} size={16} />
                      )}
                      <Text style={[styles.roleChipText, role === r && styles.roleChipTextActive]}>
                        {r}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Pressable 
                  style={({ pressed }) => [
                    styles.saveBtn, 
                    (saving || !email.trim()) && styles.saveBtnDisabled,
                    pressed && !saving && { transform: [{ scale: 0.98 }] }
                  ]} 
                  onPress={handleSend} 
                  disabled={saving || !email.trim()}
                >
                  {saving ? (
                    <ActivityIndicator color={Colors.white} size="small" />
                  ) : (
                    <>
                      <Send color={Colors.white} size={18} strokeWidth={2.5} />
                      <Text style={styles.saveText}>Generate Invite Link</Text>
                    </>
                  )}
                </Pressable>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loadingContainer: { flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' },
  content: { padding: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.huge },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  title: { color: Colors.textPrimary, fontSize: Font.size.xxl, fontWeight: '800', letterSpacing: -0.5 },
  addBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.primary, 
    paddingHorizontal: Spacing.md, 
    paddingVertical: 10, 
    borderRadius: Radius.full,
    gap: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  addBtnPressed: { transform: [{ scale: 0.96 }] },
  addBtnText: { color: Colors.white, fontSize: Font.size.sm, fontWeight: '700' },
  card: { 
    backgroundColor: Colors.surface, 
    borderRadius: Radius.xl, 
    padding: Spacing.lg, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    borderWidth: 1, 
    borderColor: Colors.border, 
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  cardInfo: { flex: 1, paddingRight: Spacing.sm },
  cardEmail: { color: Colors.textPrimary, fontSize: Font.size.md, fontWeight: '700', marginBottom: 4 },
  roleContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardRole: { color: Colors.textSecondary, fontSize: Font.size.xs, textTransform: 'capitalize', fontWeight: '500' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.sm, paddingVertical: 6, borderRadius: Radius.full, gap: 4 },
  statusText: { fontSize: Font.size.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  // Modal Styles
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modal: { 
    backgroundColor: Colors.surface, 
    borderTopLeftRadius: Radius.xxxl, 
    borderTopRightRadius: Radius.xxxl, 
    padding: Spacing.xxl,
    paddingTop: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xxl, // Safe area for iOS
  },
  modalHandle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.lg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  modalTitle: { color: Colors.textPrimary, fontSize: Font.size.xl, fontWeight: '800' },
  closeBtn: { padding: 4, backgroundColor: Colors.surfaceAlt, borderRadius: Radius.full },
  label: { color: Colors.textPrimary, fontSize: Font.size.sm, fontWeight: '600', marginBottom: Spacing.sm },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.surfaceAlt, 
    borderRadius: Radius.lg, 
    paddingHorizontal: Spacing.md,
    borderWidth: 1, 
    borderColor: Colors.surfaceAlt,
    marginBottom: Spacing.lg,
  },
  inputFocused: { borderColor: Colors.primary, backgroundColor: Colors.surface },
  input: { flex: 1, paddingVertical: 14, paddingLeft: Spacing.sm, color: Colors.textPrimary, fontSize: Font.size.md },
  roleRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xxxl },
  roleChip: { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 8, backgroundColor: Colors.surfaceAlt, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  roleChipActive: { backgroundColor: Colors.primary + '10', borderColor: Colors.primary },
  roleChipText: { color: Colors.textSecondary, fontSize: Font.size.sm, fontWeight: '600', textTransform: 'capitalize' },
  roleChipTextActive: { color: Colors.primary, fontWeight: '700' },
  saveBtn: { flexDirection: 'row', gap: 8, backgroundColor: Colors.primary, borderRadius: Radius.xl, padding: Spacing.lg, alignItems: 'center', justifyContent: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveText: { color: Colors.white, fontSize: Font.size.md, fontWeight: '700' },
  
  // Success State Styles
  successContainer: { alignItems: 'center', paddingVertical: Spacing.md },
  successIconWrapper: { backgroundColor: Colors.success + '15', padding: Spacing.lg, borderRadius: Radius.full, marginBottom: Spacing.lg },
  successText: { color: Colors.textSecondary, fontSize: Font.size.md, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },
  boldText: { color: Colors.textPrimary, fontWeight: '700' },
  linkBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceAlt, borderRadius: Radius.lg, paddingLeft: Spacing.md, borderWidth: 1, borderColor: Colors.border, width: '100%', marginBottom: Spacing.xl },
  linkText: { flex: 1, color: Colors.textPrimary, fontSize: Font.size.sm, fontWeight: '500' },
  copyBtn: { padding: Spacing.md, borderLeftWidth: 1, borderLeftColor: Colors.border },
  doneBtn: { backgroundColor: Colors.surfaceAlt, borderRadius: Radius.xl, padding: Spacing.md, width: '100%', alignItems: 'center' },
  doneBtnText: { color: Colors.textPrimary, fontSize: Font.size.md, fontWeight: '700' },
});