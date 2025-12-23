import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

const CommandCenterWidget = () => {
  const navigate = useNavigate();
  
  // Mock data (can be replaced with real hook later)
  const steps = 4238;
  const goal = 10000;
  const streak = 7;
  const targetStreak = 10;
  const progress = (steps / goal) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate('/hotstepper')}
      className="bg-[#0F172A] rounded-2xl p-5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 shadow-xl"
    >
      <div className="grid grid-cols-2 gap-4">
        {/* Left: Activity */}
        <div className="space-y-3">
          {/* Live indicator */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-400 text-xs font-semibold tracking-wide">ACTIVE</span>
          </div>
          
          {/* Step count */}
          <p className="text-3xl font-bold font-mono text-indigo-400">
            {steps.toLocaleString()}
          </p>
          <p className="text-xs text-zinc-400 tracking-wider">STEPS TODAY</p>
          
          {/* Progress bar */}
          <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full"
            />
          </div>
        </div>

        {/* Right: Streak */}
        <div className="flex flex-col items-center justify-center border-l border-zinc-700 pl-4">
          <Flame className="w-10 h-10 text-orange-500 mb-2" />
          <p className="text-white font-bold text-lg">{streak} Day Streak</p>
          <p className="text-xs text-zinc-400">Target: {targetStreak}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default CommandCenterWidget;
