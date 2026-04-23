// ─── Locations (Geo-fence Zones) API ───────────────────────────────────────────

import api from './client';

export interface GeoFenceLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  created_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateLocationPayload {
  name: string;
  latitude: number;
  longitude: number;
  radius_meters?: number;
}

export interface UpdateLocationPayload {
  name?: string;
  latitude?: number;
  longitude?: number;
  radius_meters?: number;
  is_active?: boolean;
}

export async function getLocationsApi() {
  const { data } = await api.get('/locations');
  return data as { success: boolean; data: GeoFenceLocation[] };
}

export async function createLocationApi(payload: CreateLocationPayload) {
  const { data } = await api.post('/locations', payload);
  return data as { success: boolean; data: GeoFenceLocation };
}

export async function updateLocationApi(id: string, payload: UpdateLocationPayload) {
  const { data } = await api.patch(`/locations/${id}`, payload);
  return data as { success: boolean; data: GeoFenceLocation };
}

export async function deleteLocationApi(id: string) {
  const { data } = await api.delete(`/locations/${id}`);
  return data as { success: boolean; message: string };
}
