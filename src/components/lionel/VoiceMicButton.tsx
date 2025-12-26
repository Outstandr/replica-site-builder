import { motion } from "framer-motion";
import { Mic, Volume2, Circle } from "lucide-react";

export type VoiceState = "disconnected" | "connected" | "speaking";

interface VoiceMicButtonProps {
  state: VoiceState;
  onClick: () => void;
  disabled?: boolean;
}

export const VoiceMicButton = ({ state, onClick, disabled }: VoiceMicButtonProps) => {
  const isDisabled = disabled;

  const getBackgroundClass = () => {
    switch (state) {
      case "disconnected":
        return "bg-zinc-800";
      case "connected":
        return "bg-zinc-900";
      case "speaking":
        return "bg-zinc-900";
      default:
        return "bg-zinc-800";
    }
  };

  const getBorderClass = () => {
    switch (state) {
      case "disconnected":
        return "border-zinc-600";
      case "connected":
        return "border-amber-500/60";
      case "speaking":
        return "border-amber-400";
      default:
        return "border-zinc-600";
    }
  };

  const renderIcon = () => {
    switch (state) {
      case "disconnected":
        return <Circle className="w-12 h-12 text-zinc-500" />;
      case "connected":
        return <Mic className="w-12 h-12 text-amber-500" />;
      case "speaking":
        return <Volume2 className="w-12 h-12 text-amber-400" />;
      default:
        return <Circle className="w-12 h-12 text-zinc-500" />;
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow ring for connected/speaking states */}
      {state !== "disconnected" && (
        <motion.div
          className="absolute w-48 h-48 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(245, 158, 11, ${state === "speaking" ? 0.3 : 0.15}) 0%, transparent 70%)`,
          }}
          animate={
            state === "speaking"
              ? {
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 1, 0.6],
                }
              : {
                  scale: [1, 1.05, 1],
                  opacity: [0.4, 0.6, 0.4],
                }
          }
          transition={{
            duration: state === "speaking" ? 0.5 : 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Pulsing ring for speaking state */}
      {state === "speaking" && (
        <>
          <motion.div
            className="absolute w-40 h-40 rounded-full border-2 border-amber-400/50"
            animate={{
              scale: [1, 1.3],
              opacity: [0.8, 0],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
          <motion.div
            className="absolute w-40 h-40 rounded-full border-2 border-amber-400/50"
            animate={{
              scale: [1, 1.3],
              opacity: [0.8, 0],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.4,
            }}
          />
        </>
      )}

      {/* Connected listening pulse */}
      {state === "connected" && (
        <motion.div
          className="absolute w-36 h-36 rounded-full border border-amber-500/30"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Main button */}
      <motion.button
        onClick={onClick}
        disabled={isDisabled}
        className={`
          relative z-10 w-32 h-32 rounded-full
          ${getBackgroundClass()}
          border-2 ${getBorderClass()}
          flex items-center justify-center
          transition-all duration-300
          ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"}
          shadow-lg
        `}
        whileHover={!isDisabled ? { scale: 1.05 } : {}}
        whileTap={!isDisabled ? { scale: 0.95 } : {}}
        animate={
          state === "speaking"
            ? {
                boxShadow: [
                  "0 0 20px rgba(245, 158, 11, 0.3)",
                  "0 0 40px rgba(245, 158, 11, 0.5)",
                  "0 0 20px rgba(245, 158, 11, 0.3)",
                ],
              }
            : state === "connected"
            ? {
                boxShadow: "0 0 30px rgba(245, 158, 11, 0.2)",
              }
            : {}
        }
        transition={
          state === "speaking"
            ? {
                duration: 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }
            : {}
        }
      >
        <motion.div
          animate={
            state === "speaking"
              ? {
                  scale: [1, 1.1, 1],
                }
              : {}
          }
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {renderIcon()}
        </motion.div>
      </motion.button>
    </div>
  );
};
