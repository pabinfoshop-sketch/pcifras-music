# Portar o app Cifras/Violão para Lovable

Portar todo o app (frontend + backend) do zip `appviolao-main` para este projeto TanStack Start, usando **Lovable Cloud** para base de dados e autenticação, e **server functions** para pagamentos Mercado Pago. O código Express/SQLite/Fly.io é substituído — o comportamento e a UI React são preservados o mais possível.

## Fases de entrega

### Fase 0 — Infra
- Ativar **Lovable Cloud** (Postgres + Auth geridos)
- Ativar o **Lovable AI Gateway** (não obrigatório, mas preparado para futuras features)
- Confirmar env vars (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
- Criar migrations com as tabelas: `profiles`, `user_roles`, `songs`, `setlists`, `setlist_songs`, `subscriptions`, `payments`
- RLS + GRANTs por tabela; trigger `handle_new_user` para criar `profiles` no signup

### Fase 1 — Shell TanStack Start + PWA
- Substituir a home placeholder por um layout equivalente ao `App.jsx` (mas dividido em rotas TanStack)
- Rotas: `/` (lista de músicas + player), `/setlists`, `/tuner`, `/premium`, `/auth`, `/_authenticated/account`
- `head()` com título e descrição próprios ("Cifras — App de violão, cifras, afinador e metrónomo")
- Copiar `manifest.json`, `sw.js`, ícones e splash para `public/`
- Registar o service worker no `__root.tsx`

### Fase 2 — Core cifras (prioridade #1)
Portar componentes React (JSX → TSX, mesma lógica):
- `SongView`, `Modal`, `ConfirmDialog`, `Toast`, `ErrorBoundary`, `AuthModal`, `YouTubePlayer`
- Utils: `parser.js`, `chords.js`, `chordDiagrams.js`, `useLocalStorage`
- CRUD de músicas e setlists lê/escreve em Supabase via `createServerFn` + `requireSupabaseAuth` (com fallback a `localStorage` quando não autenticado, para modo demo)
- Categorias, favoritos, transpose, filtro, editor cru

### Fase 3 — Auth (prioridade #2)
- `/auth` com email/password + Google (via `lovable.auth.signInWithOAuth("google")`)
- Configurar Google provider com `supabase--configure_social_auth`
- Layout `_authenticated/route.tsx` (gerido pela integração)
- Header mostra avatar + logout quando autenticado
- 7 dias de trial ao registar (campo `trial_ends_at` em `profiles`)

### Fase 4 — Áudio (prioridade #3)
Portar 1:1 (Web Audio API funciona nativamente no browser):
- `Tuner` (afinador cromático com `getUserMedia`)
- Metrónomo (`toggleMetro` no App.jsx)
- `StrumBar` (padrões de batida)
- Voice-scroll (auto-scroll ativado por voz)
- Auto-scroll, fullscreen, atalhos de teclado

### Fase 5 — Pagamentos Mercado Pago (prioridade #4)
Como MP não é integração nativa do Lovable, fica como integração custom:
- Secrets: `MP_ACCESS_TOKEN`, `MP_PUBLIC_KEY`, `MP_WEBHOOK_SECRET`
- Server function `createSubscription` (chamada `/preapproval`, R$ 24,90/mês)
- Server function `createPixPayment` (PIX dinâmico com QR)
- Server function `cancelSubscription`
- Server route pública `POST /api/public/mp-webhook` que:
  - valida assinatura HMAC
  - atualiza `subscriptions` e `profiles.premium` via `supabaseAdmin`
- Página `/premium` com CTA subscrever + tab PIX
- Callback `?pagamento=sucesso` refresca sessão

## Detalhes técnicos

**Stack alvo:** TanStack Start (React 19, SSR em Cloudflare Workers) + Tailwind v4 + Lovable Cloud (Supabase gerido).

**Substituições vs. repo original:**
| Original | Novo |
|---|---|
| Express + better-sqlite3 | Server functions + Postgres (Supabase) |
| JWT + bcrypt + cookie httpOnly | Supabase Auth (email+Google) com bearer |
| `fetch('/api/...')` no App.jsx | `useServerFn(...)` do TanStack |
| Backend MP (`mercadopago.js`) | Server functions + `/api/public/mp-webhook` |
| Fly.io / Docker | Deploy Lovable (edge Cloudflare) |
| SPA React+Vite | File-based routing TanStack |
| PWA (SW manual) | Mantido, ficheiros movidos para `public/` |

**Fora do âmbito desta primeira entrega:** backup em nuvem por sync automático (fica para follow-up depois de core estar estável), fetch remoto de CifraClub/Cifralize (requer proxy CORS — sugerido em fase posterior).

## O que vai ser criado (ficheiros principais)

- `supabase/migrations/*_init_cifras.sql` — schema completo
- `src/routes/__root.tsx` (atualizado com head, PWA, auth listener)
- `src/routes/index.tsx`, `setlists.tsx`, `tuner.tsx`, `premium.tsx`, `auth.tsx`
- `src/routes/_authenticated/route.tsx`, `_authenticated/account.tsx`
- `src/routes/api/public/mp-webhook.ts`
- `src/components/{SongView,Modal,Toast,Tuner,StrumBar,YouTubePlayer,AuthModal,ErrorBoundary}.tsx`
- `src/lib/{songs,setlists,payments}.functions.ts`
- `src/lib/mercadopago.server.ts`
- `src/utils/{parser,chords,chordDiagrams}.ts`
- `public/{manifest.json,sw.js,icons/*}`

## Confirmação necessária antes de arrancar
- Ativação de **Lovable Cloud** (obrigatório para DB + Auth)
- Ativação de **Google Sign-In** (recomendado)
- Vais precisar de dar as chaves de **Mercado Pago** (`MP_ACCESS_TOKEN`, `MP_PUBLIC_KEY`) quando chegarmos à Fase 5 — não são necessárias já

Aprova o plano para eu começar pela Fase 0 e 1.