import { supabase } from '@/integrations/supabase/client'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function ensureUuid(id) {
  if (id && UUID_RE.test(id)) return id
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

async function getDefaultRepertorioId(userId) {
  const { data } = await supabase
    .from('repertorios')
    .select('id')
    .eq('user_id', userId)
    .order('criado_em', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (data?.id) return data.id
  const { data: created, error } = await supabase
    .from('repertorios')
    .insert({ user_id: userId, nome: 'Meu Repertório' })
    .select('id')
    .single()
  if (error) return null
  return created?.id || null
}

function rowToSong(row) {
  let base = {}
  try { base = row.cifra ? JSON.parse(row.cifra) : {} } catch { base = { rawText: row.cifra || '' } }
  if (!base || typeof base !== 'object') base = {}
  return {
    ...base,
    id: row.id,
    title: base.title || row.titulo || 'Sem título',
    artist: base.artist || row.artista || '',
    key: base.key || row.tom || 'C',
    sections: Array.isArray(base.sections) ? base.sections : [],
  }
}

export async function loadCloudSongs(userId) {
  if (!userId) return []
  const { data, error } = await supabase
    .from('musicas')
    .select('*')
    .eq('user_id', userId)
    .order('criado_em', { ascending: true })
  if (error || !data) return []
  return data.map(rowToSong)
}

export async function upsertCloudSong(userId, song) {
  if (!userId || !song) return song?.id
  const id = ensureUuid(song.id)
  const repertorioId = await getDefaultRepertorioId(userId)
  const payload = { ...song, id }
  const row = {
    id,
    user_id: userId,
    repertorio_id: repertorioId,
    titulo: song.title || 'Sem título',
    artista: song.artist || null,
    tom: song.key || null,
    cifra: JSON.stringify(payload),
  }
  const { error } = await supabase.from('musicas').upsert(row)
  if (error) console.warn('[cloudSongs] upsert failed:', error.message)
  return id
}

export async function deleteCloudSong(userId, songId) {
  if (!userId || !songId || !UUID_RE.test(songId)) return
  const { error } = await supabase.from('musicas').delete().eq('user_id', userId).eq('id', songId)
  if (error) console.warn('[cloudSongs] delete failed:', error.message)
}
