import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";

export const Route = createFileRoute("/repertorios")({
  head: () => ({
    meta: [
      { title: "Repertórios — pCifras" },
      { name: "description", content: "Organize suas músicas em repertórios no pCifras." },
    ],
  }),
  component: RepertoriosPage,
});

type Repertoire = {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
};

type RepertoireSong = {
  id: string;
  repertoire_id: string;
  song_id: string;
  position: number;
  song: { id: string; title: string; artist: string; tone: string | null } | null;
};

type Song = { id: string; title: string; artist: string; tone: string | null };

function RepertoriosPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Repertoire | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Repertoire | null>(null);
  const [addingTo, setAddingTo] = useState<Repertoire | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUserId(s?.user?.id ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (userId === null) navigate({ to: "/auth" });
  }, [userId, navigate]);

  const repertoiresQ = useQuery({
    queryKey: ["repertoires", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("repertoires")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as Repertoire[];
    },
  });

  const songsByRepQ = useQuery({
    queryKey: ["repertoire_songs", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("repertoire_songs")
        .select("id, repertoire_id, song_id, position, song:public_songs(id,title,artist,tone)")
        .order("position", { ascending: true });
      if (error) throw error;
      const map: Record<string, RepertoireSong[]> = {};
      (data as any[]).forEach((r) => {
        (map[r.repertoire_id] ||= []).push(r as RepertoireSong);
      });
      return map;
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["repertoires"] });
    qc.invalidateQueries({ queryKey: ["repertoire_songs"] });
  };

  const removeSong = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("repertoire_songs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteRep = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("repertoires").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      setConfirmDelete(null);
    },
  });

  const reorder = useMutation({
    mutationFn: async (rows: { id: string; position: number }[]) => {
      // Update each row's position; keep it simple with individual updates
      for (const r of rows) {
        const { error } = await supabase
          .from("repertoire_songs")
          .update({ position: r.position })
          .eq("id", r.id);
        if (error) throw error;
      }
    },
    onSuccess: invalidate,
  });

  if (userId === undefined) {
    return <div className="min-h-screen bg-[#0b0d12] text-white/60 flex items-center justify-center">Carregando…</div>;
  }

  const repertoires = repertoiresQ.data ?? [];
  const songsMap = songsByRepQ.data ?? {};

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white px-5 py-10 pb-28">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-sm text-white/60 hover:text-white">← Voltar</Link>
          <span className="text-xs text-[#f5c451] uppercase tracking-widest">
            {repertoires.length} repertório{repertoires.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold">Repertórios</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-[#f5c451] text-black font-semibold px-4 py-2 rounded-lg text-sm hover:brightness-110"
          >
            + Criar Repertório
          </button>
        </div>

        {repertoiresQ.isLoading && <p className="text-white/60">Carregando…</p>}
        {repertoiresQ.error && <p className="text-red-400">Erro: {(repertoiresQ.error as Error).message}</p>}
        {!repertoiresQ.isLoading && repertoires.length === 0 && (
          <p className="text-white/60">Você ainda não tem repertórios. Crie o primeiro!</p>
        )}

        <div className="grid gap-4">
          {repertoires.map((r) => {
            const songs = songsMap[r.id] ?? [];
            return (
              <RepertoireCard
                key={r.id}
                rep={r}
                songs={songs}
                onEdit={() => setEditing(r)}
                onDelete={() => setConfirmDelete(r)}
                onAddSong={() => setAddingTo(r)}
                onRemoveSong={(id) => removeSong.mutate(id)}
                onReorder={(rows) => reorder.mutate(rows)}
              />
            );
          })}
        </div>
      </div>

      {showCreate && (
        <RepertoireFormModal
          userId={userId!}
          onClose={() => setShowCreate(false)}
          onSaved={() => {
            setShowCreate(false);
            invalidate();
          }}
        />
      )}
      {editing && (
        <RepertoireFormModal
          userId={userId!}
          rep={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            invalidate();
          }}
        />
      )}
      {confirmDelete && (
        <ConfirmModal
          title="Excluir repertório?"
          message={`Isso removerá "${confirmDelete.name}" e todas as músicas dele. Esta ação não pode ser desfeita.`}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => deleteRep.mutate(confirmDelete.id)}
          loading={deleteRep.isPending}
        />
      )}
      {addingTo && (
        <AddSongModal
          rep={addingTo}
          existingSongIds={(songsMap[addingTo.id] ?? []).map((s) => s.song_id)}
          currentCount={(songsMap[addingTo.id] ?? []).length}
          onClose={() => setAddingTo(null)}
          onAdded={() => {
            setAddingTo(null);
            invalidate();
          }}
        />
      )}
      <BottomNav />
    </div>
  );
}

function RepertoireCard({
  rep,
  songs,
  onEdit,
  onDelete,
  onAddSong,
  onRemoveSong,
  onReorder,
}: {
  rep: Repertoire;
  songs: RepertoireSong[];
  onEdit: () => void;
  onDelete: () => void;
  onAddSong: () => void;
  onRemoveSong: (id: string) => void;
  onReorder: (rows: { id: string; position: number }[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const [items, setItems] = useState(songs);
  useEffect(() => setItems(songs), [songs]);

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    onReorder(next.map((r, idx) => ({ id: r.id, position: idx })));
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <h2 className="font-bold text-lg truncate">{rep.name}</h2>
          {rep.description && <p className="text-sm text-white/60 mt-1">{rep.description}</p>}
          <div className="text-xs text-white/40 mt-1">
            {items.length} música{items.length === 1 ? "" : "s"} · {new Date(rep.created_at).toLocaleDateString("pt-BR")}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={onEdit} className="text-xs px-2 py-1 rounded border border-white/15 hover:bg-white/5">
            Editar
          </button>
          <button onClick={onDelete} className="text-xs px-2 py-1 rounded border border-red-500/30 text-red-300 hover:bg-red-500/10">
            Excluir
          </button>
        </div>
      </div>

      <button
        onClick={onAddSong}
        className="w-full mt-3 mb-3 text-sm border border-dashed border-white/15 rounded-lg py-2 text-white/70 hover:bg-white/5"
      >
        + Adicionar Música
      </button>

      {items.length === 0 ? (
        <p className="text-sm text-white/40">Nenhuma música ainda.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-1">
              {items.map((rs) => (
                <SortableSongRow key={rs.id} rs={rs} onRemove={() => onRemoveSong(rs.id)} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function SortableSongRow({ rs, onRemove }: { rs: RepertoireSong; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: rs.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-md bg-white/[0.03] border border-white/10 px-2 py-1.5"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-white/40 hover:text-white/70 px-1"
        aria-label="Arrastar para reordenar"
      >
        ⋮⋮
      </button>
      {rs.song ? (
        <Link
          to="/musicas/$id"
          params={{ id: rs.song.id }}
          className="flex-1 text-sm text-white/85 hover:text-[#f5c451] truncate"
        >
          {rs.song.title} <span className="text-white/40">— {rs.song.artist}</span>
        </Link>
      ) : (
        <span className="flex-1 text-sm text-white/40">Música removida</span>
      )}
      <button
        onClick={onRemove}
        className="text-xs text-red-300 hover:text-red-200 px-2 py-1 rounded hover:bg-red-500/10"
      >
        Remover
      </button>
    </li>
  );
}

function RepertoireFormModal({
  userId,
  rep,
  onClose,
  onSaved,
}: {
  userId: string;
  rep?: Repertoire;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(rep?.name ?? "");
  const [description, setDescription] = useState(rep?.description ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setErr(null);
    try {
      if (rep) {
        const { error } = await supabase
          .from("repertoires")
          .update({ name: name.trim(), description: description.trim() || null })
          .eq("id", rep.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("repertoires")
          .insert({ name: name.trim(), description: description.trim() || null, user_id: userId });
        if (error) throw error;
      }
      onSaved();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell onClose={onClose} title={rep ? "Editar Repertório" : "Novo Repertório"}>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="text-xs text-white/60">Nome</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 bg-white/5 border border-white/15 rounded px-3 py-2 text-sm"
            placeholder="Ex: Culto de Domingo"
            required
          />
        </div>
        <div>
          <label className="text-xs text-white/60">Descrição</label>
          <textarea
            value={description ?? ""}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full mt-1 bg-white/5 border border-white/15 rounded px-3 py-2 text-sm resize-none"
            placeholder="Opcional"
          />
        </div>
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-3 py-2 text-sm rounded border border-white/15">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="px-4 py-2 text-sm rounded bg-[#f5c451] text-black font-semibold disabled:opacity-50"
          >
            {saving ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function AddSongModal({
  rep,
  existingSongIds,
  currentCount,
  onClose,
  onAdded,
}: {
  rep: Repertoire;
  existingSongIds: string[];
  currentCount: number;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState<string | null>(null);
  const escaped = q.replace(/[%_]/g, (m) => `\\${m}`);

  const results = useQuery({
    queryKey: ["public_songs", "picker", escaped],
    queryFn: async () => {
      let query = supabase.from("public_songs").select("id,title,artist,tone").limit(30);
      if (escaped.trim()) query = query.or(`title.ilike.%${escaped}%,artist.ilike.%${escaped}%`);
      else query = query.order("views", { ascending: false });
      const { data, error } = await query;
      if (error) throw error;
      return data as Song[];
    },
  });

  const add = async (song: Song) => {
    setAdding(song.id);
    const { error } = await supabase.from("repertoire_songs").insert({
      repertoire_id: rep.id,
      song_id: song.id,
      position: currentCount,
    });
    setAdding(null);
    if (!error) onAdded();
  };

  return (
    <ModalShell onClose={onClose} title={`Adicionar música — ${rep.name}`}>
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por título ou artista"
        className="w-full bg-white/5 border border-white/15 rounded px-3 py-2 text-sm mb-3"
      />
      <div className="max-h-80 overflow-y-auto space-y-1">
        {results.isLoading && <p className="text-white/60 text-sm">Carregando…</p>}
        {results.data?.length === 0 && <p className="text-white/60 text-sm">Nenhum resultado.</p>}
        {results.data?.map((s) => {
          const already = existingSongIds.includes(s.id);
          return (
            <div key={s.id} className="flex items-center gap-2 rounded bg-white/[0.03] border border-white/10 px-2 py-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">{s.title}</div>
                <div className="text-xs text-white/50 truncate">{s.artist}{s.tone ? ` · ${s.tone}` : ""}</div>
              </div>
              <button
                onClick={() => add(s)}
                disabled={already || adding === s.id}
                className="text-xs px-2 py-1 rounded bg-[#f5c451] text-black font-semibold disabled:opacity-40"
              >
                {already ? "Adicionado" : adding === s.id ? "…" : "Adicionar"}
              </button>
            </div>
          );
        })}
      </div>
    </ModalShell>
  );
}

function ConfirmModal({
  title,
  message,
  onCancel,
  onConfirm,
  loading,
}: {
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}) {
  return (
    <ModalShell onClose={onCancel} title={title}>
      <p className="text-sm text-white/70 mb-4">{message}</p>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-2 text-sm rounded border border-white/15">
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-4 py-2 text-sm rounded bg-red-500 text-white font-semibold disabled:opacity-50"
        >
          {loading ? "Excluindo…" : "Excluir"}
        </button>
      </div>
    </ModalShell>
  );
}

function ModalShell({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#141821] border border-white/10 rounded-xl p-5 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white text-xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
