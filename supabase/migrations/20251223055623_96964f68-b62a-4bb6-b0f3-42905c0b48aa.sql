-- HotStepper Daily Steps Tracking
CREATE TABLE public.hotstepper_daily_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  steps INTEGER DEFAULT 0,
  distance_km DECIMAL(10,2) DEFAULT 0,
  calories INTEGER DEFAULT 0,
  active_minutes INTEGER DEFAULT 0,
  data_source TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, date)
);

-- HotStepper Active Workout Sessions
CREATE TABLE public.hotstepper_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER DEFAULT 0,
  steps INTEGER DEFAULT 0,
  distance_km DECIMAL(10,2) DEFAULT 0,
  route_points JSONB DEFAULT '[]'::jsonb,
  avg_speed DECIMAL(6,2) DEFAULT 0,
  max_speed DECIMAL(6,2) DEFAULT 0,
  avg_pace DECIMAL(6,2) DEFAULT 0,
  data_source TEXT DEFAULT 'gps',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- HotStepper Streaks Tracking
CREATE TABLE public.hotstepper_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_target_hit_date DATE,
  total_days_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- HotStepper Audiobook Bookmarks
CREATE TABLE public.hotstepper_audiobook_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  chapter_id INTEGER NOT NULL,
  timestamp_seconds INTEGER NOT NULL,
  label TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- HotStepper Audiobook Progress
CREATE TABLE public.hotstepper_audiobook_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  chapter_id INTEGER NOT NULL,
  progress_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  last_played_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, chapter_id)
);

-- Add HotStepper-related columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS daily_step_goal INTEGER DEFAULT 10000,
ADD COLUMN IF NOT EXISTS height_cm INTEGER,
ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(5,1),
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS hotstepper_onboarded BOOLEAN DEFAULT false;

-- Enable RLS on all HotStepper tables
ALTER TABLE public.hotstepper_daily_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotstepper_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotstepper_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotstepper_audiobook_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotstepper_audiobook_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hotstepper_daily_steps
CREATE POLICY "Users can view their own daily steps"
ON public.hotstepper_daily_steps FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily steps"
ON public.hotstepper_daily_steps FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily steps"
ON public.hotstepper_daily_steps FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for hotstepper_sessions
CREATE POLICY "Users can view their own sessions"
ON public.hotstepper_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
ON public.hotstepper_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
ON public.hotstepper_sessions FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for hotstepper_streaks
CREATE POLICY "Users can view their own streaks"
ON public.hotstepper_streaks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks"
ON public.hotstepper_streaks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks"
ON public.hotstepper_streaks FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for hotstepper_audiobook_bookmarks
CREATE POLICY "Users can manage their own bookmarks"
ON public.hotstepper_audiobook_bookmarks FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for hotstepper_audiobook_progress
CREATE POLICY "Users can view their own audiobook progress"
ON public.hotstepper_audiobook_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audiobook progress"
ON public.hotstepper_audiobook_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own audiobook progress"
ON public.hotstepper_audiobook_progress FOR UPDATE
USING (auth.uid() = user_id);

-- Leaderboard view policy (users can see others for leaderboard)
CREATE POLICY "Users can view leaderboard data"
ON public.hotstepper_daily_steps FOR SELECT
USING (true);

-- Create updated_at trigger for hotstepper tables
CREATE TRIGGER update_hotstepper_daily_steps_updated_at
BEFORE UPDATE ON public.hotstepper_daily_steps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hotstepper_streaks_updated_at
BEFORE UPDATE ON public.hotstepper_streaks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hotstepper_audiobook_progress_updated_at
BEFORE UPDATE ON public.hotstepper_audiobook_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();