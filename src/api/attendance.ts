// ─── Attendance API ────────────────────────────────────────────────────────────

import api from './client';

export interface MarkAttendancePayload {
  latitude: number;
  longitude: number;
  accuracy_meters: number;
  location_id: string;
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  location_id: string;
  latitude: number;
  longitude: number;
  accuracy_meters: number;
  distance_from_center: number;
  status: 'success' | 'outside_radius' | 'low_accuracy' | 'failed';
  marked_at: string;
  created_at: string;
  geo_fence_locations?: {
    name: string;
    latitude: number;
    longitude: number;
    radius_meters: number;
  };
  users?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface AttendanceSummary {
  total: number;
  successful: number;
  failed: number;
  last_30_days: { status: string; marked_at: string }[];
}

export async function markAttendanceApi(payload: MarkAttendancePayload) {
  const { data } = await api.post('/attendance/mark', payload);
  return data;
}

export async function getMyAttendanceApi(params?: {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
}) {
  const { data } = await api.get('/attendance/my', { params });
  return data as {
    success: boolean;
    data: AttendanceRecord[];
    meta: { total: number; page: number; limit: number };
  };
}

export async function getAllAttendanceApi(params?: {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
  user_id?: string;
  location_id?: string;
}) {
  const { data } = await api.get('/attendance', { params });
  return data as {
    success: boolean;
    data: AttendanceRecord[];
    meta: { total: number; page: number; limit: number };
  };
}

export async function getAttendanceSummaryApi(userId?: string) {
  const url = userId ? `/attendance/summary/${userId}` : '/attendance/summary';
  const { data } = await api.get(url);
  return data as { success: boolean; data: AttendanceSummary };
}
