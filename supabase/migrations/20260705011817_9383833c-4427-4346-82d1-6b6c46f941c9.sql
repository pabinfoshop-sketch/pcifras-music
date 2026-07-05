ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz;