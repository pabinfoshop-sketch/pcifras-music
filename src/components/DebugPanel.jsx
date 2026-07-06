import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { addCloudSong, fetchUserSongs } from '@/lib/songsService'

export default function DebugPanel({ authUser, isPremium, songs }) {
  const [open, setOpen] = useState(false)
  const [logs, setLogs] = useState([])
  const [copied, setCopied] = useState(false)
  const installed = useRef(false)

  const addLog = (message, level = 'log') => {
    const timestamp = new Date().toLocaleTimeString()
    const entry = `[${timestamp}] ${level === 'log' ? '' : level.toUpperCase() + ': '}${message}`
    setLogs(prev => [entry, ...prev].slice(0, 50))
  }

  // Intercept console.log/warn/error once so existing debug logs are captured.
  useEffect(() => {
    if (installed.current) return
    installed.current = true
    const orig = { log: console.log, warn: console.warn, error: console.error }
    const format = (args) =>
      args.map(a => {
        if (a instanceof Error) return a.message
        if (typeof a === 'object') { try { return JSON.stringify(a) } catch { return String(a) } }
        return String(a)
      }).join(' ')
    console.log = (...a) => { addLog(format(a), 'log'); orig.log(...a) }
    console.warn = (...a) => { addLog(format(a), 'warn'); orig.warn(...a) }
    console.error = (...a) => { addLog(format(a), 'error'); orig.error(...a) }
  }, [])

  if (!authUser) return null

  const testConnection = async () => {
    addLog('→ Testando conexão Supabase...')
    try {
      const { data, error } = await supabase.from('songs').select('id').limit(1)
      if (error) addLog(`❌ Conexão falhou: ${error.message}`)
      else addLog(`✅ Conexão OK (${data?.length ?? 0} linha[s])`)
    } catch (e) { addLog(`❌ Exceção: ${e.message}`) }
  }

  const testAdd = async () => {
    addLog('→ Testando adicionar música fake...')
    try {
      const fake = { title: `Debug ${Date.now()}`, artist: 'Debug', key: 'C', bpm: 80, sections: [] }
      const id = await addCloudSong(authUser.id, fake)
      addLog(`✅ Música criada id=${id}`)
    } catch (e) { addLog(`❌ Erro: ${e.message}`) }
  }

  const testFetch = async () => {
    addLog('→ Testando carregar músicas...')
    try {
      const list = await fetchUserSongs(authUser.id)
      addLog(`✅ ${list.length} música(s) carregadas`)
      addLog(`IDs: ${list.map(s => s.id).slice(0, 5).join(', ')}${list.length > 5 ? '…' : ''}`)
    } catch (e) { addLog(`❌ Erro: ${e.message}`) }
  }

  const copyLogs = async () => {
    const text = logs.join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Fallback
      const ta = document.createElement('textarea')
      ta.value = text; document.body.appendChild(ta); ta.select()
      try { document.execCommand('copy') } catch {}
      document.body.removeChild(ta)
      setCopied(true); setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir painel de debug"
        style={{
          position: 'fixed', right: 12, bottom: 12, zIndex: 9998,
          width: 48, height: 48, borderRadius: '50%', border: 'none',
          background: '#7c3aed', color: '#fff', fontSize: 22,
          boxShadow: '0 4px 12px rgba(0,0,0,.3)', cursor: 'pointer',
        }}
      >🐛</button>

      {open && (
        <div
          role="dialog"
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'stretch', justifyContent: 'center',
          }}
          onClick={() => setOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', color: '#111', width: '100%', maxWidth: 640,
              margin: 'auto', maxHeight: '95vh', overflow: 'auto', borderRadius: 12, padding: 16,
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>🐛 Diagnóstico</h2>
              <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: 22, cursor: 'pointer' }}>×</button>
            </div>

            <section style={{ background: '#f3f4f6', padding: 10, borderRadius: 8, marginBottom: 10, fontSize: 13 }}>
              <div><b>User ID:</b> {authUser.id}</div>
              <div><b>Email:</b> {authUser.email}</div>
              <div><b>isPremium:</b> {String(isPremium)}</div>
              <div><b>paidActive:</b> {String(authUser.paidActive)}</div>
              <div><b>premiumUntil / expiresAt:</b> {String(authUser.premiumUntil || authUser.trialEnd || '—')}</div>
              <div><b>Músicas no estado:</b> {songs?.length ?? 0}</div>
              <div style={{ fontSize: 11, color: '#555', marginTop: 4, wordBreak: 'break-all' }}>
                IDs: {(songs || []).map(s => s.id).slice(0, 5).join(', ')}{(songs?.length || 0) > 5 ? '…' : ''}
              </div>
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              <button onClick={testConnection} style={btn}>Testar Conexão</button>
              <button onClick={testFetch} style={btn}>Testar Carregar</button>
              <button onClick={testAdd} style={btn}>Testar Adicionar</button>
              <button onClick={() => setLogs([])} style={{ ...btn, background: '#ef4444' }}>Limpar Logs</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Logs ({logs.length})</h3>
              <button onClick={copyLogs} style={{ ...btn, padding: '6px 10px', fontSize: 12, background: '#0ea5e9' }}>
                {copied ? '✓ Copiado' : 'Copiar Logs'}
              </button>
            </div>
            <div style={{ maxHeight: '50vh', overflowY: 'auto', background: '#0b1020', color: '#d1e0ff', padding: 10, borderRadius: 8, fontFamily: 'monospace', fontSize: 11 }}>
              {logs.length === 0 && <div style={{ color: '#94a3b8' }}>Nenhum log ainda. Realize ações no app.</div>}
              {logs.map((log, i) => (
                <div key={i} style={{ borderBottom: '1px solid #1e293b', padding: '3px 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{log}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const btn = {
  background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 6,
  padding: '10px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
}
