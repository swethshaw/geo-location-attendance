import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  RefreshControl, 
  Pressable, 
  TextInput, 
  Alert, 
  Modal, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  StatusBar
} from 'react-native';
import MapView, { Circle } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { 
  Map as MapIcon, 
  MapPin, 
  Plus, 
  X, 
  Crosshair, 
  Ruler, 
  Type,
  LocateFixed
} from 'lucide-react-native';

import { getLocationsApi, createLocationApi, updateLocationApi, deleteLocationApi, GeoFenceLocation } from '../../api/locations';
import { useLocation } from '../../hooks/useLocation';
import { ZoneCard } from '../../components/ZoneCard';
import { EmptyState } from '../../components/EmptyState';
import { Colors, Font, Spacing, Radius } from '../../theme';

export function ZonesScreen() {
  const { location: currentLoc } = useLocation();
  const [zones, setZones] = useState<GeoFenceLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  

  const [modalVisible, setModalVisible] = useState(false);
  const [editZone, setEditZone] = useState<GeoFenceLocation | null>(null);
  const [form, setForm] = useState({ name: '', latitude: '', longitude: '', radius: '100' });
  const [entryMode, setEntryMode] = useState<'auto' | 'manual'>('auto');
  const [saving, setSaving] = useState(false);
  const [mapRegion, setMapRegion] = useState<any>(null);

  const loadZones = useCallback(async () => {
    try {
      const res = await getLocationsApi();
      if (res.success) setZones(res.data);
    } catch (err) {

    } finally { 
      setLoading(false); 
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadZones();
    }, [loadZones])
  );

  const onRefresh = async () => { 
    setRefreshing(true); 
    await loadZones(); 
    setRefreshing(false); 
  };

  const openCreate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditZone(null);
    setForm({ name: '', latitude: '', longitude: '', radius: '100' });
    setEntryMode('auto');
    if (currentLoc) {
      setMapRegion({
        latitude: currentLoc.latitude,
        longitude: currentLoc.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
      setForm(prev => ({ ...prev, latitude: String(currentLoc.latitude), longitude: String(currentLoc.longitude) }));
    }
    setModalVisible(true);
  };

  const openEdit = (zone: GeoFenceLocation) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditZone(zone);
    setForm({ name: zone.name, latitude: String(zone.latitude), longitude: String(zone.longitude), radius: String(zone.radius_meters) });
    setEntryMode('auto'); 

    setMapRegion({
      latitude: zone.latitude,
      longitude: zone.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
    setModalVisible(true);
  };

  const useCurrentLocation = () => {
    if (currentLoc) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const region = {
        latitude: currentLoc.latitude,
        longitude: currentLoc.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      setMapRegion(region);
      setForm(prev => ({ ...prev, latitude: String(currentLoc.latitude), longitude: String(currentLoc.longitude) }));
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Current location not available. Please check device permissions.');
    }
  };

  const onRegionChangeComplete = (region: any) => {
    if (entryMode === 'auto') {

      Haptics.selectionAsync();
      setMapRegion(region);
      setForm(prev => ({ ...prev, latitude: String(region.latitude), longitude: String(region.longitude) }));
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.latitude || !form.longitude || !form.radius) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    
    setSaving(true);
    try {
      if (editZone) {
        await updateLocationApi(editZone.id, { 
          name: form.name.trim(), 
          latitude: parseFloat(form.latitude), 
          longitude: parseFloat(form.longitude), 
          radius_meters: parseInt(form.radius, 10) 
        });
      } else {
        await createLocationApi({ 
          name: form.name.trim(), 
          latitude: parseFloat(form.latitude), 
          longitude: parseFloat(form.longitude), 
          radius_meters: parseInt(form.radius, 10) 
        });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setModalVisible(false);
      loadZones();
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', err?.response?.data?.error || 'Failed to save zone');
    } finally { 
      setSaving(false); 
    }
  };

  const handleDelete = (zone: GeoFenceLocation) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Delete Zone', `Are you sure you want to remove "${zone.name}"? This action cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => { 
          await deleteLocationApi(zone.id); 
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          loadZones(); 
        } 
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <FlatList
        contentContainerStyle={styles.content}
        data={zones}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Geo-fence Zones</Text>
            <Pressable 
              style={({ pressed }) => [styles.addBtn, pressed && styles.btnPressed]} 
              onPress={openCreate}
            >
              <Plus color={Colors.white} size={18} strokeWidth={2.5} />
              <Text style={styles.addBtnText}>New Zone</Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState 
              icon={MapIcon} 
              title="No Zones Configured" 
              message="Create geographic boundaries to track attendance automatically." 
              actionLabel="Create Zone" 
              onAction={openCreate} 
            />
          ) : (
            <ActivityIndicator style={{ marginTop: Spacing.xxxl }} size="large" color={Colors.primary} />
          )
        }
        renderItem={({ item }) => (
          <ZoneCard 
            name={item.name} 
            latitude={item.latitude} 
            longitude={item.longitude} 
            radiusMeters={item.radius_meters} 
            isActive={item.is_active} 
            onEdit={() => openEdit(item)} 
            onDelete={() => handleDelete(item)} 
          />
        )}
      />


      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modal}>
            <View style={styles.modalHandle} />
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editZone ? 'Edit Boundary' : 'New Boundary'}</Text>
              <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X color={Colors.textSecondary} size={24} />
              </Pressable>
            </View>


            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Zone Name</Text>
              <View style={styles.inputContainer}>
                <Type color={Colors.textMuted} size={18} />
                <TextInput 
                  style={styles.input} 
                  value={form.name} 
                  onChangeText={(v) => setForm({ ...form, name: v })} 
                  placeholder="e.g., Main Headquarters" 
                  placeholderTextColor={Colors.textMuted} 
                />
              </View>
            </View>


            <View style={styles.modeToggle}>
              <Pressable 
                style={[styles.modeBtn, entryMode === 'auto' && styles.modeBtnActive]} 
                onPress={() => { Haptics.selectionAsync(); setEntryMode('auto'); }}
              >
                <MapIcon color={entryMode === 'auto' ? Colors.primary : Colors.textMuted} size={16} />
                <Text style={[styles.modeBtnText, entryMode === 'auto' && styles.modeBtnTextActive]}>Interactive Map</Text>
              </Pressable>
              <Pressable 
                style={[styles.modeBtn, entryMode === 'manual' && styles.modeBtnActive]} 
                onPress={() => { Haptics.selectionAsync(); setEntryMode('manual'); }}
              >
                <LocateFixed color={entryMode === 'manual' ? Colors.primary : Colors.textMuted} size={16} />
                <Text style={[styles.modeBtnText, entryMode === 'manual' && styles.modeBtnTextActive]}>Manual Entry</Text>
              </Pressable>
            </View>


            {entryMode === 'auto' ? (
              <View style={styles.mapContainer}>
                {mapRegion ? (
                  <>
                    <MapView 
                      style={styles.map} 
                      region={mapRegion}
                      onRegionChangeComplete={onRegionChangeComplete}
                      showsUserLocation
                    >

                      <Circle 
                        center={{ latitude: mapRegion.latitude, longitude: mapRegion.longitude }}
                        radius={parseInt(form.radius, 10) || 100}
                        fillColor={Colors.primary + '25'} 

                        strokeColor={Colors.primary}
                        strokeWidth={2}
                      />
                    </MapView>
                    

                    <View style={styles.markerFixed} pointerEvents="none">
                      <MapPin color={Colors.error} size={36} fill={Colors.white} strokeWidth={2} />
                    </View>
                    

                    <View style={styles.coordsOverlay}>
                      <Text style={styles.coordsText}>{parseFloat(form.latitude).toFixed(6)}, {parseFloat(form.longitude).toFixed(6)}</Text>
                    </View>


                    <Pressable 
                      style={({ pressed }) => [styles.currentLocBtn, pressed && { opacity: 0.8 }]} 
                      onPress={useCurrentLocation}
                    >
                      <Crosshair color={Colors.primary} size={20} strokeWidth={2.5} />
                    </Pressable>
                  </>
                ) : (
                  <ActivityIndicator size="large" color={Colors.primary} />
                )}
              </View>
            ) : (
              <View style={styles.manualInputs}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Latitude</Text>
                    <View style={styles.inputContainer}>
                      <TextInput 
                        style={styles.input} 
                        value={form.latitude} 
                        onChangeText={(v) => setForm({ ...form, latitude: v })} 
                        placeholder="0.000000" 
                        keyboardType="numeric" 
                      />
                    </View>
                  </View>
                  <View style={{ width: Spacing.md }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Longitude</Text>
                    <View style={styles.inputContainer}>
                      <TextInput 
                        style={styles.input} 
                        value={form.longitude} 
                        onChangeText={(v) => setForm({ ...form, longitude: v })} 
                        placeholder="0.000000" 
                        keyboardType="numeric" 
                      />
                    </View>
                  </View>
                </View>
              </View>
            )}


            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Detection Radius (Meters)</Text>
              <View style={styles.inputContainer}>
                <Ruler color={Colors.textMuted} size={18} />
                <TextInput 
                  style={styles.input} 
                  value={form.radius} 
                  onChangeText={(v) => setForm({ ...form, radius: v })} 
                  placeholder="100" 
                  keyboardType="numeric" 
                />
                <Text style={styles.inputSuffix}>meters</Text>
              </View>
            </View>


            <View style={styles.modalActions}>
              <Pressable 
                style={({ pressed }) => [styles.cancelBtn, pressed && styles.btnPressed]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              
              <Pressable 
                style={({ pressed }) => [
                  styles.saveBtn, 
                  (saving || !form.latitude) && styles.saveBtnDisabled,
                  pressed && !saving && styles.btnPressed
                ]} 
                onPress={handleSave} 
                disabled={saving || !form.latitude}
              >
                {saving ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.saveText}>Save Zone</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: 100 },
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
  btnPressed: { transform: [{ scale: 0.96 }] },
  addBtnText: { color: Colors.white, fontSize: Font.size.sm, fontWeight: '700' },
  

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modal: { 
    backgroundColor: Colors.surface, 
    borderTopLeftRadius: Radius.xxxl, 
    borderTopRightRadius: Radius.xxxl, 
    padding: Spacing.xxl,
    paddingTop: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xxl, 
  },
  modalHandle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.lg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  modalTitle: { color: Colors.textPrimary, fontSize: Font.size.xl, fontWeight: '800' },
  closeBtn: { padding: 4, backgroundColor: Colors.surfaceAlt, borderRadius: Radius.full },
  

  inputGroup: { marginBottom: Spacing.md },
  fieldLabel: { color: Colors.textPrimary, fontSize: Font.size.sm, fontWeight: '600', marginBottom: 8 },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.surfaceAlt, 
    borderRadius: Radius.lg, 
    paddingHorizontal: Spacing.md,
    borderWidth: 1, 
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  input: { flex: 1, paddingVertical: 14, color: Colors.textPrimary, fontSize: Font.size.md },
  inputSuffix: { color: Colors.textMuted, fontSize: Font.size.sm, fontWeight: '500' },
  

  modeToggle: { 
    flexDirection: 'row', 
    backgroundColor: Colors.surfaceAlt, 
    borderRadius: Radius.lg, 
    padding: 4, 
    marginBottom: Spacing.md,
  },
  modeBtn: { flex: 1, flexDirection: 'row', paddingVertical: 10, justifyContent: 'center', alignItems: 'center', borderRadius: Radius.md, gap: 6 },
  modeBtnActive: { backgroundColor: Colors.surface, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  modeBtnText: { color: Colors.textSecondary, fontSize: Font.size.xs, fontWeight: '700' },
  modeBtnTextActive: { color: Colors.primary },
  

  mapContainer: { 
    height: 220, 
    borderRadius: Radius.xl, 
    overflow: 'hidden', 
    backgroundColor: Colors.surfaceAlt, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: Spacing.md, 
    borderWidth: 1, 
    borderColor: Colors.border 
  },
  map: { ...StyleSheet.absoluteFillObject },
  markerFixed: { position: 'absolute', top: '50%', left: '50%', marginLeft: -18, marginTop: -36, alignItems: 'center', justifyContent: 'center' },
  currentLocBtn: { 
    position: 'absolute', 
    bottom: Spacing.md, 
    right: Spacing.md, 
    backgroundColor: Colors.surface, 
    padding: Spacing.sm, 
    borderRadius: Radius.full, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  coordsOverlay: { 
    position: 'absolute', 
    top: Spacing.sm, 
    left: Spacing.sm, 
    backgroundColor: 'rgba(255,255,255,0.9)', 
    paddingHorizontal: 8,
    paddingVertical: 4, 
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  coordsText: { fontSize: 11, fontWeight: '600', color: Colors.textPrimary, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  
  manualInputs: { marginBottom: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  

  modalActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl },
  cancelBtn: { flex: 1, backgroundColor: Colors.surfaceAlt, borderRadius: Radius.xl, padding: Spacing.md, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: Colors.textSecondary, fontSize: Font.size.md, fontWeight: '700' },
  saveBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: Radius.xl, padding: Spacing.md, alignItems: 'center', justifyContent: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveText: { color: Colors.white, fontSize: Font.size.md, fontWeight: '700' },
});