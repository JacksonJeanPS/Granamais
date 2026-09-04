"use client"

import { ArrowRight, BanknoteArrowDown, ChartNoAxesCombined, Crosshair, Landmark, ScanSearch, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { FinancialAnalysis, FinancialInsight } from "@/lib/financial-intelligence"

const sections = [
  { value: "audit", label: "Auditoria", icon: ScanSearch },
  { value: "wealth", label: "Patrimônio", icon: Landmark },
  { value: "cashFlow", label: "Fluxo", icon: ChartNoAxesCombined },
  { value: "leaks", label: "Vazamentos", icon: BanknoteArrowDown },
  { value: "debtPlan", label: "Quitação", icon: Crosshair },
] as const

export function FinancialCommandCenter({ analysis }: { analysis: FinancialAnalysis }) {
  return (
    <section className="space-y-5" aria-labelledby="intelligence-title">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold text-primary">Grana+ Inteligente</p>
          <h2 id="intelligence-title" className="mt-1 font-display text-2xl font-bold tracking-[-.03em] sm:text-3xl">Seu dinheiro virou um plano de ação.</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Análise automática e explicável, feita somente com os dados que você cadastrou.</p>
        </div>
        <Badge className={analysis.score >= 60 ? "bg-positive/10 text-positive" : "bg-negative/10 text-negative"}>{analysis.status}</Badge>
      </div>

      <Card className="overflow-hidden rounded-3xl border-primary/15">
        <CardContent className="grid gap-5 p-5 md:grid-cols-[180px_1fr] md:p-7">
          <div>
            <div className="flex items-end gap-2"><span className="font-display text-5xl font-bold">{analysis.score}</span><span className="pb-1 text-sm text-muted-foreground">/100</span></div>
            <Progress value={analysis.score} className="mt-3" />
            <p className="mt-3 text-xs text-muted-foreground">Índice Grana+ deste mês</p>
          </div>
          <div className="rounded-2xl bg-subtle p-4 sm:p-5">
            <div className="flex gap-3"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" /><div><p className="text-sm font-bold">Leitura geral</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{analysis.summary}</p></div></div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader><CardTitle className="text-lg">Sua ação mais importante agora</CardTitle></CardHeader>
        <CardContent><InsightRow insight={analysis.nextAction} featured /></CardContent>
      </Card>

      <Tabs defaultValue="audit">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 p-1 sm:grid-cols-5">
          {sections.map(({ value, label, icon: Icon }) => <TabsTrigger key={value} value={value} className="gap-2 px-2"><Icon className="size-4" />{label}</TabsTrigger>)}
        </TabsList>
        {sections.map(({ value }) => (
          <TabsContent key={value} value={value} className="mt-4">
            <div className="grid gap-3 lg:grid-cols-2">{analysis[value].map((item, index) => <InsightRow key={`${item.title}-${index}`} insight={item} />)}</div>
          </TabsContent>
        ))}
      </Tabs>
      <p className="text-xs text-muted-foreground">As projeções são estimativas educacionais, não promessa de resultado. Atualize os lançamentos para manter a análise fiel.</p>
    </section>
  )
}

function InsightRow({ insight, featured = false }: { insight: FinancialInsight; featured?: boolean }) {
  const tone = insight.tone === "positive" ? "bg-positive/10 text-positive" : insight.tone === "warning" ? "bg-negative/10 text-negative" : "bg-primary/10 text-primary"
  return (
    <div className={`flex flex-col gap-4 rounded-2xl ${featured ? "bg-subtle p-5 sm:flex-row sm:items-center" : "border border-border p-4"}`}>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-bold">{insight.title}</p>{insight.value ? <Badge className={tone}>{insight.value}</Badge> : null}</div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{insight.description}</p>
      </div>
      {insight.href && insight.action ? <Button asChild variant={featured ? "default" : "ghost"} size="sm"><Link href={insight.href}>{insight.action}<ArrowRight /></Link></Button> : null}
    </div>
  )
}
