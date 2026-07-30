import { OPERADORAS, PRIORIDADE_OPTIONS } from './types';

const PRIORIDADES_VALIDAS = PRIORIDADE_OPTIONS.map((p) => p.value) as string[];
const OPERADORAS_VALIDAS = OPERADORAS as readonly string[];

export interface NovoChamadoInput {
  solicitante?: string;
  operadora?: string;
  numero?: string;
  titulo?: string;
  descricao?: string;
  prioridade?: string;
}

export function validateNovoChamado(input: NovoChamadoInput): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!input.solicitante?.trim()) {
    errors.solicitante = 'Informe o nome do solicitante.';
  }

  if (!input.operadora?.trim()) {
    errors.operadora = 'Selecione a operadora.';
  } else if (!OPERADORAS_VALIDAS.includes(input.operadora.trim())) {
    errors.operadora = 'Operadora inválida.';
  }

  if (!input.numero?.trim()) {
    errors.numero = 'Informe o número da linha ou do chamado.';
  }

  if (!input.titulo?.trim()) {
    errors.titulo = 'Informe o título do chamado.';
  }

  if (!input.prioridade?.trim()) {
    errors.prioridade = 'Selecione a prioridade.';
  } else if (!PRIORIDADES_VALIDAS.includes(input.prioridade.trim())) {
    errors.prioridade = 'Prioridade inválida.';
  }

  return errors;
}

export interface NovaAtualizacaoInput {
  texto?: string;
  autor?: string;
}

export function validateNovaAtualizacao(input: NovaAtualizacaoInput): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!input.texto?.trim()) {
    errors.texto = 'Escreva o texto da atualização.';
  }

  if (!input.autor?.trim()) {
    errors.autor = 'Informe quem está atualizando.';
  }

  return errors;
}
