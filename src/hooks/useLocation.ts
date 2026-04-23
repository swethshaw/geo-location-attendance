// ─── useLocation Hook ──────────────────────────────────────────────────────────
// Handles GPS permissions, fetching current location, accuracy, and all errors.

import { useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import { LOCATION_TIMEOUT } from '../utils/constants';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  timestamp: number;
}

export type LocationError =
  | 'permission_denied'
  | 'location_unavailable'
  | 'timeout'
  | 'unknown';

interface UseLocationResult {
  location: LocationData | null;
  error: LocationError | null;
  errorMessage: string | null;
  isLoading: boolean;
  permissionStatus: Location.PermissionStatus | null;
  refresh: () => Promise<void>;
}

export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<LocationError | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  const fetchLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setErrorMessage(null);

    try {
      // 1. Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status !== 'granted') {
        setError('permission_denied');
        setErrorMessage(
          'Location permission was denied. Please enable it in your device settings to use attendance features.'
        );
        setIsLoading(false);
        return;
      }

      // 2. Check if location services are enabled
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        setError('location_unavailable');
        setErrorMessage(
          'Location services are disabled. Please turn on GPS/Location in your device settings.'
        );
        setIsLoading(false);
        return;
      }

      // 3. Fetch current position with timeout
      const loc = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), LOCATION_TIMEOUT)
        ),
      ]);

      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy,
        altitude: loc.coords.altitude,
        timestamp: loc.timestamp,
      });
      setError(null);
      setErrorMessage(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      if (message === 'timeout') {
        setError('timeout');
        setErrorMessage(
          'Location request timed out. Please ensure you have a clear view of the sky and try again.'
        );
      } else {
        setError('unknown');
        setErrorMessage(`Failed to get location: ${message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Start watching location for real-time updates
  useEffect(() => {
    let mounted = true;

    const startWatch = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      watchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 1,
        },
        (loc) => {
          if (!mounted) return;
          setLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            accuracy: loc.coords.accuracy,
            altitude: loc.coords.altitude,
            timestamp: loc.timestamp,
          });
          setIsLoading(false);
          setError(null);
          setErrorMessage(null);
        }
      );
    };

    fetchLocation().then(() => {
      startWatch();
    });

    return () => {
      mounted = false;
      watchRef.current?.remove();
    };
  }, [fetchLocation]);

  return { location, error, errorMessage, isLoading, permissionStatus, refresh: fetchLocation };
}
