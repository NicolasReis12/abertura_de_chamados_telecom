import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateNovaAtualizacao } from "@/lib/validation";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const texto = typeof input.texto === "string" ? input.texto : "";
  const autor = typeof input.autor === "string" ? input.autor : "";

  const errors = validateNovaAtualizacao({ texto, autor });
  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { error: "Preencha os campos obrigatórios corretamente.", fieldErrors: errors },
      { status: 400 }
    );
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("updates")
    .insert({
      ticket_id: id,
      texto: texto.trim(),
      autor: autor.trim(),
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ update: data }, { status: 201 });
}
