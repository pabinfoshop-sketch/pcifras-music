import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import { mockRepertoires, mockSongs } from "@/lib/mockData";

export const Route = createFileRoute("/repertorios")({
  head: () => ({
    meta: [
      { title: "Repertórios — pCifras" },
      { name: "description", content: "Organize suas músicas em repertórios no pCifras." },
    ],
  }),
  component: RepertoriosPage,
});

function RepertoriosPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = mockRepertoires.find((r) => r.id === openId) ?? null;

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white px-5 py-10 pb-28">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-sm text-white/60 hover:text-white">← Voltar</Link>
          <span className="text-xs text-[#f5c451] uppercase tracking-widest">
            {mockRepertoires.length} repertórios
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold mb-6">Repertórios</h1>

        <div className="grid gap-4">
          {mockRepertoires.map((r) => (
            <button
              key={r.id}
              onClick={() => setOpenId(r.id)}
              className="text-left rounded-xl border border-white/10 bg-white/[0.03] p-5 hover:border-[#f5c451]/40 transition"
            >
              <h2 className="font-bold text-lg">{r.name}</h2>
              {r.description && <p className="text-sm text-white/60 mt-1">{r.description}</p>}
              <div className="text-xs text-white/40 mt-2">
                {r.songIds.length} música{r.songIds.length === 1 ? "" : "s"} ·{" "}
                {new Date(r.createdAt).toLocaleDateString("pt-BR")}
              </div>
            </button>
          ))}
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setOpenId(null)}
        >
          <div
            className="w-full max-w-md bg-[#141821] border border-white/10 rounded-xl p-5 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{open.name}</h3>
              <button onClick={() => setOpenId(null)} className="text-white/60 hover:text-white text-xl leading-none">×</button>
            </div>
            <ul className="space-y-1">
              {open.songIds.map((sid) => {
                const s = mockSongs.find((m) => m.id === sid);
                if (!s) return null;
                return (
                  <li key={s.id} className="rounded-md bg-white/[0.03] border border-white/10 px-3 py-2">
                    <div className="text-sm">{s.title}</div>
                    <div className="text-xs text-white/50">{s.artist} · {s.key}</div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
