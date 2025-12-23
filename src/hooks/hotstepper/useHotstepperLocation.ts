import { useState, useCallback, useRef, useEffect } from 'react';

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

  const watchIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const speedHistoryRef = useRef<number[]>([]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        gpsStatus: 'error',
      }));
      return;
    }

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

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newPosition: Position = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };

        const newRoutePoint: RoutePoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: position.timestamp,
        };

        setState(prev => {
          const newRoutePoints = [...prev.routePoints, newRoutePoint];
          
          // Calculate distance from previous point
          let newDistance = prev.totalDistance;
          let currentSpeed = 0;

          if (prev.routePoints.length > 0) {
            const lastPoint = prev.routePoints[prev.routePoints.length - 1];
            const segmentDistance = calculateDistance(
              lastPoint.lat,
              lastPoint.lng,
              newRoutePoint.lat,
              newRoutePoint.lng
            );
            
            // Filter out GPS jumps (> 100m in very short time likely an error)
            const timeDiff = (newRoutePoint.timestamp - lastPoint.timestamp) / 1000; // seconds
            if (segmentDistance < 0.1 || timeDiff > 1) { // Less than 100m or more than 1 second
              newDistance += segmentDistance;
              
              // Calculate current speed (km/h)
              if (timeDiff > 0) {
                currentSpeed = (segmentDistance / timeDiff) * 3600;
                speedHistoryRef.current.push(currentSpeed);
              }
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
            currentSpeed: Math.min(currentSpeed, 50), // Cap at 50 km/h for walking/running
            avgSpeed,
            maxSpeed,
            gpsStatus: 'active',
            error: null,
          };
        });
      },
      (error) => {
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
  }, []);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
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
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
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
