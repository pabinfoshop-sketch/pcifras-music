import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: "Planos — pCifras" },
      { name: "description", content: "Escolha o plano ideal: use grátis ou desbloqueie tudo com o Premium." },
      { property: "og:title", content: "Planos — pCifras" },
      { property: "og:description", content: "Compare os planos Grátis e Premium do pCifras." },
    ],
  }),
  component: PlanosPage,
});

const freeFeatures = [
  "Até 10 músicas salvas",
  "1 repertório",
  "Salvamento local no dispositivo",
  "Afinador e ferramentas básicas",
];

const premiumFeatures = [
  "Músicas ilimitadas",
  "Repertórios ilimitados",
  "Sincronização na nuvem",
  "Exportar cifras em PDF",
  "Modo palco avançado",
  "Suporte prioritário",
];

function PlanosPage() {
  return (
    <div className="min-h-screen bg-[#0b0d12] text-white px-5 py-10 sm:py-16">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-sm text-white/60 hover:text-white transition">← Voltar</Link>
        </div>

        <header className="text-center mb-10 sm:mb-14">
          <span className="inline-block text-xs uppercase tracking-widest text-[#f5c451] mb-3">Assinatura</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3">Escolha seu Plano</h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Comece grátis. Faça o upgrade quando quiser tocar sem limites.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {/* Free */}
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-7 flex flex-col">
            <h2 className="text-xl font-bold mb-1">Grátis</h2>
            <p className="text-white/50 text-sm mb-5">Para começar a organizar suas cifras.</p>
            <div className="mb-6">
              <span className="text-4xl font-extrabold">R$ 0</span>
              <span className="text-white/50 text-sm ml-1">/sempre</span>
            </div>
            <ul className="space-y-3 mb-7 flex-1">
              {freeFeatures.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-white/80">
                  <Check size={16} className="text-white/40 mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <button
              disabled
              className="w-full py-3 rounded-xl bg-white/5 text-white/40 text-sm font-semibold cursor-not-allowed border border-white/5"
            >
              Plano Atual
            </button>
          </div>

          {/* Premium */}
          <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-br from-[#f5c451] via-[#d4a017] to-[#f5c451] shadow-[0_20px_60px_-20px_rgba(245,196,81,0.4)]">
            <div className="relative rounded-2xl bg-[#12141b] p-7 flex flex-col h-full">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-[#f5c451] to-[#d4a017] text-[#1a1200] text-[11px] font-bold uppercase tracking-wider">
                Mais popular
              </div>
              <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                Premium <span className="text-[#f5c451]">⭐</span>
              </h2>
              <p className="text-white/60 text-sm mb-5">Tudo liberado para o músico profissional.</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold">R$ 19,90</span>
                <span className="text-white/50 text-sm ml-1">/mês</span>
              </div>
              <ul className="space-y-3 mb-7 flex-1">
                {premiumFeatures.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white">
                    <Check size={16} className="text-[#f5c451] mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/"
                className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-[#f5c451] to-[#d4a017] text-[#1a1200] text-sm font-bold hover:brightness-110 transition shadow-[0_10px_30px_-8px_rgba(245,196,81,0.5)]"
              >
                Assinar Premium
              </Link>
              <p className="text-center text-xs text-white/40 mt-3">Cancele quando quiser.</p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-white/40 mt-10">
          🔒 Pagamento seguro · Sem fidelidade · Suporte em português
        </p>
      </div>
    </div>
  );
}
