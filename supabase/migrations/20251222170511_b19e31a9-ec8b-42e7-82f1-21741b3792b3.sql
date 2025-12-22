
-- Create masterclass_lessons table for storing lesson content
CREATE TABLE public.masterclass_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name TEXT NOT NULL,
  lesson_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  video_start_time INTEGER DEFAULT 0,
  video_end_time INTEGER,
  subtitle_en_url TEXT,
  subtitle_nl_url TEXT,
  subtitle_ru_url TEXT,
  interactive_type TEXT,
  interactive_config JSONB,
  content TEXT,
  duration_minutes INTEGER,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(module_name, lesson_number)
);

-- Create user_lesson_progress table for tracking user progress
CREATE TABLE public.user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lesson_id UUID REFERENCES public.masterclass_lessons(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT false,
  video_progress INTEGER DEFAULT 0,
  interactive_responses JSONB,
  quiz_score INTEGER,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Create quiz_questions table for storing quiz content
CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.masterclass_lessons(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'multiple_choice',
  options JSONB,
  correct_answer TEXT NOT NULL,
  points INTEGER DEFAULT 10,
  order_number INTEGER NOT NULL DEFAULT 0,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_certificates table for storing earned certificates
CREATE TABLE public.user_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module_name TEXT NOT NULL,
  certificate_number TEXT NOT NULL UNIQUE,
  score INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_name)
);

-- Enable RLS on all tables
ALTER TABLE public.masterclass_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for masterclass_lessons (public read, admin write)
CREATE POLICY "Anyone can view lessons"
ON public.masterclass_lessons
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage lessons"
ON public.masterclass_lessons
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_lesson_progress
CREATE POLICY "Users can view their own progress"
ON public.user_lesson_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
ON public.user_lesson_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON public.user_lesson_progress
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress"
ON public.user_lesson_progress
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for quiz_questions (public read, admin write)
CREATE POLICY "Anyone can view quiz questions"
ON public.quiz_questions
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage quiz questions"
ON public.quiz_questions
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_certificates
CREATE POLICY "Users can view their own certificates"
ON public.user_certificates
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own certificates"
ON public.user_certificates
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view certificates by number"
ON public.user_certificates
FOR SELECT
USING (true);

-- Add triggers for updated_at columns
CREATE TRIGGER update_masterclass_lessons_updated_at
BEFORE UPDATE ON public.masterclass_lessons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_lesson_progress_updated_at
BEFORE UPDATE ON public.user_lesson_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quiz_questions_updated_at
BEFORE UPDATE ON public.quiz_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
