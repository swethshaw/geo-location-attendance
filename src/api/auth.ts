// ─── Auth API ──────────────────────────────────────────────────────────────────

import api from './client';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'supervisor' | 'client';
  supervisor_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  };
  message?: string;
  error?: string;
}

export async function loginApi(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post('/auth/login', payload);
  return data;
}

export async function registerApi(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await api.post('/auth/register', payload);
  return data;
}

export async function getMeApi(): Promise<{ success: boolean; data: AuthUser }> {
  const { data } = await api.get('/auth/me');
  return data;
}

export async function logoutApi(refreshToken: string): Promise<void> {
  await api.post('/auth/logout', { refreshToken });
}

export async function refreshTokensApi(refreshToken: string) {
  const { data } = await api.post('/auth/refresh', { refreshToken });
  return data;
}
