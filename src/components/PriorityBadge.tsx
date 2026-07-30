import type { Prioridade } from "@/lib/types";

const STYLES: Record<Prioridade, string> = {
  baixa: "bg-emerald-400/15 text-emerald-300 ring-1 ring-inset ring-emerald-400/30",
  media: "bg-amber-400/15 text-amber-300 ring-1 ring-inset ring-amber-400/30",
  alta: "bg-rose-400/15 text-rose-300 ring-1 ring-inset ring-rose-400/30",
};

const LABELS: Record<Prioridade, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

export default function PriorityBadge({ prioridade }: { prioridade: Prioridade }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[prioridade]}`}
    >
      {LABELS[prioridade]}
    </span>
  );
}
