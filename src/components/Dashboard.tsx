"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { STATUS_OPTIONS, type Status, type Ticket } from "@/lib/types";
import { useStoredName } from "@/lib/localName";
import NameGate from "./NameGate";
import TicketForm from "./TicketForm";
import TicketList from "./TicketList";
import TicketDetail from "./TicketDetail";

export default function Dashboard({ initialTickets }: { initialTickets: Ticket[] }) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [statusFilter, setStatusFilter] = useState<Status | "todos">("todos");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const storedName = useStoredName();
  const [confirmedName, setConfirmedName] = useState<string | null>(null);
  const userName = confirmedName ?? storedName;

  useEffect(() => {
    const channel = supabase
      .channel("tickets-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tickets" },
        (payload) => {
          setTickets((current) => {
            if (payload.eventType === "INSERT") {
              const novo = payload.new as Ticket;
              if (current.some((t) => t.id === novo.id)) return current;
              return [novo, ...current];
            }
            if (payload.eventType === "UPDATE") {
              const atualizado = payload.new as Ticket;
              return current.map((t) => (t.id === atualizado.id ? atualizado : t));
            }
            if (payload.eventType === "DELETE") {
              const removido = payload.old as Ticket;
              return current.filter((t) => t.id !== removido.id);
            }
            return current;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tickets
      .filter((t) => (statusFilter === "todos" ? true : t.status === statusFilter))
      .filter((t) => {
        if (!q) return true;
        return (
          (t.operadora_numero ?? "").toLowerCase().includes(q) ||
          t.numero.toLowerCase().includes(q) ||
          t.protocolo.toLowerCase().includes(q) ||
          (t.chamado_suporte ?? "").toLowerCase().includes(q) ||
          (t.chamado_telecom ?? "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());
  }, [tickets, statusFilter, search]);

  const selectedTicket = tickets.find((t) => t.id === selectedId) ?? null;

  function handleTicketCreated(ticket: Ticket) {
    setTickets((current) => (current.some((t) => t.id === ticket.id) ? current : [ticket, ...current]));
    setShowForm(false);
    setSelectedId(ticket.id);
  }

  function handleTicketUpdated(ticket: Ticket) {
    setTickets((current) => current.map((t) => (t.id === ticket.id ? ticket : t)));
  }

  function handleTicketDeleted(id: string) {
    setTickets((current) => current.filter((t) => t.id !== id));
    setSelectedId((current) => (current === id ? null : current));
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <NameGate onNameSaved={setConfirmedName} />

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 sm:text-2xl">
            Central de Chamados Telecom
          </h1>
          <p className="text-sm text-slate-400">
            Abertura e acompanhamento de chamados de efetivação com as operadoras.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center justify-center rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-teal-400"
        >
          + Novo chamado
        </button>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por protocolo, número da telecom ou do suporte..."
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal-500 focus:outline-none sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          <FilterButton label="Todos" active={statusFilter === "todos"} onClick={() => setStatusFilter("todos")} />
          {STATUS_OPTIONS.map((s) => (
            <FilterButton
              key={s.value}
              label={s.label}
              active={statusFilter === s.value}
              onClick={() => setStatusFilter(s.value)}
            />
          ))}
        </div>
      </div>

      <TicketList tickets={filtered} onSelect={setSelectedId} />

      {showForm && (
        <TicketForm
          defaultSolicitante={userName ?? ""}
          onClose={() => setShowForm(false)}
          onSaved={handleTicketCreated}
        />
      )}

      {selectedTicket && (
        <TicketDetail
          key={selectedTicket.id}
          ticket={selectedTicket}
          defaultAutor={userName ?? ""}
          onClose={() => setSelectedId(null)}
          onUpdated={handleTicketUpdated}
          onDeleted={handleTicketDeleted}
        />
      )}
    </div>
  );
}

function FilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
        active ? "bg-teal-500 text-slate-950" : "bg-slate-900 text-slate-300 hover:bg-slate-800"
      }`}
    >
      {label}
    </button>
  );
}
