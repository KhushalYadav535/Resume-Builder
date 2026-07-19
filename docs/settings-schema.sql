-- Run this in your Supabase SQL Editor to enable dynamic app settings

-- 1. Create the settings table
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Insert the default referral bonus setting (50 credits)
INSERT INTO public.app_settings (key, value) 
VALUES ('referral_bonus_amount', '50'::jsonb) 
ON CONFLICT (key) DO NOTHING;

-- 3. Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- 4. Clean up any previous policies to avoid conflicts
DROP POLICY IF EXISTS "Public can view settings" ON public.app_settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON public.app_settings;

-- 5. Policies
-- Anyone can read settings
CREATE POLICY "Public can view settings" ON public.app_settings 
  FOR SELECT USING (true);

-- Only admins can insert/update/delete settings
CREATE POLICY "Admins can manage settings" ON public.app_settings 
  FOR ALL USING (public.check_if_admin(auth.uid())) WITH CHECK (public.check_if_admin(auth.uid()));
