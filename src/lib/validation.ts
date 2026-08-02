import {
  OPERADORA_NUMERO_OPTIONS,
  OPERADORA_PROBLEMA_OPTIONS,
  PRIORIDADE_OPTIONS,
} from './types';

const PRIORIDADES_VALIDAS = PRIORIDADE_OPTIONS.map((p) => p.value) as string[];
const OPERADORA_NUMERO_VALIDAS = OPERADORA_NUMERO_OPTIONS as readonly string[];
const OPERADORA_PROBLEMA_VALIDAS = OPERADORA_PROBLEMA_OPTIONS as readonly string[];

export interface NovoChamadoInput {
  solicitante?: string;
  operadoraNumero?: string;
  operadoraProblema?: string;
  chamadoSuporte?: string;
  chamadoTelecom?: string;
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

  if (!input.operadoraNumero?.trim()) {
    errors.operadoraNumero = 'Selecione a operadora do número.';
  } else if (!OPERADORA_NUMERO_VALIDAS.includes(input.operadoraNumero.trim())) {
    errors.operadoraNumero = 'Operadora do número inválida.';
  }

  if (input.operadoraProblema?.trim() && !OPERADORA_PROBLEMA_VALIDAS.includes(input.operadoraProblema.trim())) {
    errors.operadoraProblema = 'Operadora com problema inválida.';
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

  if (!input.autor?.trim()) {
    errors.autor = 'Informe quem está atualizando.';
  }

  return errors;
}
