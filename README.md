# Painel Gestão à Vista Spotter

Dashboard desenvolvido em Next.js 14 (App Router) para exibição em tempo real dos indicadores comerciais provenientes da API Exact Spotter.

## Tecnologias

- Next.js 14 (App Router)
- React 18
- Tailwind CSS + componentes customizados inspirados no shadcn/ui
- Recharts para visualização de dados
- Deploy recomendado na Vercel (Node 18+)

## Configuração

1. Crie um arquivo `.env.local` na raiz do projeto com a variável de ambiente exigida pela API:

   ```env
   TOKEN_EXACT=insira_seu_token_aqui
   ```

   > **Importante:** nunca versione o token real.

2. Instale as dependências e rode o projeto:

   ```bash
   npm install
   npm run dev
   ```

3. A aplicação estará disponível em `http://localhost:3000`.

## Rotas principais

- `/dashboard` – visão geral com KPIs, gráficos de performance e produtos
- `/status-produto` – status das negociações por produto
- `/performance` – evolução mensal de vendas
- `/top-produtos` – ranking de faturamento
- `/ticket-medio` – ticket médio por produto
- `/motivos-descarte` – motivos de perda agrupados por produto

A rotação automática de telas é habilitada por padrão respeitando o ciclo:

1. Dashboard (60s)
2. Status por Produto (30s)
3. Performance (30s)
4. Top Produtos (30s)
5. Ticket Médio (30s)
6. Motivos de Descarte (30s)

O intervalo pode ser ajustado via query string usando `?durations=60,30,30,30,30,30`. Utilize o botão flutuante para pausar ou retomar a rotação.

## Fetch de dados

As funções em `lib/spotter/api.js` implementam a paginação OData (`@odata.nextLink`) e aplicam automaticamente o filtro de últimos 12 meses para leads, vendas e perdas.

As métricas e agregações são calculadas em `lib/spotter/kpis.js` e `lib/spotter/load.js`.

## Deploy

1. Faça o deploy na Vercel apontando para este repositório.
2. Defina a variável de ambiente `TOKEN_EXACT` no projeto Vercel.
3. Garanta que o projeto utiliza Node 18+ (default da Vercel para Next.js 14).

Após o deploy, compartilhe a URL de produção e o branch utilizado.
