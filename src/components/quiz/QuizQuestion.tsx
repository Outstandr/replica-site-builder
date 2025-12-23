import { motion, AnimatePresence } from "framer-motion";
import { SingleChoiceQuestion } from "./SingleChoiceQuestion";
import { ScaleQuestion } from "./ScaleQuestion";
import { TextQuestion } from "./TextQuestion";
import type { QuizQuestion as QuizQuestionType, QuizOption } from "@/hooks/useQuizzes";

interface QuizQuestionProps {
  question: QuizQuestionType;
  options: QuizOption[];
  answer: string | number | null;
  onAnswer: (answer: string | number) => void;
  direction: "next" | "prev";
}

const slideVariants = {
  enter: (direction: "next" | "prev") => ({
    x: direction === "next" ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: "next" | "prev") => ({
    x: direction === "next" ? -100 : 100,
    opacity: 0,
  }),
};

export function QuizQuestion({
  question,
  options,
  answer,
  onAnswer,
  direction,
}: QuizQuestionProps) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={question.id}
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 200,
        }}
        className="w-full"
      >
        {/* Question text */}
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8 leading-tight">
          {question.question_text}
        </h2>

        {/* Answer type */}
        {question.question_type === "single_choice" && (
          <SingleChoiceQuestion
            options={options}
            selectedValue={answer as string | null}
            onSelect={(value) => onAnswer(value)}
          />
        )}

        {question.question_type === "scale_1_10" && (
          <ScaleQuestion
            selectedValue={answer as number | null}
            onSelect={(value) => onAnswer(value)}
          />
        )}

        {question.question_type === "text" && (
          <TextQuestion
            value={(answer as string) || ""}
            onChange={(value) => onAnswer(value)}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
