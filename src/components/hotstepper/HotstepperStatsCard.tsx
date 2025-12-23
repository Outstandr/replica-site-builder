import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HotstepperStatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  className?: string;
  iconColor?: string;
}

export function HotstepperStatsCard({
  icon: Icon,
  label,
  value,
  unit,
  className,
  iconColor = 'text-[hsl(186,100%,50%)]',
}: HotstepperStatsCardProps) {
  return (
    <div className={cn(
      'tactical-card rounded-xl p-4 stats-card-hover press-scale',
      className
    )}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn('w-4 h-4', iconColor)} />
        <span className="tactical-label">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold tabular-nums text-[hsl(0,0%,95%)]">
          {value}
        </span>
        {unit && (
          <span className="text-sm text-[hsl(210,15%,55%)]">{unit}</span>
        )}
      </div>
    </div>
  );
}
