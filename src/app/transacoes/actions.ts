"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { parseBrazilianMoney } from "@/lib/formatters";
import { createClient } from "@/lib/supabase/server";

export type TransactionState = { status?: "success" | "error"; message?: string };
const optionalUuid = z.union([z.literal("none"), z.string().uuid()]).transform((value) => value === "none" ? null : value);
const schema = z.object({
  id: z.string().uuid().optional(), tipo: z.enum(["receita", "despesa", "transferencia"]),
  accountId: z.string().uuid(), categoryId: optionalUuid, transferAccountId: optionalUuid,
  descricao: z.string().trim().min(2, "Informe uma descrição.").max(160),
  valor: z.string().transform(parseBrazilianMoney).pipe(z.number().finite().positive("Informe um valor maior que zero.")),
  data: z.coerce.date(), status: z.enum(["prevista", "efetivada"]),
  formaPagamento: z.enum(["pix", "boleto", "debito", "credito", "dinheiro", "transferencia", "outro"]),
  observacao: z.string().trim().max(500).optional(),
}).superRefine((value, ctx) => {
  if (value.tipo === "transferencia" && (!value.transferAccountId || value.transferAccountId === value.accountId)) ctx.addIssue({ code: "custom", path: ["transferAccountId"], message: "Escolha uma conta de destino diferente." });
  if (value.tipo !== "transferencia" && !value.categoryId) ctx.addIssue({ code: "custom", path: ["categoryId"], message: "Escolha uma categoria." });
});
const recurrenceSchema = z.object({
  tipo: z.enum(["receita", "despesa"]), accountId: z.string().uuid(), categoryId: z.string().uuid(),
  descricao: z.string().trim().min(2, "Informe uma descrição.").max(160),
  valor: z.string().transform(parseBrazilianMoney).pipe(z.number().finite().positive("Informe um valor maior que zero.")),
  data: z.coerce.date(), formaPagamento: z.enum(["pix", "boleto", "debito", "credito", "dinheiro", "transferencia", "outro"]),
  frequencia: z.enum(["semanal", "quinzenal", "mensal", "bimestral", "trimestral", "semestral", "anual"]),
  intervalo: z.coerce.number().int().min(1).max(24), dataFim: z.string().optional(),
});

async function auth() { const supabase = await createClient(); const { data } = await supabase.auth.getClaims(); return { supabase, userId: data?.claims?.sub }; }
function refresh() { revalidatePath("/transacoes"); revalidatePath("/orcamento"); revalidatePath("/dashboard"); revalidatePath("/contas"); }

export async function saveTransaction(_: TransactionState, form: FormData): Promise<TransactionState> {
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Revise os dados." };
  const { supabase, userId } = await auth(); if (!userId) return { status: "error", message: "Sua sessão expirou." };
  const v = parsed.data; const date = v.data.toISOString().slice(0, 10);
  const values = { user_id: userId, tipo: v.tipo, account_id: v.accountId, category_id: v.tipo === "transferencia" ? null : v.categoryId, transfer_account_id: v.tipo === "transferencia" ? v.transferAccountId : null, descricao: v.descricao, valor: v.valor, data_competencia: date, data_efetivacao: v.status === "efetivada" ? date : null, status: v.status, forma_pagamento: v.formaPagamento, observacao: v.observacao || null };
  const result = v.id ? await supabase.from("transactions").update(values).eq("id", v.id).eq("user_id", userId).select("id").single() : await supabase.from("transactions").insert(values).select("id").single();
  if (result.error) return { status: "error", message: "Não foi possível salvar a transação." }; refresh();
  return { status: "success", message: v.id ? "Transação atualizada." : "Transação registrada." };
}
export async function createRecurrence(_: TransactionState, form: FormData): Promise<TransactionState> {
  const parsed = recurrenceSchema.safeParse(Object.fromEntries(form)); if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Revise os dados." };
  const { supabase, userId } = await auth(); if (!userId) return { status: "error", message: "Sua sessão expirou." }; const v = parsed.data;
  const { error } = await supabase.rpc("create_recurring_transaction", { p_account_id: v.accountId, p_category_id: v.categoryId!, p_type: v.tipo, p_description: v.descricao, p_amount: v.valor, p_frequency: v.frequencia, p_interval: v.intervalo, p_start_date: v.data.toISOString().slice(0, 10), p_end_date: v.dataFim || undefined, p_payment_method: v.formaPagamento });
  if (error) return { status: "error", message: "Não foi possível criar a recorrência." }; refresh(); return { status: "success", message: "Recorrência criada com as próximas previsões." };
}
export async function updateTransactionStatus(_: TransactionState, form: FormData): Promise<TransactionState> {
  const parsed = z.object({ id: z.string().uuid(), status: z.enum(["efetivada", "cancelada"]) }).safeParse(Object.fromEntries(form)); if (!parsed.success) return { status: "error", message: "Transação inválida." };
  const { supabase, userId } = await auth(); if (!userId) return { status: "error", message: "Sua sessão expirou." };
  const { error } = await supabase.from("transactions").update({ status: parsed.data.status, data_efetivacao: parsed.data.status === "efetivada" ? new Date().toISOString().slice(0, 10) : null }).eq("id", parsed.data.id).eq("user_id", userId).select("id").single();
  if (error) return { status: "error", message: "Não foi possível atualizar a transação." }; refresh(); return { status: "success", message: parsed.data.status === "efetivada" ? "Transação efetivada e saldo atualizado." : "Transação cancelada." };
}
export async function deactivateRecurrence(_: TransactionState, form: FormData): Promise<TransactionState> {
  const id = z.string().uuid().safeParse(form.get("id")); if (!id.success) return { status: "error", message: "Recorrência inválida." }; const { supabase, userId } = await auth(); if (!userId) return { status: "error", message: "Sua sessão expirou." };
  const { error } = await supabase.rpc("deactivate_recurrence", { p_recurrence_id: id.data }); if (error) return { status: "error", message: "Não foi possível encerrar a recorrência." }; refresh(); return { status: "success", message: "Recorrência encerrada; previsões futuras foram canceladas." };
}
