-- Create meal_logs table for Tactical Nutrition
CREATE TABLE public.meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  meal_name TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein INTEGER DEFAULT 0,
  carbs INTEGER DEFAULT 0,
  fats INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meal_logs
CREATE POLICY "Users can view their own meal logs" 
ON public.meal_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal logs" 
ON public.meal_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal logs" 
ON public.meal_logs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal logs" 
ON public.meal_logs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Extend profiles table with daily_calorie_goal
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_calorie_goal INTEGER DEFAULT 2000;