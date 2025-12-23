import { cn } from '@/lib/utils';

interface NutritionRadarScanProps {
  className?: string;
}

export default function NutritionRadarScan({ className }: NutritionRadarScanProps) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Radar circles */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border border-cyan-400/20"
            style={{
              width: `${i * 33}%`,
              height: `${i * 33}%`,
            }}
          />
        ))}
      </div>

      {/* Radar sweep */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="w-full h-full animate-radar-scan"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, hsl(186 100% 50% / 0.3) 30deg, transparent 60deg)'
          }}
        />
      </div>

      {/* Pulsing rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-2 border-cyan-400/40 animate-radar-sweep" />
        <div className="absolute w-24 h-24 rounded-full border border-cyan-400/20 animate-radar-sweep animation-delay-500" />
      </div>

      {/* Center point */}
      <div className="relative w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_20px_hsl(186,100%,50%)]" />

      {/* Status text */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <span className="text-cyan-400 text-sm font-mono uppercase tracking-widest animate-pulse">
          Analyzing Target...
        </span>
      </div>
    </div>
  );
}
