
CREATE TABLE public.public_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  content TEXT NOT NULL,
  tone TEXT,
  category TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.public_songs TO anon;
GRANT SELECT ON public.public_songs TO authenticated;
GRANT ALL ON public.public_songs TO service_role;

ALTER TABLE public.public_songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read songs"
  ON public.public_songs FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert songs"
  ON public.public_songs FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update songs"
  ON public.public_songs FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete songs"
  ON public.public_songs FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_public_songs_category ON public.public_songs(category);
CREATE INDEX idx_public_songs_views ON public.public_songs(views DESC);
