import { ReactNode } from "react";
import { Sparkles, Star, Heart, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import BottomTabBar from "./BottomTabBar";

interface MobileLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
  className?: string;
  accentColor?: string;
}

const MobileLayout = ({ 
  children, 
  showBottomNav = true, 
  className,
  accentColor = "primary"
}: MobileLayoutProps) => {
  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-20 -right-20 w-72 h-72 md:w-96 md:h-96 rounded-full blur-3xl animate-float opacity-30"
          style={{ background: `linear-gradient(135deg, hsl(var(--primary) / 0.3), hsl(var(--secondary) / 0.3))` }}
        />
        <div 
          className="absolute -bottom-20 -left-20 w-64 h-64 md:w-80 md:h-80 rounded-full blur-3xl animate-float opacity-30"
          style={{ animationDelay: '2s', background: `linear-gradient(135deg, hsl(var(--accent) / 0.3), hsl(var(--secondary) / 0.3))` }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 rounded-full blur-3xl animate-float opacity-20"
          style={{ animationDelay: '4s', background: `linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--accent) / 0.2))` }}
        />
      </div>

      {/* Grid Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(hsl(var(--foreground)/0.02)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--foreground)/0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Floating Particles - Hidden on mobile for performance */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none hidden md:block">
        <Sparkles className="absolute top-32 left-20 w-4 h-4 text-primary/30 animate-scale-pulse" />
        <Star className="absolute top-48 right-32 w-3 h-3 text-secondary/30 animate-scale-pulse" style={{ animationDelay: '1s' }} />
        <Heart className="absolute bottom-64 left-1/4 w-4 h-4 text-accent/30 animate-scale-pulse" style={{ animationDelay: '2s' }} />
        <Zap className="absolute top-1/3 right-20 w-3 h-3 text-primary/30 animate-scale-pulse" style={{ animationDelay: '3s' }} />
      </div>

      {/* Main Content */}
      <div className={cn(
        "relative z-10",
        showBottomNav && "pb-20", // Add padding for bottom nav
        className
      )}>
        {children}
      </div>

      {/* Bottom Tab Bar */}
      {showBottomNav && <BottomTabBar />}
    </div>
  );
};

export default MobileLayout;
