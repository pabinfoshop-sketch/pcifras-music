import { createFileRoute, Link } from "@tanstack/react-router";
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
  return (
    <div className="min-h-screen bg-[#0b0d12] text-white px-5 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-sm text-white/60 hover:text-white">← Voltar</Link>
          <span className="text-xs text-[#f5c451] uppercase tracking-widest">{mockRepertoires.length} repertórios</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-6">Repertórios</h1>
        <div className="grid gap-4 sm:grid-cols-2">
          {mockRepertoires.map((r) => {
            const songs = r.songIds.map((id) => mockSongs.find((s) => s.id === id)).filter(Boolean);
            return (
              <div key={r.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.06] transition">
                <h2 className="font-bold text-lg">{r.name}</h2>
                <p className="text-sm text-white/60 mt-1 mb-3">{r.description}</p>
                <div className="text-xs text-white/40 mb-3">{songs.length} músicas · {new Date(r.createdAt).toLocaleDateString("pt-BR")}</div>
                <ul className="space-y-1">
                  {songs.map((s) => s && (
                    <li key={s.id}>
                      <Link to="/musicas/$id" params={{ id: s.id }} className="text-sm text-white/80 hover:text-[#f5c451]">
                        · {s.title} <span className="text-white/40">— {s.artist}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
