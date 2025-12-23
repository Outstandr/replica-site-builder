import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import { HotstepperLayout } from '@/components/hotstepper/HotstepperLayout';
import { HotstepperDashboardTabs } from '@/components/hotstepper/HotstepperDashboardTabs';
import { HotstepperDayView } from '@/components/hotstepper/HotstepperDayView';
import { HotstepperWeekView } from '@/components/hotstepper/HotstepperWeekView';
import { HotstepperMonthView } from '@/components/hotstepper/HotstepperMonthView';
import { useHotstepperHealth, useHotstepperStreak } from '@/hooks/hotstepper';
import { Button } from '@/components/ui/button';

export default function HotstepperDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'month'>('day');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const { healthData, weeklyData, addSteps } = useHotstepperHealth();
  const { streak } = useHotstepperStreak();

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() + (direction === 'next' ? 1 : -1));
      return newMonth;
    });
  };

  return (
    <HotstepperLayout>
      {/* Header */}
      <header className="header-safe px-4 pb-4">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg hover:bg-[hsl(210,25%,20%)] press-scale"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold uppercase tracking-wider text-glow-cyan">
            HotStepper
          </h1>
          <div className="w-9" />
        </div>

        {/* Tabs */}
        <HotstepperDashboardTabs activeTab={activeTab} onChange={setActiveTab} />
      </header>

      {/* Content */}
      <main className="scroll-container rubber-band-scroll">
        {activeTab === 'day' && (
          <HotstepperDayView
            steps={healthData.steps}
            goal={healthData.goal}
            distance={healthData.distance}
            calories={healthData.calories}
            activeMinutes={healthData.activeMinutes}
            streak={streak.currentStreak}
          />
        )}

        {activeTab === 'week' && (
          <HotstepperWeekView
            weekData={weeklyData.map(d => ({
              date: d.date,
              steps: d.steps,
              goal: healthData.goal,
            }))}
            goal={healthData.goal}
          />
        )}

        {activeTab === 'month' && (
          <HotstepperMonthView
            monthData={weeklyData.map(d => ({
              date: d.date,
              steps: d.steps,
            }))}
            goal={healthData.goal}
            currentMonth={currentMonth}
            onMonthChange={handleMonthChange}
          />
        )}

        {/* Demo: Add steps button */}
        <div className="px-4 pb-6">
          <div className="tactical-card rounded-xl p-4">
            <p className="tactical-label mb-3 text-center">Demo: Add Steps</p>
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={() => addSteps(100)}
                className="bg-[hsl(210,25%,25%)] hover:bg-[hsl(210,25%,30%)] press-scale"
              >
                <Plus className="w-4 h-4 mr-1" /> 100
              </Button>
              <Button
                onClick={() => addSteps(1000)}
                className="bg-[hsl(186,100%,50%)] hover:bg-[hsl(186,100%,45%)] text-[hsl(210,28%,10%)] press-scale"
              >
                <Plus className="w-4 h-4 mr-1" /> 1,000
              </Button>
            </div>
          </div>
        </div>
      </main>
    </HotstepperLayout>
  );
}
