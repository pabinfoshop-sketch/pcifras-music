export default function UpgradeModal({ reason, onClose, onSubscribe }) {
  const headlines = {
    songs: {
      eyebrow: 'Você atingiu o limite do plano gratuito',
      title: 'Tenha músicas ilimitadas com o Premium',
      sub: 'O plano gratuito inclui até 2 músicas. Assine o Premium e monte uma biblioteca sem limites.',
    },
    setlists: {
      eyebrow: 'Você atingiu o limite do plano gratuito',
      title: 'Repertórios ilimitados no Premium',
      sub: 'No plano gratuito você cria 1 repertório. No Premium, monte quantos precisar — um para cada culto, ensaio ou show.',
    },
    cloud: {
      eyebrow: 'Recurso exclusivo do Premium',
      title: 'Backup automático na nuvem',
      sub: 'Suas cifras salvas com segurança e disponíveis em qualquer dispositivo. Assine o Premium para ativar.',
    },
    advanced: {
      eyebrow: 'Recurso exclusivo do Premium',
      title: 'Ferramentas avançadas de ensaio e palco',
      sub: 'Organize melhor, ensaie com precisão e apresente com confiança. Feito para músicos que levam a sério.',
    },
    generic: {
      eyebrow: 'PCifras Music Premium',
      title: 'O app completo para o músico moderno',
      sub: 'Cifras, repertórios e ferramentas de palco sem limites. Toque com liberdade total.',
    },
  }
  const h = headlines[reason] || headlines.generic

  const benefits = [
    { ico: '☁️', title: 'Backup na nuvem', desc: 'Suas cifras protegidas, sempre' },
    { ico: '🔄', title: 'Sync entre dispositivos', desc: 'Celular, tablet e web' },
    { ico: '🎼', title: 'Repertórios ilimitados', desc: 'Um para cada culto, show ou banda' },
    { ico: '🎤', title: 'Ferramentas de palco', desc: 'Modo apresentação e rolagem automática' },
    { ico: '🎚️', title: 'Ensaio profissional', desc: 'Afinador, metrônomo e transposição' },
    { ico: '⚡', title: 'Novidades em primeira mão', desc: 'Acesso antecipado a novos recursos' },
  ]

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="premium-modal" onClick={e => e.stopPropagation()}>
        <button className="premium-close" onClick={onClose} aria-label="Fechar">✕</button>

        <div className="premium-hero">
          <div className="premium-crown">👑</div>
          <div className="premium-eyebrow">{h.eyebrow}</div>
          <h2 className="premium-title">{h.title}</h2>
          <p className="premium-sub">{h.sub}</p>
        </div>

        <div className="premium-trial">
          <div className="premium-trial-badge">7 DIAS GRÁTIS</div>
          <div className="premium-trial-text">
            <strong>Experimente tudo, sem pagar nada.</strong>
            <span>Sem cartão de crédito. Cancele a qualquer momento.</span>
          </div>
        </div>

        <ul className="premium-benefits">
          {benefits.map(b => (
            <li key={b.title}>
              <span className="pb-ico">{b.ico}</span>
              <div>
                <strong>{b.title}</strong>
                <span>{b.desc}</span>
              </div>
            </li>
          ))}
        </ul>

        <div className="premium-price-card">
          <div className="premium-price-row">
            <div className="premium-price-left">
              <div className="premium-price-label">Plano Premium</div>
              <div className="premium-price-value">
                <span className="premium-currency">R$</span>
                <span className="premium-amount">19,90</span>
                <span className="premium-period">/mês</span>
              </div>
              <div className="premium-price-note">Economize ainda mais no plano anual</div>
            </div>
            <div className="premium-price-tag">Mais escolhido</div>
          </div>

          <button className="premium-cta" onClick={onSubscribe}>
            Assinar agora · começar 7 dias grátis
          </button>

          <div className="premium-trust">
            <span>🔒 Pagamento seguro</span>
            <span>·</span>
            <span>⚡ Acesso imediato</span>
            <span>·</span>
            <span>✕ Cancele quando quiser</span>
          </div>
        </div>

        <button className="premium-later" onClick={onClose}>
          Continuar no plano gratuito
        </button>
      </div>
    </div>
  )
}
