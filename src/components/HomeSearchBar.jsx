import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { mockSongs } from '@/lib/mockData'

export default function HomeSearchBar() {
  const navigate = useNavigate()
  const [term, setTerm] = useState('')

  const sugestoes = useMemo(() => {
    const q = term.trim().toLowerCase()
    if (!q) return []
    return mockSongs
      .filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q),
      )
      .slice(0, 6)
  }, [term])

  const irParaBusca = () => {
    if (!term.trim()) return
    navigate({ to: '/busca', search: { q: term.trim() } })
  }

  const irParaMusica = (id) => {
    navigate({ to: '/musicas/$id', params: { id: String(id) } })
  }

  return (
    <div
      style={{
        position: 'relative',
        maxWidth: 480,
        margin: '24px auto 0',
        padding: '0 20px',
        zIndex: 20,
      }}
    >
      <input
        type="text"
        value={term}
        placeholder="Buscar música, artista ou categoria..."
        onChange={(e) => setTerm(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && irParaBusca()}
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: 12,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#fff',
          outline: 'none',
          fontSize: 15,
        }}
      />
      {sugestoes.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            left: 20,
            right: 20,
            top: '100%',
            marginTop: 6,
            background: '#111319',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            listStyle: 'none',
            padding: 6,
            maxHeight: 280,
            overflowY: 'auto',
          }}
        >
          {sugestoes.map((m) => (
            <li
              key={m.id}
              onClick={() => irParaMusica(m.id)}
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                cursor: 'pointer',
                color: '#fff',
                fontSize: 14,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(245,196,81,0.12)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <strong>{m.title}</strong>{' '}
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>— {m.artist}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
