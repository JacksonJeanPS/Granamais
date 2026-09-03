"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { parseBrazilianMoney } from "@/lib/formatters";
import { createClient } from "@/lib/supabase/server";

export type BudgetState = { status?: "success" | "error"; message?: string };
const schema = z.object({ categoryId: z.string().uuid(), month: z.string().regex(/^\d{4}-\d{2}-01$/), amount: z.string().transform(parseBrazilianMoney).pipe(z.number().finite().min(0, "O orçamento não pode ser negativo.")) });
export async function saveBudget(_: BudgetState, form: FormData): Promise<BudgetState> {
  const parsed = schema.safeParse(Object.fromEntries(form)); if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Valor inválido." };
  const supabase = await createClient(); const { data } = await supabase.auth.getClaims(); const userId = data?.claims?.sub; if (!userId) return { status: "error", message: "Sua sessão expirou." };
  const { error } = await supabase.from("budgets").upsert({ user_id: userId, category_id: parsed.data.categoryId, mes_referencia: parsed.data.month, valor_planejado: parsed.data.amount }, { onConflict: "user_id,category_id,mes_referencia" });
  if (error) return { status: "error", message: "Não foi possível salvar este orçamento." }; revalidatePath("/orcamento"); revalidatePath("/dashboard"); return { status: "success", message: "Orçamento atualizado." };
}
