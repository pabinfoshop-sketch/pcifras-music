import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { mockSongs } from "@/lib/mockData";

export const Route = createFileRoute("/musicas/$id")({
  head: ({ params }) => {
    const song = mockSongs.find((s) => s.id === params?.id);
    return {
      meta: [
        { title: song ? `${song.title} — ${song.artist} — pCifras` : "Música — pCifras" },
        { name: "description", content: song ? `Cifra de ${song.title} por ${song.artist}` : "Cifra no pCifras" },
      ],
    };
  },
  loader: ({ params }) => {
    const song = mockSongs.find((s) => s.id === params.id);
    if (!song) throw notFound();
    return { song };
  },
  errorComponent: () => <SongError />,
  notFoundComponent: () => <SongNotFound />,
  component: SongDetailPage,
});

function SongDetailPage() {
  const { song } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-[#0b0d12] text-white px-5 py-10">
      <div className="max-w-3xl mx-auto">
        <Link to="/musicas" className="text-sm text-white/60 hover:text-white">← Voltar</Link>
        <header className="mt-6 mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold">{song.title}</h1>
          <p className="text-white/60 mt-1">{song.artist}</p>
          <div className="flex gap-2 mt-3">
            <span className="text-xs px-2 py-1 rounded-full bg-[#f5c451]/20 text-[#f5c451] font-bold">Tom: {song.key}</span>
            <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70">{song.category}</span>
          </div>
        </header>
        <pre className="whitespace-pre-wrap font-mono text-sm rounded-xl border border-white/10 bg-white/[0.03] p-5 leading-relaxed">
          {song.cifra}
        </pre>
      </div>
    </div>
  );
}

function SongNotFound() {
  return (
    <div className="min-h-screen bg-[#0b0d12] text-white px-5 py-10 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Música não encontrada</h1>
        <Link to="/musicas" className="text-[#f5c451] hover:underline">Voltar para músicas</Link>
      </div>
    </div>
  );
}

function SongError() {
  return (
    <div className="min-h-screen bg-[#0b0d12] text-white px-5 py-10 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Erro ao carregar música</h1>
        <Link to="/musicas" className="text-[#f5c451] hover:underline">Voltar</Link>
      </div>
    </div>
  );
}
