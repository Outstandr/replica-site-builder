import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { MealLog } from '@/hooks/nutrition';
import { cn } from '@/lib/utils';

interface NutritionMealCardProps {
  meal: MealLog;
  onDelete?: (id: string) => void;
  showDelete?: boolean;
}

export default function NutritionMealCard({ 
  meal, 
  onDelete,
  showDelete = false 
}: NutritionMealCardProps) {
  const time = format(new Date(meal.created_at), 'HH:mm');

  return (
    <div className="nutrition-card p-4 flex items-center gap-4">
      {/* Time badge */}
      <div className="flex-shrink-0 w-14 text-center">
        <span className="text-cyan-400 text-sm font-mono">{time}</span>
      </div>

      {/* Meal info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-medium truncate">{meal.meal_name}</h4>
        <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
          <span className="text-green-400">P:{meal.protein}g</span>
          <span className="text-yellow-400">C:{meal.carbs}g</span>
          <span className="text-rose-400">F:{meal.fats}g</span>
        </div>
      </div>

      {/* Calories */}
      <div className="flex-shrink-0 text-right">
        <span className="text-xl font-bold text-cyan-400 tabular-nums">
          {meal.calories}
        </span>
        <span className="text-zinc-500 text-xs ml-1">cal</span>
      </div>

      {/* Delete button */}
      {showDelete && onDelete && (
        <button
          onClick={() => onDelete(meal.id)}
          className="flex-shrink-0 p-2 text-zinc-500 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
