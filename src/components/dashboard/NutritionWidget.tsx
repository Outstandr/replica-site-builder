import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function NutritionWidget() {
  const navigate = useNavigate();

  // Mock data - will be replaced with real data from hooks
  const consumed = 0;
  const goal = 2000;
  const remaining = goal - consumed;
  const percentage = Math.min((consumed / goal) * 100, 100);

  const macros = {
    protein: { current: 0, goal: 150 },
    carbs: { current: 0, goal: 200 },
    fats: { current: 0, goal: 67 }
  };

  // SVG ring calculations
  const size = 100;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate('/nutrition')}
      role="button"
      tabIndex={0}
      className="bg-[#1e293b] rounded-xl p-4 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-transform duration-200 shadow-xl"
    >
      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ration Control</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Left Side - Calorie Ring */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="relative" style={{ width: size, height: size }}>
            <svg
              width={size}
              height={size}
              className="transform -rotate-90"
            >
              {/* Background track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="hsl(210, 25%, 20%)"
                strokeWidth={strokeWidth}
              />
              {/* Progress arc */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#06B6D4"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500"
                style={{
                  filter: 'drop-shadow(0 0 6px rgba(6, 182, 212, 0.5))'
                }}
              />
            </svg>
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-cyan-400 tabular-nums">{consumed}</span>
              <span className="text-[10px] text-slate-400">/ {goal.toLocaleString()}</span>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">CAL</span>
            </div>
          </div>
          {/* Remaining indicator */}
          <div className="flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="text-[10px] text-slate-400">{remaining} left</span>
          </div>
        </div>

        {/* Right Side - Macro Stats (Horizontal) */}
        <div className="flex-1 flex items-center justify-around gap-2">
          {/* Protein */}
          <div className="flex flex-col items-center text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Protein</span>
            <span className="text-[10px] text-slate-500">{macros.protein.current}/{macros.protein.goal}g</span>
            <span className="text-lg font-bold text-pink-400 tabular-nums">{macros.protein.current}</span>
            <span className="text-[10px] text-slate-500">g</span>
          </div>

          {/* Carbs */}
          <div className="flex flex-col items-center text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Carbs</span>
            <span className="text-[10px] text-slate-500">{macros.carbs.current}/{macros.carbs.goal}g</span>
            <span className="text-lg font-bold text-yellow-400 tabular-nums">{macros.carbs.current}</span>
            <span className="text-[10px] text-slate-500">g</span>
          </div>

          {/* Fats */}
          <div className="flex flex-col items-center text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Fats</span>
            <span className="text-[10px] text-slate-500">{macros.fats.current}/{macros.fats.goal}g</span>
            <span className="text-lg font-bold text-cyan-400 tabular-nums">{macros.fats.current}</span>
            <span className="text-[10px] text-slate-500">g</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
