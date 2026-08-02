import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { STATUS_OPTIONS } from "@/lib/types";
import { validateNovoChamado } from "@/lib/validation";

const VALID_STATUSES = STATUS_OPTIONS.map((s) => s.value) as string[];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const input = body as Record<string, unknown>;

  // Fluxo do dropdown de status: body só tem `status`.
  if ("status" in input && !("titulo" in input)) {
    const status = input.status;
    if (typeof status !== "string" || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Status inválido." }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("tickets")
      .update({ status })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ticket: data });
  }

  // Fluxo de edição completa do chamado.
  const solicitante = typeof input.solicitante === "string" ? input.solicitante : "";
  const operadoraNumero = typeof input.operadoraNumero === "string" ? input.operadoraNumero : "";
  const operadoraProblema = typeof input.operadoraProblema === "string" ? input.operadoraProblema : "";
  const chamadoSuporte = typeof input.chamadoSuporte === "string" ? input.chamadoSuporte : "";
  const chamadoTelecom = typeof input.chamadoTelecom === "string" ? input.chamadoTelecom : "";
  const numero = typeof input.numero === "string" ? input.numero : "";
  const titulo = typeof input.titulo === "string" ? input.titulo : "";
  const descricao = typeof input.descricao === "string" ? input.descricao : "";
  const prioridade = typeof input.prioridade === "string" ? input.prioridade : "";

  const errors = validateNovoChamado({
    solicitante,
    operadoraNumero,
    operadoraProblema,
    numero,
    titulo,
    prioridade,
  });
  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { error: "Preencha os campos obrigatórios corretamente.", fieldErrors: errors },
      { status: 400 }
    );
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tickets")
    .update({
      solicitante: solicitante.trim(),
      operadora_numero: operadoraNumero.trim(),
      operadora_problema: operadoraProblema.trim() ? operadoraProblema.trim() : null,
      chamado_suporte: chamadoSuporte.trim() ? chamadoSuporte.trim() : null,
      chamado_telecom: chamadoTelecom.trim() ? chamadoTelecom.trim() : null,
      numero: numero.trim(),
      titulo: titulo.trim(),
      descricao: descricao.trim() ? descricao.trim() : null,
      prioridade: prioridade.trim(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ticket: data });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("tickets").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
