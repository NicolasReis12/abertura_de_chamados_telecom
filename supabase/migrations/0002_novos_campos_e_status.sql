-- Central de Chamados Telecom — novos campos, status e exclusão
-- Rode este arquivo inteiro no SQL Editor do seu projeto Supabase, depois do 0001_init.sql.

-- ---------------------------------------------------------------------------
-- Campos novos / renomeados
-- ---------------------------------------------------------------------------

-- O campo "Operadora" vira "Operadora com Problema": mesma coluna, agora opcional.
alter table tickets rename column operadora to operadora_problema;
alter table tickets alter column operadora_problema drop not null;

-- "Operadora do Número": novo campo. Nullable no banco para não quebrar chamados já
-- cadastrados; a obrigatoriedade para chamados novos é validada na aplicação.
alter table tickets add column if not exists operadora_numero text;

-- "Chamado com Suporte": texto livre, opcional.
alter table tickets add column if not exists chamado_suporte text;

-- ---------------------------------------------------------------------------
-- Novos status: Aguardando Telecom, Aguardando Suporte
-- ---------------------------------------------------------------------------

alter table tickets drop constraint if exists tickets_status_check;
alter table tickets add constraint tickets_status_check
  check (status in ('aberto','andamento','aguardando','concluido','aguardando_telecom','aguardando_suporte'));

-- ---------------------------------------------------------------------------
-- Protocolo: passa a ser só numérico (sem prefixo "TEL-"). Protocolos já gerados
-- antes desta migration continuam com o formato antigo.
-- ---------------------------------------------------------------------------

create or replace function set_ticket_protocolo()
returns trigger as $$
begin
  if new.protocolo is null or new.protocolo = '' then
    new.protocolo := lpad(nextval('tickets_protocolo_seq')::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------------
-- Exclusão de chamados
-- ---------------------------------------------------------------------------

drop policy if exists "public delete tickets" on tickets;
create policy "public delete tickets" on tickets for delete using (true);
