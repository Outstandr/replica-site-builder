import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScaleQuestionProps {
  selectedValue: number | null;
  onSelect: (value: number) => void;
}

export function ScaleQuestion({ selectedValue, onSelect }: ScaleQuestionProps) {
  const scale = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="py-4">
      <div className="flex justify-between mb-3 text-sm text-muted-foreground">
        <span>Not at all</span>
        <span>Absolutely</span>
      </div>

      <div className="flex gap-2 justify-between">
        {scale.map((num, index) => {
          const isSelected = selectedValue === num;

          return (
            <motion.button
              key={num}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.15, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(num)}
              className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 rounded-full font-bold text-sm sm:text-base",
                "border-2 transition-all duration-200",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110"
                  : "border-border/50 bg-card/30 text-foreground/70 hover:border-primary/40"
              )}
            >
              {num}
            </motion.button>
          );
        })}
      </div>

      {selectedValue && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-4 text-lg font-medium text-primary"
        >
          You selected: {selectedValue}/10
        </motion.div>
      )}
    </div>
  );
}
