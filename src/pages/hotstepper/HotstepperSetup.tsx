import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MapPin, Check, AlertCircle, ArrowRight, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HotstepperLayout } from '@/components/hotstepper/HotstepperLayout';
import { healthService, PermissionStatus } from '@/services/healthService';
import { locationService, LocationPermissionStatus } from '@/services/locationService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type Step = 'health' | 'location' | 'complete';

interface PermissionStep {
  id: Step;
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
}

const steps: PermissionStep[] = [
  {
    id: 'health',
    title: 'Health Access',
    description: 'Allow HotStepper to read your step count from your device\'s health app for accurate tracking.',
    icon: Heart,
    iconColor: 'text-rose-400',
  },
  {
    id: 'location',
    title: 'Location Access',
    description: 'Enable GPS tracking to map your runs and calculate distance traveled in real-time.',
    icon: MapPin,
    iconColor: 'text-green-400',
  },
];

export default function HotstepperSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('health');
  const [healthStatus, setHealthStatus] = useState<PermissionStatus>('unknown');
  const [locationStatus, setLocationStatus] = useState<LocationPermissionStatus>('prompt');
  const [isRequesting, setIsRequesting] = useState(false);

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const currentStepData = steps[currentStepIndex];

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    
    try {
      if (currentStep === 'health') {
        const status = await healthService.requestPermissions();
        setHealthStatus(status);
        
        // Start background tracking on web for simulation
        if (healthService.platform === 'web') {
          await healthService.startBackgroundTracking();
        }
        
        // Move to next step regardless of status
        setCurrentStep('location');
      } else if (currentStep === 'location') {
        const status = await locationService.requestPermissions();
        setLocationStatus(status);
        
        // Complete setup
        await completeSetup();
      }
    } catch (error) {
      console.error('Permission request failed:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSkip = async () => {
    if (currentStep === 'health') {
      setCurrentStep('location');
    } else if (currentStep === 'location') {
      await completeSetup();
    }
  };

  const completeSetup = async () => {
    // Mark onboarding as complete in profile
    if (user) {
      await supabase
        .from('profiles')
        .update({ hotstepper_onboarded: true })
        .eq('user_id', user.id);
    }
    
    setCurrentStep('complete');
    
    // Navigate to dashboard after brief delay
    setTimeout(() => {
      navigate('/hotstepper');
    }, 1500);
  };

  const openSettings = () => {
    // On native, this would open app settings
    // On web, we show a message
    if (healthService.platform === 'web') {
      alert('On a real device, this would open your device settings to enable permissions.');
    }
  };

  if (currentStep === 'complete') {
    return (
      <HotstepperLayout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-24 h-24 rounded-full bg-[hsl(186,100%,50%)]/20 flex items-center justify-center mb-6"
          >
            <Check className="w-12 h-12 text-[hsl(186,100%,50%)]" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-white text-center mb-2"
          >
            You're All Set!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[hsl(210,15%,55%)] text-center"
          >
            Redirecting to your dashboard...
          </motion.p>
        </div>
      </HotstepperLayout>
    );
  }

  return (
    <HotstepperLayout showBackButton onBack={() => navigate('/modules')}>
      <div className="flex flex-col min-h-[80vh] px-6 py-8">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`h-2 rounded-full transition-all duration-300 ${
                index <= currentStepIndex
                  ? 'w-8 bg-[hsl(186,100%,50%)]'
                  : 'w-2 bg-[hsl(210,15%,25%)]'
              }`}
            />
          ))}
        </div>

        {/* Current step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col items-center"
          >
            {/* Icon */}
            <div className={`w-20 h-20 rounded-full bg-[hsl(210,15%,15%)] flex items-center justify-center mb-6 border border-[hsl(210,15%,25%)]`}>
              {currentStepData && (
                <currentStepData.icon className={`w-10 h-10 ${currentStepData.iconColor}`} />
              )}
            </div>

            {/* Title & Description */}
            <h2 className="text-2xl font-bold text-white text-center mb-3">
              {currentStepData?.title}
            </h2>
            <p className="text-[hsl(210,15%,55%)] text-center max-w-xs mb-8">
              {currentStepData?.description}
            </p>

            {/* Permission status indicator */}
            {currentStep === 'health' && healthStatus === 'denied' && (
              <div className="flex items-center gap-2 text-amber-400 mb-4">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Permission denied</span>
              </div>
            )}
            {currentStep === 'location' && locationStatus === 'denied' && (
              <div className="flex items-center gap-2 text-amber-400 mb-4">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Permission denied</span>
              </div>
            )}

            {/* Platform indicator for web */}
            {healthService.platform === 'web' && currentStep === 'health' && (
              <div className="bg-[hsl(210,15%,15%)] rounded-lg px-4 py-2 mb-6 border border-[hsl(210,15%,25%)]">
                <p className="text-xs text-[hsl(210,15%,55%)]">
                  📱 Web Preview Mode - Steps will be simulated for testing
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Action buttons */}
        <div className="space-y-3 mt-auto">
          <Button
            onClick={handleRequestPermission}
            disabled={isRequesting}
            className="w-full h-14 bg-[hsl(186,100%,50%)] hover:bg-[hsl(186,100%,45%)] text-[hsl(210,28%,10%)] font-bold text-lg glow-cyan"
          >
            {isRequesting ? (
              <span className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                />
                Requesting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Allow Access
                <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </Button>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="flex-1 text-[hsl(210,15%,55%)] hover:text-white hover:bg-[hsl(210,15%,15%)]"
            >
              Skip for Now
            </Button>
            
            {(healthStatus === 'denied' || locationStatus === 'denied') && (
              <Button
                variant="ghost"
                onClick={openSettings}
                className="flex-1 text-[hsl(210,15%,55%)] hover:text-white hover:bg-[hsl(210,15%,15%)]"
              >
                <Settings className="w-4 h-4 mr-2" />
                Open Settings
              </Button>
            )}
          </div>
        </div>
      </div>
    </HotstepperLayout>
  );
}
