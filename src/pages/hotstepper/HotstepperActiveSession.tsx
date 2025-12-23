import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Square, Footprints } from 'lucide-react';
import { HotstepperLayout } from '@/components/hotstepper/HotstepperLayout';
import HotstepperMap from '@/components/hotstepper/HotstepperMap';
import { HotstepperSessionStats } from '@/components/hotstepper/HotstepperSessionStats';
import { useHotstepperSession, useHotstepperLocation, useHotstepperHealth } from '@/hooks/hotstepper';
import { Button } from '@/components/ui/button';

export default function HotstepperActiveSession() {
  const navigate = useNavigate();
  const { session, startSession, updateSessionData, endSession } = useHotstepperSession();
  const location = useHotstepperLocation();
  const { addSteps } = useHotstepperHealth();

  // Start session and GPS on mount if not already active
  useEffect(() => {
    if (!session.isActive) {
      startSession('gps');
      location.startTracking();
    }
  }, []);

  // Sync location data to session
  useEffect(() => {
    if (location.isTracking) {
      updateSessionData({
        distance: location.totalDistance,
        avgSpeed: location.avgSpeed,
        maxSpeed: location.maxSpeed,
        routePoints: location.routePoints,
      });
    }
  }, [location.totalDistance, location.avgSpeed, location.routePoints]);

  const handleEndSession = async () => {
    location.stopTracking();
    const completedSession = await endSession();
    
    if (completedSession) {
      // Add session steps to daily total
      await addSteps(completedSession.steps || Math.round(completedSession.distance * 1300));
    }
    
    navigate('/hotstepper');
  };

  const handleUseStepsOnly = () => {
    location.stopTracking();
    updateSessionData({ dataSource: 'steps' });
  };

  return (
    <HotstepperLayout showBottomNav={false}>
      {/* Header */}
      <header className="header-safe px-4 pb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/hotstepper')}
            className="p-2 rounded-lg hover:bg-[hsl(210,25%,20%)] press-scale"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Footprints className="w-5 h-5 text-[hsl(186,100%,50%)]" />
            <h1 className="text-lg font-bold uppercase tracking-wider">
              Active Session
            </h1>
          </div>
          <div className="w-9" />
        </div>
      </header>

      {/* Map Area */}
      <div className="px-4 mb-4">
        <HotstepperMap
          routePoints={location.routePoints}
          currentPosition={location.currentPosition ? {
            lat: location.currentPosition.latitude,
            lng: location.currentPosition.longitude
          } : null}
          isTracking={location.isTracking}
          className="h-64 rounded-xl"
        />
      </div>

      {/* Session Stats */}
      <div className="px-4 mb-6">
        <HotstepperSessionStats
          duration={session.duration}
          distance={session.distance || location.totalDistance}
          pace={session.avgPace || (location.avgSpeed > 0 ? 60 / location.avgSpeed : 0)}
          speed={location.currentSpeed}
          steps={session.steps || Math.round((session.distance || location.totalDistance) * 1300)}
          dataSource={session.dataSource}
        />
      </div>

      {/* End Session Button */}
      <div className="px-4 safe-area-pb">
        <Button
          onClick={handleEndSession}
          className="w-full h-14 bg-red-500 hover:bg-red-600 text-white font-bold text-lg uppercase tracking-wider press-scale"
        >
          <Square className="w-5 h-5 mr-2 fill-current" />
          End Session
        </Button>
      </div>
    </HotstepperLayout>
  );
}
