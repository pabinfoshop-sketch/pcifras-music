CREATE OR REPLACE FUNCTION public.prevent_unauthorized_profile_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() <> 'service_role' THEN
    IF (OLD.premium IS DISTINCT FROM NEW.premium
        OR OLD.premium_until IS DISTINCT FROM NEW.premium_until
        OR OLD.subscription_status IS DISTINCT FROM NEW.subscription_status
        OR OLD.subscription_expires_at IS DISTINCT FROM NEW.subscription_expires_at) THEN
      RAISE EXCEPTION 'Unauthorized update to subscription columns'
        USING HINT = 'Subscription fields can only be modified by the payment webhook.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_profile_update_policy ON public.profiles;

CREATE TRIGGER enforce_profile_update_policy
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_unauthorized_profile_updates();