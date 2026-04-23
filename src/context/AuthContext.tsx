// ─── Auth Context ──────────────────────────────────────────────────────────────
// Manages auth state, token persistence, role-based routing.

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginApi, registerApi, getMeApi, logoutApi, AuthUser, LoginPayload, RegisterPayload } from '../api/auth';
import { saveTokens, getAccessToken, getRefreshToken, clearTokens, saveUser, getStoredUser, clearUser } from '../utils/storage';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // ─── Bootstrap: check for stored tokens on mount ──────────────────────────
  useEffect(() => {
    (async () => {
      console.log('🔄 Bootstrapping auth state...');
      try {
        const token = await getAccessToken();
        console.log('🔑 Token found:', !!token);
        
        if (token) {
          console.log('📡 Validating session with server...');
          // Try to validate with /auth/me
          const res = await getMeApi().catch(err => {
            console.warn('⚠️ Session validation failed:', err.message);
            return { success: false, data: null };
          });
          
          if (res.success && res.data) {
            console.log('✅ Session validated:', res.data.email);
            await saveUser(res.data);
            setState({ user: res.data as AuthUser, isLoading: false, isAuthenticated: true });
            return;
          }
        }
        
        // Fallback: check stored user data
        const storedUser = await getStoredUser();
        if (storedUser && (storedUser as any).id) {
          console.log('📦 Found cached user data');
          setState({ user: storedUser as unknown as AuthUser, isLoading: false, isAuthenticated: true });
          return;
        }
      } catch (err: any) {
        console.error('❌ Bootstrap error:', err.message);
        // Token invalid or expired
        await clearTokens().catch(() => {});
        await clearUser().catch(() => {});
      }
      
      console.log('🚪 No valid session, routing to auth');
      setState({ user: null, isLoading: false, isAuthenticated: false });
    })();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await loginApi(payload);
    if (!res.success) throw new Error(res.error || 'Login failed');
    await saveTokens(res.data.accessToken, res.data.refreshToken);
    await saveUser(res.data.user);
    setState({ user: res.data.user, isLoading: false, isAuthenticated: true });
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await registerApi(payload);
    if (!res.success) throw new Error(res.error || 'Registration failed');
    await saveTokens(res.data.accessToken, res.data.refreshToken);
    await saveUser(res.data.user);
    setState({ user: res.data.user, isLoading: false, isAuthenticated: true });
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (refreshToken) await logoutApi(refreshToken);
    } catch {
      // Ignore logout API errors
    }
    await clearTokens();
    await clearUser();
    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await getMeApi();
      if (res.success && res.data) {
        await saveUser(res.data);
        setState((s) => ({ ...s, user: res.data }));
      }
    } catch {
      // Silently fail
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
