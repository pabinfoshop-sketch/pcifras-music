import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function MinhaAssinaturaPage() {
  const { isPremium, isLoading, status, expiresAt } = useSubscription();
  const [email, setEmail] = useState<string | null>(null);
  const [showManage, setShowManage] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = "/auth?next=/minha-assinatura";
        return;
      }
      setEmail(data.user.email ?? null);
    });
  }, []);

  const days = useMemo(() => daysUntil(expiresAt), [expiresAt]);
  const isCanceled = status === "canceled";
  const isExpired = !isPremium && !!expiresAt && days !== null && days <= 0;
  const isExpiringSoon = isPremium && days !== null && days <= 7 && days > 0;

  const statusLabel = isPremium
    ? isCanceled
      ? "Premium (cancelado)"
      : "Premium Ativo"
    : isExpired
      ? "Expirado"
      : "Gratuito";

  const statusColor = isPremium
    ? isCanceled
      ? "text-orange-400"
      : "text-[#f5c451]"
    : isExpired
      ? "text-red-400"
      : "text-white/60";

  async function handleCancel() {
    setCanceling(true);
    setFeedback(null);
    try {
      const { error } = await supabase.functions.invoke("cancel-subscription", {
        body: {},
      });
      if (error) throw error;
      setFeedback({
        type: "ok",
        msg: "Assinatura cancelada. Você continua com acesso Premium até o fim do período pago.",
      });
      setShowCancelConfirm(false);
      // Recarrega para refletir status
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao cancelar";
      setFeedback({ type: "err", msg });
    } finally {
      setCanceling(false);
    }
  }

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
            {isPremium && !isCanceled && (
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

            {isExpiringSoon && (
              <div className="mb-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
                ⚠️ Sua assinatura {isCanceled ? "termina" : "renova"} em <strong>{days} {days === 1 ? "dia" : "dias"}</strong>.
              </div>
            )}

            {isCanceled && isPremium && (
              <div className="mb-6 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-200">
                🕐 Cancelamento agendado. Você mantém o Premium até <strong>{formatDate(expiresAt)}</strong>.
              </div>
            )}

            {isExpired && (
              <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                ⛔ Sua assinatura expirou em <strong>{formatDate(expiresAt)}</strong>. Renove para reativar o Premium.
              </div>
            )}

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7 mb-6">
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm text-white/60">Status atual</span>
                <span className={`text-sm font-bold ${statusColor}`}>{statusLabel}</span>
              </div>
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm text-white/60">Plano</span>
                <span className="text-sm font-semibold">
                  {isPremium ? "Premium — R$ 19,90/mês" : "Grátis"}
                </span>
              </div>
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm text-white/60">
                  {isPremium
                    ? isCanceled
                      ? "Acesso até"
                      : "Renova em"
                    : "Expiração"}
                </span>
                <span className="text-sm font-semibold">
                  {expiresAt
                    ? `${formatDate(expiresAt)}${days !== null && days > 0 ? ` · ${days} ${days === 1 ? "dia" : "dias"}` : ""}`
                    : isPremium ? "—" : "Não aplicável"}
                </span>
              </div>

              {isPremium && !isCanceled && (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setShowManage(true)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#f5c451] to-[#d4a017] text-[#1a1200] text-sm font-bold hover:brightness-110 transition shadow-[0_10px_30px_-8px_rgba(245,196,81,0.5)]"
                  >
                    ⚙️ Gerenciar pagamento
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCancelConfirm(true)}
                    className="w-full py-2.5 rounded-xl border border-white/10 text-sm text-white/70 hover:bg-white/5 transition"
                  >
                    Cancelar assinatura
                  </button>
                </div>
              )}

              {isPremium && isCanceled && (
                <Link
                  to="/planos"
                  className="block text-center w-full py-3 rounded-xl bg-gradient-to-r from-[#f5c451] to-[#d4a017] text-[#1a1200] text-sm font-bold hover:brightness-110 transition"
                >
                  🔄 Reativar assinatura
                </Link>
              )}

              {!isPremium && (
                <Link
                  to="/planos"
                  className="block text-center w-full py-3 rounded-xl bg-gradient-to-r from-[#f5c451] to-[#d4a017] text-[#1a1200] text-sm font-bold hover:brightness-110 transition shadow-[0_10px_30px_-8px_rgba(245,196,81,0.5)]"
                >
                  ⭐ {isExpired ? "Renovar Premium" : "Assine o Premium"}
                </Link>
              )}
            </section>

            {feedback && (
              <div
                className={`mb-6 rounded-xl px-4 py-3 text-sm ${
                  feedback.type === "ok"
                    ? "border border-green-500/30 bg-green-500/10 text-green-200"
                    : "border border-red-500/30 bg-red-500/10 text-red-200"
                }`}
              >
                {feedback.msg}
              </div>
            )}

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
              <h2 className="text-lg font-bold mb-2">Gerenciar pagamento</h2>
              <p className="text-sm text-white/70 mb-4">
                Para alterar forma de pagamento ou ver histórico, acesse sua conta no <strong>Mercado Pago</strong>:
              </p>
              <ol className="text-sm text-white/70 space-y-2 list-decimal pl-5 mb-5">
                <li>Acesse <span className="text-white">mercadopago.com.br</span> e entre com sua conta.</li>
                <li>Vá em <span className="text-white">Minhas Assinaturas</span>.</li>
                <li>Selecione <span className="text-white">pCifras Premium</span>.</li>
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

        {showCancelConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5"
            onClick={() => !canceling && setShowCancelConfirm(false)}
          >
            <div
              className="w-full max-w-md rounded-2xl bg-[#12141b] border border-white/10 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold mb-2">Cancelar assinatura?</h2>
              <p className="text-sm text-white/70 mb-4">
                Você continuará com acesso Premium até <strong>{formatDate(expiresAt)}</strong>.
                Após essa data, sua conta volta ao plano Grátis (10 músicas, 1 repertório).
              </p>
              <p className="text-xs text-white/50 mb-5">
                ⚠️ Lembre-se de cancelar também a cobrança recorrente no Mercado Pago para não ser cobrado novamente.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={canceling}
                  className="flex-1 py-2.5 rounded-xl bg-red-500/90 hover:bg-red-500 text-white text-sm font-bold disabled:opacity-60"
                >
                  {canceling ? "Cancelando…" : "Sim, cancelar"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={canceling}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-white/80 hover:bg-white/5"
                >
                  Voltar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
