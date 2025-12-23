import { useState, useEffect, useCallback, ReactNode } from 'react';
import { Capacitor } from '@capacitor/core';
import { Camera } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera as CameraIcon, MapPin, Activity, Shield, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PermissionState {
  camera: 'checking' | 'granted' | 'denied' | 'prompt';
  location: 'checking' | 'granted' | 'denied' | 'prompt';
  motion: 'checking' | 'granted' | 'denied' | 'prompt';
}

interface PermissionsGateProps {
  children: ReactNode;
  requiredPermissions?: ('camera' | 'location' | 'motion')[];
  onAllGranted?: () => void;
}

export function PermissionsGate({ 
  children, 
  requiredPermissions = ['camera', 'location', 'motion'],
  onAllGranted 
}: PermissionsGateProps) {
  const [permissions, setPermissions] = useState<PermissionState>({
    camera: 'checking',
    location: 'checking',
    motion: 'checking',
  });
  const [isNative, setIsNative] = useState(false);
  const [allGranted, setAllGranted] = useState(false);

  // Check all permissions on mount
  useEffect(() => {
    const platform = Capacitor.getPlatform();
    setIsNative(platform === 'ios' || platform === 'android');
    
    // On web, simulate all granted
    if (platform === 'web') {
      setPermissions({
        camera: 'granted',
        location: 'granted',
        motion: 'granted',
      });
      setAllGranted(true);
      return;
    }

    checkAllPermissions();
  }, []);

  // Check if all required permissions are granted
  useEffect(() => {
    const allRequired = requiredPermissions.every(
      (perm) => permissions[perm] === 'granted'
    );
    setAllGranted(allRequired);
    
    if (allRequired && onAllGranted) {
      onAllGranted();
    }
  }, [permissions, requiredPermissions, onAllGranted]);

  const checkAllPermissions = async () => {
    // Check camera
    try {
      const cameraStatus = await Camera.checkPermissions();
      setPermissions(prev => ({
        ...prev,
        camera: cameraStatus.camera === 'granted' ? 'granted' : 
                cameraStatus.camera === 'denied' ? 'denied' : 'prompt'
      }));
    } catch {
      setPermissions(prev => ({ ...prev, camera: 'prompt' }));
    }

    // Check location
    try {
      const locationStatus = await Geolocation.checkPermissions();
      setPermissions(prev => ({
        ...prev,
        location: locationStatus.location === 'granted' ? 'granted' : 
                  locationStatus.location === 'denied' ? 'denied' : 'prompt'
      }));
    } catch {
      setPermissions(prev => ({ ...prev, location: 'prompt' }));
    }

    // Motion/Pedometer - typically granted by default or bundled with health
    setPermissions(prev => ({ ...prev, motion: 'granted' }));
  };

  const requestCameraPermission = async () => {
    try {
      const status = await Camera.requestPermissions({ permissions: ['camera', 'photos'] });
      setPermissions(prev => ({
        ...prev,
        camera: status.camera === 'granted' ? 'granted' : 'denied'
      }));
    } catch {
      setPermissions(prev => ({ ...prev, camera: 'denied' }));
    }
  };

  const requestLocationPermission = async () => {
    try {
      const status = await Geolocation.requestPermissions();
      setPermissions(prev => ({
        ...prev,
        location: status.location === 'granted' ? 'granted' : 'denied'
      }));
    } catch {
      setPermissions(prev => ({ ...prev, location: 'denied' }));
    }
  };

  const PermissionItem = ({ 
    type, 
    icon: Icon, 
    label, 
    description,
    status,
    onRequest 
  }: { 
    type: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    description: string;
    status: PermissionState[keyof PermissionState];
    onRequest: () => void;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50"
    >
      <div className={`p-3 rounded-full ${
        status === 'granted' ? 'bg-green-500/20 text-green-400' :
        status === 'denied' ? 'bg-red-500/20 text-red-400' :
        'bg-cyan-500/20 text-cyan-400'
      }`}>
        <Icon className="w-6 h-6" />
      </div>
      
      <div className="flex-1">
        <h3 className="font-semibold text-white">{label}</h3>
        <p className="text-sm text-zinc-400">{description}</p>
      </div>

      {status === 'granted' ? (
        <CheckCircle className="w-6 h-6 text-green-400" />
      ) : status === 'denied' ? (
        <XCircle className="w-6 h-6 text-red-400" />
      ) : status === 'checking' ? (
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      ) : (
        <Button
          size="sm"
          onClick={onRequest}
          className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
        >
          Allow
        </Button>
      )}
    </motion.div>
  );

  // If all granted, show children
  if (allGranted) {
    return <>{children}</>;
  }

  // Show permissions gate UI
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="header-safe px-6 py-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center"
        >
          <Shield className="w-10 h-10 text-white" />
        </motion.div>
        
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-white mb-2"
        >
          Unlock Full Experience
        </motion.h1>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-zinc-400 max-w-sm mx-auto"
        >
          Grant access to these features to track your fitness journey and scan your meals.
        </motion.p>
      </div>

      {/* Permission Cards */}
      <div className="flex-1 px-6 space-y-4">
        <AnimatePresence>
          {requiredPermissions.includes('camera') && (
            <PermissionItem
              type="camera"
              icon={CameraIcon}
              label="Camera Access"
              description="Scan meals to log calories automatically"
              status={permissions.camera}
              onRequest={requestCameraPermission}
            />
          )}

          {requiredPermissions.includes('location') && (
            <PermissionItem
              type="location"
              icon={MapPin}
              label="Location Access"
              description="Track your walking routes and distance"
              status={permissions.location}
              onRequest={requestLocationPermission}
            />
          )}

          {requiredPermissions.includes('motion') && (
            <PermissionItem
              type="motion"
              icon={Activity}
              label="Motion & Fitness"
              description="Count your steps throughout the day"
              status={permissions.motion}
              onRequest={() => {}}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Skip Option */}
      <div className="p-6 text-center">
        <button
          onClick={() => setAllGranted(true)}
          className="text-zinc-500 text-sm hover:text-zinc-300 transition-colors"
        >
          Continue without full access →
        </button>
        <p className="text-zinc-600 text-xs mt-2">
          Some features will be limited
        </p>
      </div>
    </div>
  );
}

// Hook for checking individual permissions
export function usePermissions() {
  const [camera, setCamera] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [location, setLocation] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  const checkCamera = useCallback(async () => {
    if (Capacitor.getPlatform() === 'web') {
      setCamera('granted');
      return 'granted';
    }
    
    try {
      const status = await Camera.checkPermissions();
      const result = status.camera === 'granted' ? 'granted' : 
                     status.camera === 'denied' ? 'denied' : 'prompt';
      setCamera(result as 'granted' | 'denied' | 'prompt');
      return result;
    } catch {
      return 'prompt';
    }
  }, []);

  const checkLocation = useCallback(async () => {
    if (Capacitor.getPlatform() === 'web') {
      setLocation('granted');
      return 'granted';
    }
    
    try {
      const status = await Geolocation.checkPermissions();
      const result = status.location === 'granted' ? 'granted' : 
                     status.location === 'denied' ? 'denied' : 'prompt';
      setLocation(result as 'granted' | 'denied' | 'prompt');
      return result;
    } catch {
      return 'prompt';
    }
  }, []);

  const requestCamera = useCallback(async () => {
    try {
      const status = await Camera.requestPermissions();
      const result = status.camera === 'granted' ? 'granted' : 'denied';
      setCamera(result as 'granted' | 'denied');
      return result;
    } catch {
      return 'denied';
    }
  }, []);

  const requestLocation = useCallback(async () => {
    try {
      const status = await Geolocation.requestPermissions();
      const result = status.location === 'granted' ? 'granted' : 'denied';
      setLocation(result as 'granted' | 'denied');
      return result;
    } catch {
      return 'denied';
    }
  }, []);

  return {
    camera,
    location,
    checkCamera,
    checkLocation,
    requestCamera,
    requestLocation,
  };
}
