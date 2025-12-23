import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  category: string | null;
  estimated_time_minutes: number | null;
  is_active: boolean | null;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: "single_choice" | "scale_1_10" | "text";
  order_number: number;
  points: number;
  explanation: string | null;
}

export interface QuizOption {
  id: string;
  question_id: string;
  label: string;
  value: string;
  is_correct: boolean | null;
  order_number: number;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number | null;
  max_score: number | null;
  completed_at: string | null;
  responses: unknown;
}

export interface QuizResponse {
  questionId: string;
  answer: string | number;
  isCorrect?: boolean;
  points?: number;
}

// Fetch all quizzes
export function useQuizzes() {
  return useQuery({
    queryKey: ["quizzes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("is_active", true)
        .order("created_at");

      if (error) throw error;
      return data as Quiz[];
    },
  });
}

// Fetch a single quiz with questions and options
export function useQuiz(quizId: string | undefined) {
  return useQuery({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      if (!quizId) throw new Error("Quiz ID required");

      // Get quiz
      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", quizId)
        .maybeSingle();

      if (quizError) throw quizError;
      if (!quiz) throw new Error("Quiz not found");

      // Get questions
      const { data: questions, error: questionsError } = await supabase
        .from("standalone_quiz_questions")
        .select("*")
        .eq("quiz_id", quizId)
        .order("order_number");

      if (questionsError) throw questionsError;

      // Get options for all questions
      const questionIds = questions.map((q) => q.id);
      const { data: options, error: optionsError } = await supabase
        .from("standalone_quiz_options")
        .select("*")
        .in("question_id", questionIds)
        .order("order_number");

      if (optionsError) throw optionsError;

      return {
        quiz: quiz as Quiz,
        questions: questions as QuizQuestion[],
        options: options as QuizOption[],
      };
    },
    enabled: !!quizId,
  });
}

// Fetch user's attempts for all quizzes
export function useUserAttempts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["quiz-attempts", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_quiz_attempts")
        .select("*")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });

      if (error) throw error;
      return data as QuizAttempt[];
    },
    enabled: !!user,
  });
}

// Submit a quiz attempt
export function useSubmitQuizAttempt() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      quizId,
      score,
      maxScore,
      responses,
    }: {
      quizId: string;
      score: number;
      maxScore: number;
      responses: QuizResponse[];
    }) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("user_quiz_attempts")
        .insert({
          user_id: user.id,
          quiz_id: quizId,
          score,
          max_score: maxScore,
          responses: responses as unknown as never,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-attempts"] });
    },
  });
}
