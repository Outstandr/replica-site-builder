import React from 'react';
import { Flame, MapPin, Clock, Zap, Footprints } from 'lucide-react';
import { HotstepperProgressRing } from './HotstepperProgressRing';
import { HotstepperStatsCard } from './HotstepperStatsCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface HotstepperDayViewProps {
  steps: number;
  goal: number;
  distance: number;
  calories: number;
  activeMinutes: number;
  streak: number;
}

export function HotstepperDayView({
  steps,
  goal,
  distance,
  calories,
  activeMinutes,
  streak,
}: HotstepperDayViewProps) {
  const navigate = useNavigate();
  const progress = Math.min((steps / goal) * 100, 100);

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-6">
      {/* Progress Ring */}
      <HotstepperProgressRing progress={progress} size={220} strokeWidth={14}>
        <div className="flex flex-col items-center">
          <Footprints className="w-8 h-8 text-[hsl(186,100%,50%)] mb-2" />
          <span className="text-4xl font-bold tabular-nums text-glow-cyan">
            {steps.toLocaleString()}
          </span>
          <span className="text-sm text-[hsl(210,15%,55%)] mt-1">
            / {goal.toLocaleString()} steps
          </span>
        </div>
      </HotstepperProgressRing>

      {/* Goal Progress Text */}
      <div className="text-center">
        <span className={cn(
          'text-lg font-semibold',
          progress >= 100 ? 'text-green-400' : 'text-[hsl(186,100%,50%)]'
        )}>
          {progress >= 100 ? '🎉 Goal Achieved!' : `${Math.round(progress)}% Complete`}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        <HotstepperStatsCard
          icon={Flame}
          label="Streak"
          value={streak}
          unit="days"
          iconColor="text-orange-400"
        />
        <HotstepperStatsCard
          icon={Zap}
          label="Calories"
          value={calories}
          unit="kcal"
          iconColor="text-yellow-400"
        />
        <HotstepperStatsCard
          icon={MapPin}
          label="Distance"
          value={distance.toFixed(2)}
          unit="km"
          iconColor="text-green-400"
        />
        <HotstepperStatsCard
          icon={Clock}
          label="Active"
          value={activeMinutes}
          unit="min"
          iconColor="text-purple-400"
        />
      </div>

      {/* Start Session Button */}
      <Button
        onClick={() => navigate('/hotstepper/active')}
        className="w-full max-w-sm h-14 bg-[hsl(186,100%,50%)] hover:bg-[hsl(186,100%,45%)] text-[hsl(210,28%,10%)] font-bold text-lg uppercase tracking-wider glow-cyan press-scale mt-4"
      >
        <Footprints className="w-5 h-5 mr-2" />
        Start Active Session
      </Button>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
