"use client";

import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase/client";
import { STATUS_OPTIONS, type Status, type Ticket, type TicketUpdateRow } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import { formatDateTime } from "@/lib/format";
import { validateNovaAtualizacao } from "@/lib/validation";
import { setStoredName } from "@/lib/localName";

interface Props {
  ticket: Ticket;
  defaultAutor: string;
  onClose: () => void;
}

const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal-500 focus:outline-none";

export default function TicketDetail({ ticket, defaultAutor, onClose }: Props) {
  const [updates, setUpdates] = useState<TicketUpdateRow[]>([]);
  const [loadingUpdates, setLoadingUpdates] = useState(true);
  const [changingStatus, setChangingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [texto, setTexto] = useState("");
  // `defaultAutor` is only used as the initial value: this component remounts
  // (via `key={ticket.id}` in Dashboard) whenever the selected ticket changes,
  // so there's no need to sync it again in an effect.
  const [autor, setAutor] = useState(defaultAutor);
  const [updateErrors, setUpdateErrors] = useState<Record<string, string>>({});
  const [submittingUpdate, setSubmittingUpdate] = useState(false);
  const [updateFormError, setUpdateFormError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    supabase
      .from("updates")
      .select("*")
      .eq("ticket_id", ticket.id)
      .order("criado_em", { ascending: true })
      .then(({ data }) => {
        if (!active) return;
        setUpdates((data ?? []) as TicketUpdateRow[]);
        setLoadingUpdates(false);
      });

    const channel = supabase
      .channel(`updates-${ticket.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "updates", filter: `ticket_id=eq.${ticket.id}` },
        (payload) => {
          const nova = payload.new as TicketUpdateRow;
          setUpdates((current) => (current.some((u) => u.id === nova.id) ? current : [...current, nova]));
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [ticket.id]);

  async function handleStatusChange(status: Status) {
    if (status === ticket.status) return;
    setChangingStatus(true);
    setStatusError(null);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const body = await res.json();
        setStatusError(body.error ?? "Não foi possível atualizar o status.");
      }
    } catch {
      setStatusError("Erro de conexão. Tente novamente.");
    } finally {
      setChangingStatus(false);
    }
  }

  async function handleAddUpdate(e: FormEvent) {
    e.preventDefault();
    const errors = validateNovaAtualizacao({ texto, autor });
    setUpdateErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmittingUpdate(true);
    setUpdateFormError(null);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto, autor }),
      });
      const body = await res.json();
      if (!res.ok) {
        setUpdateFormError(body.error ?? "Não foi possível salvar a atualização.");
        return;
      }
      setStoredName(autor.trim());
      const novaAtualizacao = body.update as TicketUpdateRow;
      setUpdates((current) =>
        current.some((u) => u.id === novaAtualizacao.id) ? current : [...current, novaAtualizacao]
      );
      setTexto("");
    } catch {
      setUpdateFormError("Erro de conexão. Tente novamente.");
    } finally {
      setSubmittingUpdate(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-950/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-xl flex-col overflow-y-auto border-l border-slate-800 bg-slate-900 p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-slate-500">{ticket.protocolo}</p>
            <h2 className="text-lg font-semibold text-slate-100">{ticket.titulo}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200" aria-label="Fechar">
            ✕
          </button>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <PriorityBadge prioridade={ticket.prioridade} />
          <StatusBadge status={ticket.status} />
        </div>

        <dl className="mb-5 grid grid-cols-2 gap-3 text-sm">
          <Info label="Solicitante" value={ticket.solicitante} />
          <Info label="Operadora" value={ticket.operadora} />
          <Info label="Número" value={ticket.numero} />
          <Info label="Aberto em" value={formatDateTime(ticket.criado_em)} />
          <Info label="Última atualização" value={formatDateTime(ticket.atualizado_em)} />
        </dl>

        {ticket.descricao && (
          <div className="mb-5">
            <p className="mb-1 text-xs font-medium text-slate-400">Descrição</p>
            <p className="whitespace-pre-wrap text-sm text-slate-200">{ticket.descricao}</p>
          </div>
        )}

        <div className="mb-5">
          <label className="mb-1 block text-xs font-medium text-slate-400" htmlFor="status-select">
            Status
          </label>
          <select
            id="status-select"
            value={ticket.status}
            disabled={changingStatus}
            onChange={(e) => handleStatusChange(e.target.value as Status)}
            className={`${inputClass} disabled:opacity-60`}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          {statusError && <p className="mt-1 text-xs text-rose-400">{statusError}</p>}
        </div>

        <div className="mb-5 flex-1">
          <p className="mb-2 text-xs font-medium text-slate-400">Histórico de atualizações</p>
          {loadingUpdates ? (
            <p className="text-sm text-slate-500">Carregando...</p>
          ) : updates.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma atualização registrada ainda.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {updates.map((u) => (
                <li key={u.id} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-medium text-slate-300">{u.autor}</span>
                    <span>{formatDateTime(u.criado_em)}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-slate-200">{u.texto}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={handleAddUpdate} className="flex flex-col gap-2 border-t border-slate-800 pt-4">
          <p className="text-xs font-medium text-slate-400">Adicionar atualização</p>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={3}
            placeholder="Descreva o andamento..."
            className={inputClass}
          />
          {updateErrors.texto && <span className="text-xs text-rose-400">{updateErrors.texto}</span>}
          <input
            value={autor}
            onChange={(e) => setAutor(e.target.value)}
            placeholder="Seu nome"
            className={inputClass}
          />
          {updateErrors.autor && <span className="text-xs text-rose-400">{updateErrors.autor}</span>}
          {updateFormError && <span className="text-xs text-rose-400">{updateFormError}</span>}
          <button
            type="submit"
            disabled={submittingUpdate}
            className="mt-1 self-end rounded-lg bg-amber-400 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-amber-300 disabled:opacity-60"
          >
            {submittingUpdate ? "Salvando..." : "Adicionar atualização"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-slate-200">{value}</dd>
    </div>
  );
}
