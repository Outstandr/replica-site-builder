import React from 'react';
import { cn } from '@/lib/utils';

type TabType = 'day' | 'week' | 'month';

interface HotstepperDashboardTabsProps {
  activeTab: TabType;
  onChange: (tab: TabType) => void;
}

export function HotstepperDashboardTabs({ activeTab, onChange }: HotstepperDashboardTabsProps) {
  const tabs: { key: TabType; label: string }[] = [
    { key: 'day', label: 'Day' },
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
  ];

  return (
    <div className="flex items-center justify-center gap-2 p-1 bg-[hsl(210,28%,14%)] rounded-xl">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            'px-6 py-2 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all duration-200 press-scale',
            activeTab === tab.key
              ? 'bg-[hsl(186,100%,50%)] text-[hsl(210,28%,10%)] shadow-glow-sm'
              : 'text-[hsl(210,15%,55%)] hover:text-[hsl(0,0%,95%)]'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
