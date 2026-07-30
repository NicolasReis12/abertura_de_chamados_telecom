"use client";

import { useState, type FormEvent } from "react";
import { setStoredName, useStoredName } from "@/lib/localName";

export default function NameGate({ onNameSaved }: { onNameSaved: (name: string) => void }) {
  const storedName = useStoredName();
  const [dismissed, setDismissed] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const open = !dismissed && !storedName;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Digite seu nome para continuar.");
      return;
    }
    setStoredName(name.trim());
    onNameSaved(name.trim());
    setDismissed(true);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-100">Bem-vindo(a)</h2>
        <p className="mt-1 text-sm text-slate-400">
          Digite seu nome uma única vez. Ele será usado para preencher automaticamente os campos
          de solicitante e autor de atualização.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal-500 focus:outline-none"
          />
          {error && <span className="text-xs text-rose-400">{error}</span>}
          <button
            type="submit"
            className="mt-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-teal-400"
          >
            Continuar
          </button>
        </form>
      </div>
    </div>
  );
}
