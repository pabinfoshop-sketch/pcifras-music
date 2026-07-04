import { useState, useRef } from 'react'
import { parseCifraText } from '../utils/parser'
import { detectKey } from '../utils/chordDiagrams'

export default function Modal({ onAdd, onClose, initialTab = 'search' }) {
  const [tab, setTab] = useState(initialTab)
  const [errorMsg, setErrorMsg] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('idle')
  const [results, setResults] = useState([])
  const [fetching, setFetching] = useState(null)
  const [manualTitle, setManualTitle] = useState('')
  const [manualKey, setManualKey] = useState('G')
  const [manualRhythm, setManualRhythm] = useState('Hino 4/4')
  const [manualCifra, setManualCifra] = useState('')
  const [manualCategory, setManualCategory] = useState('')
  const inputRef = useRef(null)

  const API_URL = import.meta.env.VITE_API_URL || '/api'

  const handleSearch = async () => {
    if (!query.trim()) return
    setStatus('searching')
    setResults([])
    setFetching(null)
    setErrorMsg('')
    try {
      const res = await fetch(`${API_URL}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.error) {
        setErrorMsg(data.error || `Erro ${res.status} ao buscar`)
        setStatus('error')
        return
      }
      setResults(data.results || [])
      setStatus(data.results?.length > 0 ? 'found' : 'notfound')
    } catch (e) {
      setErrorMsg(e?.message || 'Sem conexão com o servidor de busca')
      setStatus('error')
    }
  }

  const handleSelectResult = async (song) => {
    setFetching(song.url)
    setErrorMsg('')
    try {
      const res = await fetch(`${API_URL}/fetch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: song.url, key: song.key }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.error || !data.text || data.text.length < 30) {
        setFetching(null)
        setErrorMsg(data.error || 'Cifra não pôde ser carregada desta página')
        setStatus('error')
        return
      }
      const songKey = data.key || song.key || 'C'
      const songObj = parseCifraText(data.text, data.title || song.title, songKey, 'Hino 4/4')
      songObj.artist = data.artist || song.artist_name || ''
      const allChords = []
      for (const sec of songObj.sections || []) {
        for (const line of sec.lines || []) {
          for (const g of line || []) {
            const ch = Array.isArray(g) ? g[0] : g.chord
            if (ch) allChords.push(ch)
          }
        }
      }
      if (allChords.length) songObj.key = detectKey(allChords)
      onAdd(songObj)
      reset()
    } catch (e) {
      setFetching(null)
      setErrorMsg(e?.message || 'Falha ao carregar a cifra')
      setStatus('error')
    }
  }

  const addManual = () => {
    if (!manualTitle.trim() || !manualCifra.trim()) return
    const song = parseCifraText(manualCifra, manualTitle, manualKey, manualRhythm)
    song.category = manualCategory.trim()
    onAdd(song)
    reset()
  }

  const reset = () => {
    setQuery('')
    setStatus('idle')
    setResults([])
    setFetching(null)
    setErrorMsg('')
    setTab('search')
    setManualTitle('')
    setManualKey('G')
    setManualRhythm('Hino 4/4')
    setManualCifra('')
    setManualCategory('')
    onClose()
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="modal-bg" onClick={e => { if (e.target.className === 'modal-bg') reset() }}>
      <div className="modal">
        <div className="modal-head">
          <span className="modal-title">Adicionar Música</span>
          <button className="modal-close" onClick={reset}>✕</button>
        </div>
        <div className="modal-body">
          <div className="tab-row">
            <button
              className={`tab-btn ${tab === 'search' ? 'active' : ''}`}
              onClick={() => { setTab('search'); setStatus('idle'); setErrorMsg('') }}
            >
              Buscar Online
            </button>
            <button
              className={`tab-btn ${tab === 'manual' ? 'active' : ''}`}
              onClick={() => setTab('manual')}
            >
              Digitar Manual
            </button>
          </div>

          {tab === 'search' && (
            <div>
              <label className="form-label">Nome da música ou artista</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  ref={inputRef}
                  className="form-input"
                  placeholder="ex: Vem a Jesus"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
                <button
                  className="form-submit"
                  style={{ width: 'auto', padding: '0 18px', margin: 0 }}
                  onClick={handleSearch}
                  disabled={status === 'searching' || !query.trim()}
                >
                  {status === 'searching' ? '...' : 'Buscar'}
                </button>
              </div>

              {status === 'searching' && (
                <div className="form-note" style={{ marginTop: 14 }}>
                  Procurando cifras…
                </div>
              )}

              {status === 'notfound' && (
                <div className="form-note" style={{ marginTop: 14 }}>
                  Nada encontrado para "{query}". Tente outro título ou artista, ou adicione manualmente.
                </div>
              )}

              {status === 'error' && (
                <div className="form-note" style={{ marginTop: 14, color: '#ff9a9a' }}>
                  ⚠ {errorMsg || 'A busca falhou agora. Verifique sua conexão e tente novamente.'}
                </div>
              )}


              {status === 'found' && results.length > 0 && (
                <ul className="search-results" style={{ listStyle: 'none', padding: 0, marginTop: 14, maxHeight: 340, overflowY: 'auto' }}>
                  {results.map((r) => (
                    <li key={r.url} style={{ marginBottom: 6 }}>
                      <button
                        onClick={() => handleSelectResult(r)}
                        disabled={fetching === r.url}
                        style={{
                          width: '100%', textAlign: 'left', padding: '10px 12px',
                          background: fetching === r.url ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
                          color: 'inherit', cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>{r.title}</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                          {r.artist_name}{fetching === r.url ? ' — carregando…' : ''}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === 'manual' && (
            <div>
              <div className="form-row">
                <div>
                  <label className="form-label">Título</label>
                  <input className="form-input" placeholder="Nome da música" value={manualTitle} onChange={e => setManualTitle(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Tom</label>
                  <select className="form-select" value={manualKey} onChange={e => setManualKey(e.target.value)}>
                    {['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'].map(k => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Ritmo</label>
                  <select className="form-select" value={manualRhythm} onChange={e => setManualRhythm(e.target.value)}>
                    {['Valsa','Marcha','Hino 4/4','Baião','Bolero','Outro'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Categoria</label>
                  <input className="form-input" placeholder="ex: Louvor, Adoração" value={manualCategory} onChange={e => setManualCategory(e.target.value)} />
                </div>
              </div>
              <label className="form-label">Cifra com acordes em [colchetes]</label>
              <textarea
                className="form-textarea"
                placeholder={`[G]Alma cansada que [D7]buscas a paz\n[G]No mundo não [C]podes encontrar\n\n— Refrão —\n[G]Vem a Jesus [D7]vem a Jesus`}
                value={manualCifra}
                onChange={e => setManualCifra(e.target.value)}
              />
              <div className="form-note">Use [Acorde] antes da palavra. Separe seções com linhas vazias. "— Refrão —" marca o refrão.</div>
              <button className="form-submit" onClick={addManual}>Adicionar</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
