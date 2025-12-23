import { motion } from "framer-motion";
import { Trophy, RotateCcw, BookOpen, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HotstepperProgressRing } from "@/components/hotstepper/HotstepperProgressRing";
import { cn } from "@/lib/utils";

interface QuizResultsProps {
  score: number;
  maxScore: number;
  quizTitle: string;
  onRetake: () => void;
  onSaveToJournal: () => void;
  onExit: () => void;
}

export function QuizResults({
  score,
  maxScore,
  quizTitle,
  onRetake,
  onSaveToJournal,
  onExit,
}: QuizResultsProps) {
  const percentage = Math.round((score / maxScore) * 100);

  const getMessage = () => {
    if (percentage >= 80) return { text: "Excellent!", emoji: "🏆" };
    if (percentage >= 60) return { text: "Great job!", emoji: "💪" };
    if (percentage >= 40) return { text: "Good effort!", emoji: "👍" };
    return { text: "Keep growing!", emoji: "🌱" };
  };

  const message = getMessage();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 20 }}
      className="flex flex-col items-center text-center px-4 py-8"
    >
      {/* Celebration icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", damping: 10 }}
        className="text-6xl mb-4"
      >
        {message.emoji}
      </motion.div>

      {/* Title */}
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
        {message.text}
      </h2>
      <p className="text-muted-foreground mb-8">
        {quizTitle} Complete
      </p>

      {/* Score ring */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <HotstepperProgressRing
          progress={percentage}
          size={180}
          strokeWidth={12}
        >
          <div className="flex flex-col items-center">
            <span className="text-5xl font-bold text-primary">{percentage}%</span>
            <span className="text-sm text-muted-foreground">
              {score} / {maxScore} pts
            </span>
          </div>
        </HotstepperProgressRing>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-sm space-y-3"
      >
        <Button
          onClick={onSaveToJournal}
          className="w-full"
          size="lg"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Save to Journal
        </Button>

        <div className="flex gap-3">
          <Button
            onClick={onRetake}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake
          </Button>

          <Button
            onClick={onExit}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            <Home className="w-4 h-4 mr-2" />
            Exit
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
