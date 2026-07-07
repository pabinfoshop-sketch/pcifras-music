
CREATE TABLE public.repertoires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.repertoires TO authenticated;
GRANT ALL ON public.repertoires TO service_role;
ALTER TABLE public.repertoires ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own repertoires" ON public.repertoires
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.repertoire_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repertoire_id UUID NOT NULL REFERENCES public.repertoires(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES public.public_songs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(repertoire_id, song_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.repertoire_songs TO authenticated;
GRANT ALL ON public.repertoire_songs TO service_role;
ALTER TABLE public.repertoire_songs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own repertoire songs" ON public.repertoire_songs
  FOR ALL USING (
    repertoire_id IN (SELECT id FROM public.repertoires WHERE user_id = auth.uid())
  ) WITH CHECK (
    repertoire_id IN (SELECT id FROM public.repertoires WHERE user_id = auth.uid())
  );

CREATE INDEX idx_repertoires_user ON public.repertoires(user_id);
CREATE INDEX idx_repertoire_songs_rep ON public.repertoire_songs(repertoire_id);

CREATE TRIGGER trg_repertoires_updated_at
  BEFORE UPDATE ON public.repertoires
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
