-- Central de Chamados Telecom — campo "Chamado com Telecom"
-- Rode este arquivo inteiro no SQL Editor do seu projeto Supabase, depois do 0002.

alter table tickets add column if not exists chamado_telecom text;
