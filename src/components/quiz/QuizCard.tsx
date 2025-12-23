import { motion } from "framer-motion";
import { Clock, CheckCircle2, RotateCcw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Quiz, QuizAttempt } from "@/hooks/useQuizzes";

interface QuizCardProps {
  quiz: Quiz;
  lastAttempt?: QuizAttempt;
  onStart: (quizId: string) => void;
}

const categoryIcons: Record<string, string> = {
  rhythm: "🎵",
  energy: "⚡",
  systems: "🔄",
  execution: "🎯",
  transformation: "🦋",
};

export function QuizCard({ quiz, lastAttempt, onStart }: QuizCardProps) {
  const hasCompleted = !!lastAttempt;
  const scorePercentage = lastAttempt
    ? Math.round(((lastAttempt.score || 0) / (lastAttempt.max_score || 1)) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: "spring", damping: 20 }}
      className={cn(
        "relative overflow-hidden rounded-2xl",
        // Glass effect with theme-aware border colors
        "backdrop-blur-md bg-card/40",
        // Border uses primary color which adapts to theme
        "border-2 border-primary/30",
        "hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10",
        "transition-all duration-300"
      )}
    >
      {/* Gradient overlay - uses theme colors */}
      <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-primary/30 to-accent/20" />

      <div className="relative p-6">
        {/* Header with icon */}
        <div className="flex items-start justify-between mb-4">
          <span className="text-4xl" role="img" aria-label={quiz.category || "quiz"}>
            {categoryIcons[quiz.category || "rhythm"]}
          </span>

          {hasCompleted && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>{scorePercentage}%</span>
            </div>
          )}
        </div>

        {/* Title and description */}
        <h3 className="text-xl font-bold text-foreground mb-2">{quiz.title}</h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
          {quiz.description}
        </p>

        {/* Meta info */}
        <div className="flex items-center gap-4 mb-6 text-muted-foreground text-sm">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{quiz.estimated_time_minutes} min</span>
          </div>
          {quiz.category && (
            <span className="px-2 py-0.5 rounded-full bg-secondary/50 capitalize text-xs">
              {quiz.category}
            </span>
          )}
        </div>

        {/* Action button */}
        <Button
          onClick={() => onStart(quiz.id)}
          className="w-full group"
          variant={hasCompleted ? "outline" : "default"}
        >
          {hasCompleted ? (
            <>
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake Assessment
            </>
          ) : (
            <>
              Start Assessment
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
