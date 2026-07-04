export default function AccountScreen({ user, isPremium, onSubscribe, onManage, onLogout, onBack }) {
  if (!user) return null
  const initial = (user.name || user.email || '?').charAt(0).toUpperCase()
  const trialActive = user.trialEnd && new Date(user.trialEnd).getTime() > Date.now()
  const trialDays = user.trialDays || 0
  const paid = !!user.paidActive
  const planLabel = paid ? 'PRO' : (trialActive ? 'PRO (teste grátis)' : 'FREE')
  const planClass = paid ? 'account-plan-pro' : (trialActive ? 'account-plan-trial' : 'account-plan-free')

  return (
    <>
      <div className="topbar">
        <button className="tbtn" onClick={onBack} aria-label="Voltar">←</button>
        <div className="topbar-title">Minha Conta</div>
        <div style={{width:36}} />
      </div>
      <div id="content" className="account-screen-content">
        <div className="account-card">
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
                Você está no plano gratuito. Assine o PRO para músicas e repertórios ilimitados.
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
                ⭐ Assinar PRO
              </button>
            )}
            <button className="account-btn account-btn-ghost" onClick={onLogout}>
              🚪 Sair da conta
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
