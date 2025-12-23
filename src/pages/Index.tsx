import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Feather } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen h-screen flex flex-col bg-background overflow-hidden relative">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      
      {/* Hero Section - Centered */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center space-y-4 mb-8"
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-foreground tracking-tight">
            Master Your
            <span className="block text-primary">Rhythm.</span>
          </h1>
        </motion.div>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg sm:text-xl text-muted-foreground text-center max-w-sm mb-12"
        >
          The complete operating system for body and soul.
        </motion.p>

        {/* Authority Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="glass-effect px-4 py-2 rounded-full flex items-center gap-2 shadow-soft">
            <Feather className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Methodology by Lionel Eersteling
            </span>
          </div>
        </motion.div>
      </main>

      {/* Thumb Zone Actions - Sticky Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
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
                "0 0 0 8px hsl(var(--primary) / 0.15)",
                "0 0 0 0 hsl(var(--primary) / 0)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-full"
          >
            <Button
              onClick={() => navigate('/auth')}
              className="w-full h-14 text-lg font-bold rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow transition-all duration-300"
            >
              Get Started
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
