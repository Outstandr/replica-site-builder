-- =============================================
-- QUIZ ENGINE: Tables, RLS, and Seed Data
-- =============================================

-- Table 1: quizzes (Main Quiz Collection)
CREATE TABLE public.quizzes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  cover_image text,
  category text, -- 'rhythm', 'energy', 'systems', 'execution', 'transformation'
  estimated_time_minutes integer DEFAULT 10,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table 2: standalone_quiz_questions
CREATE TABLE public.standalone_quiz_questions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id uuid REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  question_text text NOT NULL,
  question_type text NOT NULL DEFAULT 'single_choice', -- 'single_choice', 'scale_1_10', 'text'
  order_number integer DEFAULT 0,
  points integer DEFAULT 10,
  explanation text,
  created_at timestamptz DEFAULT now()
);

-- Table 3: standalone_quiz_options (for single_choice questions)
CREATE TABLE public.standalone_quiz_options (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id uuid REFERENCES public.standalone_quiz_questions(id) ON DELETE CASCADE NOT NULL,
  label text NOT NULL,
  value text NOT NULL,
  is_correct boolean DEFAULT false,
  order_number integer DEFAULT 0
);

-- Table 4: user_quiz_attempts
CREATE TABLE public.user_quiz_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  quiz_id uuid REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  score integer,
  max_score integer,
  completed_at timestamptz DEFAULT now(),
  responses jsonb DEFAULT '[]'::jsonb
);

-- Enable RLS on all tables
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standalone_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standalone_quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quiz_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quizzes (public read)
CREATE POLICY "Anyone can view active quizzes" ON public.quizzes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage quizzes" ON public.quizzes
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for questions (public read)
CREATE POLICY "Anyone can view quiz questions" ON public.standalone_quiz_questions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage quiz questions" ON public.standalone_quiz_questions
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for options (public read)
CREATE POLICY "Anyone can view quiz options" ON public.standalone_quiz_options
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage quiz options" ON public.standalone_quiz_options
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for user attempts (user-specific)
CREATE POLICY "Users can view their own attempts" ON public.user_quiz_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attempts" ON public.user_quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attempts" ON public.user_quiz_attempts
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- SEED DATA: 5 RESET Quizzes
-- =============================================

-- Quiz 1: Rhythm Assessment
INSERT INTO public.quizzes (id, title, description, category, estimated_time_minutes) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Rhythm Assessment', 'How aligned is your daily routine with your goals? Discover the harmony between your habits and aspirations.', 'rhythm', 8);

-- Quiz 2: Energy Audit
INSERT INTO public.quizzes (id, title, description, category, estimated_time_minutes) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Energy Audit', 'Evaluate your physical and mental energy levels. Understand where your power flows and where it drains.', 'energy', 10);

-- Quiz 3: Systems Check
INSERT INTO public.quizzes (id, title, description, category, estimated_time_minutes) VALUES
  ('33333333-3333-3333-3333-333333333333', 'Systems Check', 'Assess your emotional patterns and relationships. Explore the systems that support or limit your growth.', 'systems', 12);

-- Quiz 4: Execution Test
INSERT INTO public.quizzes (id, title, description, category, estimated_time_minutes) VALUES
  ('44444444-4444-4444-4444-444444444444', 'Execution Test', 'How effectively do you translate plans into action? Measure your follow-through and discipline.', 'execution', 10);

-- Quiz 5: Transformation Index
INSERT INTO public.quizzes (id, title, description, category, estimated_time_minutes) VALUES
  ('55555555-5555-5555-5555-555555555555', 'Transformation Index', 'Measure your growth mindset and identity evolution. See how far you have come and where you are heading.', 'transformation', 15);

-- =============================================
-- SEED QUESTIONS FOR QUIZ 1: Rhythm Assessment
-- =============================================

-- Q1: Single Choice
INSERT INTO public.standalone_quiz_questions (id, quiz_id, question_text, question_type, order_number, points) VALUES
  ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'How consistent is your morning routine?', 'single_choice', 1, 10);
INSERT INTO public.standalone_quiz_options (question_id, label, value, is_correct, order_number) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'I have no routine - every day is different', 'none', false, 1),
  ('a1111111-1111-1111-1111-111111111111', 'Somewhat consistent - I try but often fail', 'sometimes', false, 2),
  ('a1111111-1111-1111-1111-111111111111', 'Mostly consistent - 4-5 days per week', 'mostly', true, 3),
  ('a1111111-1111-1111-1111-111111111111', 'Rock solid - My mornings are sacred', 'always', true, 4);

-- Q2: Single Choice
INSERT INTO public.standalone_quiz_questions (id, quiz_id, question_text, question_type, order_number, points) VALUES
  ('a1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'Do you schedule time for deep work?', 'single_choice', 2, 10);
INSERT INTO public.standalone_quiz_options (question_id, label, value, is_correct, order_number) VALUES
  ('a1111111-1111-1111-1111-111111111112', 'Never - I react to whatever comes up', 'never', false, 1),
  ('a1111111-1111-1111-1111-111111111112', 'Rarely - Maybe once a week', 'rarely', false, 2),
  ('a1111111-1111-1111-1111-111111111112', 'Often - I block time most days', 'often', true, 3),
  ('a1111111-1111-1111-1111-111111111112', 'Always - Deep work is non-negotiable', 'always', true, 4);

-- Q3: Single Choice
INSERT INTO public.standalone_quiz_questions (id, quiz_id, question_text, question_type, order_number, points) VALUES
  ('a1111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 'How do you end your day?', 'single_choice', 3, 10);
INSERT INTO public.standalone_quiz_options (question_id, label, value, is_correct, order_number) VALUES
  ('a1111111-1111-1111-1111-111111111113', 'Scrolling until I pass out', 'poor', false, 1),
  ('a1111111-1111-1111-1111-111111111113', 'Watching TV or gaming', 'average', false, 2),
  ('a1111111-1111-1111-1111-111111111113', 'Reading or journaling', 'good', true, 3),
  ('a1111111-1111-1111-1111-111111111113', 'A full wind-down ritual', 'excellent', true, 4);

-- Q4: Scale 1-10
INSERT INTO public.standalone_quiz_questions (id, quiz_id, question_text, question_type, order_number, points) VALUES
  ('a1111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111111', 'On a scale of 1-10, how aligned does your daily rhythm feel with who you want to become?', 'scale_1_10', 4, 10);

-- Q5: Text
INSERT INTO public.standalone_quiz_questions (id, quiz_id, question_text, question_type, order_number, points) VALUES
  ('a1111111-1111-1111-1111-111111111115', '11111111-1111-1111-1111-111111111111', 'What is ONE change you could make to your daily rhythm that would have the biggest impact?', 'text', 5, 10);

-- =============================================
-- SEED QUESTIONS FOR QUIZ 2: Energy Audit
-- =============================================

-- Q1: Single Choice
INSERT INTO public.standalone_quiz_questions (id, quiz_id, question_text, question_type, order_number, points) VALUES
  ('a2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 'How would you describe your sleep quality?', 'single_choice', 1, 10);
INSERT INTO public.standalone_quiz_options (question_id, label, value, is_correct, order_number) VALUES
  ('a2222222-2222-2222-2222-222222222221', 'Terrible - I rarely feel rested', 'poor', false, 1),
  ('a2222222-2222-2222-2222-222222222221', 'Inconsistent - Good some nights, bad others', 'fair', false, 2),
  ('a2222222-2222-2222-2222-222222222221', 'Good - I usually wake up refreshed', 'good', true, 3),
  ('a2222222-2222-2222-2222-222222222221', 'Excellent - Sleep is optimized', 'excellent', true, 4);

-- Q2: Single Choice
INSERT INTO public.standalone_quiz_questions (id, quiz_id, question_text, question_type, order_number, points) VALUES
  ('a2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'How often do you exercise?', 'single_choice', 2, 10);
INSERT INTO public.standalone_quiz_options (question_id, label, value, is_correct, order_number) VALUES
  ('a2222222-2222-2222-2222-222222222222', 'Never or almost never', 'never', false, 1),
  ('a2222222-2222-2222-2222-222222222222', '1-2 times per week', 'sometimes', false, 2),
  ('a2222222-2222-2222-2222-222222222222', '3-4 times per week', 'often', true, 3),
  ('a2222222-2222-2222-2222-222222222222', 'Daily movement practice', 'daily', true, 4);

-- Q3: Single Choice
INSERT INTO public.standalone_quiz_questions (id, quiz_id, question_text, question_type, order_number, points) VALUES
  ('a2222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222', 'What drains your energy the most?', 'single_choice', 3, 10);
INSERT INTO public.standalone_quiz_options (question_id, label, value, is_correct, order_number) VALUES
  ('a2222222-2222-2222-2222-222222222223', 'Toxic relationships or people', 'relationships', false, 1),
  ('a2222222-2222-2222-2222-222222222223', 'Overwhelming workload', 'work', false, 2),
  ('a2222222-2222-2222-2222-222222222223', 'Lack of purpose or direction', 'purpose', false, 3),
  ('a2222222-2222-2222-2222-222222222223', 'Nothing major - I manage my energy well', 'managed', true, 4);

-- Q4: Scale 1-10
INSERT INTO public.standalone_quiz_questions (id, quiz_id, question_text, question_type, order_number, points) VALUES
  ('a2222222-2222-2222-2222-222222222224', '22222222-2222-2222-2222-222222222222', 'Rate your overall energy level on most days (1=exhausted, 10=vibrant)', 'scale_1_10', 4, 10);

-- Q5: Text
INSERT INTO public.standalone_quiz_questions (id, quiz_id, question_text, question_type, order_number, points) VALUES
  ('a2222222-2222-2222-2222-222222222225', '22222222-2222-2222-2222-222222222222', 'What activity gives you the most energy? How can you do more of it?', 'text', 5, 10);

-- =============================================
-- SEED QUESTIONS FOR QUIZ 3: Systems Check
-- =============================================

-- Q1: Single Choice
INSERT INTO public.standalone_quiz_questions (id, quiz_id, question_text, question_type, order_number, points) VALUES
  ('a3333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333', 'How would you describe your closest relationships?', 'single_choice', 1, 10);
INSERT INTO public.standalone_quiz_options (question_id, label, value, is_correct, order_number) VALUES
  ('a3333333-3333-3333-3333-333333333331', 'Strained or non-existent', 'poor', false, 1),
  ('a3333333-3333-3333-3333-333333333331', 'Surface level - we dont go deep', 'shallow', false, 2),
  ('a3333333-3333-3333-3333-333333333331', 'Good but could improve', 'good', true, 3),
  ('a3333333-3333-3333-3333-333333333331', 'Deeply supportive and nourishing', 'excellent', true, 4);

-- Q2: Single Choice
INSERT INTO public.standalone_quiz_questions (id, quiz_id, question_text, question_type, order_number, points) VALUES
  ('a3333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333', 'Do you have systems for managing stress?', 'single_choice', 2, 10);
INSERT INTO public.standalone_quiz_options (question_id, label, value, is_correct, order_number) VALUES
  ('a3333333-3333-3333-3333-333333333332', 'No - stress controls me', 'none', false, 1),
  ('a3333333-3333-3333-3333-333333333332', 'Sometimes - I have coping mechanisms', 'some', false, 2),
  ('a3333333-3333-3333-3333-333333333332', 'Yes - I have regular practices', 'regular', true, 3),
  ('a3333333-3333-3333-3333-333333333332', 'Absolutely - stress is fuel for me now', 'mastered', true, 4);

-- Q3: Single Choice
INSERT INTO public.standalone_quiz_questions (id, quiz_id, question_text, question_type, order_number, points) VALUES
  ('a3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'How do you process difficult emotions?', 'single_choice', 3, 10);
INSERT INTO public.standalone_quiz_options (question_id, label, value, is_correct, order_number) VALUES
  ('a3333333-3333-3333-3333-333333333333', 'I suppress or avoid them', 'avoid', false, 1),
  ('a3333333-3333-3333-3333-333333333333', 'They overwhelm me often', 'overwhelm', false, 2),
  ('a3333333-3333-3333-3333-333333333333', 'I acknowledge and work through them', 'process', true, 3),
  ('a3333333-3333-3333-3333-333333333333', 'I have mastery over my emotional state', 'mastery', true, 4);

-- Q4: Scale 1-10
INSERT INTO public.standalone_quiz_questions (id, quiz_id, question_text, question_type, order_number, points) VALUES
  ('a3333333-3333-3333-3333-333333333334', '33333333-3333-3333-3333-333333333333', 'How supported do you feel by the systems in your life? (1=alone, 10=fully supported)', 'scale_1_10', 4, 10);

-- Q5: Text
INSERT INTO public.standalone_quiz_questions (id, quiz_id, question_text, question_type, order_number, points) VALUES
  ('a3333333-3333-3333-3333-333333333335', '33333333-3333-3333-3333-333333333333', 'What system in your life needs the most attention right now?', 'text', 5, 10);

-- =============================================
-- SEED QUESTIONS FOR QUIZ 4: Execution Test
-- =============================================

-- Q1: Single Choice
INSERT INTO public.standalone_quiz_questions (id, quiz_id, question_text, question_type, order_number, points) VALUES
  ('a4444444-4444-4444-4444-444444444441', '44444444-4444-4444-4444-444444444444', 'When you set a goal, how often do you follow through?', 'single_choice', 1, 10);
INSERT INTO public.standalone_quiz_options (question_id, label, value, is_correct, order_number) VALUES
  ('a4444444-4444-4444-4444-444444444441', 'Rarely - I start but dont finish', 'rarely', false, 1),
  ('a4444444-4444-4444-4444-444444444441', 'Sometimes - about half the time', 'sometimes', false, 2),
  ('a4444444-4444-4444-4444-444444444441', 'Usually - I complete most goals', 'usually', true, 3),
  ('a4444444-4444-4444-4444-444444444441', 'Always - I am relentless', 'always', true, 4);

-- Q2: Single Choice
INSERT INTO public.standalone_quiz_questions (id, quiz_id, question_text, question_type, order_number, points) VALUES
  ('a4444444-4444-4444-4444-444444444442', '44444444-4444-4444-4444-444444444444', 'How do you handle setbacks?', 'single_choice', 2, 10);
INSERT INTO public.standalone_quiz_options (question_id, label, value, is_correct, order_number) VALUES
  ('a4444444-4444-4444-4444-444444444442', 'I give up easily', 'quit', false, 1),
  ('a4444444-4444-4444-4444-444444444442', 'I get frustrated but keep going', 'persist', false, 2),
  ('a4444444-4444-4444-4444-444444444442', 'I adapt and find new ways', 'adapt', true, 3),
  ('a4444444-4444-4444-4444-444444444442', 'Setbacks fuel me - I love challenges', 'thrive', true, 4);

-- Q3: Single Choice
INSERT INTO public.standalone_quiz_questions (id, quiz_id, question_text, question_type, order_number, points) VALUES
  ('a4444444-4444-4444-4444-444444444443', '44444444-4444-4444-4444-444444444444', 'Do you track your progress on goals?', 'single_choice', 3, 10);
INSERT INTO public.standalone_quiz_options (question_id, label, value, is_correct, order_number) VALUES
  ('a4444444-4444-4444-4444-444444444443', 'Never - I set and forget', 'never', false, 1),
  ('a4444444-4444-4444-4444-444444444443', 'Sometimes - when I remember', 'sometimes', false, 2),
  ('a4444444-4444-4444-4444-444444444443', 'Weekly reviews', 'weekly', true, 3),
  ('a4444444-4444-4444-4444-444444444443', 'Daily tracking systems', 'daily', true, 4);

-- Q4: Scale 1-10
INSERT INTO public.standalone_quiz_questions (id, quiz_id, question_text, question_type, order_number, points) VALUES
  ('a4444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'How disciplined would you say you are? (1=no discipline, 10=iron will)', 'scale_1_10', 4, 10);

-- Q5: Text
INSERT INTO public.standalone_quiz_questions (id, quiz_id, question_text, question_type, order_number, points) VALUES
  ('a4444444-4444-4444-4444-444444444445', '44444444-4444-4444-4444-444444444444', 'What is one goal you have been putting off? What is the first step to start?', 'text', 5, 10);

-- =============================================
-- SEED QUESTIONS FOR QUIZ 5: Transformation Index
-- =============================================

-- Q1: Single Choice
INSERT INTO public.standalone_quiz_questions (id, quiz_id, question_text, question_type, order_number, points) VALUES
  ('a5555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555555', 'How has your identity evolved in the last year?', 'single_choice', 1, 10);
INSERT INTO public.standalone_quiz_options (question_id, label, value, is_correct, order_number) VALUES
  ('a5555555-5555-5555-5555-555555555551', 'I feel stuck - same as before', 'stuck', false, 1),
  ('a5555555-5555-5555-5555-555555555551', 'Small changes - nothing major', 'small', false, 2),
  ('a5555555-5555-5555-5555-555555555551', 'Significant growth - I am different', 'significant', true, 3),
  ('a5555555-5555-5555-5555-555555555551', 'Completely transformed - unrecognizable', 'transformed', true, 4);

-- Q2: Single Choice
INSERT INTO public.standalone_quiz_questions (id, quiz_id, question_text, question_type, order_number, points) VALUES
  ('a5555555-5555-5555-5555-555555555552', '55555555-5555-5555-5555-555555555555', 'How do you view challenges?', 'single_choice', 2, 10);
INSERT INTO public.standalone_quiz_options (question_id, label, value, is_correct, order_number) VALUES
  ('a5555555-5555-5555-5555-555555555552', 'Threats to avoid', 'threat', false, 1),
  ('a5555555-5555-5555-5555-555555555552', 'Necessary evils', 'tolerate', false, 2),
  ('a5555555-5555-5555-5555-555555555552', 'Opportunities to learn', 'opportunity', true, 3),
  ('a5555555-5555-5555-5555-555555555552', 'Gifts that accelerate growth', 'gift', true, 4);

-- Q3: Single Choice
INSERT INTO public.standalone_quiz_questions (id, quiz_id, question_text, question_type, order_number, points) VALUES
  ('a5555555-5555-5555-5555-555555555553', '55555555-5555-5555-5555-555555555555', 'Do you have a clear vision for your future self?', 'single_choice', 3, 10);
INSERT INTO public.standalone_quiz_options (question_id, label, value, is_correct, order_number) VALUES
  ('a5555555-5555-5555-5555-555555555553', 'No - I take it day by day', 'none', false, 1),
  ('a5555555-5555-5555-5555-555555555553', 'Vague ideas but nothing concrete', 'vague', false, 2),
  ('a5555555-5555-5555-5555-555555555553', 'Clear vision for the next few years', 'clear', true, 3),
  ('a5555555-5555-5555-5555-555555555553', 'Vivid, detailed vision I work toward daily', 'vivid', true, 4);

-- Q4: Scale 1-10
INSERT INTO public.standalone_quiz_questions (id, quiz_id, question_text, question_type, order_number, points) VALUES
  ('a5555555-5555-5555-5555-555555555554', '55555555-5555-5555-5555-555555555555', 'How committed are you to becoming your best self? (1=not at all, 10=absolutely)', 'scale_1_10', 4, 10);

-- Q5: Text
INSERT INTO public.standalone_quiz_questions (id, quiz_id, question_text, question_type, order_number, points) VALUES
  ('a5555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'Describe your future self in 3 years. What does that person look like, feel like, and do?', 'text', 5, 10);