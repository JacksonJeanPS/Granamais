import { ArrowDownRight, ArrowUpRight, CalendarClock, CreditCard, Landmark, Target } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
import { FinancialCommandCenter } from "@/components/dashboard/financial-command-center";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/formatters";
import { buildFinancialAnalysis } from "@/lib/financial-intelligence";
import { createClient } from "@/lib/supabase/server";

const monthLabels = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export default async function Page() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) redirect("/entrar");

  const now = brazilDateParts();
  const monthStart = `${now.year}-${String(now.month).padStart(2, "0")}-01`;
  const nextMonth = now.month === 12 ? `${now.year + 1}-01-01` : `${now.year}-${String(now.month + 1).padStart(2, "0")}-01`;
  const historyStart = new Date(Date.UTC(now.year, now.month - 6, 1)).toISOString().slice(0, 10);
  const ninetyDays = new Date(Date.UTC(now.year, now.month - 1, now.day + 90)).toISOString().slice(0, 10);
  const [profileResult, accountsResult, transactionsResult, invoicesResult, goalsResult, debtsResult] = await Promise.all([
    supabase.from("profiles").select("nome,onboarding_concluido").eq("user_id", userId).single(),
    supabase.from("accounts").select("id,nome,instituicao,saldo_atual,cor,inclui_no_patrimonio").eq("user_id", userId).eq("ativa", true).order("criado_em"),
    supabase.from("transactions").select("tipo,valor,data_competencia,status,descricao,recurrence_rule_id,categories(nome)").eq("user_id", userId).neq("status", "cancelada").gte("data_competencia", historyStart).lt("data_competencia", nextMonth),
    supabase.from("card_invoices").select("id,valor_total,data_vencimento,status,cards(nome,cor)").eq("user_id", userId).neq("status", "paga").gte("data_vencimento", monthStart).lte("data_vencimento", ninetyDays).order("data_vencimento").limit(4),
    supabase.from("goals").select("id,nome,valor_atual,valor_alvo,cor,data_alvo").eq("user_id", userId).eq("status", "ativa").order("data_alvo").limit(3),
    supabase.from("debts").select("id,nome,credor,saldo_devedor,taxa_juros_mensal,valor_parcela,em_atraso,negativada,oferta_quitacao").eq("user_id", userId).in("status", ["aberta", "negociada"]),
  ]);
  const profile = profileResult.data;
  if (!profile?.onboarding_concluido) redirect("/onboarding");

  const accounts = accountsResult.data ?? [];
  const transactions = transactionsResult.data ?? [];
  const monthly = transactions.filter((item) => item.data_competencia >= monthStart);
  const revenues = sumByType(monthly, "receita");
  const expenses = sumByType(monthly, "despesa");
  const balance = accounts.filter((account) => account.inclui_no_patrimonio).reduce((sum, account) => sum + Number(account.saldo_atual), 0);
  const financialAnalysis = buildFinancialAnalysis({
    transactions: transactions.filter((item) => item.status === "efetivada").map((item) => ({ type: item.tipo, value: Number(item.valor), date: item.data_competencia, description: item.descricao, recurring: item.recurrence_rule_id !== null, category: item.categories?.nome ?? "Sem categoria" })),
    debts: (debtsResult.data ?? []).map((debt) => ({ id: debt.id, name: debt.nome, creditor: debt.credor, balance: Number(debt.saldo_devedor), monthlyInterest: debt.taxa_juros_mensal === null ? null : Number(debt.taxa_juros_mensal), minimumPayment: debt.valor_parcela === null ? null : Number(debt.valor_parcela), overdue: debt.em_atraso, negativeListed: debt.negativada, settlementOffer: debt.oferta_quitacao === null ? null : Number(debt.oferta_quitacao) })),
    accountBalance: balance,
    goalBalance: (goalsResult.data ?? []).reduce((sum, goal) => sum + Number(goal.valor_atual), 0),
    currentMonth: monthStart.slice(0, 7),
  });

  return <div className="mx-auto max-w-[1400px] space-y-7">
    <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-bold text-primary">{greeting()}, {profile.nome?.split(" ")[0] ?? "bem-vindo"}</p><h1 className="mt-1 font-display text-3xl font-bold tracking-[-.04em] sm:text-4xl">Sua grana, com direção.</h1><p className="mt-2 text-sm text-muted-foreground">Resumo de {monthLabels[now.month - 1]} de {now.year}</p></div><Button asChild><Link href="/contas">Gerenciar contas</Link></Button></section>
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Metric icon={Landmark} label="Patrimônio em contas" value={formatCurrency(balance)} helper={`${accounts.length} ${accounts.length === 1 ? "conta ativa" : "contas ativas"}`} /><Metric icon={ArrowUpRight} label="Receitas no mês" value={formatCurrency(revenues)} positive helper="Previstas e efetivadas" /><Metric icon={ArrowDownRight} label="Despesas no mês" value={formatCurrency(expenses)} negative helper="Previstas e efetivadas" /><Metric icon={CalendarClock} label="Resultado do mês" value={formatCurrency(revenues - expenses)} positive={revenues >= expenses} negative={expenses > revenues} helper={revenues >= expenses ? "Você está no positivo" : "Atenção ao fluxo do mês"} /></section>
    <FinancialCommandCenter analysis={financialAnalysis} />
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,.8fr)]"><Card><CardHeader className="flex-row items-start justify-between"><div><CardTitle>Fluxo de caixa</CardTitle><p className="mt-1 text-sm text-muted-foreground">Receitas e despesas dos últimos 6 meses</p></div><div className="hidden gap-3 text-xs sm:flex"><Legend color="bg-positive" label="Receitas" /><Legend color="bg-negative" label="Despesas" /></div></CardHeader><CardContent><CashFlowChart data={buildChart(transactions, now.year, now.month)} /></CardContent></Card><Card><CardHeader><CardTitle className="text-xl">Próximas faturas</CardTitle></CardHeader><CardContent className="space-y-3">{invoicesResult.data?.length ? invoicesResult.data.map((invoice) => <div key={invoice.id} className="flex items-center gap-3 rounded-2xl bg-subtle p-4"><span className="rounded-xl bg-card p-2.5"><CreditCard className="size-4 text-primary" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{invoice.cards?.nome ?? "Cartão"}</p><p className="text-xs text-muted-foreground">Vence {formatShortDate(invoice.data_vencimento)}</p></div><p className="text-sm font-bold">{formatCurrency(Number(invoice.valor_total))}</p></div>) : <Empty icon={CreditCard} text="Nenhuma fatura prevista nos próximos 90 dias." />}</CardContent></Card></section>
    <section className="grid gap-6 lg:grid-cols-2"><Card><CardHeader className="flex-row items-center justify-between"><CardTitle className="text-xl">Suas contas</CardTitle><Button asChild variant="ghost" size="sm"><Link href="/contas">Ver todas</Link></Button></CardHeader><CardContent className="space-y-3">{accounts.length ? accounts.slice(0, 4).map((account) => <div key={account.id} className="flex items-center gap-3 border-b border-border py-3 last:border-0"><span className="size-3 rounded-full" style={{ backgroundColor: account.cor }} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{account.nome}</p><p className="truncate text-xs text-muted-foreground">{account.instituicao}</p></div><p className="font-display font-bold">{formatCurrency(Number(account.saldo_atual))}</p></div>) : <Empty icon={Landmark} text="Cadastre sua primeira conta para ver o saldo consolidado." />}</CardContent></Card><Card><CardHeader><CardTitle className="text-xl">Metas em andamento</CardTitle></CardHeader><CardContent className="space-y-5">{goalsResult.data?.length ? goalsResult.data.map((goal) => { const progress = Math.min(100, Number(goal.valor_atual) / Number(goal.valor_alvo) * 100); return <div key={goal.id}><div className="mb-2 flex items-center justify-between gap-4"><div><p className="text-sm font-bold">{goal.nome}</p><p className="text-xs text-muted-foreground">Até {formatShortDate(goal.data_alvo)}</p></div><Badge>{progress.toFixed(0)}%</Badge></div><Progress value={progress} /><p className="mt-2 text-xs text-muted-foreground">{formatCurrency(Number(goal.valor_atual))} de {formatCurrency(Number(goal.valor_alvo))}</p></div>; }) : <Empty icon={Target} text="Quando você criar uma meta, o progresso aparece aqui." />}</CardContent></Card></section>
  </div>;
}

function Metric({ icon: Icon, label, value, helper, positive, negative }: { icon: typeof Landmark; label: string; value: string; helper: string; positive?: boolean; negative?: boolean }) { return <Card className="rounded-2xl"><CardContent className="p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><span className="rounded-xl bg-subtle p-2.5 text-primary"><Icon className="size-4.5" /></span>{positive || negative ? <Badge className={positive ? "bg-positive/10 text-positive" : "bg-negative/10 text-negative"}>{positive ? "positivo" : "atenção"}</Badge> : null}</div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 font-display text-2xl font-bold tracking-[-.04em]">{value}</p><p className="mt-2 text-xs text-muted-foreground">{helper}</p></CardContent></Card>; }
function Legend({ color, label }: { color: string; label: string }) { return <span className="flex items-center gap-1.5"><span className={`size-2 rounded-full ${color}`} />{label}</span>; }
function Empty({ icon: Icon, text }: { icon: typeof Landmark; text: string }) { return <div className="flex min-h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-border p-5 text-center"><Icon className="mb-3 size-5 text-muted-foreground" /><p className="max-w-60 text-sm text-muted-foreground">{text}</p></div>; }
function sumByType(items: { tipo: string; valor: number }[], type: string) { return items.reduce((sum, item) => item.tipo === type ? sum + Number(item.valor) : sum, 0); }
function buildChart(items: { tipo: string; valor: number; data_competencia: string }[], year: number, month: number) { return Array.from({ length: 6 }, (_, index) => { const date = new Date(Date.UTC(year, month - 6 + index, 1)); const key = date.toISOString().slice(0, 7); const selected = items.filter((item) => item.data_competencia.startsWith(key)); return { mes: monthLabels[date.getUTCMonth()], receitas: sumByType(selected, "receita"), despesas: sumByType(selected, "despesa") }; }); }
function brazilDateParts() { const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", year: "numeric", month: "numeric", day: "numeric" }).formatToParts(new Date()); const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value); return { year: value("year"), month: value("month"), day: value("day") }; }
function greeting() { const hour = Number(new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", hour12: false }).format(new Date())); return hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite"; }
function formatShortDate(value: string) { return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)); }
