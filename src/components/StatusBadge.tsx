import type { Status } from "@/lib/types";

const STYLES: Record<Status, string> = {
  aberto: "bg-sky-400/15 text-sky-300 ring-1 ring-inset ring-sky-400/30",
  andamento: "bg-amber-400/15 text-amber-300 ring-1 ring-inset ring-amber-400/30",
  aguardando: "bg-purple-400/15 text-purple-300 ring-1 ring-inset ring-purple-400/30",
  concluido: "bg-teal-400/15 text-teal-300 ring-1 ring-inset ring-teal-400/30",
};

const LABELS: Record<Status, string> = {
  aberto: "Aberto",
  andamento: "Em andamento",
  aguardando: "Aguardando operadora",
  concluido: "Concluído",
};

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
