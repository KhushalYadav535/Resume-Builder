-- UpRole Pricing & Credit System Schema
-- Run this in your Supabase SQL Editor

-- 1. Create enum for tiers
CREATE TYPE subscription_tier AS ENUM ('free', 'sprint', 'pro');

-- 2. Create the user_profiles table if it doesn't exist (assuming you might have one)
-- If you already have a profiles table, just add these columns.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  tier subscription_tier DEFAULT 'free',
  tier_expiry_date TIMESTAMP WITH TIME ZONE,
  credit_balance INTEGER DEFAULT 100, -- 100 Welcome bonus
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

-- 4. Create credit_transactions table
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  amount INTEGER NOT NULL, -- Positive for earn, Negative for spend
  reason TEXT NOT NULL, -- e.g., 'Welcome Bonus', 'AI Resume Edit', 'Journal: Certification'
  category TEXT, -- For grouping analytics
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE -- For tracing expiry of purchased/earned credits
);

-- 5. Enable RLS on transactions
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.credit_transactions 
  FOR SELECT USING (auth.uid() = user_id);

-- 6. Trigger to automatically create a profile and give welcome bonus on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, tier, credit_balance)
  VALUES (new.id, 'free', 100);

  INSERT INTO public.credit_transactions (user_id, amount, reason, expires_at)
  VALUES (new.id, 100, 'Welcome Bonus', now() + interval '24 months');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to allow safe re-running
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
