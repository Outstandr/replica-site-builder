import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuizOption } from "@/hooks/useQuizzes";

interface SingleChoiceQuestionProps {
  options: QuizOption[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
}

export function SingleChoiceQuestion({
  options,
  selectedValue,
  onSelect,
}: SingleChoiceQuestionProps) {
  return (
    <div className="space-y-3">
      {options.map((option, index) => {
        const isSelected = selectedValue === option.value;

        return (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(option.value)}
            className={cn(
              "w-full p-4 rounded-xl text-left transition-all duration-200",
              "border-2 backdrop-blur-sm",
              isSelected
                ? "border-primary bg-primary/15 shadow-lg shadow-primary/20"
                : "border-border/50 bg-card/30 hover:border-primary/40 hover:bg-card/50"
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <span className={cn(
                "text-base",
                isSelected ? "text-foreground font-medium" : "text-foreground/80"
              )}>
                {option.label}
              </span>

              <div
                className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30"
                )}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15 }}
                  >
                    <Check className="w-4 h-4" />
                  </motion.div>
                )}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
