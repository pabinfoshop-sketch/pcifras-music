
-- Trigger-only functions: revoke all execute
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_free_song_limit() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_free_setlist_limit() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_unauthorized_profile_updates() FROM PUBLIC, anon, authenticated;

-- Helper functions used inside RLS policies: restrict to authenticated only (not anon)
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

REVOKE ALL ON FUNCTION public.is_premium(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_premium(uuid) TO authenticated;
