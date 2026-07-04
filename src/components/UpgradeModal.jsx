export default function UpgradeModal({ reason, onClose, onSubscribe }) {
  const headlines = {
    songs: {
      eyebrow: 'Limite do plano grátis',
      title: 'Desbloqueie músicas ilimitadas',
      sub: 'Você chegou ao limite de 5 músicas do plano grátis. Assine o Premium e leve seu repertório sem limites.',
    },
    setlists: {
      eyebrow: 'Limite do plano grátis',
      title: 'Repertórios ilimitados no Premium',
      sub: 'O plano grátis permite apenas 1 repertório. Assine o Premium e monte quantos quiser para cada culto, ensaio ou show.',
    },
    generic: {
      eyebrow: 'PCifras Music Premium',
      title: 'Toque com liberdade total',
      sub: 'Cifras, repertórios e recursos de palco sem limites. Feito para músicos que levam a sério.',
    },
  }
  const h = headlines[reason] || headlines.generic

  const benefits = [
    { ico: '☁️', title: 'Backup na nuvem', desc: 'Nunca perca uma cifra' },
    { ico: '🔄', title: 'Sync entre dispositivos', desc: 'Celular, tablet e web' },
    { ico: '🎼', title: 'Repertórios avançados', desc: 'Organize por culto, show ou banda' },
    { ico: '🎤', title: 'Ferramentas de palco', desc: 'Modo apresentação e auto-scroll' },
    { ico: '🎚️', title: 'Recursos de ensaio', desc: 'Afinador, metrônomo e transporte' },
    { ico: '⚡', title: 'Prioridade em novidades', desc: 'Recursos novos primeiro' },
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
            <strong>Teste tudo sem pagar nada.</strong>
            <span>Sem cartão de crédito. Cancele quando quiser.</span>
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
              <div className="premium-price-note">Ou economize com o plano anual</div>
            </div>
            <div className="premium-price-tag">Mais popular</div>
          </div>

          <button className="premium-cta" onClick={onSubscribe}>
            Assinar agora · começar 7 dias grátis
          </button>

          <div className="premium-trust">
            <span>🔒 Cobrança segura</span>
            <span>·</span>
            <span>⚡ Acesso imediato</span>
            <span>·</span>
            <span>✕ Cancele quando quiser</span>
          </div>
        </div>

        <button className="premium-later" onClick={onClose}>
          Continuar no plano grátis
        </button>
      </div>
    </div>
  )
}
