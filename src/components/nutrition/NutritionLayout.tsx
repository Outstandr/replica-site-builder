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
      "min-h-screen nutrition-theme",
      className
    )}>
      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 gradient-nutrition pointer-events-none" />
      
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
