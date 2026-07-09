# 🚀 Guia de Deploy - Cloudflare Pages

## ✅ O que foi configurado automaticamente

1. **Workflow GitHub Actions** (`.github/workflows/deploy-cloudflare.yml`)
   - Deploy automático a cada push na branch `main`
   - Usa Bun para instalar dependências
   - Faz build e deploy para Cloudflare Pages

2. **Configuração Wrangler** (`wrangler.jsonc`)
   - Configuração para Cloudflare Pages

---

## 🔐 Secrets Necessários (você precisa adicionar)

### 1. Obter o Cloudflare API Token

1. Acesse: https://dash.cloudflare.com/profile/api-tokens
2. Clique em **"Create Token"**
3. Use o template **"Edit Cloudflare Workers"** ou crie um custom:
   - Account: `Workers AI` - Edit
   - Account: `Cloudflare Pages` - Edit
4. Copie o token gerado

### 2. Obter o Cloudflare Account ID

1. Acesse: https://dash.cloudflare.com/
2. Selecione seu domínio ou账户
3. O Account ID está no canto inferior direito da página

### 3. Adicionar Secrets no GitHub

1. Acesse: https://github.com/pabinfoshop-sketch/pcifras-music/settings/secrets/actions
2. Clique em **"New repository secret"** e adicione:

| Secret Name | Value |
|------------|-------|
| `CLOUDFLARE_API_TOKEN` | Seu token da Cloudflare |
| `CLOUDFLARE_ACCOUNT_ID` | Seu Account ID |
| `SUPABASE_URL` | `https://uqgulksbvwsxwimhjjrw.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | Chave pública do Supabase |

---

## 🌐 Configurar Custom Domain (opcional)

Se quiser usar um domínio customizado:

1. No Cloudflare Dashboard → Pages → seu projeto
2. Vá em **Custom domains**
3. Adicione seu domínio (ex: pcifras.com)
4. Configure o DNS conforme instruído

---

## ✅ Testar o Deploy

Após adicionar os secrets:

1. Vá para a aba **Actions** no GitHub: https://github.com/pabinfoshop-sketch/pcifras-music/actions
2. O workflow deve iniciar automaticamente
3. Aguarde o deploy completar
4. Acesse: `https://pcifras-music.pages.dev`

---

## 🔄 Sincronização com Lovable

O código está sincronizado entre:
- ✅ GitHub: `pabinfoshop-sketch/pcifras-music`
- ✅ Lovable: `https://pcifras.lovable.app/`

Quando você fizer mudanças no Lovable, elas vão para o GitHub. O GitHub Actions vai fazer o deploy automaticamente no Cloudflare.

---

## ❓ Precisa de Ajuda?

- [Documentação Cloudflare Pages + GitHub Actions](https://developers.cloudflare.com/pages/configuration/continuous-deployment/)
- [Criar API Token Cloudflare](https://developers.cloudflare.com/fundamentals/api/get-started/create-tokens/)
