import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre o pCifras — App de Cifras para Músicos" },
      { name: "description", content: "Conheça o pCifras: app brasileiro para músicos organizarem cifras, repertórios e tocarem no palco." },
      { property: "og:title", content: "Sobre o pCifras" },
      { property: "og:description", content: "App brasileiro de cifras para violão, guitarra e outros instrumentos." },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: "https://pcifras-music.lovable.app/sobre" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "pCifras",
          applicationCategory: "MusicApplication",
          operatingSystem: "Web, iOS, Android (PWA)",
          offers: [
            { "@type": "Offer", price: "0", priceCurrency: "BRL", name: "Grátis" },
            { "@type": "Offer", price: "19.90", priceCurrency: "BRL", name: "Premium mensal" },
          ],
          description: "App de cifras para músicos: organize repertórios, use afinador e toque no palco.",
        }),
      },
    ],
  }),
  component: SobrePage,
});

function SobrePage() {
  return (
    <div className="min-h-screen bg-[#0b0d12] text-white px-5 py-10 sm:py-16">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-sm text-white/60 hover:text-white transition">← Voltar</Link>

        <header className="mt-6 mb-8">
          <span className="inline-block text-xs uppercase tracking-widest text-[#f5c451] mb-3">Sobre nós</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Cifras que acompanham você <span className="text-[#f5c451]">no palco</span>.
          </h1>
          <p className="text-white/70 text-lg">
            O pCifras é um app brasileiro feito por músicos, para músicos. Organize suas cifras,
            monte repertórios e toque sem depender de folhas soltas.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 mb-10">
          {[
            { icon: "🎸", title: "Acervo pessoal", desc: "Salve suas próprias cifras ou importe de fontes públicas." },
            { icon: "📋", title: "Repertórios", desc: "Monte setlists para cada show, ensaio ou culto." },
            { icon: "🎯", title: "Modo palco", desc: "Rolagem automática, transposição e afinador integrado." },
            { icon: "☁️", title: "Sincronização", desc: "Acesse seu acervo de qualquer dispositivo com o Premium." },
          ].map(f => (
            <div key={f.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="font-bold mb-1">{f.title}</div>
              <div className="text-sm text-white/60">{f.desc}</div>
            </div>
          ))}
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 mb-8">
          <h2 className="text-xl font-bold mb-3">Nossa missão</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Democratizar o acesso a ferramentas profissionais para músicos amadores e experientes.
            Acreditamos que uma boa cifra deve estar sempre um toque de distância — no bolso, no palco, no ensaio.
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 mb-10">
          <h2 className="text-xl font-bold mb-3">Contato</h2>
          <ul className="text-white/70 text-sm space-y-2">
            <li>📧 <a className="text-[#f5c451] underline" href="mailto:contato@pcifras.com">contato@pcifras.com</a></li>
            <li>🛟 <a className="text-[#f5c451] underline" href="mailto:suporte@pcifras.com">suporte@pcifras.com</a></li>
            <li>🔒 <a className="text-[#f5c451] underline" href="mailto:privacidade@pcifras.com">privacidade@pcifras.com</a></li>
          </ul>
        </section>

        <div className="flex flex-wrap gap-4 text-sm text-white/60">
          <Link to="/termos" className="hover:text-white">Termos de Uso</Link>
          <Link to="/privacidade" className="hover:text-white">Política de Privacidade</Link>
          <Link to="/planos" className="hover:text-white">Planos</Link>
        </div>
      </div>
    </div>
  );
}
