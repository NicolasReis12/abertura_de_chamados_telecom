export const OPERADORAS = ['Vivo', 'Claro', 'TIM', 'Oi', 'Algar', 'Outra'] as const;
export type Operadora = (typeof OPERADORAS)[number];

export type Prioridade = 'baixa' | 'media' | 'alta';

export const PRIORIDADE_OPTIONS: { value: Prioridade; label: string }[] = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
];

export type Status = 'aberto' | 'andamento' | 'aguardando' | 'concluido';

export const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'aberto', label: 'Aberto' },
  { value: 'andamento', label: 'Em andamento' },
  { value: 'aguardando', label: 'Aguardando operadora' },
  { value: 'concluido', label: 'Concluído' },
];

export interface Ticket {
  id: string;
  protocolo: string;
  titulo: string;
  descricao: string | null;
  solicitante: string;
  operadora: string;
  numero: string;
  prioridade: Prioridade;
  status: Status;
  criado_em: string;
  atualizado_em: string;
}

export interface TicketUpdateRow {
  id: string;
  ticket_id: string;
  texto: string;
  autor: string;
  criado_em: string;
}
