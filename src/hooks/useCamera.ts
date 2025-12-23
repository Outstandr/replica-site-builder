import { useState, useCallback } from 'react';
import { cameraService, CaptureResult } from '@/services/cameraService';

export function useCamera() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastCapture, setLastCapture] = useState<CaptureResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const capturePhoto = useCallback(async (): Promise<CaptureResult | null> => {
    setIsCapturing(true);
    setError(null);

    try {
      // Check/request permissions first
      let permission = await cameraService.checkPermissions();
      
      if (permission === 'denied') {
        setError('Camera permission denied. Please enable in settings.');
        return null;
      }
      
      if (permission === 'prompt') {
        permission = await cameraService.requestPermissions();
        if (permission !== 'granted') {
          setError('Camera permission required to capture photos.');
          return null;
        }
      }

      const result = await cameraService.capturePhoto();
      
      if (result) {
        setLastCapture(result);
        return result;
      } else {
        setError('Failed to capture photo. Please try again.');
        return null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Camera error';
      console.error('[useCamera] Capture error:', message);
      setError(message);
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, []);

  const pickFromGallery = useCallback(async (): Promise<CaptureResult | null> => {
    setIsCapturing(true);
    setError(null);

    try {
      const result = await cameraService.pickFromGallery();
      
      if (result) {
        setLastCapture(result);
        return result;
      } else {
        // User probably cancelled - not an error
        return null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gallery error';
      console.error('[useCamera] Gallery error:', message);
      setError(message);
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLastCapture(null);
    setError(null);
  }, []);

  return {
    isCapturing,
    lastCapture,
    error,
    capturePhoto,
    pickFromGallery,
    reset,
    platform: cameraService.platform,
  };
}
