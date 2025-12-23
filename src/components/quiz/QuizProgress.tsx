import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface QuizProgressProps {
  current: number;
  total: number;
  className?: string;
}

export function QuizProgress({ current, total, className }: QuizProgressProps) {
  const percentage = (current / total) * 100;

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-2 text-sm">
        <span className="text-muted-foreground">
          Question {current} of {total}
        </span>
        <span className="text-primary font-medium">
          {Math.round(percentage)}%
        </span>
      </div>
      
      <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
        />
      </div>
    </div>
  );
}
