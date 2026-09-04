"use client"

import { Calculator, CalendarCheck, CircleAlert, Sparkles, TrendingDown } from "lucide-react"
import { useMemo, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { calculateDebtPlan, type PayoffMethod, type PlanningDebt } from "@/lib/debt-plan"
import { formatCurrency } from "@/lib/formatters"

type PlannerProps = {
  debts: PlanningDebt[]
  availableMargin: number
}

export function DebtPayoffPlanner({ debts, availableMargin }: PlannerProps) {
  const suggestedExtra = Math.max(0, Math.floor(availableMargin / 50) * 50)
  const [extra, setExtra] = useState(suggestedExtra)
  const [method, setMethod] = useState<PayoffMethod>("avalanche")
  const plan = useMemo(() => calculateDebtPlan(debts, extra, method), [debts, extra, method])
  const alternative = useMemo(
    () => calculateDebtPlan(debts, extra, method === "avalanche" ? "snowball" : "avalanche"),
    [debts, extra, method],
  )
  const unknownInterest = debts.filter((debt) => debt.monthlyInterest === null).length

  if (!debts.length) return null

  return (
    <section className="space-y-5" aria-labelledby="payoff-title">
      <div>
        <p className="text-sm font-bold text-primary">Plano de saída</p>
        <h2 id="payoff-title" className="mt-1 font-display text-2xl font-bold tracking-[-.03em] sm:text-3xl">
          Quando você pode ficar sem dívidas?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Simulação estimada. Altere o reforço mensal e compare as estratégias.
        </p>
      </div>

      <Card className="overflow-hidden rounded-3xl">
        <CardContent className="grid gap-6 p-5 lg:grid-cols-[280px_1fr] lg:p-7">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="extra-payment">Valor extra por mês</Label>
              <Input
                id="extra-payment"
                inputMode="decimal"
                value={extra}
                onChange={(event) => setExtra(parseMoney(event.target.value))}
                aria-describedby="extra-help"
              />
              <p id="extra-help" className="text-xs text-muted-foreground">
                Além das parcelas mínimas já cadastradas.
              </p>
            </div>
            <div className="rounded-2xl bg-subtle p-4">
              <p className="text-xs text-muted-foreground">Orçamento mensal do plano</p>
              <p className="mt-1 font-display text-2xl font-bold">{formatCurrency(plan.monthlyBudget)}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Parcelas mínimas + {formatCurrency(extra)} extras
              </p>
            </div>
          </div>

          <Tabs value={method} onValueChange={(value) => setMethod(value as PayoffMethod)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="avalanche">Menos juros</TabsTrigger>
              <TabsTrigger value="snowball">Vitórias rápidas</TabsTrigger>
            </TabsList>
            <TabsContent value={method} className="mt-5 space-y-5">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Summary icon={CalendarCheck} label="Previsão final" value={plan.debtFreeDate ? monthYear(plan.debtFreeDate) : "Sem previsão"} />
                <Summary icon={TrendingDown} label="Tempo estimado" value={plan.months ? duration(plan.months) : "—"} />
                <Summary icon={Calculator} label="Juros estimados" value={formatCurrency(plan.totalInterest)} />
                <Summary icon={Calculator} label="Total estimado" value={formatCurrency(plan.totalPaid)} />
              </div>

              {!plan.feasible ? (
                <Alert className="border-negative/40 text-negative">
                  <CircleAlert />
                  <AlertTitle>O plano não fecha com esse valor</AlertTitle>
                  <AlertDescription>
                    Informe parcelas ou aumente o valor extra. Dívidas cujo pagamento não cobre os juros podem crescer.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  {plan.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-border p-3 sm:p-4">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                        {item.position}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.payoffDate ? `termina em ${monthYear(item.payoffDate)}` : "sem previsão"}
                        </p>
                      </div>
                      <p className="text-end text-xs text-muted-foreground">
                        juros<br /><strong className="text-foreground">{formatCurrency(item.totalInterest)}</strong>
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {plan.feasible && alternative.feasible ? (
                <div className="flex gap-3 rounded-2xl bg-primary/8 p-4 text-sm">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                  <p>
                    {comparison(plan, alternative)}
                  </p>
                </div>
              ) : null}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {availableMargin < 0 ? (
        <Alert className="border-negative/40 text-negative">
          <CircleAlert />
          <AlertTitle>Seu mês está no vermelho</AlertTitle>
          <AlertDescription>
            Antes de acelerar pagamentos, faltam {formatCurrency(Math.abs(availableMargin))} para cobrir despesas e parcelas atuais.
          </AlertDescription>
        </Alert>
      ) : null}

      {unknownInterest ? (
        <p className="text-xs text-muted-foreground">
          {unknownInterest} {unknownInterest === 1 ? "dívida está" : "dívidas estão"} sem taxa informada e foi considerada com juros zero. Atualize a taxa para uma previsão mais fiel.
        </p>
      ) : null}
    </section>
  )
}

function Summary({ icon: Icon, label, value }: { icon: typeof Calculator; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-subtle p-4">
      <Icon className="size-4 text-primary" />
      <p className="mt-3 text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-lg font-bold">{value}</p>
    </div>
  )
}

function monthYear(date: string) {
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`))
}

function duration(months: number) {
  if (months < 12) return `${months} ${months === 1 ? "mês" : "meses"}`
  const years = Math.floor(months / 12)
  const rest = months % 12
  return `${years} ${years === 1 ? "ano" : "anos"}${rest ? ` e ${rest} ${rest === 1 ? "mês" : "meses"}` : ""}`
}

function comparison(current: ReturnType<typeof calculateDebtPlan>, alternative: ReturnType<typeof calculateDebtPlan>) {
  const difference = alternative.totalInterest - current.totalInterest
  if (Math.abs(difference) < 0.01) return "As duas estratégias têm praticamente o mesmo custo com os dados atuais."
  if (difference > 0) return `Esta estratégia economiza cerca de ${formatCurrency(difference)} em juros em relação à outra.`
  return `A outra estratégia economiza cerca de ${formatCurrency(Math.abs(difference))} em juros com os dados atuais.`
}

function parseMoney(value: string) {
  const normalized = value.includes(",") ? value.replace(/\./g, "").replace(",", ".") : value
  return Math.max(0, Number(normalized) || 0)
}
