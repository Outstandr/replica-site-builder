import { useState, useEffect } from "react";
import { CheckCircle, XCircle, ChevronRight, Trophy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  question_text: string;
  question_type: string;
  options: QuizOption[];
  correct_answer: string;
  explanation: string | null;
  points: number;
}

interface QuizComponentProps {
  lessonId: string;
  onComplete?: (score: number, totalPoints: number) => void;
  onClose?: () => void;
}

const QuizComponent = ({ lessonId, onComplete, onClose }: QuizComponentProps) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data, error } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('lesson_id', lessonId)
          .order('order_number');

        if (error) throw error;

        const formattedQuestions: QuizQuestion[] = (data || []).map(q => ({
          id: q.id,
          question_text: q.question_text,
          question_type: q.question_type,
          options: Array.isArray(q.options) ? (q.options as unknown as QuizOption[]) : [],
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          points: q.points || 10,
        }));

        setQuestions(formattedQuestions);
        setTotalPoints(formattedQuestions.reduce((sum, q) => sum + q.points, 0));
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching quiz questions:', error);
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [lessonId]);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const handleAnswerSelect = (answerId: string) => {
    if (showResult) return;
    setSelectedAnswer(answerId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;
    
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    if (isCorrect) {
      setScore(prev => prev + currentQuestion.points);
    }
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsComplete(true);
      onComplete?.(score, totalPoints);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setIsComplete(false);
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse">Loading quiz...</div>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No quiz questions available for this lesson.</p>
          <Button onClick={onClose} className="mt-4">Close</Button>
        </CardContent>
      </Card>
    );
  }

  if (isComplete) {
    const percentage = Math.round((score / totalPoints) * 100);
    const isPassing = percentage >= 70;

    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className={cn(
            "w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center",
            isPassing ? "bg-accent/20" : "bg-destructive/20"
          )}>
            <Trophy className={cn(
              "w-10 h-10",
              isPassing ? "text-accent" : "text-destructive"
            )} />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">
            {isPassing ? "Congratulations!" : "Keep Practicing!"}
          </h2>
          
          <p className="text-muted-foreground mb-4">
            You scored {score} out of {totalPoints} points ({percentage}%)
          </p>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={handleRetry}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry Quiz
            </Button>
            <Button onClick={onClose}>
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-sm font-medium text-gold">
            {currentQuestion.points} points
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>

      <CardContent className="space-y-6">
        <CardTitle className="text-xl">
          {currentQuestion.question_text}
        </CardTitle>

        <div className="space-y-3">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedAnswer === option.id;
            const isCorrect = option.id === currentQuestion.correct_answer;
            const showCorrect = showResult && isCorrect;
            const showIncorrect = showResult && isSelected && !isCorrect;

            return (
              <button
                key={option.id}
                onClick={() => handleAnswerSelect(option.id)}
                disabled={showResult}
                className={cn(
                  "w-full p-4 rounded-lg border-2 text-left transition-all",
                  "hover:border-primary/50",
                  isSelected && !showResult && "border-primary bg-primary/10",
                  showCorrect && "border-accent bg-accent/10",
                  showIncorrect && "border-destructive bg-destructive/10",
                  !isSelected && !showResult && "border-border"
                )}
              >
                <div className="flex items-center justify-between">
                  <span>{option.text}</span>
                  {showCorrect && <CheckCircle className="w-5 h-5 text-accent" />}
                  {showIncorrect && <XCircle className="w-5 h-5 text-destructive" />}
                </div>
              </button>
            );
          })}
        </div>

        {showResult && currentQuestion.explanation && (
          <div className="p-4 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">
              <strong>Explanation:</strong> {currentQuestion.explanation}
            </p>
          </div>
        )}

        <div className="flex justify-end">
          {!showResult ? (
            <Button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer}
            >
              Submit Answer
            </Button>
          ) : (
            <Button onClick={handleNextQuestion}>
              {currentIndex < questions.length - 1 ? (
                <>
                  Next Question
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                "See Results"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizComponent;
