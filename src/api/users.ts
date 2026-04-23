// ─── Users & Invitations API ───────────────────────────────────────────────────

import api from './client';
import { AuthUser } from './auth';

export interface Invitation {
  id: string;
  email: string;
  role: 'supervisor' | 'client';
  invited_by: string;
  supervisor_id?: string | null;
  token: string;
  expires_at: string;
  accepted_at?: string | null;
  created_at: string;
}

// ─── Users ─────────────────────────────────────────────────────────────────────

export async function getUsersApi(params?: { role?: string; supervisor_id?: string }) {
  const { data } = await api.get('/users', { params });
  return data as { success: boolean; data: AuthUser[] };
}

export async function updateUserApi(id: string, payload: {
  name?: string;
  role?: string;
  supervisor_id?: string | null;
  is_active?: boolean;
}) {
  const { data } = await api.patch(`/users/${id}`, payload);
  return data as { success: boolean; data: AuthUser };
}

export async function assignSupervisorApi(clientId: string, supervisorId: string) {
  const { data } = await api.post('/users/assign-supervisor', {
    client_id: clientId,
    supervisor_id: supervisorId,
  });
  return data as { success: boolean; data: AuthUser; message: string };
}

// ─── Invitations ───────────────────────────────────────────────────────────────

export async function sendInvitationApi(email: string, role: 'supervisor' | 'client') {
  const { data } = await api.post('/invitations', { email, role });
  return data as {
    success: boolean;
    data: { invitation: Invitation; invite_link: string };
    message: string;
  };
}

export async function getInvitationsApi() {
  const { data } = await api.get('/invitations');
  return data as { success: boolean; data: Invitation[] };
}

export async function validateInvitationApi(token: string) {
  const { data } = await api.get(`/invitations/validate/${token}`);
  return data as { success: boolean; data: { email: string; role: string } };
}
