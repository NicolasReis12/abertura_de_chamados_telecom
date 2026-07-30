"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { OPERADORAS, PRIORIDADE_OPTIONS, type Ticket } from "@/lib/types";
import { validateNovoChamado } from "@/lib/validation";
import { setStoredName } from "@/lib/localName";

interface Props {
  defaultSolicitante: string;
  onClose: () => void;
  onCreated: (ticket: Ticket) => void;
}

const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal-500 focus:outline-none";

export default function TicketForm({ defaultSolicitante, onClose, onCreated }: Props) {
  const [solicitante, setSolicitante] = useState(defaultSolicitante);
  const [operadora, setOperadora] = useState("");
  const [numero, setNumero] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prioridade, setPrioridade] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const input = { solicitante, operadora, numero, titulo, descricao, prioridade };
    const validationErrors = validateNovoChamado(input);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const body = await res.json();
      if (!res.ok) {
        setFormError(body.error ?? "Não foi possível abrir o chamado.");
        return;
      }
      setStoredName(solicitante.trim());
      onCreated(body.ticket as Ticket);
    } catch {
      setFormError("Erro de conexão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/70 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl sm:max-w-lg sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">Novo chamado</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200" aria-label="Fechar">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Nome do solicitante" error={errors.solicitante}>
            <input
              value={solicitante}
              onChange={(e) => setSolicitante(e.target.value)}
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Operadora" error={errors.operadora}>
              <select
                value={operadora}
                onChange={(e) => setOperadora(e.target.value)}
                className={inputClass}
              >
                <option value="">Selecione...</option>
                {OPERADORAS.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Prioridade" error={errors.prioridade}>
              <select
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value)}
                className={inputClass}
              >
                <option value="">Selecione...</option>
                {PRIORIDADE_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Número da linha / chamado" error={errors.numero}>
            <input
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="Ex: (11) 91234-5678 ou protocolo 20260001"
              className={inputClass}
            />
          </Field>

          <Field label="Título do chamado" error={errors.titulo}>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className={inputClass} />
          </Field>

          <Field label="Descrição / detalhes (opcional)">
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={4}
              className={inputClass}
            />
          </Field>

          {formError && <p className="text-sm text-rose-400">{formError}</p>}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-teal-400 disabled:opacity-60"
            >
              {submitting ? "Salvando..." : "Abrir chamado"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-400">{label}</span>
      {children}
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </label>
  );
}
