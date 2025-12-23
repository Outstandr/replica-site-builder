import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Feather } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

const cyclingWords = ["SOUL", "MIND", "BODY", "LIMITS"];

const Index = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [wordIndex, setWordIndex] = useState(0);

  // Cycle through words every 2.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % cyclingWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const isFemale = theme === "female";

  return (
    <div className="min-h-screen h-screen flex flex-col bg-background transition-all duration-500 overflow-hidden relative">
      {/* Hero Section - Centered */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        {/* Headline Stack */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center space-y-2 mb-8"
        >
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black text-foreground tracking-tight">
            RESET YOUR
          </h1>
          <div className="h-16 sm:h-20 md:h-24 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={cyclingWords[wordIndex]}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="font-heading text-5xl sm:text-6xl md:text-7xl font-black text-primary neon-text"
              >
                {cyclingWords[wordIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="font-body text-lg sm:text-xl text-muted-foreground text-center max-w-xs mb-12"
        >
          The complete operating system for your life.
        </motion.p>

        {/* Vibe Switcher */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <span className="font-body text-sm text-muted-foreground uppercase tracking-widest">
            Choose Your Frequency
          </span>
          
          {/* Toggle Switch */}
          <button
            onClick={toggleTheme}
            className="relative w-64 h-16 rounded-full bg-secondary/50 border-2 border-border p-1 transition-all duration-500 hover:border-primary/50 group"
            aria-label="Toggle theme"
          >
            {/* Track Labels */}
            <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
              <span className={`font-body font-semibold text-sm transition-all duration-500 ${isFemale ? 'text-primary' : 'text-muted-foreground'}`}>
                Warm
              </span>
              <span className={`font-body font-semibold text-sm transition-all duration-500 ${!isFemale ? 'text-primary' : 'text-muted-foreground'}`}>
                Cool
              </span>
            </div>
            
            {/* Thumb */}
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={`absolute top-1 h-12 w-28 rounded-full bg-primary shadow-glow flex items-center justify-center
                ${isFemale ? 'left-1' : 'left-[calc(100%-7.25rem)]'}`}
            >
              <span className="font-body font-bold text-sm text-primary-foreground">
                {isFemale ? '☀️ Warm' : '❄️ Cool'}
              </span>
            </motion.div>
          </button>
        </motion.div>
      </main>

      {/* Authority Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="absolute bottom-36 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="glass-effect px-4 py-2 rounded-full flex items-center gap-2">
          <Feather className="w-4 h-4 text-muted-foreground" />
          <span className="font-body text-xs text-muted-foreground">
            Methodology by Lionel Eersteling
          </span>
        </div>
      </motion.div>

      {/* Thumb Zone Actions - Sticky Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="fixed bottom-0 left-0 right-0 z-20"
      >
        {/* Gradient Fade */}
        <div className="h-12 bg-gradient-to-t from-background to-transparent" />
        
        {/* Action Buttons */}
        <div className="bg-background px-6 pb-8 pt-2 space-y-3 safe-area-bottom">
          {/* Primary CTA with Pulse */}
          <motion.div
            animate={{ 
              boxShadow: [
                "0 0 0 0 hsl(var(--primary) / 0)",
                "0 0 0 8px hsl(var(--primary) / 0.2)",
                "0 0 0 0 hsl(var(--primary) / 0)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-lg"
          >
            <Button
              onClick={() => navigate('/auth')}
              className="w-full h-14 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
            >
              Start Your Reset
            </Button>
          </motion.div>
          
          {/* Secondary - Login */}
          <Button
            variant="ghost"
            onClick={() => navigate('/auth')}
            className="w-full h-12 text-muted-foreground hover:text-foreground transition-all duration-300"
          >
            Login
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
