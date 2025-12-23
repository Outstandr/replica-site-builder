import { ReactNode } from 'react';
import NutritionBottomNav from './NutritionBottomNav';
import { cn } from '@/lib/utils';

interface NutritionLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
  className?: string;
}

export default function NutritionLayout({ 
  children, 
  showBottomNav = true,
  className 
}: NutritionLayoutProps) {
  return (
    <div className={cn(
      "min-h-screen-safe nutrition-theme bg-zinc-950 text-zinc-100 no-overscroll",
      className
    )}>
      {/* Tactical grid overlay */}
      <div className="fixed inset-0 tactical-grid pointer-events-none opacity-50" />
      
      {/* Main content */}
      <div className={cn(
        "relative z-10",
        showBottomNav && "pb-24"
      )}>
        {children}
      </div>

      {showBottomNav && <NutritionBottomNav />}
    </div>
  );
}
