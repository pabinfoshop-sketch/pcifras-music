import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — pCifras" },
      { name: "description", content: "Termos e condições de uso do pCifras: regras, direitos, deveres e política de assinatura." },
      { property: "og:title", content: "Termos de Uso — pCifras" },
      { property: "og:description", content: "Leia os termos e condições de uso do pCifras." },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: "https://pcifras-music.lovable.app/termos" }],
  }),
  component: TermosPage,
});

function TermosPage() {
  return (
    <div className="min-h-screen bg-[#0b0d12] text-white px-5 py-10 sm:py-16">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-sm text-white/60 hover:text-white transition">← Voltar</Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-6 mb-2">Termos de Uso</h1>
        <p className="text-white/50 text-sm mb-8">Última atualização: 07 de julho de 2026</p>

        <div className="space-y-6 text-white/80 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-white mb-2">1. Aceitação</h2>
            <p>Ao criar uma conta ou usar o pCifras, você concorda com estes Termos. Se não concordar, não utilize o serviço.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">2. O serviço</h2>
            <p>O pCifras é um aplicativo para músicos organizarem cifras, repertórios e usarem ferramentas como afinador. Oferecemos um plano Grátis limitado e um plano Premium por assinatura mensal.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">3. Conta</h2>
            <p>Você é responsável por manter suas credenciais em segurança. Um cadastro por pessoa. Podemos suspender contas em caso de fraude, abuso ou violação destes Termos.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">4. Assinatura Premium</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Valor: R$ 19,90/mês, cobrado via Mercado Pago.</li>
              <li>A assinatura é renovada automaticamente até o cancelamento.</li>
              <li>O cancelamento pode ser feito a qualquer momento na tela "Minha Assinatura".</li>
              <li>Após o cancelamento, o acesso Premium permanece até o fim do período pago. Não há reembolso proporcional.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">5. Direito de arrependimento</h2>
            <p>Conforme o CDC (art. 49), você pode desistir da assinatura em até 7 dias da contratação, com reembolso integral. Solicite pelo canal de suporte.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">6. Conteúdo</h2>
            <p>As cifras exibidas podem ser criadas por você ou obtidas de fontes públicas. Você é responsável pelo conteúdo que salva. Direitos autorais das músicas pertencem aos seus autores.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">7. Limitação de responsabilidade</h2>
            <p>O pCifras é fornecido "como está". Não garantimos disponibilidade ininterrupta nem exatidão absoluta das cifras. Nossa responsabilidade máxima limita-se ao valor pago nos últimos 12 meses.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">8. Alterações</h2>
            <p>Podemos atualizar estes Termos. Mudanças relevantes serão comunicadas por e-mail ou no app com 15 dias de antecedência.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">9. Contato</h2>
            <p>Dúvidas: <a className="text-[#f5c451] underline" href="mailto:pabinfoshop@gmail.com">contato@pcifras.com</a></p>
          </section>
        </div>

        <div className="mt-10 flex gap-4 text-sm text-white/60">
          <Link to="/privacidade" className="hover:text-white">Política de Privacidade</Link>
          <Link to="/sobre" className="hover:text-white">Sobre</Link>
        </div>
      </div>
    </div>
  );
}
