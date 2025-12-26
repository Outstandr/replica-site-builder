import { motion } from "framer-motion";
import { Mic, Loader2, Volume2 } from "lucide-react";

export type VoiceState = "idle" | "recording" | "processing" | "playing";

interface VoiceMicButtonProps {
  state: VoiceState;
  onClick: () => void;
  disabled?: boolean;
}

export const VoiceMicButton = ({ state, onClick, disabled }: VoiceMicButtonProps) => {
  const isDisabled = disabled || state === "processing" || state === "playing";

  // Get animation props based on state
  const getAnimationProps = () => {
    switch (state) {
      case "recording":
        return {
          scale: [1, 1.05, 1],
          boxShadow: [
            "0 0 30px rgba(239, 68, 68, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.3)",
            "0 0 60px rgba(239, 68, 68, 0.6), inset 0 0 20px rgba(0, 0, 0, 0.3)",
            "0 0 30px rgba(239, 68, 68, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.3)",
          ],
        };
      case "processing":
        return {
          scale: 1,
          boxShadow: "0 0 40px rgba(245, 158, 11, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.3)",
        };
      case "playing":
        return {
          scale: 1,
          boxShadow: "0 0 50px rgba(245, 158, 11, 0.6), inset 0 0 20px rgba(0, 0, 0, 0.3)",
        };
      default:
        return {
          scale: 1,
          boxShadow: "0 0 30px rgba(245, 158, 11, 0.2), inset 0 0 20px rgba(0, 0, 0, 0.3)",
        };
    }
  };

  const getTransitionProps = () => {
    if (state === "recording") {
      return {
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut" as const,
      };
    }
    return { duration: 0.3 };
  };

  // Icon based on state
  const renderIcon = () => {
    switch (state) {
      case "processing":
        return <Loader2 className="w-16 h-16 text-amber-500 animate-spin" />;
      case "playing":
        return <Volume2 className="w-16 h-16 text-amber-400" />;
      case "recording":
        return <Mic className="w-16 h-16 text-red-500" />;
      default:
        return <Mic className="w-16 h-16 text-zinc-400" />;
    }
  };

  // Border color based on state
  const getBorderClass = () => {
    switch (state) {
      case "recording":
        return "border-red-500/80";
      case "processing":
        return "border-amber-500/60";
      case "playing":
        return "border-amber-400/80";
      default:
        return "border-amber-500/20 hover:border-amber-500/40";
    }
  };

  // Background based on state
  const getBackgroundClass = () => {
    switch (state) {
      case "recording":
        return "bg-gradient-to-br from-zinc-800 to-zinc-900";
      case "playing":
        return "bg-gradient-to-br from-zinc-700 to-zinc-800";
      default:
        return "bg-gradient-to-br from-zinc-800 to-zinc-950";
    }
  };

  return (
    <div className="relative">
      {/* Outer glow ring for playing state */}
      {state === "playing" && (
        <motion.div
          className="absolute inset-0 rounded-full bg-amber-500/20"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.2, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ width: 192, height: 192 }}
        />
      )}

      {/* Recording pulse ring */}
      {state === "recording" && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-red-500/50"
          animate={{
            scale: [1, 1.4],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeOut",
          }}
          style={{ width: 192, height: 192 }}
        />
      )}

      {/* Processing spinner ring */}
      {state === "processing" && (
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 border-r-amber-500/50"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ width: 192, height: 192 }}
        />
      )}

      {/* Main button */}
      <motion.button
        onClick={onClick}
        disabled={isDisabled}
        animate={getAnimationProps()}
        transition={getTransitionProps()}
        whileTap={!isDisabled ? { scale: 0.95 } : undefined}
        className={`
          relative w-48 h-48 rounded-full
          ${getBackgroundClass()}
          border-4 ${getBorderClass()}
          flex items-center justify-center
          transition-colors duration-300
          ${isDisabled ? "cursor-not-allowed opacity-80" : "cursor-pointer"}
          focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-4 focus:ring-offset-zinc-950
        `}
      >
        {/* Inner highlight */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-b from-zinc-700/30 to-transparent pointer-events-none" />
        
        {/* Icon */}
        <motion.div
          animate={state === "recording" ? { scale: [1, 1.1, 1] } : { scale: 1 }}
          transition={state === "recording" ? { duration: 0.5, repeat: Infinity } : undefined}
        >
          {renderIcon()}
        </motion.div>
      </motion.button>
    </div>
  );
};
