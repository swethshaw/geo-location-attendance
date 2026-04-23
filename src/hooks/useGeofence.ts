// ─── useGeofence Hook ──────────────────────────────────────────────────────────
// Calculates distance from a zone and determines inside/outside status.

import { useMemo } from 'react';
import { haversineDistance, isInsideGeoFence } from '../utils/geofence';
import { GeoFenceLocation } from '../api/locations';
import { LocationData } from './useLocation';

interface UseGeofenceResult {
  distance: number | null;
  isInside: boolean;
  zone: GeoFenceLocation | null;
}

export function useGeofence(
  location: LocationData | null,
  zone: GeoFenceLocation | null
): UseGeofenceResult {
  return useMemo(() => {
    if (!location || !zone) {
      return { distance: null, isInside: false, zone };
    }

    const dist = haversineDistance(
      location.latitude,
      location.longitude,
      zone.latitude,
      zone.longitude
    );

    const inside = isInsideGeoFence(
      location.latitude,
      location.longitude,
      zone.latitude,
      zone.longitude,
      zone.radius_meters
    );

    return { distance: dist, isInside: inside, zone };
  }, [location?.latitude, location?.longitude, zone?.id, zone?.latitude, zone?.longitude, zone?.radius_meters]);
}
