import { redirect } from "next/navigation";
import { TransactionManager } from "@/components/transactions/transaction-manager";
import { createClient } from "@/lib/supabase/server";

export default async function TransactionsPage() {
  const supabase = await createClient(); const { data: claims } = await supabase.auth.getClaims(); const userId = claims?.claims?.sub; if (!userId) redirect("/entrar?next=/transacoes");
  const [accounts, categories, transactions, recurrences] = await Promise.all([
    supabase.from("accounts").select("id,nome,instituicao,cor").eq("user_id", userId).eq("ativa", true).order("nome"),
    supabase.from("categories").select("id,nome,tipo,cor").eq("user_id", userId).eq("ativa", true).order("ordem"),
    supabase.from("transactions").select("id,account_id,category_id,transfer_account_id,tipo,valor,descricao,data_competencia,data_efetivacao,status,forma_pagamento,observacao,accounts!transactions_account_id_user_id_fkey(nome),categories(nome),destination:accounts!transactions_transfer_account_id_user_id_fkey(nome)").eq("user_id", userId).order("data_competencia", { ascending: false }).limit(100),
    supabase.from("recurrence_rules").select("id,tipo,descricao,valor,frequencia,proxima_execucao,ativa,accounts(nome),categories(nome)").eq("user_id", userId).eq("ativa", true).order("proxima_execucao"),
  ]);
  const rows = (transactions.data ?? []).map((item) => ({ ...item, valor: Number(item.valor), accountName: item.accounts?.nome ?? "Conta", categoryName: item.categories?.nome ?? null, destinationName: item.destination?.nome ?? null }));
  const rules = (recurrences.data ?? []).map((item) => ({ ...item, valor: Number(item.valor), accountName: item.accounts?.nome ?? "Conta", categoryName: item.categories?.nome ?? "Categoria" }));
  return <TransactionManager accounts={accounts.data ?? []} categories={categories.data ?? []} transactions={rows} recurrences={rules} />;
}
