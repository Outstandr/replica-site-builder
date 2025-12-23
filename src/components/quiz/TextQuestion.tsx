import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";

interface TextQuestionProps {
  value: string;
  onChange: (value: string) => void;
}

export function TextQuestion({ value, onChange }: TextQuestionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-4"
    >
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Take a moment to reflect and share your thoughts..."
        className="min-h-[180px] bg-card/50 border-primary/20 focus:border-primary/50 
                   placeholder:text-muted-foreground/50 text-foreground resize-none
                   rounded-xl p-4 text-base leading-relaxed"
      />
      <p className="mt-3 text-sm text-muted-foreground text-center">
        This is a reflection question — there are no wrong answers
      </p>
    </motion.div>
  );
}
