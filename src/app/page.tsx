import Dashboard from "@/components/Dashboard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Ticket } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <SetupMessage
        title="Configuração pendente"
        message={
          <>
            Defina as variáveis <code className="text-teal-300">NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
            <code className="text-teal-300">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> no arquivo{" "}
            <code className="text-teal-300">.env.local</code> e reinicie o servidor. Veja o README
            para instruções.
          </>
        }
      />
    );
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) {
    return (
      <SetupMessage
        title="Não foi possível carregar os chamados"
        message={
          <>
            {error.message}
            <br />
            Confirme se as tabelas foram criadas no Supabase (veja o README).
          </>
        }
      />
    );
  }

  return <Dashboard initialTickets={(data ?? []) as Ticket[]} />;
}

function SetupMessage({ title, message }: { title: string; message: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-lg font-semibold text-slate-100">{title}</h1>
      <p className="mt-2 text-sm text-slate-400">{message}</p>
    </div>
  );
}
