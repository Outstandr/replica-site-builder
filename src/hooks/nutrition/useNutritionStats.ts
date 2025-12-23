import { useMemo } from 'react';
import { MealLog } from './useNutritionLogs';

export interface NutritionStats {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatsGoal: number;
  calorieProgress: number;
  proteinProgress: number;
  carbsProgress: number;
  fatsProgress: number;
  remainingCalories: number;
}

interface UseNutritionStatsOptions {
  todayLogs: MealLog[];
  calorieGoal?: number;
}

export function useNutritionStats({ todayLogs, calorieGoal = 2000 }: UseNutritionStatsOptions): NutritionStats {
  return useMemo(() => {
    const totalCalories = todayLogs.reduce((sum, log) => sum + log.calories, 0);
    const totalProtein = todayLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
    const totalCarbs = todayLogs.reduce((sum, log) => sum + (log.carbs || 0), 0);
    const totalFats = todayLogs.reduce((sum, log) => sum + (log.fats || 0), 0);

    // Calculate macro goals based on calorie goal
    // Standard macro split: 30% protein, 40% carbs, 30% fats
    const proteinGoal = Math.round((calorieGoal * 0.30) / 4); // 4 cal/g protein
    const carbsGoal = Math.round((calorieGoal * 0.40) / 4);   // 4 cal/g carbs
    const fatsGoal = Math.round((calorieGoal * 0.30) / 9);    // 9 cal/g fats

    const calorieProgress = Math.min((totalCalories / calorieGoal) * 100, 100);
    const proteinProgress = Math.min((totalProtein / proteinGoal) * 100, 100);
    const carbsProgress = Math.min((totalCarbs / carbsGoal) * 100, 100);
    const fatsProgress = Math.min((totalFats / fatsGoal) * 100, 100);

    const remainingCalories = Math.max(calorieGoal - totalCalories, 0);

    return {
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFats,
      calorieGoal,
      proteinGoal,
      carbsGoal,
      fatsGoal,
      calorieProgress,
      proteinProgress,
      carbsProgress,
      fatsProgress,
      remainingCalories
    };
  }, [todayLogs, calorieGoal]);
}
