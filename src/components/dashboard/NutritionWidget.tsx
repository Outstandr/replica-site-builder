import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Utensils } from 'lucide-react';
import { useNutritionLogs, useNutritionStats } from '@/hooks/nutrition';

export default function NutritionWidget() {
  const navigate = useNavigate();
  const { todayLogs, loading } = useNutritionLogs();
  const stats = useNutritionStats({ todayLogs });
  
  const { totalCalories, calorieGoal, remainingCalories, calorieProgress } = stats;

  // SVG ring calculations - compact size
  const size = 72;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (calorieProgress / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate('/nutrition')}
      role="button"
      tabIndex={0}
      className="bg-[#1e293b] rounded-xl p-3 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 shadow-xl flex-1"
    >
      {/* Title */}
      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Ration Control</span>

      <div className="flex items-center gap-3 mt-2">
        {/* Calorie Ring */}
        <div className="relative flex-shrink-0">
          <svg
            width={size}
            height={size}
            className="transform -rotate-90"
          >
            <defs>
              <filter id="nutrition-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="hsl(210, 25%, 20%)"
              strokeWidth={strokeWidth}
            />
            
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#06B6D4"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "easeOut" }}
              filter="url(#nutrition-glow)"
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Utensils className="w-4 h-4 text-[#06B6D4]" />
            {loading ? (
              <span className="text-sm font-bold text-white/50">...</span>
            ) : (
              <span className="text-sm font-bold text-white font-mono">{totalCalories}</span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="animate-pulse space-y-1">
              <div className="h-5 bg-slate-700 rounded w-12" />
              <div className="h-3 bg-slate-700 rounded w-16" />
            </div>
          ) : (
            <>
              <p className="text-lg font-bold text-white">{totalCalories.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400">/ {calorieGoal.toLocaleString()} cal</p>
              <p className="text-[10px] text-[#06B6D4] mt-1">{remainingCalories} left</p>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
