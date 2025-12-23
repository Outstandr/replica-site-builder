import { useCallback } from 'react';
import { toast } from 'sonner';
import { type PermissionType } from '@/utils/safeNative';

interface UseNativeErrorReturn {
  showError: (context: string, message?: string) => void;
  showPermissionDenied: (type: PermissionType) => void;
  showRetry: (message: string, onRetry: () => void) => void;
  showGpsError: () => void;
  showCameraError: () => void;
  showNetworkError: () => void;
}

export const useNativeError = (): UseNativeErrorReturn => {
  // Show a generic error with context
  const showError = useCallback((context: string, message?: string) => {
    const displayMessage = message || `Something went wrong with ${context}. Please try again.`;
    
    toast.error(displayMessage, {
      duration: 4000,
    });
    
    console.error(`[NativeError] ${context}:`, message);
  }, []);

  // Show permission denied message with settings hint
  const showPermissionDenied = useCallback((type: PermissionType) => {
    const messages: Record<PermissionType, { title: string; description: string }> = {
      camera: {
        title: 'Camera Access Required',
        description: 'Please enable camera access in your device settings to scan food.',
      },
      location: {
        title: 'Location Access Required',
        description: 'Please enable location access in your device settings to track your walks.',
      },
      motion: {
        title: 'Motion Tracking Required',
        description: 'Please enable motion tracking in your device settings to count your steps.',
      },
    };

    const { title, description } = messages[type];

    toast.error(title, {
      description,
      duration: 5000,
      action: {
        label: 'Settings',
        onClick: () => {
          toast.info('Go to Settings > Privacy to enable permissions');
        },
      },
    });
  }, []);

  // Show error with retry option
  const showRetry = useCallback((message: string, onRetry: () => void) => {
    toast.error(message, {
      duration: 6000,
      action: {
        label: 'Retry',
        onClick: onRetry,
      },
    });
  }, []);

  // Specific error: GPS unavailable
  const showGpsError = useCallback(() => {
    toast.error('Could not access GPS', {
      description: 'Please check your location settings and try again.',
      duration: 4000,
    });
  }, []);

  // Specific error: Camera unavailable
  const showCameraError = useCallback(() => {
    toast.error('Could not access camera', {
      description: 'Please check your camera settings and try again.',
      duration: 4000,
    });
  }, []);

  // Specific error: Network issue
  const showNetworkError = useCallback(() => {
    toast.error('Network error', {
      description: 'Please check your internet connection and try again.',
      duration: 4000,
      action: {
        label: 'Retry',
        onClick: () => window.location.reload(),
      },
    });
  }, []);

  return {
    showError,
    showPermissionDenied,
    showRetry,
    showGpsError,
    showCameraError,
    showNetworkError,
  };
};

export default useNativeError;
