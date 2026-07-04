
CREATE TABLE public.repertorios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.repertorios TO authenticated;
GRANT ALL ON public.repertorios TO service_role;
ALTER TABLE public.repertorios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own repertorios" ON public.repertorios FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_repertorios_user ON public.repertorios(user_id);

CREATE TABLE public.musicas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repertorio_id UUID REFERENCES public.repertorios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  artista TEXT,
  cifra TEXT,
  tom TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.musicas TO authenticated;
GRANT ALL ON public.musicas TO service_role;
ALTER TABLE public.musicas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own musicas" ON public.musicas FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_musicas_user ON public.musicas(user_id);
CREATE INDEX idx_musicas_repertorio ON public.musicas(repertorio_id);
