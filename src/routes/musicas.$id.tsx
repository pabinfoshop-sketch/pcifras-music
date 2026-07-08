import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { mockSongs } from "@/lib/mockData";
import { transposeChord } from "@/utils/chords";
import BottomNav from "@/components/BottomNav";
import BottomNav from "@/components/BottomNav";
import { Heart, Share2, Maximize, X, Download } from "lucide-react";
import { jsPDF } from "jspdf";

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

const FAV_KEY = "pcifras_favorites";

function readFavs(): string[] {
  try { return JSON.parse(localStorage.getItem(FAV_KEY) || "[]"); } catch { return []; }
}

function transposeCifra(cifra: string, semitones: number) {
  if (!semitones) return cifra;
  return cifra.replace(/\[([^\]]+)\]/g, (_, c) => `[${transposeChord(c, semitones)}]`);
}

function SongDetailPage() {
  const { song } = Route.useLoaderData();
  const [semitones, setSemitones] = useState(0);
  const [stage, setStage] = useState(false);
  const [favs, setFavs] = useState<string[]>(() => (typeof window !== "undefined" ? readFavs() : []));

  const isFav = favs.includes(song.id);
  const currentKey = useMemo(() => transposeChord(song.key, semitones), [song.key, semitones]);
  const cifra = useMemo(() => transposeCifra(song.cifra, semitones), [song.cifra, semitones]);

  function toggleFav() {
    const next = isFav ? favs.filter((x) => x !== song.id) : [...favs, song.id];
    setFavs(next);
    try { localStorage.setItem(FAV_KEY, JSON.stringify(next)); } catch {}
  }

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const data = { title: `${song.title} — ${song.artist}`, text: `Cifra de ${song.title}`, url };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(url);
        alert("Link copiado!");
      }
    } catch {}
  }

  if (stage) {
    const parts = cifra.split(/(\[[^\]]+\])/g);
    return (
      <div className="fixed inset-0 z-50 bg-black text-white overflow-auto">
        <button
          type="button"
          onClick={() => {
            setStage(false);
            if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
          }}
          className="fixed top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20"
          aria-label="Sair do modo palco"
        >
          <X size={20} />
        </button>
        <div className="px-6 py-10 max-w-5xl mx-auto">
          <h1 className="text-4xl font-extrabold">{song.title}</h1>
          <p className="text-white/60 mt-1">{song.artist} · Tom {currentKey}</p>
          <pre className="whitespace-pre-wrap font-mono text-[2.5rem] leading-[3rem] mt-6">
            {parts.map((p, i) =>
              p.startsWith("[") && p.endsWith("]")
                ? <span key={i} className="text-[#f5c451] font-bold">{p.slice(1, -1)}</span>
                : <span key={i}>{p}</span>
            )}
          </pre>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#0b0d12] text-white px-5 py-10 pb-28">
      <div className="max-w-3xl mx-auto">
        <Link to="/musicas" className="text-sm text-white/60 hover:text-white">← Voltar</Link>
        <header className="mt-6 mb-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold">{song.title}</h1>
          <p className="text-white/60 mt-1">{song.artist}</p>
          <div className="flex gap-2 mt-3 flex-wrap">
            <span className="text-xs px-2 py-1 rounded-full bg-[#f5c451]/20 text-[#f5c451] font-bold">
              Tom: {currentKey}{semitones !== 0 && <span className="text-white/50 ml-1">(orig. {song.key})</span>}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70">{song.category}</span>
          </div>
        </header>

        <div className="flex flex-wrap gap-2 mb-5">
          <button
            type="button"
            onClick={toggleFav}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
              isFav ? "bg-red-500/20 text-red-300 border border-red-500/30" : "bg-white/[0.05] border border-white/10 hover:bg-white/10"
            }`}
          >
            <Heart size={16} fill={isFav ? "currentColor" : "none"} />
            {isFav ? "Favoritada" : "Favoritar"}
          </button>

          <div className="flex items-center gap-1 bg-white/[0.05] border border-white/10 rounded-lg overflow-hidden">
            <button type="button" onClick={() => setSemitones((s) => s - 1)} className="px-3 py-2 hover:bg-white/10" aria-label="Descer meio tom">−</button>
            <span className="px-2 text-sm text-white/70 min-w-[3.5rem] text-center">
              {semitones === 0 ? "Tom" : semitones > 0 ? `+${semitones}` : semitones}
            </span>
            <button type="button" onClick={() => setSemitones((s) => s + 1)} className="px-3 py-2 hover:bg-white/10" aria-label="Subir meio tom">+</button>
            {semitones !== 0 && (
              <button type="button" onClick={() => setSemitones(0)} className="px-2 py-2 text-xs text-[#f5c451] hover:bg-white/10">Reset</button>
            )}
          </div>

          <button
            type="button"
            onClick={share}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-white/[0.05] border border-white/10 hover:bg-white/10"
          >
            <Share2 size={16} /> Compartilhar
          </button>

          <button
            type="button"
            onClick={() => {
              setStage(true);
              document.documentElement.requestFullscreen?.().catch(() => {});
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-[#f5c451]/20 border border-[#f5c451]/30 text-[#f5c451] hover:bg-[#f5c451]/30"
          >
            <Maximize size={16} /> Modo Palco
          </button>
        </div>

        <pre className="whitespace-pre-wrap font-mono text-sm rounded-xl border border-white/10 bg-white/[0.03] p-5 leading-relaxed">
          {cifra}
        </pre>
      </div>
      <BottomNav />
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
