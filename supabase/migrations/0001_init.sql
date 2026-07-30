-- Central de Chamados Telecom — schema inicial
-- Rode este arquivo inteiro no SQL Editor do seu projeto Supabase (Database > SQL Editor > New query).

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------

create table if not exists tickets (
  id uuid primary key default gen_random_uuid(),
  protocolo text unique not null, -- gerado automaticamente no insert (ex: TEL-0001), ver trigger abaixo
  titulo text not null,
  descricao text,
  solicitante text not null,
  operadora text not null,
  numero text not null,
  prioridade text not null check (prioridade in ('baixa','media','alta')),
  status text not null default 'aberto' check (status in ('aberto','andamento','aguardando','concluido')),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists updates (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references tickets(id) on delete cascade,
  texto text not null,
  autor text not null,
  criado_em timestamptz not null default now()
);

create index if not exists idx_tickets_status on tickets(status);
create index if not exists idx_tickets_operadora on tickets(operadora);
create index if not exists idx_tickets_numero on tickets(numero);
create index if not exists idx_updates_ticket_id on updates(ticket_id);

-- ---------------------------------------------------------------------------
-- Geração automática do protocolo (TEL-0001, TEL-0002, ...)
-- Usa uma sequence no banco para garantir números únicos mesmo com
-- múltiplas pessoas criando chamados ao mesmo tempo.
-- ---------------------------------------------------------------------------

create sequence if not exists tickets_protocolo_seq;

create or replace function set_ticket_protocolo()
returns trigger as $$
begin
  if new.protocolo is null or new.protocolo = '' then
    new.protocolo := 'TEL-' || lpad(nextval('tickets_protocolo_seq')::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_ticket_protocolo on tickets;
create trigger trg_set_ticket_protocolo
before insert on tickets
for each row execute function set_ticket_protocolo();

-- ---------------------------------------------------------------------------
-- Atualiza "atualizado_em" automaticamente:
--  1) sempre que a própria linha do chamado for alterada (ex: status)
--  2) sempre que uma nova atualização for adicionada ao chamado
-- ---------------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_tickets_set_updated_at on tickets;
create trigger trg_tickets_set_updated_at
before update on tickets
for each row execute function set_updated_at();

create or replace function touch_ticket_on_update()
returns trigger as $$
begin
  update tickets set atualizado_em = now() where id = new.ticket_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_updates_touch_ticket on updates;
create trigger trg_updates_touch_ticket
after insert on updates
for each row execute function touch_ticket_on_update();

-- ---------------------------------------------------------------------------
-- Realtime: habilita as duas tabelas para replicação, para que a lista e o
-- painel de detalhe se atualizem sozinhos para todo mundo com a página aberta.
-- ---------------------------------------------------------------------------

alter publication supabase_realtime add table tickets, updates;

-- ---------------------------------------------------------------------------
-- Row Level Security (RLS)
--
-- ATENÇÃO: como este app ainda não tem login, as policies abaixo liberam
-- select/insert/update públicos (qualquer pessoa com a anon key consegue
-- ler e gravar). Isso é aceitável para uma ferramenta interna de equipe,
-- mas se o app crescer (ficar exposto publicamente, guardar dados
-- sensíveis, etc.) troque isso por policies que exijam autenticação
-- (ex: `using (auth.role() = 'authenticated')`) antes de ir para produção
-- em maior escala.
-- ---------------------------------------------------------------------------

alter table tickets enable row level security;
alter table updates enable row level security;

drop policy if exists "public read tickets" on tickets;
drop policy if exists "public insert tickets" on tickets;
drop policy if exists "public update tickets" on tickets;

create policy "public read tickets" on tickets for select using (true);
create policy "public insert tickets" on tickets for insert with check (true);
create policy "public update tickets" on tickets for update using (true);

drop policy if exists "public read updates" on updates;
drop policy if exists "public insert updates" on updates;

create policy "public read updates" on updates for select using (true);
create policy "public insert updates" on updates for insert with check (true);
