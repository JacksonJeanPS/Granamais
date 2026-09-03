"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { parseBrazilianMoney } from "@/lib/formatters";
import { createClient } from "@/lib/supabase/server";

export type AccountState = { status?: "success" | "error"; message?: string };
const accountSchema = z.object({
  id: z.string().uuid().optional(),
  nome: z.string().trim().min(2, "Informe um nome para a conta.").max(80),
  instituicao: z.string().trim().min(2, "Informe o banco ou instituição.").max(100),
  tipo: z.enum(["corrente", "poupanca", "investimento", "dinheiro", "carteira_digital"]),
  saldo: z.string().transform(parseBrazilianMoney).pipe(z.number().finite().min(-9999999999999).max(9999999999999)),
  cor: z.string().regex(/^#[0-9a-f]{6}$/i),
  incluiNoPatrimonio: z.string().optional().transform(Boolean),
});

async function currentUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return { supabase, userId: data?.claims?.sub };
}

export async function saveAccount(_: AccountState, form: FormData): Promise<AccountState> {
  const parsed = accountSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Revise os dados." };
  const { supabase, userId } = await currentUser();
  if (!userId) return { status: "error", message: "Sua sessão expirou. Entre novamente." };
  const values = { nome: parsed.data.nome, instituicao: parsed.data.instituicao, tipo: parsed.data.tipo, cor: parsed.data.cor, inclui_no_patrimonio: parsed.data.incluiNoPatrimonio };
  const result = parsed.data.id
    ? await supabase.from("accounts").update({ ...values, saldo_atual: parsed.data.saldo }).eq("id", parsed.data.id).eq("user_id", userId).select("id").single()
    : await supabase.from("accounts").insert({ ...values, saldo_inicial: parsed.data.saldo, user_id: userId }).select("id").single();
  if (result.error) return { status: "error", message: "Não foi possível salvar a conta. Tente novamente." };
  revalidatePath("/contas"); revalidatePath("/dashboard");
  return { status: "success", message: parsed.data.id ? "Conta atualizada." : "Conta criada." };
}

export async function archiveAccount(_: AccountState, form: FormData): Promise<AccountState> {
  const id = z.string().uuid().safeParse(form.get("id"));
  if (!id.success) return { status: "error", message: "Conta inválida." };
  const { supabase, userId } = await currentUser();
  if (!userId) return { status: "error", message: "Sua sessão expirou." };
  const { error } = await supabase.from("accounts").update({ ativa: false }).eq("id", id.data).eq("user_id", userId).select("id").single();
  if (error) return { status: "error", message: "Não foi possível arquivar esta conta." };
  revalidatePath("/contas"); revalidatePath("/dashboard");
  return { status: "success", message: "Conta arquivada sem apagar o histórico." };
}

export async function restoreAccount(_: AccountState, form: FormData): Promise<AccountState> {
  const id = z.string().uuid().safeParse(form.get("id"));
  if (!id.success) return { status: "error", message: "Conta inválida." };
  const { supabase, userId } = await currentUser();
  if (!userId) return { status: "error", message: "Sua sessão expirou." };
  const { error } = await supabase.from("accounts").update({ ativa: true }).eq("id", id.data).eq("user_id", userId).select("id").single();
  if (error) return { status: "error", message: "Não foi possível restaurar esta conta." };
  revalidatePath("/contas"); revalidatePath("/dashboard");
  return { status: "success", message: "Conta restaurada." };
}
