

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


  useEffect(() => {
    (async () => {

      try {
        const token = await getAccessToken();

        
        if (token) {


          const res = await getMeApi().catch(err => {

            return { success: false, data: null };
          });
          
          if (res.success && res.data) {

            await saveUser(res.data);
            setState({ user: res.data as AuthUser, isLoading: false, isAuthenticated: true });
            return;
          }
        }
        

        const storedUser = await getStoredUser();
        if (storedUser && (storedUser as any).id) {

          setState({ user: storedUser as unknown as AuthUser, isLoading: false, isAuthenticated: true });
          return;
        }
      } catch (err: any) {


        await clearTokens().catch(() => {});
        await clearUser().catch(() => {});
      }
      

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
