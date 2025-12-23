import { useCallback, useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Polyline, Marker } from '@react-google-maps/api';
import { Loader2, MapPin } from 'lucide-react';

interface RoutePoint {
  lat: number;
  lng: number;
  timestamp?: number;
}

interface GoogleMapContentProps {
  apiKey: string;
  routePoints: RoutePoint[];
  currentPosition?: { lat: number; lng: number } | null;
  isTracking?: boolean;
}

interface HotstepperMapProps {
  routePoints?: RoutePoint[];
  currentPosition?: { lat: number; lng: number } | null;
  isTracking?: boolean;
  className?: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const darkMapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8892b0' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64ffda' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#2d3748' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#3d4f6f' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0d1b2a' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4a5568' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#1a3a2a' }],
  },
];

const defaultCenter = {
  lat: 52.3676,
  lng: 4.9041, // Amsterdam
};

// Inner component that uses the Google Maps API (only rendered when apiKey is available)
function GoogleMapContent({ apiKey, routePoints, currentPosition, isTracking }: GoogleMapContentProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Center map on current position or route
  useEffect(() => {
    if (map && currentPosition) {
      map.panTo(currentPosition);
    } else if (map && routePoints.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      routePoints.forEach((point) => bounds.extend(point));
      map.fitBounds(bounds);
    }
  }, [map, currentPosition, routePoints]);

  const center = currentPosition || (routePoints.length > 0 ? routePoints[0] : defaultCenter);

  if (loadError) {
    return (
      <div className="flex items-center justify-center bg-[#1a1a2e] h-full w-full">
        <div className="text-center p-4">
          <MapPin className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-red-400">Failed to load map</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center bg-[#1a1a2e] h-full w-full">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={15}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: darkMapStyles,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
      >
        {/* Route polyline */}
        {routePoints.length > 1 && (
          <Polyline
            path={routePoints}
            options={{
              strokeColor: '#06B6D4',
              strokeOpacity: 1,
              strokeWeight: 4,
            }}
          />
        )}

        {/* Current position marker */}
        {currentPosition && (
          <Marker
            position={currentPosition}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#06B6D4',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            }}
          />
        )}

        {/* Start marker */}
        {routePoints.length > 0 && (
          <Marker
            position={routePoints[0]}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#22C55E',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }}
          />
        )}
      </GoogleMap>

      {/* Tracking indicator */}
      {isTracking && (
        <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs text-white font-medium">TRACKING</span>
        </div>
      )}
    </>
  );
}

// Outer component that handles API key fetching
export default function HotstepperMap({
  routePoints = [],
  currentPosition,
  isTracking = false,
  className = '',
}: HotstepperMapProps) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchApiKey() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-maps-key`,
          {
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
          }
        );
        
        const data = await response.json();
        
        if (data?.apiKey) {
          setApiKey(data.apiKey);
        } else if (data?.error) {
          setError(data.error);
        }
      } catch (err) {
        console.error('Failed to fetch Google Maps API key:', err);
        setError('Failed to load map configuration');
      } finally {
        setLoading(false);
      }
    }

    fetchApiKey();
  }, []);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-[#1a1a2e] ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
          <p className="text-sm text-slate-400">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error || !apiKey) {
    return (
      <div className={`flex items-center justify-center bg-[#1a1a2e] ${className}`}>
        <div className="text-center p-4">
          <MapPin className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Map unavailable</p>
          <p className="text-xs text-slate-500 mt-1">{error || 'API key not configured'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      <GoogleMapContent
        apiKey={apiKey}
        routePoints={routePoints}
        currentPosition={currentPosition}
        isTracking={isTracking}
      />
    </div>
  );
}
