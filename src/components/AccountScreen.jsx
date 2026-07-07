import { useState } from 'react'

export default function AccountScreen({
  user,
  isPremium,
  songCount = 0,
  setlistCount = 0,
  onSubscribe,
  onManage,
  onLogout,
  onBack,
  onRestore,
  onSupport,
  onPolicies,
  onUpdateProfile,
}) {
  if (!user) return null
  const initial = (user.name || user.email || '?').charAt(0).toUpperCase()
  const trialActive = user.trialEnd && new Date(user.trialEnd).getTime() > Date.now()
  const trialDays = user.trialDays || 0
  const paid = !!user.paidActive || !!isPremium
  const planLabel = paid ? 'PREMIUM' : (trialActive ? 'TESTE GRATUITO' : 'GRATUITO')
  const planClass = paid ? 'account-plan-pro' : (trialActive ? 'account-plan-trial' : 'account-plan-free')

  // Edição inline do nome
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(user.name || '')
  const [savingName, setSavingName] = useState(false)

  const handleSaveName = async () => {
    const trimmed = (nameDraft || '').trim()
    if (!trimmed || trimmed === user.name) {
      setEditingName(false)
      setNameDraft(user.name || '')
      return
    }
    if (!onUpdateProfile) { setEditingName(false); return }
    setSavingName(true)
    try {
      await onUpdateProfile({ name: trimmed })
      setEditingName(false)
    } finally {
      setSavingName(false)
    }
  }

  const handleRestore = onRestore || (() => window.location.reload())
  const handleSupport = onSupport || (() => window.open('mailto:pabinfoshop@gmail.com', '_blank'))
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
          {/* Identidade */}
          <section className="account-card">
            <div className="account-header">
              <div className="account-avatar">{initial}</div>
              <div className="account-identity" style={{flex:1,minWidth:0}}>
                {editingName ? (
                  <div style={{display:'flex',gap:6,alignItems:'center'}}>
                    <input
                      type="text"
                      value={nameDraft}
                      onChange={(e) => setNameDraft(e.target.value)}
                      autoFocus
                      maxLength={60}
                      disabled={savingName}
                      style={{
                        flex:1,minWidth:0,padding:'6px 10px',borderRadius:8,
                        border:'1px solid rgba(245,196,81,0.4)',background:'rgba(0,0,0,0.3)',
                        color:'#fff',fontSize:'1rem',fontWeight:600
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName()
                        if (e.key === 'Escape') { setEditingName(false); setNameDraft(user.name || '') }
                      }}
                    />
                    <button
                      className="account-btn"
                      onClick={handleSaveName}
                      disabled={savingName}
                      style={{padding:'6px 10px',fontSize:'0.85rem'}}
                    >
                      {savingName ? '…' : '✓'}
                    </button>
                    <button
                      className="account-btn"
                      onClick={() => { setEditingName(false); setNameDraft(user.name || '') }}
                      disabled={savingName}
                      style={{padding:'6px 10px',fontSize:'0.85rem'}}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                    <div className="account-name" style={{margin:0}}>
                      {user.name || 'Usuário'}
                      {paid && (
                        <span
                          title="Assinante Premium"
                          style={{
                            marginLeft:8,padding:'2px 8px',borderRadius:999,
                            background:'linear-gradient(135deg,#f5c451,#d19a2a)',
                            color:'#0b0d12',fontSize:'0.7rem',fontWeight:800,letterSpacing:0.3,
                            verticalAlign:'middle'
                          }}
                        >
                          👑 PREMIUM
                        </span>
                      )}
                    </div>
                    {onUpdateProfile && (
                      <button
                        onClick={() => { setNameDraft(user.name || ''); setEditingName(true) }}
                        title="Editar nome"
                        aria-label="Editar nome"
                        style={{
                          background:'transparent',border:'none',color:'#f5c451',
                          cursor:'pointer',padding:2,fontSize:'0.9rem'
                        }}
                      >
                        ✏️
                      </button>
                    )}
                  </div>
                )}
                <div className="account-email">{user.email}</div>
              </div>
            </div>

            {/* Estatísticas */}
            <div
              style={{
                display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:14,
              }}
            >
              <div style={{
                padding:'12px 14px',borderRadius:12,
                background:'rgba(245,196,81,0.08)',border:'1px solid rgba(245,196,81,0.18)',
                textAlign:'center'
              }}>
                <div style={{fontSize:'1.4rem',fontWeight:800,color:'#f5c451'}}>{songCount}</div>
                <div style={{fontSize:'0.75rem',color:'rgba(255,255,255,0.7)',marginTop:2}}>
                  {songCount === 1 ? 'música salva' : 'músicas salvas'}
                </div>
              </div>
              <div style={{
                padding:'12px 14px',borderRadius:12,
                background:'rgba(245,196,81,0.08)',border:'1px solid rgba(245,196,81,0.18)',
                textAlign:'center'
              }}>
                <div style={{fontSize:'1.4rem',fontWeight:800,color:'#f5c451'}}>{setlistCount}</div>
                <div style={{fontSize:'0.75rem',color:'rgba(255,255,255,0.7)',marginTop:2}}>
                  {setlistCount === 1 ? 'repertório' : 'repertórios'}
                </div>
              </div>
            </div>

            <div className={`account-plan ${planClass}`} style={{marginTop:14}}>
              <div className="account-plan-row">
                <span className="account-plan-label">Plano atual</span>
                <span className="account-plan-badge">{planLabel}</span>
              </div>
              {trialActive && !paid && (
                <div className="account-trial-info">
                  <span className="account-trial-icon">🎉</span>
                  <span>
                    <strong>{trialDays} {trialDays === 1 ? 'dia restante' : 'dias restantes'}</strong> do seu período de teste
                  </span>
                </div>
              )}
              {!paid && !trialActive && (
                <p className="account-plan-desc">
                  Você está no plano gratuito. Assine o Premium para liberar todos os recursos.
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
                <a className="account-btn account-btn-primary" href="/minha-assinatura" style={{textAlign:'center',textDecoration:'none',display:'block'}}>
                  ⚙️ Gerenciar assinatura
                </a>
              ) : (
                <button className="account-btn account-btn-primary" onClick={onSubscribe}>
                  ⭐ Assinar Premium
                </button>
              )}
              <a className="account-btn" href="/planos" style={{marginTop:8,display:'block',textAlign:'center',textDecoration:'none'}}>
                Ver planos e preços
              </a>
            </div>
          </section>


          {/* Benefícios Premium — esconde se já é assinante */}
          {!paid && (
            <section className="account-card account-benefits-card">
              <div className="account-section-head">
                <span className="account-section-eyebrow">Premium</span>
                <h3 className="account-section-title">Tudo o que você ganha</h3>
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

          {/* Ações da conta */}
          <section className="account-card account-list-card">
            <div className="account-section-head">
              <h3 className="account-section-title">Conta e suporte</h3>
            </div>
            <ul className="account-list">
              <li>
                <a className="account-list-item" href="/minha-assinatura" style={{textDecoration:'none'}}>
                  <span className="ali-ico">👑</span>
                  <span className="ali-text">
                    <strong>Minha assinatura</strong>
                    <span>Status, renovação e gerenciamento</span>
                  </span>
                  <span className="ali-chev">›</span>
                </a>
              </li>
              <li>
                <button className="account-list-item" onClick={handleRestore}>
                  <span className="ali-ico">🔄</span>
                  <span className="ali-text">
                    <strong>Restaurar assinatura</strong>
                    <span>Recupere compras e dados da nuvem</span>
                  </span>
                  <span className="ali-chev">›</span>
                </button>
              </li>
              <li>
                <button className="account-list-item" onClick={handleSupport}>
                  <span className="ali-ico">💬</span>
                  <span className="ali-text">
                    <strong>Suporte</strong>
                    <span>Fale direto com nosso time</span>
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
