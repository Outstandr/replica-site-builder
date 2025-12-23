import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Zap, MapPin, Clock, Footprints } from 'lucide-react';

const HotStepperWidget = () => {
  const navigate = useNavigate();
  
  // Mock data (will be replaced with real hooks later)
  const steps = 0;
  const goal = 10000;
  const streak = 0;
  const calories = 0;
  const distance = 0.00;
  const activeMinutes = 0;
  const progress = (steps / goal) * 100;

  // SVG ring calculations
  const size = 100;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const stats = [
    { icon: Flame, color: '#F97316', label: 'Streak', value: `${streak} days` },
    { icon: Zap, color: '#EAB308', label: 'Calories', value: `${calories} kcal` },
    { icon: MapPin, color: '#22C55E', label: 'Distance', value: `${distance.toFixed(2)} km` },
    { icon: Clock, color: '#A855F7', label: 'Active', value: `${activeMinutes} min` },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate('/hotstepper')}
      className="bg-[#1e293b] rounded-xl p-4 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-transform duration-200 shadow-xl"
    >
      <div className="flex items-center gap-4">
        {/* Left Side - Steps Ring (35%) */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="relative">
            <svg
              width={size}
              height={size}
              className="transform -rotate-90"
            >
              {/* Glow filter */}
              <defs>
                <filter id="widget-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Background circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="hsl(210, 25%, 20%)"
                strokeWidth={strokeWidth}
              />
              
              {/* Progress circle */}
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
              <Footprints className="w-5 h-5 text-[#06B6D4] mb-0.5" />
              <span className="text-xl font-bold text-white font-mono">{steps.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400">/ 10k</span>
            </div>
          </div>
          
          {/* Percentage below ring */}
          <span className="text-xs text-[#06B6D4] mt-2 font-medium">
            {Math.round(progress)}% Complete
          </span>
        </div>

        {/* Right Side - Stats Grid (65%) */}
        <div className="flex-1 grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-2">
              <stat.icon 
                className="w-5 h-5 flex-shrink-0" 
                style={{ color: stat.color }} 
              />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">{stat.label}</p>
                <p className="text-sm font-semibold text-white truncate">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default HotStepperWidget;
