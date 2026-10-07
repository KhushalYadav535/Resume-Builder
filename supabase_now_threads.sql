-- ==============================================================================
-- UpRole Now — Thread Persistence Schema (Spec Section 20 & 21)
-- ==============================================================================
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/qiovlwywiparkwnedzwe/sql
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.now_threads (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  intent text NOT NULL,
  status text DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'COMPLETED', 'ABANDONED')),
  current_stage text DEFAULT 'INTENT_DETECTED',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_activity_at timestamp with time zone DEFAULT now(),
  context_snapshot jsonb DEFAULT '{}'::jsonb,
  response_snapshot jsonb DEFAULT '{}'::jsonb,
  next_action text,
  completed_at timestamp with time zone
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_now_threads_user_status ON public.now_threads(user_id, status);
CREATE INDEX IF NOT EXISTS idx_now_threads_updated ON public.now_threads(updated_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.now_threads ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies if any
DROP POLICY IF EXISTS "Users can manage their own now_threads" ON public.now_threads;
DROP POLICY IF EXISTS "Users can insert their own now_threads" ON public.now_threads;
DROP POLICY IF EXISTS "Users can select their own now_threads" ON public.now_threads;
DROP POLICY IF EXISTS "Users can update their own now_threads" ON public.now_threads;
DROP POLICY IF EXISTS "Users can delete their own now_threads" ON public.now_threads;

-- RLS Policies for authenticated users
CREATE POLICY "Users can insert their own now_threads" ON public.now_threads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select their own now_threads" ON public.now_threads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own now_threads" ON public.now_threads
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own now_threads" ON public.now_threads
  FOR DELETE USING (auth.uid() = user_id);

-- Optional: Interpretation Feedback Table (Spec Section 27)
CREATE TABLE IF NOT EXISTS public.now_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  thread_id text REFERENCES public.now_threads(id) ON DELETE SET NULL,
  block_id text,
  decision text CHECK (decision IN ('ACCEPT', 'EDIT', 'REJECT')),
  edited_text text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.now_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own feedback" ON public.now_feedback;
CREATE POLICY "Users can manage their own feedback" ON public.now_feedback
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
