-- ==============================================================================
-- UpRole — Momentum Engine Database Schema
-- Conforming to Development Specification — MVP (Uprole-Momentum-Dashboard-Specs.txt)
-- ==============================================================================

-- 1. Career Priorities Table (Spec Section 9)
CREATE TABLE IF NOT EXISTS public.career_priorities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'growth', 'leadership', 'comp', 'learning', etc.
    label TEXT NOT NULL,
    importance TEXT DEFAULT 'high', -- 'high', 'medium', 'low'
    preference TEXT,
    source TEXT DEFAULT 'User Selected',
    selected BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT career_priorities_user_type_key UNIQUE (user_id, type)
);

-- 2. Career Directions Table (Spec Section 5)
CREATE TABLE IF NOT EXISTS public.career_directions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    current_path TEXT,
    target_path TEXT,
    full_trajectory TEXT[],
    status TEXT NOT NULL DEFAULT 'Active', -- 'Active', 'Exploring', 'Paused', 'Achieved', 'Archived'
    source TEXT DEFAULT 'User Confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Career Goals Table (Spec Section 6 & 11 & 12)
CREATE TABLE IF NOT EXISTS public.career_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    direction_id UUID REFERENCES public.career_directions(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    target_role TEXT NOT NULL,
    current_role TEXT,
    target_horizon TEXT DEFAULT '6–12 months',
    goal_type TEXT NOT NULL DEFAULT 'Role Change',
    status TEXT NOT NULL DEFAULT 'Active', -- 'Exploring', 'Active', 'Paused', 'Achieved', 'Archived'
    is_primary BOOLEAN DEFAULT false,
    stage TEXT DEFAULT 'target', -- 'direction', 'target', 'strategy', 'outcome'
    objective TEXT, -- Spec Section 19: Career Objective
    strategy_overview TEXT, -- Spec Section 19: Career Strategy
    reason_summary TEXT,
    supporting_evidence JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Career Goal Milestones Table (Spec Section 7 & 10)
CREATE TABLE IF NOT EXISTS public.goal_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES public.career_goals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    stage TEXT DEFAULT 'strategy', -- 'direction', 'target', 'strategy', 'outcome'
    source_type TEXT DEFAULT 'Milestone', -- Spec Section 10: Career Event, Capability, Evidence, etc.
    evidence_snippet TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES & CONSTRAINTS
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_career_priorities_user ON public.career_priorities(user_id);
CREATE INDEX IF NOT EXISTS idx_career_directions_user ON public.career_directions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_career_goals_user ON public.career_goals(user_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_goal_milestones_goal ON public.goal_milestones(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_milestones_user_completed ON public.goal_milestones(user_id, completed);

-- Enforce at most 1 primary goal per user (Spec Section 11: 1 primary active goal)
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_primary_goal_per_user ON public.career_goals(user_id) WHERE is_primary = true;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.career_priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_directions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_milestones ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own career priorities') THEN
        CREATE POLICY "Users can manage own career priorities" ON public.career_priorities FOR ALL USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own career directions') THEN
        CREATE POLICY "Users can manage own career directions" ON public.career_directions FOR ALL USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own career goals') THEN
        CREATE POLICY "Users can manage own career goals" ON public.career_goals FOR ALL USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own goal milestones') THEN
        CREATE POLICY "Users can manage own goal milestones" ON public.goal_milestones FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;
