import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity, TextInput, Alert, Modal, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import { getLocationsApi, createLocationApi, updateLocationApi, deleteLocationApi, GeoFenceLocation } from '../../api/locations';
import { useLocation } from '../../hooks/useLocation';
import { ZoneCard } from '../../components/ZoneCard';
import { EmptyState } from '../../components/EmptyState';
import { Colors, Font, Spacing, Radius, Shadow } from '../../theme';

const ViewComp = View as any;
const TextComp = Text as any;
const FlatListComp = FlatList as any;
const RefreshControlComp = RefreshControl as any;
const TouchableOpacityComp = TouchableOpacity as any;
const TextInputComp = TextInput as any;
const ModalComp = Modal as any;
const MapViewComp = MapView as any;
const MarkerComp = Marker as any;
const ActivityIndicatorComp = ActivityIndicator as any;

export function ZonesScreen() {
  const { location: currentLoc } = useLocation();
  const [zones, setZones] = useState<GeoFenceLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editZone, setEditZone] = useState<GeoFenceLocation | null>(null);
  const [form, setForm] = useState({ name: '', latitude: '', longitude: '', radius: '100' });
  const [entryMode, setEntryMode] = useState<'manual' | 'auto'>('auto');
  const [saving, setSaving] = useState(false);
  const [mapRegion, setMapRegion] = useState<any>(null);

  const loadZones = useCallback(async () => {
    try {
      const res = await getLocationsApi();
      if (res.success) setZones(res.data);
    } catch {} finally { setLoading(false); }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadZones();
    }, [loadZones])
  );

  const onRefresh = async () => { setRefreshing(true); await loadZones(); setRefreshing(false); };

  const openCreate = () => {
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
    setEditZone(zone);
    setForm({ name: zone.name, latitude: String(zone.latitude), longitude: String(zone.longitude), radius: String(zone.radius_meters) });
    setEntryMode('manual');
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
      const region = {
        latitude: currentLoc.latitude,
        longitude: currentLoc.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      setMapRegion(region);
      setForm(prev => ({ ...prev, latitude: String(currentLoc.latitude), longitude: String(currentLoc.longitude) }));
    } else {
      Alert.alert('Error', 'Current location not available');
    }
  };

  const onRegionChangeComplete = (region: any) => {
    if (entryMode === 'auto') {
      setMapRegion(region);
      setForm(prev => ({ ...prev, latitude: String(region.latitude), longitude: String(region.longitude) }));
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.latitude || !form.longitude) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      if (editZone) {
        await updateLocationApi(editZone.id, { name: form.name, latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude), radius_meters: parseInt(form.radius) });
      } else {
        await createLocationApi({ name: form.name, latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude), radius_meters: parseInt(form.radius) });
      }
      setModalVisible(false);
      loadZones();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to save zone');
    } finally { setSaving(false); }
  };

  const handleDelete = (zone: GeoFenceLocation) => {
    Alert.alert('Delete Zone', `Deactivate "${zone.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteLocationApi(zone.id); loadZones(); } },
    ]);
  };

  return (
    <ViewComp style={styles.container}>
      <FlatListComp
        contentContainerStyle={styles.content}
        data={zones}
        keyExtractor={(item: any) => item.id}
        refreshControl={<RefreshControlComp refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ListHeaderComponent={
          <ViewComp style={styles.header}>
            <TextComp style={styles.title}>Geo-fence Zones</TextComp>
            <TouchableOpacityComp style={styles.addBtn} onPress={openCreate}>
              <TextComp style={styles.addBtnText}>+ New Zone</TextComp>
            </TouchableOpacityComp>
          </ViewComp>
        }
        ListEmptyComponent={!loading ? <EmptyState icon="📍" title="No Zones" message="Create your first geo-fence zone." actionLabel="Create Zone" onAction={openCreate} /> : null}
        renderItem={({ item }: { item: GeoFenceLocation }) => (
          <ZoneCard name={item.name} latitude={item.latitude} longitude={item.longitude} radiusMeters={item.radius_meters} isActive={item.is_active} onEdit={() => openEdit(item)} onDelete={() => handleDelete(item)} />
        )}
      />

      <ModalComp visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ViewComp style={styles.modal}>
            <ViewComp style={styles.modalHeader}>
              <TextComp style={styles.modalTitle}>{editZone ? 'Edit Zone' : 'New Zone'}</TextComp>
              <TouchableOpacityComp onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <TextComp style={styles.closeBtnText}>✕</TextComp>
              </TouchableOpacityComp>
            </ViewComp>

            <TextComp style={styles.fieldLabel}>Zone Name *</TextComp>
            <TextInputComp 
              style={styles.input} 
              value={form.name} 
              onChangeText={(v: string) => setForm({ ...form, name: v })} 
              placeholder="e.g. Main Office" 
              placeholderTextColor={Colors.textMuted} 
            />

            <ViewComp style={styles.modeToggle}>
              <TouchableOpacityComp 
                style={[styles.modeBtn, entryMode === 'auto' && styles.modeBtnActive]} 
                onPress={() => setEntryMode('auto')}
              >
                <TextComp style={[styles.modeBtnText, entryMode === 'auto' && styles.modeBtnTextActive]}>Auto (Map)</TextComp>
              </TouchableOpacityComp>
              <TouchableOpacityComp 
                style={[styles.modeBtn, entryMode === 'manual' && styles.modeBtnActive]} 
                onPress={() => setEntryMode('manual')}
              >
                <TextComp style={[styles.modeBtnText, entryMode === 'manual' && styles.modeBtnTextActive]}>Manual</TextComp>
              </TouchableOpacityComp>
            </ViewComp>

            {entryMode === 'auto' ? (
              <ViewComp style={styles.mapContainer}>
                {mapRegion ? (
                  <>
                    <MapViewComp 
                      style={styles.map} 
                      region={mapRegion}
                      onRegionChangeComplete={onRegionChangeComplete}
                      showsUserLocation
                    />
                    <ViewComp style={styles.markerFixed} pointerEvents="none">
                      <TextComp style={styles.markerEmoji}>📍</TextComp>
                    </ViewComp>
                    <TouchableOpacityComp style={styles.currentLocBtn} onPress={useCurrentLocation}>
                      <TextComp style={styles.currentLocBtnText}>🎯 Use My Location</TextComp>
                    </TouchableOpacityComp>
                  </>
                ) : (
                  <ActivityIndicatorComp size="large" color={Colors.primary} />
                )}
                <ViewComp style={styles.coordsOverlay}>
                  <TextComp style={styles.coordsText}>Lat: {parseFloat(form.latitude).toFixed(5)}</TextComp>
                  <TextComp style={styles.coordsText}>Lng: {parseFloat(form.longitude).toFixed(5)}</TextComp>
                </ViewComp>
              </ViewComp>
            ) : (
              <ViewComp style={styles.manualInputs}>
                <ViewComp style={styles.row}>
                  <ViewComp style={{ flex: 1 }}>
                    <TextComp style={styles.fieldLabel}>Latitude *</TextComp>
                    <TextInputComp 
                      style={styles.input} 
                      value={form.latitude} 
                      onChangeText={(v: string) => setForm({ ...form, latitude: v })} 
                      placeholder="0.000" 
                      keyboardType="numeric" 
                    />
                  </ViewComp>
                  <ViewComp style={{ width: Spacing.md }} />
                  <ViewComp style={{ flex: 1 }}>
                    <TextComp style={styles.fieldLabel}>Longitude *</TextComp>
                    <TextInputComp 
                      style={styles.input} 
                      value={form.longitude} 
                      onChangeText={(v: string) => setForm({ ...form, longitude: v })} 
                      placeholder="0.000" 
                      keyboardType="numeric" 
                    />
                  </ViewComp>
                </ViewComp>
              </ViewComp>
            )}

            <TextComp style={styles.fieldLabel}>Radius (meters) *</TextComp>
            <TextInputComp 
              style={styles.input} 
              value={form.radius} 
              onChangeText={(v: string) => setForm({ ...form, radius: v })} 
              placeholder="100" 
              keyboardType="numeric" 
            />

            <ViewComp style={styles.modalActions}>
              <TouchableOpacityComp style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <TextComp style={styles.cancelText}>Cancel</TextComp>
              </TouchableOpacityComp>
              <TouchableOpacityComp 
                style={[styles.saveBtn, (saving || !form.latitude) && { opacity: 0.6 }]} 
                onPress={handleSave} 
                disabled={saving || !form.latitude}
              >
                <TextComp style={styles.saveText}>{saving ? 'Saving...' : 'Save Zone'}</TextComp>
              </TouchableOpacityComp>
            </ViewComp>
          </ViewComp>
        </KeyboardAvoidingView>
      </ModalComp>
    </ViewComp>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, paddingTop: Spacing.huge },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xxl },
  title: { color: Colors.textPrimary, fontSize: Font.size.xxxl, ...Font.bold },
  addBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.full },
  addBtnText: { color: Colors.white, fontSize: Font.size.sm, ...Font.bold },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: Colors.overlay },
  modal: { backgroundColor: Colors.surface, borderTopLeftRadius: Radius.xxl, borderTopRightRadius: Radius.xxl, padding: Spacing.xxl },
  modalTitle: { color: Colors.textPrimary, fontSize: Font.size.xl, ...Font.bold, marginBottom: Spacing.lg },
  fieldLabel: { color: Colors.textSecondary, fontSize: Font.size.sm, ...Font.medium, marginBottom: Spacing.xs, marginTop: Spacing.md },
  input: { backgroundColor: Colors.surfaceLight, borderRadius: Radius.md, padding: Spacing.md, color: Colors.textPrimary, fontSize: Font.size.md, borderWidth: 1, borderColor: Colors.border },
  modalActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xxl },
  cancelBtn: { flex: 1, backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  cancelText: { color: Colors.textSecondary, fontSize: Font.size.md, ...Font.semibold },
  saveBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  saveText: { color: Colors.white, fontSize: Font.size.md, ...Font.bold },
  
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  closeBtn: { padding: Spacing.xs },
  closeBtnText: { color: Colors.textMuted, fontSize: 20 },
  modeToggle: { flexDirection: 'row', backgroundColor: Colors.surfaceLight, borderRadius: Radius.md, padding: 4, marginTop: Spacing.lg, marginBottom: Spacing.md },
  modeBtn: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderRadius: Radius.sm },
  modeBtnActive: { backgroundColor: Colors.surface, ...Shadow.sm },
  modeBtnText: { color: Colors.textMuted, fontSize: Font.size.xs, ...Font.bold, textTransform: 'uppercase' },
  modeBtnTextActive: { color: Colors.primary },
  mapContainer: { height: 250, borderRadius: Radius.lg, overflow: 'hidden', backgroundColor: Colors.surfaceLight, justifyContent: 'center', alignItems: 'center', marginTop: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  map: { ...StyleSheet.absoluteFillObject },
  markerFixed: { position: 'absolute', top: '50%', left: '50%', marginLeft: -15, marginTop: -35, alignItems: 'center', justifyContent: 'center' },
  markerEmoji: { fontSize: 30 },
  currentLocBtn: { position: 'absolute', bottom: Spacing.md, right: Spacing.md, backgroundColor: Colors.surface, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full, ...Shadow.md },
  currentLocBtnText: { color: Colors.primary, fontSize: Font.size.xs, ...Font.bold },
  coordsOverlay: { position: 'absolute', top: Spacing.sm, left: Spacing.sm, backgroundColor: 'rgba(255,255,255,0.8)', padding: 4, borderRadius: 4 },
  coordsText: { fontSize: 10, color: Colors.textPrimary, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  manualInputs: { marginTop: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
});
