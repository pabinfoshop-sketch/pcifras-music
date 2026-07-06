import { createClient } from '@supabase/supabase-js'

/**
 * Verify the incoming request has a valid Supabase JWT bearer token.
 * Returns { userId } on success, or a Response (401/500) that the caller
 * should return immediately.
 */
export async function requireApiAuth(
  request: Request,
  corsHeaders: Record<string, string> = {},
): Promise<{ userId: string } | Response> {
  const jsonHeaders = { 'Content-Type': 'application/json', ...corsHeaders }

  const auth = request.headers.get('authorization') || request.headers.get('Authorization')
  if (!auth || !auth.toLowerCase().startsWith('bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: jsonHeaders,
    })
  }
  const token = auth.slice(7).trim()
  if (!token || token.split('.').length !== 3) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: jsonHeaders,
    })
  }

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) {
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
      status: 500,
      headers: jsonHeaders,
    })
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await supabase.auth.getClaims(token)
  if (error || !data?.claims?.sub) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: jsonHeaders,
    })
  }
  return { userId: data.claims.sub as string }
}
