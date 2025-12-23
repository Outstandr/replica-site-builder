import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileLayout from "@/components/layout/MobileLayout";
import { QuizCard } from "@/components/quiz";
import { useQuizzes, useUserAttempts } from "@/hooks/useQuizzes";
import { Skeleton } from "@/components/ui/skeleton";

export default function QuizLibrary() {
  const navigate = useNavigate();
  const { data: quizzes, isLoading: quizzesLoading } = useQuizzes();
  const { data: attempts } = useUserAttempts();

  const getLastAttempt = (quizId: string) => {
    if (!attempts) return undefined;
    return attempts.find((a) => a.quiz_id === quizId);
  };

  const handleStartQuiz = (quizId: string) => {
    navigate(`/garden/quizzes/${quizId}`);
  };

  return (
    <MobileLayout showBottomNav>
      <div className="min-h-screen pb-24">
        {/* Header */}
        <div className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b border-border/50">
          <div className="px-4 py-4">
            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
                className="shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Soul Garden</h1>
                <p className="text-muted-foreground text-sm">Assessments & Quizzes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-6">
          {/* Intro card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 
                       border border-primary/20 backdrop-blur-sm"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">
                  RESET Assessments
                </h2>
                <p className="text-muted-foreground text-sm">
                  Discover your current state across the five pillars of transformation. 
                  Each assessment takes 5-15 minutes.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quiz grid */}
          {quizzesLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-64 rounded-2xl" />
              ))}
            </div>
          ) : quizzes && quizzes.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {quizzes.map((quiz, index) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <QuizCard
                    quiz={quiz}
                    lastAttempt={getLastAttempt(quiz.id)}
                    onStart={handleStartQuiz}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No quizzes available yet.</p>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
