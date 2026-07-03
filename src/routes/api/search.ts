import { createFileRoute } from '@tanstack/react-router'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36'

type Result = {
  title: string
  artist_name: string
  url: string
  key?: string
}

function decodeEntities(s: string) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
}

function stripTags(s: string) {
  return decodeEntities(s.replace(/<[^>]+>/g, '')).trim()
}

async function searchCifraClub(query: string): Promise<Result[]> {
  const url = `https://www.cifraclub.com.br/?q=${encodeURIComponent(query)}`
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html' } })
  if (!res.ok) throw new Error(`CifraClub HTTP ${res.status}`)
  const html = await res.text()

  const results: Result[] = []
  const seen = new Set<string>()

  // Match cifraclub song entries: <a href="/artist/song/"><h3>Title</h3>...<h4>Artist</h4>
  const linkRe =
    /<a[^>]+href="(https?:\/\/www\.cifraclub\.com\.br)?(\/[a-z0-9-]+\/[a-z0-9-]+\/)"[^>]*>([\s\S]*?)<\/a>/gi
  let m: RegExpExecArray | null
  while ((m = linkRe.exec(html)) !== null && results.length < 20) {
    const path = m[2]
    if (seen.has(path)) continue
    // Skip obvious non-song paths
    if (/^\/(letras|artistas|top|estilos|acordes|videoaulas|revista|colunas|noticias|forum|contato|sobre|termos|privacidade|app|assine|premium)\//.test(path))
      continue
    const inner = m[3]
    const titleMatch = inner.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i) || inner.match(/<span[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/span>/i)
    const artistMatch = inner.match(/<h4[^>]*>([\s\S]*?)<\/h4>/i) || inner.match(/<span[^>]*class="[^"]*subtitle[^"]*"[^>]*>([\s\S]*?)<\/span>/i)
    if (!titleMatch) continue
    const title = stripTags(titleMatch[1])
    const artist = artistMatch ? stripTags(artistMatch[1]) : ''
    if (!title) continue
    seen.add(path)
    results.push({
      title,
      artist_name: artist,
      url: `https://www.cifraclub.com.br${path}`,
    })
  }

  return results
}

export const Route = createFileRoute('/api/search')({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          const { query } = (await request.json()) as { query?: string }
          if (!query || !query.trim()) {
            return new Response(JSON.stringify({ results: [] }), {
              headers: { 'Content-Type': 'application/json', ...CORS },
            })
          }
          const results = await searchCifraClub(query.trim())
          return new Response(JSON.stringify({ results }), {
            headers: { 'Content-Type': 'application/json', ...CORS },
          })
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'search failed'
          return new Response(JSON.stringify({ error: msg, results: [] }), {
            status: 502,
            headers: { 'Content-Type': 'application/json', ...CORS },
          })
        }
      },
    },
  },
})
