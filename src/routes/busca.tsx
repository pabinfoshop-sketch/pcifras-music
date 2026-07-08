import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { mockSongs } from "@/lib/mockData";
import BottomNav from "@/components/BottomNav";

export const Route = createFileRoute("/busca")({
  head: () => ({
    meta: [
      { title: "Buscar — pCifras" },
      { name: "description", content: "Busque músicas e cifras no pCifras." },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
  component: BuscaPage,
});

function BuscaPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: "/busca" });
  const [term, setTerm] = useState(q);

  const query = q.trim().toLowerCase();

  const results = useMemo(() => {
    if (!query) return [];
    return mockSongs.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.artist.toLowerCase().includes(query) ||
        s.category.toLowerCase().includes(query),
    );
  }, [query]);

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white px-5 py-8 pb-28">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-sm text-white/60 hover:text-white">← Voltar</Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold mt-4 mb-4">Buscar</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ search: { q: term } });
          }}
          className="flex gap-2"
        >
          <input
            autoFocus
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Nome da música ou artista…"
            className="flex-1 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 outline-none focus:border-[#f5c451] text-white placeholder-white/40"
          />
          <button
            type="submit"
            className="px-4 py-3 rounded-xl bg-[#f5c451] text-[#1a1200] font-bold hover:brightness-110 transition"
          >
            Buscar
          </button>
        </form>

        <div className="mt-6">
          {!query ? (
            <p className="text-white/40 text-sm">Digite para buscar músicas.</p>
          ) : results.length === 0 ? (
            <p className="text-white/60 text-sm">Nenhum resultado para "{q}".</p>
          ) : (
            <>
              <p className="text-xs text-white/40 mb-3 uppercase tracking-widest">
                {results.length} resultado{results.length > 1 ? "s" : ""}
              </p>
              <ul className="space-y-3">
                {results.map((s) => (
                  <li key={s.id}>
                    <Link
                      to="/musicas/$id"
                      params={{ id: s.id }}
                      className="block rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] p-4 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{s.title}</div>
                          <div className="text-sm text-white/60">
                            {s.artist}
                            {s.category ? ` · ${s.category}` : ""}
                          </div>
                        </div>
                        {s.key && (
                          <span className="text-[#f5c451] font-bold text-sm">{s.key}</span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
