-- Run this in your Supabase SQL Editor

-- 1. Add referral columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id);

-- 2. Backfill existing profiles with a referral code (first 8 chars of their UUID)
UPDATE public.profiles 
SET referral_code = SUBSTRING(id::text, 1, 8) 
WHERE referral_code IS NULL;

-- 3. Modify handle_new_user trigger to generate a referral code automatically
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, tier, credit_balance, referral_code)
  VALUES (new.id, 'free', 100, SUBSTRING(new.id::text, 1, 8));

  INSERT INTO public.credit_transactions (user_id, amount, reason, category, expires_at)
  VALUES (new.id, 100, 'Welcome Bonus', 'welcome', now() + interval '24 months');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
