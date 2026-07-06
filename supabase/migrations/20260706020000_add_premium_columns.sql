-- Migration: Add Mercado Pago subscription columns to profiles table
-- This migration adds columns for tracking premium subscription status

-- Add is_premium column (alias for premium, for compatibility)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false;

-- The following columns already exist in the schema but we ensure they are properly configured
-- premium: boolean - whether user has premium status
-- premium_until: timestamp - when premium expires
-- subscription_status: string - current subscription status (free, premium, canceled, etc.)
-- subscription_expires_at: timestamp - when subscription expires

-- Add index for faster premium status queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON public.profiles(is_premium) WHERE is_premium = true;

CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);

CREATE INDEX IF NOT EXISTS idx_profiles_premium_until ON public.profiles(premium_until);

-- Add check constraint for subscription_status values
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS chk_subscription_status;
ALTER TABLE public.profiles
ADD CONSTRAINT chk_subscription_status
CHECK (subscription_status IN ('free', 'premium', 'canceled', 'pending', 'trial'));

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.is_premium IS 'Alias for premium column, indicates if user has active premium subscription';
COMMENT ON COLUMN public.profiles.subscription_status IS 'Current subscription status: free, premium, canceled, pending, trial';
COMMENT ON COLUMN public.profiles.subscription_expires_at IS 'When the current subscription period ends';
COMMENT ON COLUMN public.profiles.premium_until IS 'Legacy field for premium expiration date';

-- Function to sync is_premium with premium column (for consistency)
CREATE OR REPLACE FUNCTION sync_is_premium_column()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    NEW.is_premium = NEW.premium;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_is_premium ON public.profiles;
CREATE TRIGGER trg_sync_is_premium
  BEFORE INSERT OR UPDATE OF premium ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_is_premium_column();

-- Initialize is_premium based on existing premium values
UPDATE public.profiles SET is_premium = premium WHERE is_premium IS DISTINCT FROM premium;

-- Add indexes for payments table
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_payment_id ON public.payments(provider_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- Add indexes for subscriptions table
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_provider_ref ON public.subscriptions(provider_ref);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- Ensure RLS is enabled for payments and subscriptions tables
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own payments
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can view their own subscriptions
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT, INSERT ON public.payments TO authenticated;
GRANT SELECT ON public.payments TO anon;
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
GRANT SELECT ON public.subscriptions TO anon;
