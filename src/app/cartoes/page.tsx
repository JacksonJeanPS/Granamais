import { redirect } from "next/navigation";
import { CardManager } from "@/components/cards/card-manager";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) redirect("/entrar");
  const [cardsResult, accountsResult, categoriesResult, invoicesResult, purchasesResult] = await Promise.all([
    supabase.from("cards").select("id,account_id,ativo,bandeira,cor,dia_fechamento,dia_vencimento,instituicao,limite_total,nome,ultimos_quatro_digitos").eq("user_id", userId).order("ativo", { ascending: false }).order("criado_em"),
    supabase.from("accounts").select("id,nome,instituicao").eq("user_id", userId).eq("ativa", true).order("nome"),
    supabase.from("categories").select("id,nome,cor").eq("user_id", userId).eq("tipo", "despesa").eq("ativa", true).order("ordem"),
    supabase.from("card_invoices").select("id,card_id,data_fechamento,data_vencimento,status,valor_total,cards(nome,cor)").eq("user_id", userId).neq("status", "paga").order("data_vencimento").limit(12),
    supabase.from("purchases").select("id,descricao,valor_total,numero_parcelas,data_compra,cancelada_em,cards(nome,cor),categories(nome),installments(numero_parcela,valor,data_vencimento,status)").eq("user_id", userId).order("data_compra", { ascending: false }).limit(30),
  ]);
  const failed = [cardsResult, accountsResult, categoriesResult, invoicesResult, purchasesResult].find((result) => result.error);
  if (failed?.error) throw new Error("Não foi possível carregar cartões e faturas.");
  const invoices = (invoicesResult.data ?? []).map((invoice) => ({ ...invoice, valor_total: Number(invoice.valor_total), cardName: invoice.cards?.nome ?? "Cartão", cardColor: invoice.cards?.cor ?? "#145C43" }));
  const usedByCard = new Map<string, number>();
  invoices.forEach((invoice) => usedByCard.set(invoice.card_id, (usedByCard.get(invoice.card_id) ?? 0) + invoice.valor_total));
  const cards = (cardsResult.data ?? []).map((card) => ({ ...card, limite_total: Number(card.limite_total), used: usedByCard.get(card.id) ?? 0 }));
  const purchases = (purchasesResult.data ?? []).map((purchase) => ({ ...purchase, valor_total: Number(purchase.valor_total), cardName: purchase.cards?.nome ?? "Cartão", cardColor: purchase.cards?.cor ?? "#145C43", categoryName: purchase.categories?.nome ?? "Sem categoria", installments: (purchase.installments ?? []).map((item) => ({ ...item, valor: Number(item.valor) })) }));
  return <div className="mx-auto max-w-[1400px]"><CardManager cards={cards} accounts={accountsResult.data ?? []} categories={categoriesResult.data ?? []} invoices={invoices} purchases={purchases} /></div>;
}
