import { 
  isNative, 
  isWeb, 
  checkAndRequestPermission, 
  safePluginCall, 
  logNativeError,
  showPermissionDeniedToast 
} from '@/utils/safeNative';
import { healthService } from './healthService';
import { locationService, type Position } from './locationService';
import { toast } from 'sonner';

export interface StepStats {
  steps: number;
  distance: number; // in km
  calories: number;
  activeMinutes: number;
  source: 'native' | 'simulated';
}

export interface TrackingSession {
  id: string;
  startTime: Date;
  isActive: boolean;
}

export interface PositionUpdate {
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number | null;
  timestamp: number;
}

type PositionCallback = (position: PositionUpdate) => void;
type ErrorCallback = (error: string) => void;

class HotStepperServiceClass {
  private currentSession: TrackingSession | null = null;
  private positionWatchId: string | null = null;
  private stepUpdateInterval: ReturnType<typeof setInterval> | null = null;

  // Start tracking - crash-proof implementation
  async startTracking(): Promise<TrackingSession | null> {
    // Step 1: Web Check - use mock data
    if (isWeb()) {
      console.log('[HotStepper] Web Mode: Simulating steps');
      return this.startWebSimulation();
    }

    // Step 2: Check permissions
    try {
      const motionPermission = await checkAndRequestPermission('motion');
      if (!motionPermission.granted) {
        showPermissionDeniedToast('motion');
        return null;
      }

      const locationPermission = await checkAndRequestPermission('location');
      if (!locationPermission.granted) {
        showPermissionDeniedToast('location');
        return null;
      }
    } catch (error) {
      logNativeError('HotStepper.startTracking.permissions', error);
      toast.error('Could not check permissions. Please try again.');
      return null;
    }

    // Step 3: Start native tracking with crash protection
    try {
      // Start health tracking
      await safePluginCall(
        () => healthService.startBackgroundTracking(),
        'HotStepper.startHealthTracking',
        undefined
      );

      // Create session
      this.currentSession = {
        id: `session-${Date.now()}`,
        startTime: new Date(),
        isActive: true,
      };

      console.log('[HotStepper] Tracking started:', this.currentSession.id);
      toast.success('Step tracking started!');

      return this.currentSession;
    } catch (error) {
      logNativeError('HotStepper.startTracking.execution', error);
      toast.error('Could not start tracking. GPS may be unavailable.');
      return null;
    }
  }

  // Stop tracking
  async stopTracking(): Promise<void> {
    try {
      if (this.positionWatchId) {
        await this.clearPositionWatch(this.positionWatchId);
        this.positionWatchId = null;
      }

      if (this.stepUpdateInterval) {
        clearInterval(this.stepUpdateInterval);
        this.stepUpdateInterval = null;
      }

      await safePluginCall(
        () => healthService.stopBackgroundTracking(),
        'HotStepper.stopHealthTracking',
        undefined
      );

      if (this.currentSession) {
        this.currentSession.isActive = false;
        console.log('[HotStepper] Tracking stopped:', this.currentSession.id);
      }

      this.currentSession = null;
    } catch (error) {
      logNativeError('HotStepper.stopTracking', error);
      // Force cleanup even on error
      this.currentSession = null;
      this.positionWatchId = null;
    }
  }

  // Get current stats - crash-proof
  async getCurrentStats(): Promise<StepStats> {
    if (isWeb()) {
      const data = await healthService.queryDailySteps();
      return {
        steps: data.steps,
        distance: data.distance,
        calories: data.calories,
        activeMinutes: data.activeMinutes,
        source: 'simulated',
      };
    }

    try {
      const data = await safePluginCall(
        () => healthService.queryDailySteps(),
        'HotStepper.getCurrentStats',
        { steps: 0, distance: 0, calories: 0, activeMinutes: 0 }
      );

      return {
        steps: data.steps,
        distance: data.distance,
        calories: data.calories,
        activeMinutes: data.activeMinutes,
        source: isNative() ? 'native' : 'simulated',
      };
    } catch (error) {
      logNativeError('HotStepper.getCurrentStats', error);
      return {
        steps: 0,
        distance: 0,
        calories: 0,
        activeMinutes: 0,
        source: 'simulated',
      };
    }
  }

  // Watch position with crash protection
  async watchPosition(
    onPosition: PositionCallback,
    onError?: ErrorCallback
  ): Promise<string | null> {
    if (isWeb()) {
      console.log('[HotStepper] Web Mode: Position watching simulated');
      return 'web-watch-simulated';
    }

    try {
      const watchId = await locationService.watchPosition(
        (position: Position) => {
          onPosition({
            latitude: position.latitude,
            longitude: position.longitude,
            accuracy: position.accuracy,
            speed: position.speed ?? null,
            timestamp: position.timestamp,
          });
        },
        (error: string) => {
          // Log but don't crash
          console.warn('[HotStepper] Position error:', error);
          onError?.(error);
        }
      );

      this.positionWatchId = watchId;
      return watchId;
    } catch (error) {
      logNativeError('HotStepper.watchPosition', error);
      onError?.('Could not access GPS. Location services may be unavailable.');
      return null;
    }
  }

  // Clear position watch
  async clearPositionWatch(watchId: string): Promise<void> {
    try {
      await locationService.clearWatch(watchId);
    } catch (error) {
      logNativeError('HotStepper.clearPositionWatch', error);
    }
  }

  // Web simulation mode
  private startWebSimulation(): TrackingSession {
    this.currentSession = {
      id: `web-session-${Date.now()}`,
      startTime: new Date(),
      isActive: true,
    };

    // Start the health service simulation
    healthService.startBackgroundTracking();

    console.log('[HotStepper] Web simulation started');
    return this.currentSession;
  }

  // Check if tracking is active
  isTracking(): boolean {
    return this.currentSession?.isActive ?? false;
  }

  // Get current session
  getCurrentSession(): TrackingSession | null {
    return this.currentSession;
  }
}

// Export singleton instance
export const HotStepperService = new HotStepperServiceClass();
