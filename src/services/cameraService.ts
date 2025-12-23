import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';

export type CameraPermissionStatus = 'granted' | 'denied' | 'prompt' | 'limited';

export interface CaptureResult {
  base64: string;
  format: string;
  webPath?: string;
}

export interface CameraService {
  platform: 'web' | 'ios' | 'android';
  checkPermissions: () => Promise<CameraPermissionStatus>;
  requestPermissions: () => Promise<CameraPermissionStatus>;
  capturePhoto: () => Promise<CaptureResult | null>;
  pickFromGallery: () => Promise<CaptureResult | null>;
}

// Convert Photo to CaptureResult
async function photoToResult(photo: Photo): Promise<CaptureResult | null> {
  if (!photo.base64String) return null;
  
  return {
    base64: `data:image/${photo.format};base64,${photo.base64String}`,
    format: photo.format,
    webPath: photo.webPath,
  };
}

// Web implementation - uses file input picker
const webCameraService: CameraService = {
  platform: 'web',

  async checkPermissions(): Promise<CameraPermissionStatus> {
    // Web uses file input, no special permissions needed
    return 'granted';
  },

  async requestPermissions(): Promise<CameraPermissionStatus> {
    return 'granted';
  },

  async capturePhoto(): Promise<CaptureResult | null> {
    try {
      // On web, Camera plugin opens a file picker or camera based on browser support
      const photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        width: 1024,
        height: 1024,
      });
      
      return photoToResult(photo);
    } catch (error) {
      console.error('[CameraService:Web] Capture failed:', error);
      return null;
    }
  },

  async pickFromGallery(): Promise<CaptureResult | null> {
    try {
      const photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos,
        width: 1024,
        height: 1024,
      });
      
      return photoToResult(photo);
    } catch (error) {
      console.error('[CameraService:Web] Gallery pick failed:', error);
      return null;
    }
  },
};

// Native implementation - uses Capacitor Camera plugin
const nativeCameraService: CameraService = {
  platform: Capacitor.getPlatform() as 'ios' | 'android',

  async checkPermissions(): Promise<CameraPermissionStatus> {
    try {
      const status = await Camera.checkPermissions();
      return status.camera as CameraPermissionStatus;
    } catch (error) {
      console.error('[CameraService:Native] Permission check failed:', error);
      return 'denied';
    }
  },

  async requestPermissions(): Promise<CameraPermissionStatus> {
    try {
      const status = await Camera.requestPermissions({ permissions: ['camera', 'photos'] });
      return status.camera as CameraPermissionStatus;
    } catch (error) {
      console.error('[CameraService:Native] Permission request failed:', error);
      return 'denied';
    }
  },

  async capturePhoto(): Promise<CaptureResult | null> {
    try {
      const photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        width: 1024,
        height: 1024,
        correctOrientation: true,
      });
      
      return photoToResult(photo);
    } catch (error) {
      console.error('[CameraService:Native] Capture failed:', error);
      return null;
    }
  },

  async pickFromGallery(): Promise<CaptureResult | null> {
    try {
      const photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos,
        width: 1024,
        height: 1024,
        correctOrientation: true,
      });
      
      return photoToResult(photo);
    } catch (error) {
      console.error('[CameraService:Native] Gallery pick failed:', error);
      return null;
    }
  },
};

// Factory function
export function getCameraService(): CameraService {
  const platform = Capacitor.getPlatform();
  
  if (platform === 'ios' || platform === 'android') {
    return nativeCameraService;
  }
  
  return webCameraService;
}

// Export singleton
export const cameraService = getCameraService();
