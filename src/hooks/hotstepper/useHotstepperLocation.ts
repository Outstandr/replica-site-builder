import { useState, useCallback, useRef, useEffect } from 'react';
import { HotStepperService, PositionUpdate } from '@/services/HotStepperService';
import { isWeb } from '@/utils/safeNative';

interface Position {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface RoutePoint {
  lat: number;
  lng: number;
  timestamp: number;
}

interface LocationState {
  currentPosition: Position | null;
  routePoints: RoutePoint[];
  totalDistance: number;
  currentSpeed: number;
  avgSpeed: number;
  maxSpeed: number;
  isTracking: boolean;
  gpsStatus: 'inactive' | 'acquiring' | 'active' | 'error';
  error: string | null;
}

// Haversine formula for distance calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useHotstepperLocation() {
  const [state, setState] = useState<LocationState>({
    currentPosition: null,
    routePoints: [],
    totalDistance: 0,
    currentSpeed: 0,
    avgSpeed: 0,
    maxSpeed: 0,
    isTracking: false,
    gpsStatus: 'inactive',
    error: null,
  });

  const watchIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const speedHistoryRef = useRef<number[]>([]);
  const webWatchIdRef = useRef<number | null>(null);

  // Process position update (shared between native and web)
  const processPositionUpdate = useCallback((position: PositionUpdate) => {
    const newPosition: Position = {
      latitude: position.latitude,
      longitude: position.longitude,
      accuracy: position.accuracy,
      timestamp: position.timestamp,
    };

    const newRoutePoint: RoutePoint = {
      lat: position.latitude,
      lng: position.longitude,
      timestamp: position.timestamp,
    };

    setState(prev => {
      const newRoutePoints = [...prev.routePoints, newRoutePoint];
      
      // Calculate distance from previous point
      let newDistance = prev.totalDistance;
      let currentSpeed = position.speed ?? 0;

      if (prev.routePoints.length > 0) {
        const lastPoint = prev.routePoints[prev.routePoints.length - 1];
        const segmentDistance = calculateDistance(
          lastPoint.lat,
          lastPoint.lng,
          newRoutePoint.lat,
          newRoutePoint.lng
        );
        
        // Filter out GPS jumps (> 100m in very short time likely an error)
        const timeDiff = (newRoutePoint.timestamp - lastPoint.timestamp) / 1000;
        if (segmentDistance < 0.1 || timeDiff > 1) {
          newDistance += segmentDistance;
          
          // Calculate current speed if not provided
          if (timeDiff > 0 && !position.speed) {
            currentSpeed = (segmentDistance / timeDiff) * 3600;
          }
          speedHistoryRef.current.push(currentSpeed);
        }
      }

      // Calculate average and max speed
      const speeds = speedHistoryRef.current;
      const avgSpeed = speeds.length > 0 
        ? speeds.reduce((a, b) => a + b, 0) / speeds.length 
        : 0;
      const maxSpeed = speeds.length > 0 
        ? Math.max(...speeds) 
        : 0;

      return {
        ...prev,
        currentPosition: newPosition,
        routePoints: newRoutePoints,
        totalDistance: newDistance,
        currentSpeed: Math.min(currentSpeed, 50),
        avgSpeed,
        maxSpeed,
        gpsStatus: 'active',
        error: null,
      };
    });
  }, []);

  // Start tracking using crash-proof HotStepperService
  const startTracking = useCallback(async () => {
    setState(prev => ({
      ...prev,
      isTracking: true,
      gpsStatus: 'acquiring',
      routePoints: [],
      totalDistance: 0,
      currentSpeed: 0,
      avgSpeed: 0,
      maxSpeed: 0,
      error: null,
    }));

    startTimeRef.current = Date.now();
    speedHistoryRef.current = [];

    // Use web geolocation API directly for web platform
    if (isWeb()) {
      if (!navigator.geolocation) {
        setState(prev => ({
          ...prev,
          error: 'Geolocation is not supported by your browser',
          gpsStatus: 'error',
        }));
        return;
      }

      webWatchIdRef.current = navigator.geolocation.watchPosition(
        (geoPosition) => {
          processPositionUpdate({
            latitude: geoPosition.coords.latitude,
            longitude: geoPosition.coords.longitude,
            accuracy: geoPosition.coords.accuracy,
            speed: geoPosition.coords.speed ?? null,
            timestamp: geoPosition.timestamp,
          });
        },
        (error) => {
          console.warn('[HotstepperLocation] Web GPS error:', error.message);
          setState(prev => ({
            ...prev,
            error: error.message,
            gpsStatus: 'error',
          }));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
      return;
    }

    // Use crash-proof HotStepperService for native
    const watchId = await HotStepperService.watchPosition(
      (position) => {
        processPositionUpdate(position);
      },
      (error) => {
        console.warn('[HotstepperLocation] GPS error:', error);
        setState(prev => ({
          ...prev,
          error,
          gpsStatus: 'error',
        }));
      }
    );

    if (watchId) {
      watchIdRef.current = watchId;
    } else {
      setState(prev => ({
        ...prev,
        gpsStatus: 'error',
        error: 'Could not start GPS tracking',
      }));
    }
  }, [processPositionUpdate]);

  // Stop tracking
  const stopTracking = useCallback(async () => {
    // Clear web watch
    if (webWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(webWatchIdRef.current);
      webWatchIdRef.current = null;
    }

    // Clear native watch
    if (watchIdRef.current !== null) {
      await HotStepperService.clearPositionWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isTracking: false,
      gpsStatus: 'inactive',
    }));

    startTimeRef.current = null;
    speedHistoryRef.current = [];
  }, []);

  const retryGPS = useCallback(() => {
    stopTracking();
    setTimeout(startTracking, 500);
  }, [stopTracking, startTracking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (webWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(webWatchIdRef.current);
      }
      if (watchIdRef.current !== null) {
        HotStepperService.clearPositionWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    ...state,
    startTracking,
    stopTracking,
    retryGPS,
  };
}
