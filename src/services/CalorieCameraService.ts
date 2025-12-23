import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { 
  isWeb, 
  checkAndRequestPermission, 
  logNativeError, 
  isUserCancellation,
  showPermissionDeniedToast,
  openNativeSettings
} from '@/utils/safeNative';
import { toast } from 'sonner';

export interface CaptureResult {
  base64: string;
  format: string;
  webPath?: string;
}

class CalorieCameraServiceClass {
  private fileInputRef: HTMLInputElement | null = null;

  // Open scanner - crash-proof camera access
  async openScanner(): Promise<CaptureResult | null> {
    // Step 1: Web Check - use file input instead
    if (isWeb()) {
      console.log('[CalorieCam] Web Mode: Opening file picker');
      return this.openWebFilePicker();
    }

    // Step 2: Check camera permission
    try {
      const permission = await checkAndRequestPermission('camera');
      
      if (!permission.granted) {
        showPermissionDeniedToast('camera');
        
        // Offer to open settings
        toast.error('Camera access denied', {
          action: {
            label: 'Open Settings',
            onClick: () => openNativeSettings(),
          },
        });
        
        return null;
      }
    } catch (error) {
      logNativeError('CalorieCam.openScanner.permissions', error);
      toast.error('Could not access camera permissions');
      return null;
    }

    // Step 3: Capture photo with error handling
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        quality: 85,
        allowEditing: false,
        saveToGallery: false,
      });

      if (!photo.base64String) {
        console.warn('[CalorieCam] No image data received');
        return null;
      }

      return {
        base64: photo.base64String,
        format: photo.format,
        webPath: photo.webPath,
      };
    } catch (error) {
      // Check for user cancellation - silently return null
      if (isUserCancellation(error)) {
        console.log('[CalorieCam] User cancelled camera');
        return null;
      }

      // Log other errors
      logNativeError('CalorieCam.openScanner.capture', error);
      toast.error('Could not capture photo. Please try again.');
      return null;
    }
  }

  // Open gallery picker - crash-proof
  async openGallery(): Promise<CaptureResult | null> {
    if (isWeb()) {
      return this.openWebFilePicker();
    }

    try {
      const permission = await checkAndRequestPermission('camera');
      
      if (!permission.granted) {
        showPermissionDeniedToast('camera');
        return null;
      }

      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos,
        quality: 85,
      });

      if (!photo.base64String) {
        return null;
      }

      return {
        base64: photo.base64String,
        format: photo.format,
        webPath: photo.webPath,
      };
    } catch (error) {
      if (isUserCancellation(error)) {
        return null;
      }

      logNativeError('CalorieCam.openGallery', error);
      toast.error('Could not access gallery. Please try again.');
      return null;
    }
  }

  // Web fallback - file picker
  private openWebFilePicker(): Promise<CaptureResult | null> {
    return new Promise((resolve) => {
      // Create input if not exists
      if (!this.fileInputRef) {
        this.fileInputRef = document.createElement('input');
        this.fileInputRef.type = 'file';
        this.fileInputRef.accept = 'image/*';
        this.fileInputRef.style.display = 'none';
        document.body.appendChild(this.fileInputRef);
      }

      const handleChange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];

        if (!file) {
          resolve(null);
          return;
        }

        const reader = new FileReader();
        
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve({
            base64,
            format: file.type.split('/')[1] || 'jpeg',
            webPath: URL.createObjectURL(file),
          });
        };

        reader.onerror = () => {
          logNativeError('CalorieCam.webFilePicker.read', reader.error);
          resolve(null);
        };

        reader.readAsDataURL(file);
        
        // Reset input for next use
        target.value = '';
      };

      // Handle cancel (no file selected)
      const handleCancel = () => {
        // User closed the picker without selecting
        setTimeout(() => {
          if (this.fileInputRef && !this.fileInputRef.files?.length) {
            resolve(null);
          }
        }, 100);
      };

      this.fileInputRef.onchange = handleChange;
      this.fileInputRef.onclick = () => {
        // Set up cancel detection
        window.addEventListener('focus', handleCancel, { once: true });
      };

      this.fileInputRef.click();
    });
  }

  // Cleanup
  dispose(): void {
    if (this.fileInputRef && this.fileInputRef.parentNode) {
      this.fileInputRef.parentNode.removeChild(this.fileInputRef);
      this.fileInputRef = null;
    }
  }
}

// Export singleton instance
export const CalorieCameraService = new CalorieCameraServiceClass();
