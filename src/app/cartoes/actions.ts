"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { parseBrazilianMoney } from "@/lib/formatters";
import { createClient } from "@/lib/supabase/server";

export type FinanceActionState = { status?: "success" | "error"; message?: string };
const money = z.string().transform(parseBrazilianMoney).pipe(z.number().finite().positive().max(9999999999999));
const optionalId = z.union([z.literal(""), z.literal("none"), z.string().uuid()]).transform((value) => value === "none" || value === "" ? null : value);
const cardSchema = z.object({
  id: z.string().uuid().optional(), nome: z.string().trim().min(2).max(80), instituicao: z.string().trim().min(2).max(100),
  bandeira: z.string().trim().min(2).max(40), ultimosQuatro: z.union([z.literal(""), z.string().regex(/^\d{4}$/)]).transform((value) => value || null),
  limite: money, diaFechamento: z.coerce.number().int().min(1).max(31), diaVencimento: z.coerce.number().int().min(1).max(31),
  accountId: optionalId, cor: z.string().regex(/^#[0-9a-f]{6}$/i),
});
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)), "Data inválida.");
const purchaseSchema = z.object({
  cardId: z.string().uuid(), categoryId: z.string().uuid(), descricao: z.string().trim().min(2).max(160),
  valorTotal: money, numeroParcelas: z.coerce.number().int().min(1).max(360), dataCompra: isoDate,
  dataPrimeiraParcela: z.union([z.literal(""), isoDate]).transform((value) => value || null), observacao: z.string().trim().max(500).optional(),
}).refine((data) => !data.dataPrimeiraParcela || data.dataPrimeiraParcela >= data.dataCompra, { message: "A primeira parcela não pode ser anterior à compra." });

async function authenticatedClient() { const supabase = await createClient(); const { data } = await supabase.auth.getClaims(); return { supabase, userId: data?.claims?.sub }; }
function refresh() { revalidatePath("/cartoes"); revalidatePath("/dashboard"); }

export async function saveCard(_: FinanceActionState, form: FormData): Promise<FinanceActionState> {
  const parsed = cardSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Revise os dados do cartão." };
  const { supabase, userId } = await authenticatedClient();
  if (!userId) return { status: "error", message: "Sua sessão expirou." };
  const values = { account_id: parsed.data.accountId, nome: parsed.data.nome, instituicao: parsed.data.instituicao, bandeira: parsed.data.bandeira, ultimos_quatro_digitos: parsed.data.ultimosQuatro, limite_total: parsed.data.limite, dia_fechamento: parsed.data.diaFechamento, dia_vencimento: parsed.data.diaVencimento, cor: parsed.data.cor };
  const result = parsed.data.id ? await supabase.from("cards").update(values).eq("id", parsed.data.id).eq("user_id", userId).select("id").single() : await supabase.from("cards").insert({ ...values, user_id: userId }).select("id").single();
  if (result.error) return { status: "error", message: "Não foi possível salvar o cartão." };
  refresh(); return { status: "success", message: parsed.data.id ? "Cartão atualizado." : "Cartão criado." };
}

async function setCardActive(form: FormData, active: boolean): Promise<FinanceActionState> {
  const id = z.string().uuid().safeParse(form.get("id")); if (!id.success) return { status: "error", message: "Cartão inválido." };
  const { supabase, userId } = await authenticatedClient(); if (!userId) return { status: "error", message: "Sua sessão expirou." };
  const { error } = await supabase.from("cards").update({ ativo: active }).eq("id", id.data).eq("user_id", userId).select("id").single();
  if (error) return { status: "error", message: `Não foi possível ${active ? "restaurar" : "arquivar"} o cartão.` };
  refresh(); return { status: "success", message: active ? "Cartão restaurado." : "Cartão arquivado sem apagar o histórico." };
}
export async function archiveCard(_: FinanceActionState, form: FormData) { return setCardActive(form, false); }
export async function restoreCard(_: FinanceActionState, form: FormData) { return setCardActive(form, true); }

export async function createPurchase(_: FinanceActionState, form: FormData): Promise<FinanceActionState> {
  const parsed = purchaseSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Revise os dados da compra." };
  const { supabase, userId } = await authenticatedClient(); if (!userId) return { status: "error", message: "Sua sessão expirou." };
  const { error } = await supabase.from("purchases").insert({ user_id: userId, card_id: parsed.data.cardId, category_id: parsed.data.categoryId, descricao: parsed.data.descricao, valor_total: parsed.data.valorTotal, numero_parcelas: parsed.data.numeroParcelas, data_compra: parsed.data.dataCompra, data_primeira_parcela: parsed.data.dataPrimeiraParcela, observacao: parsed.data.observacao || null });
  if (error) return { status: "error", message: "Não foi possível registrar a compra. Confira o cartão e tente novamente." };
  refresh(); return { status: "success", message: parsed.data.numeroParcelas > 1 ? `${parsed.data.numeroParcelas} parcelas geradas nas faturas corretas.` : "Compra adicionada à fatura." };
}

export async function cancelPurchase(_: FinanceActionState, form: FormData): Promise<FinanceActionState> {
  const id = z.string().uuid().safeParse(form.get("id")); if (!id.success) return { status: "error", message: "Compra inválida." };
  const { supabase, userId } = await authenticatedClient(); if (!userId) return { status: "error", message: "Sua sessão expirou." };
  const { error } = await supabase.rpc("cancel_purchase", { p_purchase_id: id.data });
  if (error) return { status: "error", message: "Não foi possível cancelar esta compra." };
  refresh(); return { status: "success", message: "Compra e parcelas canceladas; faturas recalculadas." };
}
