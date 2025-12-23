import React from 'react';
import { cn } from '@/lib/utils';
import { HotstepperBottomNav } from './HotstepperBottomNav';

interface HotstepperLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
  className?: string;
}

export function HotstepperLayout({ 
  children, 
  showBottomNav = true,
  className 
}: HotstepperLayoutProps) {
  return (
    <div className={cn(
      'hotstepper-theme min-h-screen bg-[hsl(210,28%,10%)] text-[hsl(0,0%,95%)]',
      className
    )}>
      {/* Background gradient */}
      <div className="fixed inset-0 gradient-tactical pointer-events-none" />
      
      {/* Content */}
      <div className={cn(
        'relative z-10',
        showBottomNav && 'pb-20'
      )}>
        {children}
      </div>

      {/* Bottom Navigation */}
      {showBottomNav && <HotstepperBottomNav />}
    </div>
  );
}
