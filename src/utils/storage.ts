

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';



const ACCESS_TOKEN_KEY = 'geo_access_token';
const REFRESH_TOKEN_KEY = 'geo_refresh_token';
const USER_KEY = 'geo_user';

export async function saveTokens(accessToken: string, refreshToken: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  } catch (e) {

    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export async function getAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch (e) {

    return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (e) {

    return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  }
}

export async function clearTokens(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch (e) {

    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}



export async function saveUser(user: any): Promise<void> {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {

  }
}

export async function getStoredUser(): Promise<Record<string, unknown> | null> {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {

    return null;
  }
}

export async function clearUser(): Promise<void> {
  try {
    await AsyncStorage.removeItem(USER_KEY);
  } catch (e) {

  }
}



const ATTENDANCE_CACHE_KEY = 'geo_attendance_cache';

export interface CachedAttendance {
  id?: string;
  latitude: number;
  longitude: number;
  accuracy_meters: number;
  distance_from_center: number;
  status: string;
  location_name: string;
  marked_at: string;
  synced: boolean;
}

export async function cacheAttendance(record: CachedAttendance): Promise<void> {
  const existing = await getCachedAttendance();
  existing.unshift(record);

  const trimmed = existing.slice(0, 100);
  await AsyncStorage.setItem(ATTENDANCE_CACHE_KEY, JSON.stringify(trimmed));
}

export async function getCachedAttendance(): Promise<CachedAttendance[]> {
  const raw = await AsyncStorage.getItem(ATTENDANCE_CACHE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function clearAttendanceCache(): Promise<void> {
  await AsyncStorage.removeItem(ATTENDANCE_CACHE_KEY);
}
