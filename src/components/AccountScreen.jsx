export default function AccountScreen({ user, isPremium, onSubscribe, onManage, onLogout, onBack, onRestore, onSupport, onPolicies }) {
  if (!user) return null
  const initial = (user.name || user.email || '?').charAt(0).toUpperCase()
  const trialActive = user.trialEnd && new Date(user.trialEnd).getTime() > Date.now()
  const trialDays = user.trialDays || 0
  const paid = !!user.paidActive
  const planLabel = paid ? 'PREMIUM' : (trialActive ? 'TESTE GRATUITO' : 'GRATUITO')
  const planClass = paid ? 'account-plan-pro' : (trialActive ? 'account-plan-trial' : 'account-plan-free')

  const handleRestore = onRestore || (() => window.location.reload())
  const handleSupport = onSupport || (() => window.open('mailto:suporte@pcifras.app', '_blank'))
  const handlePolicies = onPolicies || (() => window.open('https://pcifras-music.lovable.app', '_blank'))

  const benefits = [
    { ico: '☁️', label: 'Backup na nuvem' },
    { ico: '🔄', label: 'Sincronização entre dispositivos' },
    { ico: '🎼', label: 'Repertórios ilimitados' },
    { ico: '🎤', label: 'Ferramentas de palco' },
  ]

  return (
    <>
      <div className="topbar">
        <button className="tbtn" onClick={onBack} aria-label="Voltar">←</button>
        <div className="topbar-title">Minha Conta</div>
        <div style={{width:36}} />
      </div>
      <div id="content" className="account-screen-content">
        <div className="account-wrap">
          {/* Identity */}
          <section className="account-card">
            <div className="account-header">
              <div className="account-avatar">{initial}</div>
              <div className="account-identity">
                <div className="account-name">{user.name || 'Usuário'}</div>
                <div className="account-email">{user.email}</div>
              </div>
            </div>

            <div className={`account-plan ${planClass}`}>
              <div className="account-plan-row">
                <span className="account-plan-label">Plano atual</span>
                <span className="account-plan-badge">{planLabel}</span>
              </div>
              {trialActive && !paid && (
                <div className="account-trial-info">
                  <span className="account-trial-icon">🎉</span>
                  <span>
                    <strong>{trialDays} {trialDays === 1 ? 'dia restante' : 'dias restantes'}</strong> do seu teste grátis
                  </span>
                </div>
              )}
              {!paid && !trialActive && (
                <p className="account-plan-desc">
                  Você está no plano gratuito. Desbloqueie recursos ilimitados no Premium.
                </p>
              )}
              {paid && (
                <p className="account-plan-desc">
                  Obrigado por apoiar o app! Você tem acesso completo a todos os recursos.
                </p>
              )}
            </div>

            <div className="account-actions">
              {paid ? (
                <button className="account-btn account-btn-primary" onClick={onManage}>
                  ⚙️ Gerenciar assinatura
                </button>
              ) : (
                <button className="account-btn account-btn-primary" onClick={onSubscribe}>
                  ⭐ Assinar Premium
                </button>
              )}
            </div>
          </section>

          {/* Premium benefits — hide if already paid */}
          {!paid && (
            <section className="account-card account-benefits-card">
              <div className="account-section-head">
                <span className="account-section-eyebrow">Premium</span>
                <h3 className="account-section-title">Por que assinar?</h3>
              </div>
              <ul className="account-benefits">
                {benefits.map(b => (
                  <li key={b.label}>
                    <span className="ab-ico">{b.ico}</span>
                    <span>{b.label}</span>
                  </li>
                ))}
              </ul>
              {!trialActive && (
                <button className="account-btn account-btn-primary" onClick={onSubscribe}>
                  Começar 7 dias grátis
                </button>
              )}
            </section>
          )}

          {/* Account actions list */}
          <section className="account-card account-list-card">
            <div className="account-section-head">
              <h3 className="account-section-title">Conta e suporte</h3>
            </div>
            <ul className="account-list">
              <li>
                <button className="account-list-item" onClick={handleRestore}>
                  <span className="ali-ico">🔄</span>
                  <span className="ali-text">
                    <strong>Restaurar conta</strong>
                    <span>Sincronize compras e dados</span>
                  </span>
                  <span className="ali-chev">›</span>
                </button>
              </li>
              <li>
                <button className="account-list-item" onClick={handleSupport}>
                  <span className="ali-ico">💬</span>
                  <span className="ali-text">
                    <strong>Suporte</strong>
                    <span>Fale com a gente</span>
                  </span>
                  <span className="ali-chev">›</span>
                </button>
              </li>
              <li>
                <button className="account-list-item" onClick={handlePolicies}>
                  <span className="ali-ico">📄</span>
                  <span className="ali-text">
                    <strong>Políticas</strong>
                    <span>Termos e privacidade</span>
                  </span>
                  <span className="ali-chev">›</span>
                </button>
              </li>
              <li>
                <button className="account-list-item account-list-item-danger" onClick={onLogout}>
                  <span className="ali-ico">🚪</span>
                  <span className="ali-text">
                    <strong>Sair da conta</strong>
                    <span>Encerrar sessão neste dispositivo</span>
                  </span>
                  <span className="ali-chev">›</span>
                </button>
              </li>
            </ul>
          </section>

          <div className="account-footer-note">PCifras Music · v1.0</div>
        </div>
      </div>
    </>
  )
}
