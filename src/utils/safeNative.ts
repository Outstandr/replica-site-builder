import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Camera } from '@capacitor/camera';
import { toast } from 'sonner';

// Error codes for native operations
export const NativeErrorCodes = {
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  PERMISSION_UNAVAILABLE: 'PERMISSION_UNAVAILABLE',
  PLUGIN_ERROR: 'PLUGIN_ERROR',
  USER_CANCELLED: 'USER_CANCELLED',
  NOT_AVAILABLE: 'NOT_AVAILABLE',
} as const;

export type NativeErrorCode = typeof NativeErrorCodes[keyof typeof NativeErrorCodes];

export class NativeError extends Error {
  code: NativeErrorCode;
  context: string;

  constructor(code: NativeErrorCode, message: string, context: string) {
    super(message);
    this.code = code;
    this.context = context;
    this.name = 'NativeError';
  }
}

// Platform detection
export const isNative = (): boolean => {
  const platform = Capacitor.getPlatform();
  return platform === 'ios' || platform === 'android';
};

export const isWeb = (): boolean => {
  return Capacitor.getPlatform() === 'web';
};

export const getPlatform = (): 'ios' | 'android' | 'web' => {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
};

// Permission types
export type PermissionType = 'camera' | 'location' | 'motion';

export interface PermissionResult {
  granted: boolean;
  status: 'granted' | 'denied' | 'prompt' | 'unavailable';
  canRequest: boolean;
}

// Check and request permission with error handling
export const checkAndRequestPermission = async (
  type: PermissionType
): Promise<PermissionResult> => {
  // On web, permissions work differently - return granted for simulation
  if (isWeb()) {
    return { granted: true, status: 'granted', canRequest: false };
  }

  try {
    switch (type) {
      case 'camera': {
        const status = await Camera.checkPermissions();
        if (status.camera === 'granted' || status.photos === 'granted') {
          return { granted: true, status: 'granted', canRequest: false };
        }
        if (status.camera === 'denied') {
          return { granted: false, status: 'denied', canRequest: false };
        }
        // Try to request
        const requested = await Camera.requestPermissions({ permissions: ['camera', 'photos'] });
        return {
          granted: requested.camera === 'granted' || requested.photos === 'granted',
          status: requested.camera === 'granted' ? 'granted' : 'denied',
          canRequest: false,
        };
      }

      case 'location': {
        const status = await Geolocation.checkPermissions();
        if (status.location === 'granted') {
          return { granted: true, status: 'granted', canRequest: false };
        }
        if (status.location === 'denied') {
          return { granted: false, status: 'denied', canRequest: false };
        }
        // Try to request
        const requested = await Geolocation.requestPermissions();
        return {
          granted: requested.location === 'granted',
          status: requested.location === 'granted' ? 'granted' : 'denied',
          canRequest: false,
        };
      }

      case 'motion': {
        // Motion/Activity recognition is handled by the pedometer plugin
        // For now, we'll return granted as the plugin handles its own permissions
        return { granted: true, status: 'granted', canRequest: false };
      }

      default:
        return { granted: false, status: 'unavailable', canRequest: false };
    }
  } catch (error) {
    console.error(`[SafeNative] Permission check failed for ${type}:`, error);
    return { granted: false, status: 'unavailable', canRequest: false };
  }
};

// Safe wrapper for any plugin call
export const safePluginCall = async <T>(
  fn: () => Promise<T>,
  context: string,
  fallback: T
): Promise<T> => {
  if (isWeb()) {
    console.log(`[SafeNative] Web Mode: ${context} - using fallback`);
    return fallback;
  }

  try {
    return await fn();
  } catch (error) {
    logNativeError(context, error);
    return fallback;
  }
};

// Log errors consistently
export const logNativeError = (context: string, error: unknown): void => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[SafeNative] Error in ${context}:`, message);
  
  // Check for user cancellation (don't log these as errors)
  if (isUserCancellation(error)) {
    console.log(`[SafeNative] User cancelled: ${context}`);
    return;
  }

  // Could log to Supabase here for crash analytics
  // For now, just console error
};

// Check if error is a user cancellation
export const isUserCancellation = (error: unknown): boolean => {
  if (!error) return false;
  
  const message = error instanceof Error ? error.message : String(error);
  const lowerMessage = message.toLowerCase();
  
  return (
    lowerMessage.includes('user cancelled') ||
    lowerMessage.includes('user canceled') ||
    lowerMessage.includes('cancelled by user') ||
    lowerMessage.includes('canceled by user') ||
    lowerMessage.includes('user denied') ||
    lowerMessage.includes('activity was cancelled') ||
    lowerMessage.includes('photo picker was cancelled')
  );
};

// Show permission denied toast with settings hint
export const showPermissionDeniedToast = (permissionType: PermissionType): void => {
  const messages: Record<PermissionType, string> = {
    camera: 'Camera access denied. Please enable in Settings.',
    location: 'Location access denied. Please enable in Settings.',
    motion: 'Motion tracking denied. Please enable in Settings.',
  };

  toast.error(messages[permissionType], {
    duration: 4000,
    action: {
      label: 'Settings',
      onClick: () => {
        // On native, we'd use NativeSettings plugin to open app settings
        // For now, just show a message
        toast.info('Go to your device Settings to enable permissions');
      },
    },
  });
};

// Try to open native settings (graceful fallback)
export const openNativeSettings = async (): Promise<void> => {
  if (isWeb()) {
    toast.info('Open your browser settings to manage permissions');
    return;
  }
  
  // Would use @capacitor-community/native-settings here
  // For now, show instructions
  toast.info('Go to Settings > Apps > [App Name] > Permissions');
};
