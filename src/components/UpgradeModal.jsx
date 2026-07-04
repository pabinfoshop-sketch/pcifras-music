export default function UpgradeModal({ reason, onClose, onSubscribe }) {
  const messages = {
    songs: {
      title: 'Você atingiu o limite do plano FREE',
      desc: 'O plano gratuito permite até 5 músicas no seu repertório. Assine o PRO para adicionar músicas ilimitadas.',
    },
    setlists: {
      title: 'Você atingiu o limite do plano FREE',
      desc: 'O plano gratuito permite apenas 1 repertório. Assine o PRO para criar quantos repertórios quiser.',
    },
    generic: {
      title: 'Desbloqueie o PCifrasMusic PRO',
      desc: 'Tire o limite de músicas, tenha repertórios ilimitados e apoie o desenvolvimento do app.',
    },
  }
  const m = messages[reason] || messages.generic

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="upgrade-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close upgrade-close" onClick={onClose} aria-label="Fechar">✕</button>

        <div className="upgrade-crown">👑</div>
        <h2 className="upgrade-title">{m.title}</h2>
        <p className="upgrade-desc">{m.desc}</p>

        <div className="upgrade-plans">
          <div className="upgrade-plan upgrade-plan-free">
            <div className="upgrade-plan-name">FREE</div>
            <div className="upgrade-plan-price">R$ 0<span>/mês</span></div>
            <ul className="upgrade-features">
              <li>✓ Até 5 músicas</li>
              <li>✓ 1 repertório</li>
              <li>✓ Afinador e metrônomo</li>
              <li className="dim">✗ Ilimitado</li>
            </ul>
            <div className="upgrade-plan-tag">Plano atual</div>
          </div>

          <div className="upgrade-plan upgrade-plan-pro">
            <div className="upgrade-badge">Recomendado</div>
            <div className="upgrade-plan-name">PRO</div>
            <div className="upgrade-plan-price">R$ 19,90<span>/mês</span></div>
            <ul className="upgrade-features">
              <li>✓ Músicas ilimitadas</li>
              <li>✓ Repertórios ilimitados</li>
              <li>✓ Sincronização na nuvem</li>
              <li>✓ Apoia o desenvolvimento</li>
            </ul>
            <button className="upgrade-cta" onClick={onSubscribe}>
              Assinar PRO
            </button>
            <div className="upgrade-note">💳 Pagamento em breve — sem cobrança agora</div>
          </div>
        </div>

        <button className="upgrade-later" onClick={onClose}>Continuar no FREE</button>
      </div>
    </div>
  )
}
