
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (name, email) ON public.profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.is_premium(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = _user_id
      AND (
        (p.subscription_status = 'premium'
          AND (p.subscription_expires_at IS NULL OR p.subscription_expires_at > now()))
        OR (p.premium = true
          AND (p.premium_until IS NULL OR p.premium_until > now()))
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.enforce_free_song_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  song_count int;
BEGIN
  IF public.is_premium(NEW.user_id) THEN
    RETURN NEW;
  END IF;
  SELECT count(*) INTO song_count FROM public.songs WHERE user_id = NEW.user_id;
  IF song_count >= 2 THEN
    RAISE EXCEPTION 'free_tier_song_limit_reached'
      USING HINT = 'Upgrade to Premium to add more songs.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_free_song_limit ON public.songs;
CREATE TRIGGER trg_enforce_free_song_limit
  BEFORE INSERT ON public.songs
  FOR EACH ROW EXECUTE FUNCTION public.enforce_free_song_limit();

CREATE OR REPLACE FUNCTION public.enforce_free_setlist_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  setlist_count int;
BEGIN
  IF public.is_premium(NEW.user_id) THEN
    RETURN NEW;
  END IF;
  SELECT count(*) INTO setlist_count FROM public.setlists WHERE user_id = NEW.user_id;
  IF setlist_count >= 1 THEN
    RAISE EXCEPTION 'free_tier_setlist_limit_reached'
      USING HINT = 'Upgrade to Premium to create more setlists.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_free_setlist_limit ON public.setlists;
CREATE TRIGGER trg_enforce_free_setlist_limit
  BEFORE INSERT ON public.setlists
  FOR EACH ROW EXECUTE FUNCTION public.enforce_free_setlist_limit();
