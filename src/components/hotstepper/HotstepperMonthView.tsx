import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DayData {
  date: string;
  steps: number;
}

interface HotstepperMonthViewProps {
  monthData: DayData[];
  goal: number;
  currentMonth: Date;
  onMonthChange: (direction: 'prev' | 'next') => void;
}

export function HotstepperMonthView({ 
  monthData, 
  goal, 
  currentMonth,
  onMonthChange 
}: HotstepperMonthViewProps) {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Create calendar grid
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const getDataForDay = (day: number): DayData | undefined => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return monthData.find(d => d.date === dateStr);
  };

  const daysHitGoal = monthData.filter(d => d.steps >= goal).length;
  const totalSteps = monthData.reduce((sum, d) => sum + d.steps, 0);

  return (
    <div className="px-4 py-6">
      {/* Month Stats */}
      <div className="tactical-card rounded-xl p-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="tactical-label">Total Steps</span>
            <p className="text-2xl font-bold tabular-nums text-[hsl(186,100%,50%)]">
              {totalSteps.toLocaleString()}
            </p>
          </div>
          <div>
            <span className="tactical-label">Goals Hit</span>
            <p className="text-2xl font-bold tabular-nums text-green-400">
              {daysHitGoal} <span className="text-sm text-[hsl(210,15%,55%)]">days</span>
            </p>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="tactical-card rounded-xl p-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => onMonthChange('prev')}
            className="p-2 rounded-lg hover:bg-[hsl(210,25%,20%)] press-scale"
          >
            <ChevronLeft className="w-5 h-5 text-[hsl(210,15%,55%)]" />
          </button>
          <h3 className="text-lg font-semibold">
            {monthNames[month]} {year}
          </h3>
          <button
            onClick={() => onMonthChange('next')}
            className="p-2 rounded-lg hover:bg-[hsl(210,25%,20%)] press-scale"
          >
            <ChevronRight className="w-5 h-5 text-[hsl(210,15%,55%)]" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {days.map((day, i) => (
            <div key={i} className="text-center text-xs text-[hsl(210,15%,55%)] font-medium py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={index} className="aspect-square" />;
            }

            const data = getDataForDay(day);
            const hitGoal = data && data.steps >= goal;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const isFuture = new Date(dateStr) > today;

            return (
              <div
                key={index}
                className={cn(
                  'aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all',
                  hitGoal && 'bg-[hsl(186,100%,50%)] text-[hsl(210,28%,10%)]',
                  !hitGoal && data && 'bg-[hsl(210,25%,20%)]',
                  !data && !isFuture && 'bg-[hsl(210,25%,15%)]',
                  isFuture && 'text-[hsl(210,15%,35%)]',
                  isToday && 'ring-2 ring-[hsl(186,100%,50%)] ring-offset-1 ring-offset-[hsl(210,28%,14%)]'
                )}
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-[hsl(210,15%,55%)]">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[hsl(186,100%,50%)]" />
            <span>Goal Hit</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[hsl(210,25%,20%)]" />
            <span>Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
