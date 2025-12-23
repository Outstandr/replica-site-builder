import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Footprints } from 'lucide-react';
import { useHotstepperHealth } from '@/hooks/hotstepper';

const HotStepperWidget = () => {
  const navigate = useNavigate();
  const { healthData, isLoading } = useHotstepperHealth();
  
  const { steps, goal, goalProgress } = healthData;

  // SVG ring calculations - compact size
  const size = 72;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (goalProgress / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate('/hotstepper')}
      role="button"
      tabIndex={0}
      className="bg-[#1e293b] rounded-xl p-3 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 shadow-xl flex-1"
    >
      {/* Title */}
      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">HotStepper</span>

      <div className="flex items-center gap-3 mt-2">
        {/* Steps Ring */}
        <div className="relative flex-shrink-0">
          <svg
            width={size}
            height={size}
            className="transform -rotate-90"
          >
            <defs>
              <filter id="widget-glow" x="-50%" y="-50%" width="200%" height="200%">
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
              filter="url(#widget-glow)"
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Footprints className="w-4 h-4 text-[#06B6D4]" />
            {isLoading ? (
              <span className="text-sm font-bold text-white/50">...</span>
            ) : (
              <span className="text-sm font-bold text-white font-mono">{steps.toLocaleString()}</span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="animate-pulse space-y-1">
              <div className="h-5 bg-slate-700 rounded w-12" />
              <div className="h-3 bg-slate-700 rounded w-16" />
            </div>
          ) : (
            <>
              <p className="text-lg font-bold text-white">{steps.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400">/ {(goal/1000).toFixed(0)}k steps</p>
              <p className="text-[10px] text-[#06B6D4] mt-1">{Math.round(goalProgress)}% complete</p>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default HotStepperWidget;
