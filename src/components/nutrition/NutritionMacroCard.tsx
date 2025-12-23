import { cn } from '@/lib/utils';

interface NutritionMacroCardProps {
  label: string;
  current: number;
  goal: number;
  unit?: string;
  color: 'protein' | 'carbs' | 'fats';
}

const colorMap = {
  protein: {
    text: 'text-green-400',
    bg: 'bg-green-400',
    glow: 'shadow-[0_0_10px_hsl(142,76%,36%/0.3)]'
  },
  carbs: {
    text: 'text-yellow-400',
    bg: 'bg-yellow-400',
    glow: 'shadow-[0_0_10px_hsl(45,93%,47%/0.3)]'
  },
  fats: {
    text: 'text-rose-400',
    bg: 'bg-rose-400',
    glow: 'shadow-[0_0_10px_hsl(350,89%,60%/0.3)]'
  }
};

export default function NutritionMacroCard({ 
  label, 
  current, 
  goal, 
  unit = 'g',
  color 
}: NutritionMacroCardProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  const colors = colorMap[color];

  return (
    <div className="nutrition-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-zinc-500 text-xs uppercase tracking-wider">{label}</span>
        <span className={cn("text-xs", colors.text)}>
          {current}/{goal}{unit}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
            colors.bg,
            colors.glow
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Current value */}
      <div className="mt-2 flex items-center gap-2">
        <span className={cn("text-2xl font-bold tabular-nums", colors.text)}>
          {current}
        </span>
        <span className="text-zinc-600 text-sm">{unit}</span>
      </div>
    </div>
  );
}
