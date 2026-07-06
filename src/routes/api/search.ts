import { createFileRoute } from '@tanstack/react-router'
import { requireApiAuth } from '@/lib/api-auth'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

type Result = {
  title: string
  artist_name: string
  url: string
}

type SolrDoc = {
  t?: string
  art?: string
  dns?: string
  txt?: string
  url?: string
}

async function searchCifraClub(query: string): Promise<Result[]> {
  const url = `https://solr.sscdn.co/cifraclub/1/search-artmus/select?q=${encodeURIComponent(
    query,
  )}&wt=json&rows=25`
  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' },
  })
  if (!res.ok) throw new Error(`Busca indisponível (HTTP ${res.status})`)
  const data = (await res.json()) as { response?: { docs?: SolrDoc[] } }
  const docs = data?.response?.docs || []
  const results: Result[] = []
  for (const d of docs) {
    // t=2 is a song entry; artist-only entries have no url slug
    if (d.t !== '2' || !d.dns || !d.url || !d.txt) continue
    results.push({
      title: d.txt,
      artist_name: d.art || '',
      url: `https://www.cifraclub.com.br/${d.dns}/${d.url}/`,
    })
    if (results.length >= 20) break
  }
  return results
}

export const Route = createFileRoute('/api/search')({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        const auth = await requireApiAuth(request, CORS)
        if (auth instanceof Response) return auth
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
          const msg = e instanceof Error ? e.message : 'Falha ao buscar'
          return new Response(JSON.stringify({ error: msg, results: [] }), {
            status: 502,
            headers: { 'Content-Type': 'application/json', ...CORS },
          })
        }
      },
    },
  },
})
