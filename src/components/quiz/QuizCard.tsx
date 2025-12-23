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

const categoryColors: Record<string, string> = {
  rhythm: "from-primary/20 to-accent/10",
  energy: "from-accent/20 to-primary/10",
  systems: "from-primary/30 to-secondary/20",
  execution: "from-accent/30 to-primary/10",
  transformation: "from-primary/20 to-accent/20",
};

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
        "backdrop-blur-md bg-card/40 border border-primary/20",
        "hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10",
        "transition-all duration-300"
      )}
    >
      {/* Gradient overlay */}
      <div
        className={cn(
          "absolute inset-0 opacity-30 bg-gradient-to-br",
          categoryColors[quiz.category || "rhythm"]
        )}
      />

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
