import { redirect } from "next/navigation";
import { signOut } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { formatCurrency } from "@/lib/formatters";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) redirect("/entrar");
  const [{ data: profile }, { data: accounts }, { count: cards }] = await Promise.all([
    supabase.from("profiles").select("nome,onboarding_concluido").eq("user_id", userId).single(),
    supabase.from("accounts").select("saldo_atual").eq("user_id", userId).eq("ativa", true),
    supabase.from("cards").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("ativo", true),
  ]);
  if (!profile?.onboarding_concluido) redirect("/onboarding");
  const balance = accounts?.reduce((sum, account) => sum + Number(account.saldo_atual), 0) ?? 0;
  return <main className="min-h-screen px-5 py-8"><div className="mx-auto max-w-6xl"><header className="flex items-center justify-between"><span className="font-display text-2xl font-extrabold">Grana<span className="text-primary">+</span></span><div className="flex items-center gap-2"><ThemeToggle /><form action={signOut}><Button variant="outline">Sair</Button></form></div></header><section className="py-16"><p className="font-bold text-primary">Olá, {profile.nome?.split(" ")[0] ?? "bem-vindo"}</p><h1 className="mt-2 font-display text-4xl font-bold">Sua base financeira está pronta.</h1><p className="mt-3 max-w-xl text-muted-foreground">O painel completo será construído no próximo bloco. Seus primeiros dados já estão seguros e relacionados.</p><div className="mt-10 grid gap-5 sm:grid-cols-3"><Metric label="Saldo consolidado" value={formatCurrency(balance)} /><Metric label="Contas ativas" value={String(accounts?.length ?? 0)} /><Metric label="Cartões ativos" value={String(cards ?? 0)} /></div></section></div></main>;
}
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-border bg-card p-6"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 font-display text-2xl font-bold">{value}</p></div>; }
