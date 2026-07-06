import { createFileRoute } from '@tanstack/react-router'
import { requireApiAuth } from '@/lib/api-auth'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36'

type YTResult = {
  id: string
  title: string
  artist: string
  duration: number
  score?: number
}

function parseDuration(txt: string): number {
  if (!txt) return 0
  const parts = txt.split(':').map((n) => parseInt(n, 10) || 0)
  let s = 0
  for (const p of parts) s = s * 60 + p
  return s
}

// Strip diacritics
function stripAccents(s: string): string {
  return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

// Aggressive cleaner for the search query itself
function cleanForQuery(s: string): string {
  if (!s) return ''
  let out = s
  // Remove content in brackets/parens that is usually noise
  out = out.replace(/\[[^\]]*\]/g, ' ')
  out = out.replace(/\([^)]*\)/g, ' ')
  // Remove common noise markers
  out = out.replace(
    /\b(ao vivo|acustic[oa]|acoustic|live|official|oficial|clipe|video ?clipe|hd|4k|lyric[s]?|letra|legendad[oa]|cover|remix|remaster(ed)?|version|vers[aã]o|karaok[eê]|feat\.?|ft\.?|part\.?|com\s+part[ií]cip)/gi,
    ' ',
  )
  // Drop separators like " - ", " | ", " / "
  out = out.replace(/[|/·•—–_]+/g, ' ')
  // Collapse punctuation
  out = out.replace(/[^\p{L}\p{N}\s'.-]/gu, ' ')
  out = out.replace(/\s+/g, ' ').trim()
  return out
}

// Light normalization (preserve casing/spaces for query)
function normalize(s: string): string {
  return (s || '').replace(/\s+/g, ' ').trim()
}

// Token set for scoring / dedup
function tokens(s: string): string[] {
  return stripAccents(s.toLowerCase())
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && w.length > 1)
}

const STOP = new Set([
  'de', 'da', 'do', 'das', 'dos', 'a', 'o', 'e', 'em', 'no', 'na', 'um', 'uma',
  'the', 'of', 'and', 'to', 'for', 'in', 'on',
])
function contentTokens(s: string): string[] {
  return tokens(s).filter((t) => !STOP.has(t))
}

function buildQueries(
  title: string,
  artist: string,
  type: 'playback' | 'original',
  key: string,
): string[] {
  const t = cleanForQuery(title)
  const a = cleanForQuery(artist)
  const suffix = type === 'playback' ? 'playback' : 'oficial'
  const list: string[] = []

  const push = (q: string) => {
    const norm = normalize(q).slice(0, 120)
    if (norm && !list.includes(norm)) list.push(norm)
  }

  if (t && a) {
    push(`${a} ${t} ${suffix}`)
    if (key) push(`${a} ${t} ${suffix} tom ${key}`)
    push(`${a} ${t}`)
  } else if (t) {
    push(`${t} ${suffix}`)
    push(t)
  } else if (a) {
    push(`${a} ${suffix}`)
  }

  // Fallback: raw title without cleaning (in case cleaner stripped too much)
  const rawT = normalize(title)
  const rawA = normalize(artist)
  if (rawT && rawA) push(`${rawA} ${rawT} ${suffix}`)
  if (rawT) push(`${rawT} ${suffix}`)

  return list
}

function scoreResult(
  r: YTResult,
  refTitle: string,
  refArtist: string,
  type: 'playback' | 'original',
): number {
  const refT = new Set(contentTokens(refTitle))
  const refA = new Set(contentTokens(refArtist))
  const cand = new Set([...contentTokens(r.title), ...contentTokens(r.artist)])
  let hitT = 0
  refT.forEach((w) => cand.has(w) && hitT++)
  let hitA = 0
  refA.forEach((w) => cand.has(w) && hitA++)
  const covT = refT.size ? hitT / refT.size : 0
  const covA = refA.size ? hitA / refA.size : 0

  let score = covT * 60 + covA * 25
  const lower = (r.title + ' ' + r.artist).toLowerCase()

  if (type === 'playback') {
    if (/playback/.test(lower)) score += 20
    else if (/instrumental|karaok/.test(lower)) score += 10
    if (/\bao vivo\b|live/.test(lower)) score -= 8
  } else {
    if (/oficial|official/.test(lower)) score += 10
    if (/playback|karaok|instrumental/.test(lower)) score -= 15
    if (/cover/.test(lower)) score -= 6
  }

  // Duration preference: 2–6 min sweet spot
  if (r.duration >= 120 && r.duration <= 360) score += 5
  if (r.duration > 900) score -= 10

  return score
}

function extractResults(html: string): YTResult[] {
  const m = html.match(/var ytInitialData = ({[\s\S]*?});<\/script>/)
  if (!m) return []
  let data: any
  try {
    data = JSON.parse(m[1])
  } catch {
    return []
  }
  const sections =
    data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer
      ?.contents || []
  const out: YTResult[] = []
  for (const sec of sections) {
    const items = sec?.itemSectionRenderer?.contents || []
    for (const it of items) {
      const vr = it?.videoRenderer
      if (!vr?.videoId) continue
      const title =
        (vr.title?.runs || []).map((r: any) => r.text || '').join('') ||
        vr.title?.simpleText ||
        ''
      const artist =
        (vr.ownerText?.runs || []).map((r: any) => r.text || '').join('') ||
        (vr.longBylineText?.runs || []).map((r: any) => r.text || '').join('') ||
        ''
      const durTxt =
        vr.lengthText?.simpleText ||
        (vr.lengthText?.runs || []).map((r: any) => r.text || '').join('') ||
        ''
      const duration = parseDuration(durTxt)
      if (duration && (duration < 45 || duration > 60 * 20)) continue
      out.push({ id: vr.videoId, title, artist, duration })
      if (out.length >= 25) return out
    }
  }
  return out
}

async function fetchSearch(query: string): Promise<YTResult[]> {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      Accept: 'text/html,application/xhtml+xml',
    },
  })
  if (!res.ok) throw new Error(`YouTube HTTP ${res.status}`)
  return extractResults(await res.text())
}

export const Route = createFileRoute('/api/audio/search')({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            title?: string
            artist?: string
            type?: string
            key?: string
          }
          const title = normalize(body.title || '')
          const artist = normalize(body.artist || '')
          const type: 'playback' | 'original' =
            body.type === 'playback' ? 'playback' : 'original'
          const key = normalize(body.key || '')

          if (!title && !artist) {
            return new Response(
              JSON.stringify({ results: [], query: '', error: 'Título ou artista ausente' }),
              { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } },
            )
          }

          const queries = buildQueries(title, artist, type, key)
          const seen = new Map<string, YTResult>()
          let usedQuery = ''

          for (const q of queries) {
            let batch: YTResult[] = []
            try {
              batch = await fetchSearch(q)
            } catch {
              continue
            }
            if (!usedQuery) usedQuery = q
            for (const r of batch) {
              if (seen.has(r.id)) continue
              r.score = scoreResult(r, title, artist, type)
              seen.set(r.id, r)
            }
            // Stop early once we have enough well-scored candidates
            const good = [...seen.values()].filter((r) => (r.score || 0) >= 40)
            if (good.length >= 6) break
          }

          const ranked = [...seen.values()]
            .filter((r) => {
              // Drop clearly irrelevant results (no shared tokens with reference)
              if (!title && !artist) return true
              return (r.score || 0) > 0
            })
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .slice(0, 12)
            .map(({ score, ...rest }) => rest)

          return new Response(
            JSON.stringify({ results: ranked, query: usedQuery, tried: queries }),
            { headers: { 'Content-Type': 'application/json', ...CORS } },
          )
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Falha na busca'
          return new Response(JSON.stringify({ results: [], error: msg }), {
            status: 502,
            headers: { 'Content-Type': 'application/json', ...CORS },
          })
        }
      },
    },
  },
})
