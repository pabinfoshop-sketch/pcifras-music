import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil — pCifras" },
      { name: "description", content: "Seu perfil no pCifras." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PerfilPage,
});

function PerfilPage() {
  const { isPremium, isLoading } = useSubscription();
  const [user, setUser] = useState<{ email: string | null; name: string | null; avatar: string | null } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = "/auth?next=/perfil";
        return;
      }
      const meta = data.user.user_metadata || {};
      setUser({
        email: data.user.email ?? null,
        name: meta.full_name || meta.name || null,
        avatar: meta.avatar_url || meta.picture || null,
      });
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    try { localStorage.removeItem("cifras_user"); } catch {}
    window.location.href = "/";
  }

  if (!user) {
    return <div className="min-h-screen bg-[#0b0d12] text-white/60 flex items-center justify-center">Carregando…</div>;
  }

  const initials = (user.name || user.email || "?").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white px-5 py-10">
      <div className="max-w-xl mx-auto">
        <Link to="/" className="text-sm text-white/60 hover:text-white">← Voltar</Link>

        <div className="mt-8 flex items-center gap-4">
          {user.avatar ? (
            <img src={user.avatar} alt="" className="w-20 h-20 rounded-full border-2 border-[#f5c451]/40" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#f5c451] to-[#d4a017] flex items-center justify-center text-[#1a1200] font-extrabold text-2xl">
              {initials}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-extrabold">{user.name || "Usuário"}</h1>
            <p className="text-white/60 text-sm">{user.email}</p>
          </div>
        </div>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-white/60">Assinatura</span>
            <span className={`text-sm font-bold ${isPremium ? "text-[#f5c451]" : "text-white/60"}`}>
              {isLoading ? "…" : isPremium ? "👑 Premium" : "Grátis"}
            </span>
          </div>
          <Link
            to="/planos"
            className="block text-center w-full py-3 rounded-xl bg-gradient-to-r from-[#f5c451] to-[#d4a017] text-[#1a1200] text-sm font-bold hover:brightness-110 transition"
          >
            {isPremium ? "Gerenciar assinatura" : "⭐ Assinar Premium"}
          </Link>
        </section>

        <section className="mt-4 grid grid-cols-2 gap-3">
          <Link to="/musicas" className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center hover:bg-white/[0.06]">
            <div className="text-2xl mb-1">🎵</div>
            <div className="text-sm">Músicas</div>
          </Link>
          <Link to="/repertorios" className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center hover:bg-white/[0.06]">
            <div className="text-2xl mb-1">📚</div>
            <div className="text-sm">Repertórios</div>
          </Link>
        </section>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 w-full py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 text-sm font-semibold transition"
        >
          Sair da conta
        </button>
      </div>
    </div>
  );
}
