import { createFileRoute, Link } from "@tanstack/react-router";
import { mockSongs } from "@/lib/mockData";
import BottomNav from "@/components/BottomNav";

export const Route = createFileRoute("/musicas/")({
  head: () => ({
    meta: [
      { title: "Músicas — pCifras" },
      { name: "description", content: "Explore o catálogo de músicas com cifras no pCifras." },
    ],
  }),
  component: MusicasPage,
});

function MusicasPage() {
  return (
    <div className="min-h-screen bg-[#0b0d12] text-white px-5 py-10 pb-28">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-sm text-white/60 hover:text-white">← Voltar</Link>
          <span className="text-xs text-[#f5c451] uppercase tracking-widest">{mockSongs.length} músicas</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-6">Músicas</h1>
        <ul className="space-y-3">
          {mockSongs.map((s) => (
            <li key={s.id}>
              <Link
                to="/musicas/$id"
                params={{ id: s.id }}
                className="block rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] p-4 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{s.title}</div>
                    <div className="text-sm text-white/60">{s.artist}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#f5c451] font-bold text-sm">{s.key}</div>
                    <div className="text-xs text-white/40">{s.category}</div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <BottomNav />
    </div>
  );
}
