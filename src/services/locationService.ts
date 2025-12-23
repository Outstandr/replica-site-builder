import { Capacitor } from '@capacitor/core';

export type LocationPermissionStatus = 'granted' | 'denied' | 'prompt';

export interface Position {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  speed?: number;
  timestamp: number;
}

export interface LocationService {
  platform: string;
  requestPermissions: () => Promise<LocationPermissionStatus>;
  checkPermissionStatus: () => Promise<LocationPermissionStatus>;
  getCurrentPosition: () => Promise<Position>;
  watchPosition: (callback: (position: Position) => void, onError?: (error: string) => void) => Promise<string>;
  clearWatch: (watchId: string) => Promise<void>;
}

// Haversine formula to calculate distance between two points
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Web/Browser implementation
const webLocationService: LocationService = {
  platform: 'web',
  
  async requestPermissions(): Promise<LocationPermissionStatus> {
    if (!navigator.geolocation) {
      return 'denied';
    }
    
    try {
      await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });
      return 'granted';
    } catch {
      return 'denied';
    }
  },
  
  async checkPermissionStatus(): Promise<LocationPermissionStatus> {
    if (!navigator.permissions) {
      return 'prompt';
    }
    
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state as LocationPermissionStatus;
    } catch {
      return 'prompt';
    }
  },
  
  async getCurrentPosition(): Promise<Position> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            altitude: pos.coords.altitude ?? undefined,
            speed: pos.coords.speed ?? undefined,
            timestamp: pos.timestamp,
          });
        },
        (error) => reject(error.message),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  },
  
  async watchPosition(
    callback: (position: Position) => void,
    onError?: (error: string) => void
  ): Promise<string> {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        callback({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude ?? undefined,
          speed: pos.coords.speed ?? undefined,
          timestamp: pos.timestamp,
        });
      },
      (error) => onError?.(error.message),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
    
    return String(watchId);
  },
  
  async clearWatch(watchId: string): Promise<void> {
    navigator.geolocation.clearWatch(Number(watchId));
  },
};

// Native (Capacitor) implementation
const nativeLocationService: LocationService = {
  platform: Capacitor.getPlatform(),
  
  async requestPermissions(): Promise<LocationPermissionStatus> {
    try {
      const { Geolocation } = await import('@capacitor/geolocation');
      const result = await Geolocation.requestPermissions();
      return result.location as LocationPermissionStatus;
    } catch (error) {
      console.error('[LocationService:Native] Permission request failed:', error);
      return 'denied';
    }
  },
  
  async checkPermissionStatus(): Promise<LocationPermissionStatus> {
    try {
      const { Geolocation } = await import('@capacitor/geolocation');
      const result = await Geolocation.checkPermissions();
      return result.location as LocationPermissionStatus;
    } catch {
      return 'denied';
    }
  },
  
  async getCurrentPosition(): Promise<Position> {
    const { Geolocation } = await import('@capacitor/geolocation');
    const pos = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    });
    
    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      altitude: pos.coords.altitude ?? undefined,
      speed: pos.coords.speed ?? undefined,
      timestamp: pos.timestamp,
    };
  },
  
  async watchPosition(
    callback: (position: Position) => void,
    onError?: (error: string) => void
  ): Promise<string> {
    const { Geolocation } = await import('@capacitor/geolocation');
    
    const watchId = await Geolocation.watchPosition(
      { enableHighAccuracy: true },
      (pos, err) => {
        if (err) {
          onError?.(err.message);
          return;
        }
        if (pos) {
          callback({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            altitude: pos.coords.altitude ?? undefined,
            speed: pos.coords.speed ?? undefined,
            timestamp: pos.timestamp,
          });
        }
      }
    );
    
    return watchId;
  },
  
  async clearWatch(watchId: string): Promise<void> {
    const { Geolocation } = await import('@capacitor/geolocation');
    await Geolocation.clearWatch({ id: watchId });
  },
};

// Factory function
export function getLocationService(): LocationService {
  const platform = Capacitor.getPlatform();
  
  if (platform === 'web') {
    return webLocationService;
  }
  
  return nativeLocationService;
}

export const locationService = getLocationService();
