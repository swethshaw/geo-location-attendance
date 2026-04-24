

/** GPS accuracy threshold in meters. Attendance is blocked above this. */
export const GPS_ACCURACY_THRESHOLD = 50;

/** Accuracy levels for the visual gauge */
export const ACCURACY_LEVELS = {
  EXCELLENT: { max: 10, label: 'Excellent', color: '#22C55E' },
  GOOD: { max: 25, label: 'Good', color: '#22C55E' },
  FAIR: { max: 50, label: 'Fair', color: '#F59E0B' },
  POOR: { max: Infinity, label: 'Poor', color: '#EF4444' },
} as const;

/** Get accuracy level from a meters value */
export function getAccuracyLevel(meters: number) {
  if (meters <= ACCURACY_LEVELS.EXCELLENT.max) return ACCURACY_LEVELS.EXCELLENT;
  if (meters <= ACCURACY_LEVELS.GOOD.max) return ACCURACY_LEVELS.GOOD;
  if (meters <= ACCURACY_LEVELS.FAIR.max) return ACCURACY_LEVELS.FAIR;
  return ACCURACY_LEVELS.POOR;
}

/** Default pagination */
export const DEFAULT_PAGE_SIZE = 20;

/** Location fetch timeout in ms */
export const LOCATION_TIMEOUT = 15000;

/** API base URL — overridden by .env */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.103:3000/api';
