-- Supabase Database Schema Migration
-- Paste and execute this SQL inside your Supabase SQL Editor to configure user-ownership 
-- and set up Row Level Security (RLS) policies on the resumes table.

-- 1. Alter resumes table to attach foreign key reference to Supabase auth.users(id)
ALTER TABLE resumes 
  ALTER COLUMN user_id TYPE uuid USING (
    CASE 
      WHEN user_id = 'anonymous' THEN NULL 
      ELSE user_id::uuid 
    END
  ),
  ADD CONSTRAINT fk_resumes_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS updated_at timestamp default now(),
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS google_account boolean default false;

-- 2. Enable Row Level Security (RLS) on the resumes table
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- 3. Clean up any previous anonymous/test policies to avoid overrides
DROP POLICY IF EXISTS "Allow anonymous insert" ON resumes;
DROP POLICY IF EXISTS "Allow anonymous select" ON resumes;
DROP POLICY IF EXISTS "Users can insert their own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can view their own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can update their own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can delete their own resumes" ON resumes;

-- 4. Create secure RLS policies for individual user ownership
-- Users can only insert resumes belonging to themselves
CREATE POLICY "Users can insert their own resumes" ON resumes
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Users can only view resumes belonging to themselves
CREATE POLICY "Users can view their own resumes" ON resumes
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can only update resumes belonging to themselves
CREATE POLICY "Users can update their own resumes" ON resumes
  FOR UPDATE USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);

-- Users can only delete resumes belonging to themselves
CREATE POLICY "Users can delete their own resumes" ON resumes
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- 5. Create user_profiles table for Role-Based Access Control (RBAC)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  role text DEFAULT 'user',
  created_at timestamp DEFAULT now()
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Clean up any previous policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;

-- Users can read/update only their own profile
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Helper function running with SECURITY DEFINER to bypass RLS recursion on user_profiles
CREATE OR REPLACE FUNCTION public.check_if_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admins can read all profiles
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR SELECT USING (
    public.check_if_admin(auth.uid())
  );

-- Trigger to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role)
  VALUES (new.id, new.email, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing users (if any)
INSERT INTO public.user_profiles (id, email, role)
SELECT id, email, 'user'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- SQL to manually promote one account:
-- UPDATE public.user_profiles SET role = 'admin' WHERE email = 'YOUR_EMAIL_HERE';

-- 10. Job Tracker Table
CREATE TABLE IF NOT EXISTS public.job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company text NOT NULL,
  role text NOT NULL,
  salary text,
  platform text,
  date date NOT NULL DEFAULT current_date,
  status text NOT NULL CHECK (status IN ('Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn')),
  notes text,
  reminders timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on job_applications
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Drop previous policies if any
DROP POLICY IF EXISTS "Users can manage their own job applications" ON public.job_applications;

-- Policy: Users can manage all operations on their own job applications
CREATE POLICY "Users can manage their own job applications" ON public.job_applications
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_apps_user ON public.job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_apps_status ON public.job_applications(status);

-- 11. Resume Shares Table
CREATE TABLE IF NOT EXISTS public.resume_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id uuid NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  views_count integer DEFAULT 0,
  downloads_count integer DEFAULT 0,
  is_public boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on resume_shares
ALTER TABLE public.resume_shares ENABLE ROW LEVEL SECURITY;

-- Drop previous policies
DROP POLICY IF EXISTS "Public can view shared resumes" ON public.resume_shares;
DROP POLICY IF EXISTS "Owners can manage their resume shares" ON public.resume_shares;

-- Public can view shares if is_public = true (only SELECT)
CREATE POLICY "Public can view shared resumes" ON public.resume_shares
  FOR SELECT USING (is_public = true);

-- Owners can view/manage their resume shares
CREATE POLICY "Owners can manage their resume shares" ON public.resume_shares
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.resumes
      WHERE resumes.id::text = resume_shares.resume_id::text AND resumes.user_id::text = auth.uid()::text
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.resumes
      WHERE resumes.id::text = resume_shares.resume_id::text AND resumes.user_id::text = auth.uid()::text
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_resume_shares_token ON public.resume_shares(token);
CREATE INDEX IF NOT EXISTS idx_resume_shares_resume ON public.resume_shares(resume_id);

-- 12. user_profiles additions
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS has_completed_onboarding boolean DEFAULT false;

-- 13. job_applications additions
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS resume_id uuid REFERENCES public.resumes(id) ON DELETE SET NULL;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS jd_text text;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS jd_url text;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS jd_match_score integer;

-- 14. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  type text NOT NULL,
  is_read boolean DEFAULT false,
  link text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop previous policy if any
DROP POLICY IF EXISTS "Users can manage their own notifications" ON public.notifications;

-- Policy: Users can view and manage their own notifications
CREATE POLICY "Users can manage their own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Index for notifications performance
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);

-- 15. AI Requests Logging Table
CREATE TABLE IF NOT EXISTS public.ai_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_used text NOT NULL,
  tokens_estimated integer,
  success boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on ai_requests
ALTER TABLE public.ai_requests ENABLE ROW LEVEL SECURITY;

-- Drop previous policies if any
DROP POLICY IF EXISTS "Users can view their own ai requests" ON public.ai_requests;
DROP POLICY IF EXISTS "Users can insert their own ai requests" ON public.ai_requests;
DROP POLICY IF EXISTS "Admins can view all ai requests" ON public.ai_requests;

-- Policies for ai_requests
CREATE POLICY "Users can view their own ai requests" ON public.ai_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ai requests" ON public.ai_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all ai requests" ON public.ai_requests
  FOR SELECT USING (public.check_if_admin(auth.uid()));

-- Index for ai_requests performance
CREATE INDEX IF NOT EXISTS idx_ai_requests_user ON public.ai_requests(user_id);


-- 16. Pending Keywords Table (Phase 2 Dynamic ATS)
CREATE TABLE IF NOT EXISTS public.pending_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry text NOT NULL,
  keyword text NOT NULL,
  weight integer NOT NULL,
  aliases text[] DEFAULT '{}',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on pending_keywords
ALTER TABLE public.pending_keywords ENABLE ROW LEVEL SECURITY;

-- Drop previous policies if any
DROP POLICY IF EXISTS "Admins can manage pending keywords" ON public.pending_keywords;

-- Policy: Only admins can read/write
CREATE POLICY "Admins can manage pending keywords" ON public.pending_keywords
  FOR ALL USING (public.check_if_admin(auth.uid())) WITH CHECK (public.check_if_admin(auth.uid()));

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_pending_keywords_industry ON public.pending_keywords(industry);
CREATE INDEX IF NOT EXISTS idx_pending_keywords_status ON public.pending_keywords(status);

-- 17. Resume Improvement Suggestions Table
CREATE TABLE IF NOT EXISTS public.resume_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN (
    'missing_keyword',
    'missing_skill',
    'experience_gap',
    'skill_enhancement',
    'formatting_improvement'
  )),
  title TEXT NOT NULL,
  description TEXT,
  suggested_text TEXT NOT NULL,
  category TEXT,
  priority INT DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
  is_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(resume_id, suggestion_type, suggested_text)
);

ALTER TABLE public.resume_suggestions ENABLE ROW LEVEL SECURITY;

-- Drop previous policies if any
DROP POLICY IF EXISTS "Users can view their own suggestions" ON public.resume_suggestions;
DROP POLICY IF EXISTS "Users can manage their own suggestions" ON public.resume_suggestions;

CREATE POLICY "Users can manage their own suggestions"
  ON public.resume_suggestions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_resume_suggestions_resume ON public.resume_suggestions(resume_id);

-- 18. Comprehensive Resume Improvement Suggestions Table
CREATE TABLE IF NOT EXISTS public.resume_improvement_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  suggestion_category TEXT NOT NULL CHECK (suggestion_category IN (
    'ats_keyword',
    'technical_skill',
    'soft_skill',
    'experience_bullet',
    'achievement_quantification',
    'action_verb',
    'professional_summary',
    'education',
    'certification',
    'project',
    'formatting',
    'contact_info',
    'skills_organization',
    'work_experience_structure'
  )),
  
  title TEXT NOT NULL,
  description TEXT,
  suggested_text TEXT,
  current_text TEXT,
  impact_level TEXT CHECK (impact_level IN ('high', 'medium', 'low')),
  priority INT DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
  section TEXT,
  is_accepted BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.resume_improvement_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and manage their suggestions"
  ON public.resume_improvement_suggestions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_resume_imp_sugg_resume ON public.resume_improvement_suggestions(resume_id);

-- 19. Career Journal Entries Table
CREATE TABLE IF NOT EXISTS public.career_journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT current_date,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('win', 'gap', 'skill', 'feedback', 'project', 'certification', 'promotion', 'other')),
  content TEXT NOT NULL,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'imported', 'prompted')),
  linked_role TEXT,
  tags TEXT[] DEFAULT '{}',
  extracted_metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.career_journal_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own journal entries" ON public.career_journal_entries;

CREATE POLICY "Users can manage their own journal entries"
  ON public.career_journal_entries
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_career_journal_user ON public.career_journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_career_journal_date ON public.career_journal_entries(date);
CREATE INDEX IF NOT EXISTS idx_career_journal_type ON public.career_journal_entries(entry_type);
