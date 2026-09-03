import { redirect } from "next/navigation";
import { GoalManager } from "@/components/goals/goal-manager";
import { createClient } from "@/lib/supabase/server";

export default async function GoalsPage() { const supabase = await createClient(); const { data: claims } = await supabase.auth.getClaims(); const userId = claims?.claims?.sub; if (!userId) redirect("/entrar?next=/metas"); const [goals, accounts, contributions] = await Promise.all([
  supabase.from("goals").select("id,nome,descricao,valor_alvo,valor_inicial,valor_atual,data_inicio,data_alvo,cor,status").eq("user_id", userId).neq("status", "cancelada").order("data_alvo"),
  supabase.from("accounts").select("id,nome,instituicao,cor").eq("user_id", userId).eq("ativa", true).order("nome"),
  supabase.from("goal_contributions").select("id,goal_id,account_id,valor,tipo,data,observacao,accounts(nome)").eq("user_id", userId).order("data", { ascending: false }).limit(100),
]); const rows = (goals.data ?? []).map((goal) => ({ ...goal, valor_alvo: Number(goal.valor_alvo), valor_inicial: Number(goal.valor_inicial), valor_atual: Number(goal.valor_atual), contributions: (contributions.data ?? []).filter((item) => item.goal_id === goal.id).map((item) => ({ ...item, valor: Number(item.valor), accountName: item.accounts?.nome ?? null })) })); return <GoalManager goals={rows} accounts={accounts.data ?? []} />; }
