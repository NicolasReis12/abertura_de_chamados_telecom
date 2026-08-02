"use client";

import type { Status, Ticket } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import { formatDateTime } from "@/lib/format";

const CARD_HIGHLIGHT: Partial<Record<Status, string>> = {
  aguardando_telecom: "border-orange-500/50 bg-orange-500/10 hover:bg-orange-500/15",
  aguardando_suporte: "border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/15",
};

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
          className={`flex flex-col gap-2 rounded-xl border p-4 text-left transition sm:flex-row sm:items-center sm:justify-between ${
            CARD_HIGHLIGHT[ticket.status] ?? "border-slate-800 bg-slate-900 hover:border-slate-700 hover:bg-slate-800/60"
          }`}
        >
          <div className="flex flex-col gap-1">
            <span className="text-lg font-bold tracking-tight text-white">{ticket.solicitante}</span>
            <span className="font-medium text-slate-300">
              #{ticket.protocolo} - {ticket.titulo}
            </span>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
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
