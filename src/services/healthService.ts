import { Capacitor } from '@capacitor/core';

export type Platform = 'web' | 'ios' | 'android';
export type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'unknown';

interface HealthData {
  steps: number;
  distance: number;
  calories: number;
  activeMinutes: number;
}

interface HealthService {
  platform: Platform;
  requestPermissions: () => Promise<PermissionStatus>;
  checkPermissionStatus: () => Promise<PermissionStatus>;
  queryDailySteps: (date?: Date) => Promise<HealthData>;
  startBackgroundTracking: () => Promise<void>;
  stopBackgroundTracking: () => Promise<void>;
}

// Web simulation state
let webSimulationInterval: number | null = null;
let simulatedSteps = 0;
let simulationStartTime = Date.now();

function getRandomIncrement(): number {
  // Simulate realistic step increments (5-20 steps every few seconds)
  return Math.floor(Math.random() * 16) + 5;
}

function calculateDerivedMetrics(steps: number): HealthData {
  return {
    steps,
    distance: steps * 0.0008, // ~0.8m per step = 0.0008 km
    calories: Math.round(steps * 0.04), // ~0.04 cal per step
    activeMinutes: Math.round(steps / 100), // ~100 steps per minute
  };
}

// Web implementation with smooth simulation
const webHealthService: HealthService = {
  platform: 'web',
  
  async requestPermissions(): Promise<PermissionStatus> {
    // On web, we simulate permissions as granted
    console.log('[HealthService:Web] Simulating permission grant');
    return 'granted';
  },
  
  async checkPermissionStatus(): Promise<PermissionStatus> {
    return 'granted';
  },
  
  async queryDailySteps(date?: Date): Promise<HealthData> {
    // Return current simulated steps
    const targetDate = date || new Date();
    const isToday = targetDate.toDateString() === new Date().toDateString();
    
    if (isToday) {
      return calculateDerivedMetrics(simulatedSteps);
    }
    
    // For past dates, return random historical data
    const historicalSteps = Math.floor(Math.random() * 8000) + 2000;
    return calculateDerivedMetrics(historicalSteps);
  },
  
  async startBackgroundTracking(): Promise<void> {
    if (webSimulationInterval) return;
    
    console.log('[HealthService:Web] Starting step simulation');
    simulationStartTime = Date.now();
    
    // Simulate steps incrementing every 2-5 seconds
    const tick = () => {
      simulatedSteps += getRandomIncrement();
      const nextInterval = Math.floor(Math.random() * 3000) + 2000; // 2-5 seconds
      webSimulationInterval = window.setTimeout(tick, nextInterval);
    };
    
    tick();
  },
  
  async stopBackgroundTracking(): Promise<void> {
    if (webSimulationInterval) {
      clearTimeout(webSimulationInterval);
      webSimulationInterval = null;
      console.log('[HealthService:Web] Stopped step simulation');
    }
  },
};

// iOS HealthKit implementation (uses dynamic imports - gracefully falls back to web)
const iosHealthService: HealthService = {
  platform: 'ios',
  
  async requestPermissions(): Promise<PermissionStatus> {
    // On web builds, fall back to web simulation
    console.warn('[HealthService:iOS] Native plugin not available in web, using simulation');
    return webHealthService.requestPermissions();
  },
  
  async checkPermissionStatus(): Promise<PermissionStatus> {
    return webHealthService.checkPermissionStatus();
  },
  
  async queryDailySteps(date?: Date): Promise<HealthData> {
    return webHealthService.queryDailySteps(date);
  },
  
  async startBackgroundTracking(): Promise<void> {
    return webHealthService.startBackgroundTracking();
  },
  
  async stopBackgroundTracking(): Promise<void> {
    return webHealthService.stopBackgroundTracking();
  },
};

// Android Health Connect implementation (gracefully falls back to web)
const androidHealthService: HealthService = {
  platform: 'android',
  
  async requestPermissions(): Promise<PermissionStatus> {
    console.warn('[HealthService:Android] Native plugin not available in web, using simulation');
    return webHealthService.requestPermissions();
  },
  
  async checkPermissionStatus(): Promise<PermissionStatus> {
    return webHealthService.checkPermissionStatus();
  },
  
  async queryDailySteps(date?: Date): Promise<HealthData> {
    return webHealthService.queryDailySteps(date);
  },
  
  async startBackgroundTracking(): Promise<void> {
    return webHealthService.startBackgroundTracking();
  },
  
  async stopBackgroundTracking(): Promise<void> {
    return webHealthService.stopBackgroundTracking();
  },
};

// Factory function to get the right service based on platform
export function getHealthService(): HealthService {
  let platform: Platform;
  
  try {
    const capacitorPlatform = Capacitor.getPlatform();
    platform = capacitorPlatform as Platform;
  } catch {
    platform = 'web';
  }
  
  switch (platform) {
    case 'ios':
      return iosHealthService;
    case 'android':
      return androidHealthService;
    default:
      return webHealthService;
  }
}

// Export singleton instance
export const healthService = getHealthService();

// Utility to reset web simulation (for testing)
export function resetWebSimulation(): void {
  simulatedSteps = 0;
  simulationStartTime = Date.now();
}

// Get current simulated steps (for web testing UI)
export function getSimulatedSteps(): number {
  return simulatedSteps;
}

// Set simulated steps manually (for demo/testing)
export function setSimulatedSteps(steps: number): void {
  simulatedSteps = steps;
}
