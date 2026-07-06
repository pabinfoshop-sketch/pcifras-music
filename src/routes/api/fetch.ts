import { createFileRoute } from '@tanstack/react-router'
import { requireApiAuth } from '@/lib/api-auth'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36'

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

/** Convert CifraClub <pre> HTML into plain cifra text with [Chord] markers. */
function extractCifra(html: string): { text: string; title: string; artist: string; key: string } {
  // Meta from head
  const titleTag = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || ''
  // e.g. "Nome da Música - Artista - Cifra Club"
  let title = ''
  let artist = ''
  const t = stripTags(titleTag).replace(/\s*-\s*Cifra Club.*$/i, '').trim()
  const parts = t.split(/\s+-\s+/)
  if (parts.length >= 2) {
    title = parts[0].trim()
    artist = parts.slice(1).join(' - ').trim()
  } else {
    title = t
  }

  // Try meta og:title/og:description too
  const ogTitle = html.match(/property=["']og:title["']\s+content=["']([^"']+)["']/i)?.[1]
  if (ogTitle) {
    const c = ogTitle.replace(/\s*-\s*Cifra Club.*$/i, '').trim()
    const p = c.split(/\s+-\s+/)
    if (p.length >= 2) {
      title = p[0].trim()
      artist = p.slice(1).join(' - ').trim()
    }
  }

  // Key: <span class="tom"><a>G</a></span> or similar
  let key = ''
  const keyMatch =
    html.match(/id=["']cifra_tom["'][^>]*>\s*(?:<[^>]+>\s*)*([A-G][#b]?m?)/i) ||
    html.match(/class=["'][^"']*tom[^"']*["'][^>]*>\s*(?:<[^>]+>\s*)*([A-G][#b]?m?)/i)
  if (keyMatch) key = keyMatch[1]

  // Cifra content: <pre>...</pre> inside cifra_cnt
  const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i)
  if (!preMatch) return { text: '', title, artist, key }
  let body = preMatch[1]

  // Chords are inside <b>Chord</b>. Convert to inline [Chord] form.
  body = body.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, (_, c) => {
    const chord = stripTags(c)
    return chord ? chord : ''
  })
  // Section headers often wrapped in something; drop remaining tags
  body = body.replace(/<br\s*\/?\s*>/gi, '\n')
  body = stripTags(body)

  return { text: body, title, artist, key }
}

export const Route = createFileRoute('/api/fetch')({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        const auth = await requireApiAuth(request, CORS)
        if (auth instanceof Response) return auth
        try {
          const { url, key } = (await request.json()) as { url?: string; key?: string }
          if (!url || !/^https?:\/\/www\.cifraclub\.com\.br\//.test(url)) {
            return new Response(JSON.stringify({ error: 'URL inválida' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...CORS },
            })
          }
          const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html' } })
          if (!res.ok) {
            return new Response(JSON.stringify({ error: `CifraClub HTTP ${res.status}` }), {
              status: 502,
              headers: { 'Content-Type': 'application/json', ...CORS },
            })
          }
          const html = await res.text()
          const parsed = extractCifra(html)
          return new Response(
            JSON.stringify({
              text: parsed.text,
              title: parsed.title,
              artist: parsed.artist,
              key: parsed.key || key || '',
            }),
            { headers: { 'Content-Type': 'application/json', ...CORS } },
          )
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'fetch failed'
          return new Response(JSON.stringify({ error: msg }), {
            status: 502,
            headers: { 'Content-Type': 'application/json', ...CORS },
          })
        }
      },
    },
  },
})
