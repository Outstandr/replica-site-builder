import React from 'react';
import { cn } from '@/lib/utils';

interface DayData {
  date: string;
  steps: number;
  goal: number;
}

interface HotstepperWeekViewProps {
  weekData: DayData[];
  goal: number;
}

export function HotstepperWeekView({ weekData, goal }: HotstepperWeekViewProps) {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date().getDay();

  // Get last 7 days of data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const dayData = weekData.find(d => d.date === dateStr);
    return {
      dayIndex: date.getDay(),
      date: dateStr,
      steps: dayData?.steps || 0,
      isToday: i === 6,
    };
  });

  const maxSteps = Math.max(...last7Days.map(d => d.steps), goal);
  const totalSteps = last7Days.reduce((sum, d) => sum + d.steps, 0);
  const avgSteps = Math.round(totalSteps / 7);

  return (
    <div className="px-4 py-6">
      {/* Week Stats */}
      <div className="tactical-card rounded-xl p-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="tactical-label">Total Steps</span>
            <p className="text-2xl font-bold tabular-nums text-[hsl(186,100%,50%)]">
              {totalSteps.toLocaleString()}
            </p>
          </div>
          <div>
            <span className="tactical-label">Daily Average</span>
            <p className="text-2xl font-bold tabular-nums text-[hsl(0,0%,95%)]">
              {avgSteps.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="tactical-card rounded-xl p-4">
        <h3 className="tactical-label mb-4">This Week</h3>
        
        <div className="flex items-end justify-between gap-2 h-40">
          {last7Days.map((day, index) => {
            const heightPercent = maxSteps > 0 ? (day.steps / maxSteps) * 100 : 0;
            const hitGoal = day.steps >= goal;

            return (
              <div key={index} className="flex flex-col items-center gap-2 flex-1">
                {/* Bar */}
                <div className="relative w-full h-28 flex items-end justify-center">
                  <div
                    className={cn(
                      'w-full max-w-8 rounded-t-lg transition-all duration-500',
                      hitGoal 
                        ? 'bg-[hsl(186,100%,50%)] shadow-glow-sm'
                        : 'bg-[hsl(210,25%,25%)]',
                      day.isToday && 'ring-2 ring-[hsl(186,100%,50%)] ring-offset-2 ring-offset-[hsl(210,28%,10%)]'
                    )}
                    style={{ height: `${Math.max(heightPercent, 4)}%` }}
                  />
                </div>

                {/* Steps count */}
                <span className="text-[10px] text-[hsl(210,15%,55%)] tabular-nums">
                  {day.steps >= 1000 ? `${(day.steps / 1000).toFixed(1)}k` : day.steps}
                </span>

                {/* Day label */}
                <span className={cn(
                  'text-xs font-medium',
                  day.isToday 
                    ? 'text-[hsl(186,100%,50%)]' 
                    : 'text-[hsl(210,15%,55%)]'
                )}>
                  {days[day.dayIndex]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Goal line indicator */}
        <div className="mt-4 flex items-center gap-2">
          <div className="h-0.5 flex-1 bg-[hsl(186,100%,50%)/0.3] rounded" />
          <span className="text-xs text-[hsl(210,15%,55%)]">
            Goal: {goal.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
