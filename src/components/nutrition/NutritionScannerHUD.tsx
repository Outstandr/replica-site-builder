import { cn } from '@/lib/utils';

interface NutritionScannerHUDProps {
  children?: React.ReactNode;
  className?: string;
}

export default function NutritionScannerHUD({ children, className }: NutritionScannerHUDProps) {
  return (
    <div className={cn(
      "relative w-full aspect-[4/3] max-w-md mx-auto",
      className
    )}>
      {/* HUD corners */}
      <div className="hud-corner hud-corner-tl border-cyan-400" />
      <div className="hud-corner hud-corner-tr border-cyan-400" />
      <div className="hud-corner hud-corner-bl border-cyan-400" />
      <div className="hud-corner hud-corner-br border-cyan-400" />

      {/* Inner content area */}
      <div className="absolute inset-4 flex items-center justify-center bg-zinc-900/50 rounded-lg overflow-hidden">
        {children}
      </div>

      {/* Crosshair */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-12 h-12">
          {/* Horizontal line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-400/30" />
          {/* Vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-400/30" />
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-cyan-400 rounded-full opacity-50" />
        </div>
      </div>

      {/* Scan line effect (shown when scanning) */}
    </div>
  );
}
