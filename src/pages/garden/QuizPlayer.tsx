import { useState, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizProgress, QuizQuestion, QuizResults } from "@/components/quiz";
import { useQuiz, useSubmitQuizAttempt, type QuizResponse } from "@/hooks/useQuizzes";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function QuizPlayer() {
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string }>();
  const { user } = useAuth();
  const { data, isLoading, error } = useQuiz(quizId);
  const submitAttempt = useSubmitQuizAttempt();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [isComplete, setIsComplete] = useState(false);
  const [finalScore, setFinalScore] = useState({ score: 0, maxScore: 0 });

  const questions = useMemo(() => data?.questions || [], [data]);
  const currentQuestion = questions[currentIndex];
  const currentOptions = useMemo(
    () => data?.options.filter((o) => o.question_id === currentQuestion?.id) || [],
    [data, currentQuestion]
  );

  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;
  const isLastQuestion = currentIndex === questions.length - 1;
  const canGoNext = currentAnswer !== null && currentAnswer !== undefined && currentAnswer !== "";

  const handleAnswer = useCallback((answer: string | number) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }));
  }, [currentQuestion]);

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      handleFinish();
    } else {
      setDirection("next");
      setCurrentIndex((prev) => prev + 1);
    }
  }, [isLastQuestion, currentIndex]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection("prev");
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleFinish = useCallback(async () => {
    if (!data || !user) {
      toast.error("Please log in to save your results");
      return;
    }

    // Calculate score
    let score = 0;
    let maxScore = 0;
    const responses: QuizResponse[] = [];

    for (const question of questions) {
      const answer = answers[question.id];
      maxScore += question.points || 10;

      if (question.question_type === "single_choice") {
        const selectedOption = data.options.find(
          (o) => o.question_id === question.id && o.value === answer
        );
        const isCorrect = selectedOption?.is_correct || false;
        if (isCorrect) score += question.points || 10;

        responses.push({
          questionId: question.id,
          answer: answer as string,
          isCorrect,
          points: isCorrect ? question.points : 0,
        });
      } else if (question.question_type === "scale_1_10") {
        // Scale questions: award points based on value (higher = better)
        const scaleValue = answer as number;
        const pointsEarned = Math.round((scaleValue / 10) * (question.points || 10));
        score += pointsEarned;

        responses.push({
          questionId: question.id,
          answer: scaleValue,
          points: pointsEarned,
        });
      } else if (question.question_type === "text") {
        // Text questions: award full points for any response
        const hasResponse = answer && String(answer).trim().length > 0;
        if (hasResponse) score += question.points || 10;

        responses.push({
          questionId: question.id,
          answer: answer as string,
          points: hasResponse ? question.points : 0,
        });
      }
    }

    setFinalScore({ score, maxScore });
    setIsComplete(true);

    // Save to database
    try {
      await submitAttempt.mutateAsync({
        quizId: data.quiz.id,
        score,
        maxScore,
        responses,
      });
      toast.success("Results saved!");
    } catch (err) {
      console.error("Failed to save results:", err);
      toast.error("Failed to save results");
    }
  }, [data, user, questions, answers, submitAttempt]);

  const handleRetake = useCallback(() => {
    setCurrentIndex(0);
    setAnswers({});
    setIsComplete(false);
    setDirection("next");
  }, []);

  const handleSaveToJournal = useCallback(() => {
    toast.success("Saving to journal coming soon!");
    // TODO: Implement journal integration
  }, []);

  const handleExit = useCallback(() => {
    navigate("/garden/quizzes");
  }, [navigate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <Skeleton className="h-4 w-48 mx-auto mb-8" />
          <Skeleton className="h-8 w-full mb-8" />
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-destructive mb-4">Failed to load quiz</p>
          <Button onClick={() => navigate("/garden/quizzes")}>
            Back to Quizzes
          </Button>
        </div>
      </div>
    );
  }

  // Results view
  if (isComplete) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-lg mx-auto pt-8">
          <QuizResults
            score={finalScore.score}
            maxScore={finalScore.maxScore}
            quizTitle={data.quiz.title}
            onRetake={handleRetake}
            onSaveToJournal={handleSaveToJournal}
            onExit={handleExit}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with close and progress */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-background/90 border-b border-border/50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExit}
              className="shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
            <span className="text-sm text-muted-foreground font-medium">
              {data.quiz.title}
            </span>
            <div className="w-10" /> {/* Spacer */}
          </div>
          <QuizProgress current={currentIndex + 1} total={questions.length} />
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 flex flex-col px-4 py-8 overflow-hidden">
        <div className="flex-1 flex items-start">
          <div className="w-full max-w-lg mx-auto">
            {currentQuestion && (
              <QuizQuestion
                question={currentQuestion}
                options={currentOptions}
                answer={currentAnswer}
                onAnswer={handleAnswer}
                direction={direction}
              />
            )}
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="sticky bottom-0 backdrop-blur-md bg-background/90 border-t border-border/50 p-4">
        <div className="max-w-lg mx-auto flex gap-3">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex-1"
            size="lg"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canGoNext}
            className={cn("flex-1", canGoNext && "animate-pulse-slow")}
            size="lg"
          >
            {isLastQuestion ? "Finish" : "Next"}
            {!isLastQuestion && <ChevronRight className="w-4 h-4 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
