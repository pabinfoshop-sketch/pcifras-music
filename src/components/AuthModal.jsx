import { useState } from 'react'

export default function AuthModal({ mode, setMode, onAuth, onGoogle, onClose }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const isRegister = mode === 'register'

  const submit = async e => {
    e.preventDefault()
    if (loading) return
    if (isRegister && !name) return
    if (!email || !password) return
    setLoading(true)
    const ok = await onAuth(mode, name, email, password)
    setLoading(false)
    if (ok) { setName(''); setEmail(''); setPassword('') }
  }

  const google = async () => {
    if (!onGoogle || googleLoading) return
    setGoogleLoading(true)
    try { await onGoogle() } finally { setGoogleLoading(false) }
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="auth-modal-v2" onClick={e => e.stopPropagation()}>
        <button className="auth-close-v2" onClick={onClose} aria-label="Fechar">✕</button>

        <div className="auth-hero">
          <div className="auth-logo-mark">♫</div>
          <div className="auth-eyebrow">PCifras Music</div>
          <h2 className="auth-title-v2">
            {isRegister ? 'Crie sua conta grátis' : 'Bem-vindo de volta'}
          </h2>
          <p className="auth-sub-v2">
            {isRegister
              ? 'Sincronize suas cifras e libere todos os recursos por 7 dias.'
              : 'Acesse suas cifras e repertórios de qualquer lugar.'}
          </p>
          {isRegister && (
            <div className="auth-trial-badge">
              <span className="auth-trial-dot" />
              7 dias grátis · sem cartão de crédito
            </div>
          )}
        </div>

        {isRegister && (
          <ul className="auth-benefits">
            <li><span className="ab-ico">☁️</span> Sincronize músicas entre dispositivos</li>
            <li><span className="ab-ico">🎼</span> Salve repertórios ilimitados</li>
            <li><span className="ab-ico">👑</span> Libere recursos premium do app</li>
          </ul>
        )}

        <form className="auth-form-v2" onSubmit={submit}>
          {onGoogle && (
            <>
              <button type="button" className="auth-google-v2" onClick={google} disabled={googleLoading}>
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.3 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"/>
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.9 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.3 29 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"/>
                  <path fill="#4CAF50" d="M24 43.5c5 0 9.5-1.7 13-4.6l-6-5.1c-1.9 1.4-4.3 2.2-7 2.2-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.6 39.1 16.2 43.5 24 43.5z"/>
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6 5.1c-.4.4 6.5-4.7 6.5-14.7 0-1.2-.1-2.3-.4-3.5z"/>
                </svg>
                {googleLoading ? 'Abrindo Google…' : 'Continuar com Google'}
              </button>
              <div className="auth-divider-v2"><span>ou com email</span></div>
            </>
          )}

          {isRegister && (
            <div className="auth-field-v2">
              <label>Nome</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Como quer ser chamado"
                autoComplete="name"
                required
                autoFocus
              />
            </div>
          )}
          <div className="auth-field-v2">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
              required
              autoFocus={!isRegister}
            />
          </div>
          <div className="auth-field-v2">
            <label>Senha</label>
            <div className="auth-pw-wrap">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={isRegister ? 'Mínimo 4 caracteres' : 'Sua senha'}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                required
                minLength={4}
              />
              <button
                type="button"
                className="auth-pw-toggle"
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit-v2" disabled={loading}>
            {loading
              ? 'Aguarde…'
              : isRegister ? 'Começar teste grátis de 7 dias' : 'Entrar na minha conta'}
          </button>

          <div className="auth-switch-v2">
            {isRegister ? (
              <>Já tem conta? <button type="button" className="link-btn-v2" onClick={() => setMode('login')}>Entrar</button></>
            ) : (
              <>Novo por aqui? <button type="button" className="link-btn-v2" onClick={() => setMode('register')}>Criar conta grátis</button></>
            )}
          </div>

          <div className="auth-foot-v2">
            <span>🔒 Seus dados ficam seguros</span>
            <span>·</span>
            <span>Cancele quando quiser</span>
          </div>
        </form>
      </div>
    </div>
  )
}
