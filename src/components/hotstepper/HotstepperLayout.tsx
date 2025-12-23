import React from 'react';
import { cn } from '@/lib/utils';
import { HotstepperBottomNav } from './HotstepperBottomNav';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HotstepperLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
  className?: string;
}

export function HotstepperLayout({ 
  children, 
  showBottomNav = true,
  showBackButton = false,
  onBack,
  className 
}: HotstepperLayoutProps) {
  return (
    <div className={cn(
      'hotstepper-theme min-h-screen bg-[hsl(210,28%,10%)] text-[hsl(0,0%,95%)]',
      className
    )}>
      {/* Background gradient */}
      <div className="fixed inset-0 gradient-tactical pointer-events-none" />
      
      {/* Back button */}
      {showBackButton && onBack && (
        <div className="fixed top-4 left-4 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[hsl(210,15%,15%)]/80 backdrop-blur-sm border border-[hsl(210,15%,25%)] hover:bg-[hsl(210,15%,20%)]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
      )}
      
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
