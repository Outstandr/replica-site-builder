import React from 'react';
import { MapPin, Satellite, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HotstepperMapPlaceholderProps {
  gpsStatus: 'inactive' | 'acquiring' | 'active' | 'error';
  error?: string | null;
  onRetry?: () => void;
  onUseStepsOnly?: () => void;
}

export function HotstepperMapPlaceholder({
  gpsStatus,
  error,
  onRetry,
  onUseStepsOnly,
}: HotstepperMapPlaceholderProps) {
  return (
    <div className="relative w-full h-64 rounded-xl overflow-hidden bg-[hsl(210,28%,12%)]">
      {/* Grid pattern background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(186, 100%, 50%, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(186, 100%, 50%, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        {gpsStatus === 'acquiring' && (
          <>
            <div className="relative mb-4">
              <Satellite className="w-12 h-12 text-[hsl(186,100%,50%)] animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 bg-[hsl(186,100%,50%)] rounded-full animate-satellite" />
              </div>
            </div>
            <p className="text-[hsl(186,100%,50%)] font-semibold mb-1">
              Acquiring GPS Signal...
            </p>
            <p className="text-sm text-[hsl(210,15%,55%)] text-center">
              Make sure you're in an open area
            </p>
          </>
        )}

        {gpsStatus === 'error' && (
          <>
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-red-400 font-semibold mb-1">GPS Error</p>
            <p className="text-sm text-[hsl(210,15%,55%)] text-center mb-4">
              {error || 'Unable to get your location'}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={onRetry}
                variant="outline"
                className="border-[hsl(186,100%,50%)] text-[hsl(186,100%,50%)] hover:bg-[hsl(186,100%,50%)/0.1]"
              >
                Retry GPS
              </Button>
              <Button
                onClick={onUseStepsOnly}
                className="bg-[hsl(210,25%,25%)] hover:bg-[hsl(210,25%,30%)]"
              >
                Use Steps Only
              </Button>
            </div>
          </>
        )}

        {gpsStatus === 'inactive' && (
          <>
            <MapPin className="w-12 h-12 text-[hsl(210,15%,55%)] mb-4 animate-pin-bounce" />
            <p className="text-[hsl(210,15%,55%)] font-semibold mb-1">
              Map Ready
            </p>
            <p className="text-sm text-[hsl(210,15%,45%)] text-center">
              Start a session to track your route
            </p>
          </>
        )}
      </div>
    </div>
  );
}
