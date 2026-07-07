import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — pCifras" },
      { name: "description", content: "Como o pCifras coleta, usa e protege seus dados pessoais, em conformidade com a LGPD." },
      { property: "og:title", content: "Política de Privacidade — pCifras" },
      { property: "og:description", content: "Nossa política de privacidade e proteção de dados (LGPD)." },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: "https://pcifras-music.lovable.app/privacidade" }],
  }),
  component: PrivacidadePage,
});

function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-[#0b0d12] text-white px-5 py-10 sm:py-16">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-sm text-white/60 hover:text-white transition">← Voltar</Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-6 mb-2">Política de Privacidade</h1>
        <p className="text-white/50 text-sm mb-8">Última atualização: 07 de julho de 2026 · Conforme LGPD (Lei 13.709/2018)</p>

        <div className="space-y-6 text-white/80 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-white mb-2">1. Dados coletados</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Cadastro:</strong> nome, e-mail e senha (armazenada com hash).</li>
              <li><strong>Uso do app:</strong> músicas e repertórios que você cria.</li>
              <li><strong>Pagamento:</strong> processado pelo Mercado Pago. Não armazenamos dados de cartão.</li>
              <li><strong>Técnicos:</strong> logs de acesso, tipo de dispositivo, IP anonimizado.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">2. Finalidade</h2>
            <p>Usamos seus dados para: autenticar sua conta, salvar seu acervo de cifras, processar assinaturas, oferecer suporte e melhorar o serviço.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">3. Base legal (LGPD)</h2>
            <p>Tratamos dados com base em: execução de contrato (uso do app), consentimento (comunicações), obrigação legal (fiscal) e legítimo interesse (segurança e prevenção a fraude).</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">4. Compartilhamento</h2>
            <p>Compartilhamos dados apenas com operadores essenciais: Supabase (banco/autenticação), Mercado Pago (pagamentos), Lovable Cloud (hospedagem). Não vendemos seus dados.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">5. Seus direitos</h2>
            <p>Você pode a qualquer momento: acessar, corrigir, exportar ou excluir seus dados; revogar consentimento; solicitar portabilidade. Faça a solicitação pelo e-mail de contato abaixo.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">6. Segurança</h2>
            <p>Usamos HTTPS, hash de senhas, Row Level Security no banco e chaves API rotacionáveis. Ainda assim, nenhum sistema é 100% imune — notificaremos você em caso de incidente.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">7. Retenção</h2>
            <p>Mantemos seus dados enquanto sua conta estiver ativa. Após exclusão, apagamos em até 30 dias (exceto obrigações legais fiscais, mantidas por 5 anos).</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">8. Cookies</h2>
            <p>Usamos apenas cookies essenciais para manter sua sessão logada. Não usamos cookies de publicidade de terceiros.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">9. Menores de idade</h2>
            <p>O pCifras é destinado a maiores de 13 anos. Menores de 18 devem usar sob supervisão dos responsáveis.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">10. Encarregado (DPO)</h2>
            <p>Contato para questões de privacidade: <a className="text-[#f5c451] underline" href="mailto:privacidade@pcifras.com">privacidade@pcifras.com</a></p>
          </section>
        </div>

        <div className="mt-10 flex gap-4 text-sm text-white/60">
          <Link to="/termos" className="hover:text-white">Termos de Uso</Link>
          <Link to="/sobre" className="hover:text-white">Sobre</Link>
        </div>
      </div>
    </div>
  );
}
