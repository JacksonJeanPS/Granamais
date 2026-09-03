import { redirect } from "next/navigation";
import { AccountManager } from "@/components/accounts/account-manager";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) redirect("/entrar");
  const { data: accounts, error } = await supabase.from("accounts").select("id,nome,instituicao,tipo,saldo_atual,cor,inclui_no_patrimonio,ativa").eq("user_id", userId).order("ativa", { ascending: false }).order("criado_em");
  if (error) throw new Error("Não foi possível carregar suas contas.");
  return <div className="mx-auto max-w-[1400px]"><AccountManager accounts={accounts ?? []} /></div>;
}
