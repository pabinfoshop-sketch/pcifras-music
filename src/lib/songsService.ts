import { supabase } from '@/integrations/supabase/client'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function ensureUuid(id: string | undefined | null): string {
  if (id && UUID_RE.test(id)) return id
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

function rowToSong(row: any) {
  let base: any = {}
  try { base = row.raw_text ? JSON.parse(row.raw_text) : {} } catch { base = { rawText: row.raw_text || '' } }
  if (!base || typeof base !== 'object') base = {}
  return {
    ...base,
    id: row.id,
    title: base.title || row.title || 'Sem título',
    artist: base.artist || row.artist || '',
    key: base.key || row.music_key || 'C',
    bpm: base.bpm ?? row.bpm ?? 80,
    favorite: base.favorite ?? row.favorite ?? false,
    category: base.category ?? row.category ?? null,
    sections: Array.isArray(base.sections) ? base.sections : (Array.isArray(row.sections) ? row.sections : []),
  }
}

function songToRow(userId: string, song: any) {
  const id = ensureUuid(song?.id)
  return {
    id,
    user_id: userId,
    title: song?.title || 'Sem título',
    artist: song?.artist || null,
    music_key: song?.key || 'C',
    bpm: Number.isFinite(song?.bpm) ? song.bpm : 80,
    favorite: !!song?.favorite,
    category: song?.category || null,
    sections: Array.isArray(song?.sections) ? song.sections : [],
    raw_text: JSON.stringify({ ...song, id }),
  }
}

export async function fetchUserSongs(userId: string) {
  if (!userId) return []
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data || []).map(rowToSong)
}

export async function addCloudSong(userId: string, song: any) {
  if (!userId) throw new Error('Usuário não autenticado')
  const row = songToRow(userId, song)
  console.log('addCloudSong chamado com:', row)
  const { data, error } = await supabase.from('songs').upsert(row).select()
  console.log('Resultado do insert:', { data, error })
  if (error) throw error
  return (data && data[0]?.id) || row.id
}

export async function deleteCloudSong(userId: string, songId: string) {
  if (!userId || !songId || !UUID_RE.test(songId)) return
  const { error } = await supabase.from('songs').delete().eq('user_id', userId).eq('id', songId)
  if (error) throw error
}

export async function syncLocalSongsToCloud(userId: string, localSongs: any[]) {
  if (!userId) throw new Error('Usuário não autenticado')
  let ok = 0
  for (const s of localSongs || []) {
    try {
      await addCloudSong(userId, s)
      ok++
    } catch (e) {
      console.warn('[songsService] sync failed for song', s?.id, e)
    }
  }
  return ok
}
