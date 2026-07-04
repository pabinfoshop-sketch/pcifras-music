import { useState } from 'react'

export default function AuthModal({ mode, setMode, onAuth, onGoogle, onClose }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const submit = async e => {
    e.preventDefault()
    if (loading) return
    if (mode === 'register' && !name) return
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
      <div className="modal auth-modal" onClick={e => e.stopPropagation()} style={{maxWidth:420,margin:'auto',borderRadius:20}}>
        <div className="modal-head">
          <div className="modal-title">
            <span style={{fontSize:'1.3rem',marginRight:6}}>{mode === 'login' ? '🔑' : '🎉'}</span>
            {mode === 'login' ? 'Entrar na sua conta' : 'Criar Conta — 7 dias grátis'}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form className="modal-body auth-form" onSubmit={submit} style={{padding:'20px 24px 24px'}}>
          {onGoogle && (
            <>
              <button type="button" className="auth-google-btn" onClick={google} disabled={googleLoading}>
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.3 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"/>
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.9 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.3 29 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"/>
                  <path fill="#4CAF50" d="M24 43.5c5 0 9.5-1.7 13-4.6l-6-5.1c-1.9 1.4-4.3 2.2-7 2.2-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.6 39.1 16.2 43.5 24 43.5z"/>
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6 5.1c-.4.4 6.5-4.7 6.5-14.7 0-1.2-.1-2.3-.4-3.5z"/>
                </svg>
                {googleLoading ? 'Abrindo Google…' : 'Continuar com Google'}
              </button>
              <div className="auth-divider"><span>ou</span></div>
            </>
          )}
          {mode === 'register' && (
            <div className="auth-field">
              <label>Nome</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Seu nome"
                autoComplete="name"
                required
                autoFocus
              />
            </div>
          )}
          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
              required
              autoFocus={mode === 'login'}
            />
          </div>
          <div className="auth-field">
            <label>Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'register' ? 'Mínimo 4 caracteres' : 'Sua senha'}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={4}
            />
          </div>
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? '⏳ Aguarde...' : (mode === 'login' ? '🔑 Entrar' : '🚀 Criar Conta e Testar Grátis')}
          </button>
          <div className="auth-switch">
            {mode === 'login' ? (
              <>Não tem conta? <button type="button" className="link-btn" onClick={() => setMode('register')}>Criar agora</button></>
            ) : (
              <>Já tem conta? <button type="button" className="link-btn" onClick={() => setMode('login')}>Entrar</button></>
            )}
          </div>
          <div className="premium-footer-note" style={{marginTop:12}}>
            {mode === 'register' ? (
              <>🎉 7 dias grátis — sem cartão. Suas músicas ficam salvas.</>
            ) : (
              <>🔒 Suas músicas continuam salvas no dispositivo</>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
