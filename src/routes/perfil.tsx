import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import BottomNav from "@/components/BottomNav";

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

type UserInfo = { id: string; email: string | null; name: string | null; avatar: string | null };

function PerfilPage() {
  const { isPremium, isLoading } = useSubscription();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = "/auth?next=/perfil";
        return;
      }
      const meta = data.user.user_metadata || {};
      setUser({
        id: data.user.id,
        email: data.user.email ?? null,
        name: meta.full_name || meta.name || null,
        avatar: meta.avatar_url || meta.picture || null,
      });
      setReady(true);
    });
  }, []);

  const { data: stats } = useQuery({
    queryKey: ["perfil-stats", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const uid = user!.id;
      const [rep, songs] = await Promise.all([
        supabase.from("repertoires").select("id", { count: "exact", head: true }).eq("user_id", uid),
        supabase.from("musicas").select("id", { count: "exact", head: true }).eq("user_id", uid),
      ]);
      return { repertoires: rep.count ?? 0, songs: songs.count ?? 0 };
    },
  });

  async function handleLogout() {
    await supabase.auth.signOut();
    try { localStorage.removeItem("cifras_user"); } catch {}
    window.location.href = "/";
  }

  if (!ready || !user) {
    return <div className="min-h-screen bg-[#0b0d12] text-white/60 flex items-center justify-center">Carregando…</div>;
  }

  const initials = (user.name || user.email || "?").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white px-5 py-10 pb-28">
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
            <span className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${isPremium ? "bg-[#f5c451]/20 text-[#f5c451]" : "bg-white/10 text-white/60"}`}>
              {isLoading ? "…" : isPremium ? "⭐ Premium" : "Gratuito"}
            </span>
          </div>
        </div>

        <section className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <div className="text-2xl font-extrabold">{stats?.songs ?? 0}</div>
            <div className="text-xs text-white/60 mt-1">Músicas Salvas</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <div className="text-2xl font-extrabold">{stats?.repertoires ?? 0}</div>
            <div className="text-xs text-white/60 mt-1">Repertórios</div>
          </div>
        </section>

        <Link
          to="/minha-assinatura"
          className="mt-4 block text-center w-full py-3 rounded-xl bg-gradient-to-r from-[#f5c451] to-[#d4a017] text-[#1a1200] text-sm font-bold hover:brightness-110 transition"
        >
          {isPremium ? "Gerenciar Assinatura" : "Fazer Upgrade Premium"}
        </Link>

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
          Sair da Conta
        </button>
      </div>
      <BottomNav />
    </div>
  );
}
