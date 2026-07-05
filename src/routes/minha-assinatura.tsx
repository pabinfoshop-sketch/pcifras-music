import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";

export const Route = createFileRoute("/minha-assinatura")({
  head: () => ({
    meta: [
      { title: "Minha Assinatura — pCifras" },
      { name: "description", content: "Gerencie seu plano e sua assinatura Premium do pCifras." },
      { property: "og:title", content: "Minha Assinatura — pCifras" },
      { property: "og:description", content: "Portal do assinante do pCifras." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MinhaAssinaturaPage,
});

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function MinhaAssinaturaPage() {
  const { isPremium, isLoading, status, expiresAt } = useSubscription();
  const [email, setEmail] = useState<string | null>(null);
  const [showManage, setShowManage] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = "/auth?next=/minha-assinatura";
        return;
      }
      setEmail(data.user.email ?? null);
    });
  }, []);

  const statusLabel = isPremium
    ? "Premium Ativo"
    : status === "canceled"
      ? "Cancelado"
      : "Gratuito";

  const statusColor = isPremium
    ? "text-[#f5c451]"
    : status === "canceled"
      ? "text-red-400"
      : "text-white/60";

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white px-5 py-10 sm:py-16">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-sm text-white/60 hover:text-white transition">← Voltar</Link>
          <Link to="/planos" className="text-sm text-white/60 hover:text-white transition">Ver planos</Link>
        </div>

        <header className="mb-8">
          <span className="inline-block text-xs uppercase tracking-widest text-[#f5c451] mb-2">Portal do assinante</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Minha Assinatura</h1>
          {email && <p className="text-white/50 text-sm mt-2">{email}</p>}
        </header>

        {isLoading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-white/50">Carregando…</div>
        ) : (
          <>
            {isPremium && (
              <div className="mb-6 rounded-2xl p-[1.5px] bg-gradient-to-br from-[#f5c451] via-[#d4a017] to-[#f5c451] shadow-[0_20px_60px_-20px_rgba(245,196,81,0.4)]">
                <div className="rounded-2xl bg-[#12141b] px-5 py-4 flex items-center gap-3">
                  <span className="text-2xl">👑</span>
                  <div>
                    <div className="font-bold">Membro Premium</div>
                    <div className="text-xs text-white/60">Acesso total a todos os recursos.</div>
                  </div>
                </div>
              </div>
            )}

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7 mb-6">
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm text-white/60">Status atual</span>
                <span className={`text-sm font-bold ${statusColor}`}>{statusLabel}</span>
              </div>
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm text-white/60">
                  {isPremium ? "Renova / expira em" : "Expiração"}
                </span>
                <span className="text-sm font-semibold">
                  {expiresAt ? formatDate(expiresAt) : (isPremium ? "—" : "Não aplicável")}
                </span>
              </div>

              {isPremium ? (
                <button
                  type="button"
                  onClick={() => setShowManage(true)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#f5c451] to-[#d4a017] text-[#1a1200] text-sm font-bold hover:brightness-110 transition shadow-[0_10px_30px_-8px_rgba(245,196,81,0.5)]"
                >
                  ⚙️ Gerenciar Assinatura
                </button>
              ) : (
                <Link
                  to="/planos"
                  className="block text-center w-full py-3 rounded-xl bg-gradient-to-r from-[#f5c451] to-[#d4a017] text-[#1a1200] text-sm font-bold hover:brightness-110 transition shadow-[0_10px_30px_-8px_rgba(245,196,81,0.5)]"
                >
                  ⭐ Assine o Premium
                </Link>
              )}
            </section>

            <p className="text-center text-xs text-white/40">
              🔒 Pagamento processado pelo Mercado Pago · Suporte em português
            </p>
          </>
        )}

        {showManage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5"
            onClick={() => setShowManage(false)}
          >
            <div
              className="w-full max-w-md rounded-2xl bg-[#12141b] border border-white/10 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold mb-2">Gerenciar assinatura</h2>
              <p className="text-sm text-white/70 mb-4">
                Sua assinatura é processada pelo <strong>Mercado Pago</strong>. Para cancelar, pausar
                ou alterar a forma de pagamento:
              </p>
              <ol className="text-sm text-white/70 space-y-2 list-decimal pl-5 mb-5">
                <li>Acesse <span className="text-white">mercadopago.com.br</span> e entre com sua conta.</li>
                <li>Vá em <span className="text-white">Minhas Assinaturas</span>.</li>
                <li>Selecione <span className="text-white">pCifras Premium</span> e escolha a ação desejada.</li>
              </ol>
              <div className="flex gap-2">
                <a
                  href="https://www.mercadopago.com.br/subscriptions"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 text-center py-2.5 rounded-xl bg-gradient-to-r from-[#f5c451] to-[#d4a017] text-[#1a1200] text-sm font-bold"
                >
                  Abrir Mercado Pago
                </a>
                <button
                  type="button"
                  onClick={() => setShowManage(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-white/80 hover:bg-white/5"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
