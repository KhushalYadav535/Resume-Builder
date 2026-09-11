-- Career Discovery Engine Schema

-- Table to store user sessions
CREATE TABLE IF NOT EXISTS public.cde_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'in_progress', -- in_progress, completed
    profile_strength INTEGER DEFAULT 0,
    ats_readiness INTEGER DEFAULT 0,
    last_question_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table to store extracted facts
CREATE TABLE IF NOT EXISTS public.cde_facts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.cde_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    fact_key VARCHAR(100) NOT NULL,
    fact_value JSONB NOT NULL,
    source_question_id VARCHAR(100),
    confidence_score INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(session_id, fact_key)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.cde_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cde_facts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Sessions
CREATE POLICY "Users can view their own CDE sessions"
    ON public.cde_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own CDE sessions"
    ON public.cde_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CDE sessions"
    ON public.cde_sessions FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policies for Facts
CREATE POLICY "Users can view their own CDE facts"
    ON public.cde_facts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own CDE facts"
    ON public.cde_facts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CDE facts"
    ON public.cde_facts FOR UPDATE
    USING (auth.uid() = user_id);
