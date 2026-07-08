## Problema

Na home, o topo do título "O app do músico moderno." fica escondido/cortado atrás do header (topbar com fundo translúcido e `backdrop-filter`). O `#content` começa colado no topbar e, com o padding atual (`padding-top: 8px` inline + `padding: 20px 16px 100px` do CSS), a primeira linha da hero acaba visualmente encostando/entrando na área do header em telas pequenas.

## Correção

Editar apenas CSS/estilos de apresentação — nenhuma mudança de lógica.

1. **`src/styles.css` — bloco `.welcome-premium`** (linha ~4842): aumentar o `padding-top` para dar respiro entre topbar e o título da hero.
   - `padding: 28px 20px 40px;` → `padding: 40px 20px 44px;` (e `48px` em telas ≥ 640px via media query já existente, se necessário).

2. **`src/styles.css` — `.topbar` refinado** (linha ~4561): reforçar a separação visual para o conteúdo não "vazar" atrás quando houver scroll.
   - Aumentar levemente a opacidade do gradiente de fundo (`0.92 → 0.98` e `0.85 → 0.94`) para o header ficar mais sólido.
   - Manter o `border-bottom` já existente.

3. **`src/routes/index.tsx` / render da home em `App.jsx`** (não editar lógica): no `#content` inline style, trocar `paddingTop: 8` por `paddingTop: 16` para garantir folga mínima abaixo do header.

Nada mais é alterado — sem mexer em rotas, dados, auth ou componentes de negócio.

## Verificação

- Recarregar preview em viewport mobile (Kiwi/Chrome mobile ~412px) e confirmar que "O app do músico moderno." aparece inteiro, sem clipping, logo abaixo do header.
- Conferir que o header continua legível (logo + PRO + botões ⭐ / +) e que não há regressão em outras telas (Repertórios, Ferramentas, Perfil) — o padding extra é escopado a `.welcome-premium`.