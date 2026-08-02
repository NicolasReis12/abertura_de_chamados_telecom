export const OPERADORA_PROBLEMA_OPTIONS = ['Oi', 'Vivo', 'TIM', 'Claro'] as const;
export type OperadoraProblema = (typeof OPERADORA_PROBLEMA_OPTIONS)[number];

export const OPERADORA_NUMERO_OPTIONS = [
  'DATORA',
  'GT',
  'TVN',
  'Americanet',
  'Algar',
  'Telecall',
] as const;
export type OperadoraNumero = (typeof OPERADORA_NUMERO_OPTIONS)[number];

export type Prioridade = 'baixa' | 'media' | 'alta';

export const PRIORIDADE_OPTIONS: { value: Prioridade; label: string }[] = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
];

export type Status =
  | 'aberto'
  | 'andamento'
  | 'aguardando'
  | 'concluido'
  | 'aguardando_telecom'
  | 'aguardando_suporte';

export const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'aberto', label: 'Aberto' },
  { value: 'andamento', label: 'Em andamento' },
  { value: 'aguardando', label: 'Aguardando operadora' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'aguardando_telecom', label: 'Aguardando Telecom' },
  { value: 'aguardando_suporte', label: 'Aguardando Suporte' },
];

export interface Ticket {
  id: string;
  protocolo: string;
  titulo: string;
  descricao: string | null;
  solicitante: string;
  operadora_problema: string | null;
  operadora_numero: string | null;
  chamado_suporte: string | null;
  chamado_telecom: string | null;
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
