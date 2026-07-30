"use client";

import type { Ticket } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import { formatDateTime } from "@/lib/format";

export default function TicketList({
  tickets,
  onSelect,
}: {
  tickets: Ticket[];
  onSelect: (id: string) => void;
}) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-800 py-16 text-center text-sm text-slate-500">
        Nenhum chamado encontrado.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {tickets.map((ticket) => (
        <button
          key={ticket.id}
          onClick={() => onSelect(ticket.id)}
          className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900 p-4 text-left transition hover:border-slate-700 hover:bg-slate-800/60 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-slate-500">{ticket.protocolo}</span>
              <span className="font-medium text-slate-100">{ticket.titulo}</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
              <span>
                {ticket.operadora} · {ticket.numero}
              </span>
              <span>Solicitante: {ticket.solicitante}</span>
              <span>Aberto em {formatDateTime(ticket.criado_em)}</span>
              <span>Atualizado em {formatDateTime(ticket.atualizado_em)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PriorityBadge prioridade={ticket.prioridade} />
            <StatusBadge status={ticket.status} />
          </div>
        </button>
      ))}
    </div>
  );
}
