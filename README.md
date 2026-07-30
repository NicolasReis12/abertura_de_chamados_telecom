# Central de Chamados Telecom

Web app interno para a equipe de suporte abrir e acompanhar chamados de efetivação de telecom
(operadora, linha, protocolo etc). Sem login: qualquer pessoa com o link acessa. Os dados ficam
persistidos no Supabase (Postgres) e as atualizações aparecem em tempo real para todo mundo com a
página aberta, via Supabase Realtime.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres + Realtime) via `@supabase/supabase-js`
- Sem autenticação — RLS pública (ver aviso de segurança abaixo)

## 1. Criar o projeto no Supabase

1. Crie uma conta gratuita em [supabase.com](https://supabase.com) e clique em **New Project**.
2. Escolha um nome, uma senha de banco (guarde-a, mas ela não é usada por este app) e a região mais
   próxima da sua equipe.
3. Aguarde o projeto ficar pronto (leva ~1-2 minutos).
4. No menu lateral, abra **SQL Editor** → **New query**.
5. Copie todo o conteúdo do arquivo [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
   deste projeto, cole no editor e clique em **Run**.
   - Isso cria as tabelas `tickets` e `updates`, os triggers que geram o protocolo automaticamente
     (`TEL-0001`, `TEL-0002`, ...) e atualizam `atualizado_em`, habilita o Realtime nas duas tabelas
     e ativa as policies de RLS.
6. Confira em **Table Editor** se as tabelas `tickets` e `updates` foram criadas.
7. Confira em **Database → Replication** se as tabelas `tickets` e `updates` aparecem habilitadas
   para a publicação `supabase_realtime` (o script já faz isso, mas vale conferir).

### ⚠️ Sobre segurança (RLS)

Como o app não tem login, as policies de RLS criadas pelo script liberam `select`, `insert` e
`update` públicos nas duas tabelas — qualquer pessoa com a **anon key** consegue ler e gravar
dados. Isso é aceitável para uma ferramenta interna de equipe usada atrás de um link não
divulgado publicamente. **Se o app crescer** (ficar exposto publicamente, guardar dados sensíveis,
precisar de auditoria por usuário etc.), troque essas policies por regras que exijam autenticação
(por exemplo, usando Supabase Auth e `using (auth.role() = 'authenticated')`) antes de escalar o
uso.

## 2. Configurar as variáveis de ambiente localmente

1. No painel do Supabase, vá em **Project Settings → API**.
2. Copie a **Project URL** e a **anon public key**.
3. Duplique o arquivo `.env.example` como `.env.local` na raiz do projeto:

   ```bash
   cp .env.example .env.local
   ```

4. Edite `.env.local` e preencha:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
   ```

`.env.local` não é versionado (está no `.gitignore`).

## 3. Rodar localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Se as variáveis de ambiente não estiverem
configuradas, a página mostra um aviso explicando o que falta em vez de quebrar.

Na primeira visita, cada pessoa digita o próprio nome uma vez (fica salvo no navegador dela) — esse
nome preenche automaticamente os campos "solicitante" e "autor da atualização" nas próximas ações.
Isso é só uma conveniência, não um mecanismo de autenticação.

## 4. Deploy na Vercel

1. Suba o projeto para um repositório Git (GitHub, GitLab etc.) e importe-o na Vercel, **ou** rode
   `vercel deploy` diretamente pela CLI a partir da raiz do projeto.
2. Antes do primeiro deploy (ou no painel do projeto em **Settings → Environment Variables**),
   adicione as mesmas duas variáveis usadas no `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Aplique-as aos ambientes de **Production**, **Preview** e **Development** conforme necessário.
4. Rode o deploy. Como é um app Next.js padrão (App Router, sem configuração especial de runtime),
   não é necessário nenhum ajuste em `next.config` ou `vercel.json`.

## Funcionalidades

- **Abrir chamado**: formulário com solicitante, operadora (Vivo/Claro/TIM/Oi/Algar/Outra), número
  da linha ou protocolo, título, descrição opcional e prioridade (Baixa/Média/Alta). Validação de
  campos obrigatórios tanto no front quanto na rota de API (`POST /api/tickets`).
- **Listar chamados**: cards com protocolo, título, operadora, número, solicitante, prioridade,
  status e datas de criação/atualização. Filtro por status e busca por operadora/número.
- **Detalhe do chamado**: painel lateral com todas as informações, seletor de status
  (Aberto → Em andamento → Aguardando operadora → Concluído) e histórico cronológico de
  atualizações (texto + autor + data/hora). Adicionar atualização exige texto e nome de quem está
  atualizando (`POST /api/tickets/[id]/updates`).
- **Tempo real**: a lista de chamados e o painel de detalhe assinam mudanças via Supabase Realtime
  nas tabelas `tickets` e `updates`. Qualquer pessoa com a página aberta vê as mudanças de outras
  pessoas na hora, sem F5 e sem polling. Em caso de duas gravações quase simultâneas, a última
  gravação prevalece (comportamento aceito nesta primeira versão).

## Estrutura do projeto

```text
src/
  app/
    page.tsx                        # fetch inicial dos chamados + renderiza o Dashboard
    layout.tsx
    globals.css
    api/
      tickets/route.ts              # POST — cria chamado (com validação)
      tickets/[id]/route.ts         # PATCH — atualiza status
      tickets/[id]/updates/route.ts # POST — adiciona atualização
  components/
    Dashboard.tsx                   # estado, filtros, subscription Realtime de tickets
    NameGate.tsx                    # modal de nome (uma vez por navegador)
    TicketForm.tsx                  # formulário de novo chamado
    TicketList.tsx                  # lista/cards
    TicketDetail.tsx                # painel de detalhe + histórico + subscription de updates
    StatusBadge.tsx / PriorityBadge.tsx
  lib/
    supabase/client.ts              # cliente Supabase para o browser (Realtime)
    supabase/server.ts              # cliente Supabase para as rotas de API / server components
    types.ts                        # tipos e opções (operadoras, status, prioridades)
    validation.ts                   # validação compartilhada (usada no front e nas rotas de API)
    format.ts / localName.ts
supabase/
  migrations/0001_init.sql          # schema completo para rodar no SQL Editor do Supabase
```
