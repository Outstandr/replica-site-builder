import React from 'react';
import { Clock, MapPin, Gauge, Footprints, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HotstepperSessionStatsProps {
  duration: number; // seconds
  distance: number; // km
  pace: number; // min/km
  speed: number; // km/h
  steps: number;
  dataSource: 'gps' | 'steps';
}

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function formatPace(pace: number): string {
  if (pace <= 0 || !isFinite(pace)) return '--:--';
  const mins = Math.floor(pace);
  const secs = Math.round((pace - mins) * 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export function HotstepperSessionStats({
  duration,
  distance,
  pace,
  speed,
  steps,
  dataSource,
}: HotstepperSessionStatsProps) {
  return (
    <div className="space-y-4">
      {/* Duration - Large display */}
      <div className="tactical-card rounded-xl p-6 text-center">
        <Clock className="w-6 h-6 text-[hsl(186,100%,50%)] mx-auto mb-2" />
        <p className="text-4xl font-bold tabular-nums animate-timer-glow">
          {formatDuration(duration)}
        </p>
        <p className="tactical-label mt-1">Duration</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Distance */}
        <div className="tactical-card rounded-xl p-4 text-center">
          <MapPin className="w-5 h-5 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold tabular-nums">
            {distance.toFixed(2)}
          </p>
          <p className="tactical-label">km</p>
        </div>

        {/* Pace */}
        <div className="tactical-card rounded-xl p-4 text-center">
          <Gauge className="w-5 h-5 text-orange-400 mx-auto mb-2" />
          <p className="text-2xl font-bold tabular-nums">
            {formatPace(pace)}
          </p>
          <p className="tactical-label">min/km</p>
        </div>

        {/* Speed */}
        <div className="tactical-card rounded-xl p-4 text-center">
          <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
          <p className="text-2xl font-bold tabular-nums">
            {speed.toFixed(1)}
          </p>
          <p className="tactical-label">km/h</p>
        </div>

        {/* Steps */}
        <div className="tactical-card rounded-xl p-4 text-center">
          <Footprints className="w-5 h-5 text-[hsl(186,100%,50%)] mx-auto mb-2" />
          <p className="text-2xl font-bold tabular-nums">
            {steps.toLocaleString()}
          </p>
          <p className="tactical-label">steps</p>
        </div>
      </div>

      {/* Data Source Badge */}
      <div className="flex justify-center">
        <div className={cn(
          'px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider',
          dataSource === 'gps' 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-[hsl(186,100%,50%)/0.2] text-[hsl(186,100%,50%)] border border-[hsl(186,100%,50%)/0.3]'
        )}>
          {dataSource === 'gps' ? '📡 GPS Tracking' : '👟 Step Counter'}
        </div>
      </div>
    </div>
  );
}
