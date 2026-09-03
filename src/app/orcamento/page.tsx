import { redirect } from "next/navigation";
import { BudgetManager } from "@/components/budget/budget-manager";
import { createClient } from "@/lib/supabase/server";

function currentMonth() { return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit" }).format(new Date()) + "-01"; }
export default async function BudgetPage({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const params = await searchParams; const month = /^\d{4}-\d{2}$/.test(params.mes ?? "") ? `${params.mes}-01` : currentMonth(); const nextMonth = new Date(`${month}T00:00:00Z`); nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1); const end = nextMonth.toISOString().slice(0, 10);
  const supabase = await createClient(); const { data: claims } = await supabase.auth.getClaims(); const userId = claims?.claims?.sub; if (!userId) redirect("/entrar?next=/orcamento");
  const [categories, budgets, transactions, installments] = await Promise.all([
    supabase.from("categories").select("id,nome,cor,icone").eq("user_id", userId).eq("tipo", "despesa").eq("ativa", true).order("ordem"),
    supabase.from("budgets").select("category_id,valor_planejado").eq("user_id", userId).eq("mes_referencia", month),
    supabase.from("transactions").select("category_id,valor").eq("user_id", userId).eq("tipo", "despesa").eq("status", "efetivada").gte("data_competencia", month).lt("data_competencia", end),
    supabase.from("installments").select("valor,purchases!inner(category_id)").eq("user_id", userId).neq("status", "cancelada").gte("data_vencimento", month).lt("data_vencimento", end),
  ]);
  const planned = new Map((budgets.data ?? []).map((item) => [item.category_id, Number(item.valor_planejado)])); const actual = new Map<string, number>(); for (const item of transactions.data ?? []) if (item.category_id) actual.set(item.category_id, (actual.get(item.category_id) ?? 0) + Number(item.valor));
  for (const item of installments.data ?? []) { const categoryId = item.purchases?.category_id; if (categoryId) actual.set(categoryId, (actual.get(categoryId) ?? 0) + Number(item.valor)); }
  const rows = (categories.data ?? []).map((item) => ({ ...item, planned: planned.get(item.id) ?? 0, actual: actual.get(item.id) ?? 0 }));
  return <BudgetManager month={month} rows={rows} />;
}
