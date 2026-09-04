import { calculateDebtPlan } from "@/lib/debt-plan"

export type IntelligenceTransaction = {
  type: string
  value: number
  date: string
  description: string
  recurring: boolean
  category: string
}

export type IntelligenceDebt = {
  id: string
  name: string
  creditor: string
  balance: number
  monthlyInterest: number | null
  minimumPayment: number | null
  overdue: boolean
  negativeListed: boolean
  settlementOffer: number | null
}

export type FinancialInsight = {
  title: string
  description: string
  value?: string
  tone: "positive" | "warning" | "neutral"
  href?: string
  action?: string
}

export type FinancialAnalysis = {
  score: number
  status: string
  summary: string
  audit: FinancialInsight[]
  wealth: FinancialInsight[]
  cashFlow: FinancialInsight[]
  leaks: FinancialInsight[]
  debtPlan: FinancialInsight[]
  nextAction: FinancialInsight
}

type AnalysisInput = {
  transactions: IntelligenceTransaction[]
  debts: IntelligenceDebt[]
  accountBalance: number
  goalBalance: number
  currentMonth: string
}

export function buildFinancialAnalysis(input: AnalysisInput): FinancialAnalysis {
  const current = input.transactions.filter((item) => item.date.startsWith(input.currentMonth))
  const revenue = sum(current, "receita")
  const expenses = sum(current, "despesa")
  const recurring = current.filter((item) => item.type === "despesa" && item.recurring).reduce((total, item) => total + item.value, 0)
  const openDebts = input.debts.filter((debt) => debt.balance > 0)
  const debtBalance = openDebts.reduce((total, debt) => total + debt.balance, 0)
  const installments = openDebts.reduce((total, debt) => total + (debt.minimumPayment ?? 0), 0)
  const margin = revenue - expenses - installments
  const netWorth = input.accountBalance + input.goalBalance - debtBalance
  const expenseRatio = revenue > 0 ? expenses / revenue : expenses > 0 ? 2 : 0
  const commitment = revenue > 0 ? (expenses + installments) / revenue : 0
  const reserveMonths = expenses > 0 ? Math.max(0, input.accountBalance) / expenses : 0
  const overdue = openDebts.filter((debt) => debt.overdue || debt.negativeListed)
  const highestInterest = [...openDebts].sort((a, b) => (b.monthlyInterest ?? 0) - (a.monthlyInterest ?? 0))[0]
  const categories = categoryTotals(current)
  const previousCategoryAverage = categoryAverage(input.transactions.filter((item) => !item.date.startsWith(input.currentMonth)))
  const leaks = findLeaks(categories, previousCategoryAverage, recurring)
  const payoff = calculateDebtPlan(openDebts.map((debt) => ({
    id: debt.id,
    name: debt.name,
    balance: debt.balance,
    monthlyInterest: debt.monthlyInterest,
    minimumPayment: debt.minimumPayment,
  })), Math.max(0, margin), "avalanche")

  let score = 100
  if (!revenue) score -= 25
  else if (expenseRatio > 1) score -= 35
  else if (expenseRatio > .8) score -= 22
  else if (expenseRatio > .6) score -= 10
  if (commitment > 1) score -= 20
  else if (commitment > .7) score -= 12
  if (overdue.length) score -= Math.min(20, 8 + overdue.length * 3)
  if (reserveMonths < 1) score -= 12
  if (netWorth < 0) score -= 10
  score = Math.max(0, Math.min(100, score))

  const status = score >= 80 ? "Saudável" : score >= 60 ? "Em atenção" : score >= 40 ? "Apertado" : "Crítico"
  const nextAction = chooseNextAction({ revenue, expenses, margin, overdue, highestInterest, debtBalance })

  return {
    score,
    status,
    summary: summaryFor({ revenue, expenses, margin, debtBalance, score }),
    nextAction,
    audit: [
      insight("Fluxo deste mês", margin >= 0 ? "Há dinheiro livre depois das despesas e parcelas." : "As saídas e parcelas ultrapassam sua renda do mês.", signedMoney(margin), margin >= 0 ? "positive" : "warning", "/transacoes", "Revisar lançamentos"),
      insight("Patrimônio líquido", netWorth >= 0 ? "Seus recursos superam as dívidas cadastradas." : "As dívidas ainda são maiores que seus recursos acumulados.", money(netWorth), netWorth >= 0 ? "positive" : "warning"),
      insight("Comprometimento da renda", revenue ? `${percentage(commitment)} da renda está comprometida com despesas e parcelas.` : "Cadastre sua receita mensal para medir o comprometimento.", revenue ? percentage(commitment) : "Sem renda", commitment <= .7 ? "neutral" : "warning"),
      insight("Reserva disponível", reserveMonths >= 1 ? `Seu saldo cobre aproximadamente ${reserveMonths.toFixed(1).replace(".", ",")} mês(es) de despesas.` : "Seu saldo ainda não cobre um mês das despesas atuais.", `${reserveMonths.toFixed(1).replace(".", ",")} mês`, reserveMonths >= 1 ? "positive" : "warning", "/metas", "Criar reserva"),
    ],
    wealth: buildWealthPlan({ margin, debtBalance, overdue: overdue.length, reserveMonths, goalBalance: input.goalBalance }),
    cashFlow: buildCashFlowPlan({ revenue, expenses, installments, margin, recurring }),
    leaks,
    debtPlan: buildDebtPlan({ openDebts, highestInterest, payoff, margin }),
  }
}

function buildWealthPlan({ margin, debtBalance, overdue, reserveMonths, goalBalance }: { margin: number; debtBalance: number; overdue: number; reserveMonths: number; goalBalance: number }): FinancialInsight[] {
  return [
    insight("1. Estabilizar o mês", margin >= 0 ? "Etapa controlada: suas entradas cobrem os compromissos atuais." : "Primeiro elimine o déficit mensal antes de assumir novos objetivos.", signedMoney(margin), margin >= 0 ? "positive" : "warning", "/orcamento", "Ajustar orçamento"),
    insight("2. Criar uma proteção mínima", reserveMonths >= 1 ? "Você já tem pelo menos um mês de despesas em saldo." : "Construa primeiro uma reserva equivalente a um mês de despesas essenciais.", `${reserveMonths.toFixed(1).replace(".", ",")} mês`, reserveMonths >= 1 ? "positive" : "neutral", "/metas", "Planejar reserva"),
    insight("3. Limpar dívidas caras", !debtBalance ? "Etapa concluída: nenhuma dívida aberta." : overdue ? "Dívidas atrasadas ou negativadas devem vir antes da construção de longo prazo." : "Mantenha as parcelas e direcione sobras para os maiores juros.", money(debtBalance), !debtBalance ? "positive" : "warning", "/dividas", "Ver estratégia"),
    insight("4. Construir patrimônio", debtBalance || reserveMonths < 1 ? "Comece esta etapa depois de estabilizar dívidas e proteção mínima." : "Com a base protegida, transforme a sobra mensal em metas de médio e longo prazo.", money(goalBalance), debtBalance ? "neutral" : "positive", "/metas", "Gerenciar metas"),
  ]
}

function buildCashFlowPlan({ revenue, expenses, installments, margin, recurring }: { revenue: number; expenses: number; installments: number; margin: number; recurring: number }): FinancialInsight[] {
  const essentialBase = expenses + installments
  return [
    insight("Entradas com propósito", revenue ? "Use a renda primeiro para cobrir despesas, parcelas e proteção; somente a sobra vira aceleração." : "Sem uma receita cadastrada, o app não consegue distribuir cada real.", money(revenue), revenue ? "positive" : "warning", "/transacoes", "Cadastrar receita"),
    insight("Base comprometida", "Valor atualmente necessário para despesas do mês e parcelas de dívidas.", money(essentialBase), essentialBase <= revenue ? "neutral" : "warning", "/orcamento", "Organizar categorias"),
    insight("Custos automáticos", recurring ? `Se continuarem iguais, os gastos recorrentes representam ${money(recurring * 12)} em 12 meses.` : "Nenhuma despesa recorrente foi efetivada neste mês.", money(recurring), recurring <= revenue * .3 ? "neutral" : "warning", "/transacoes", "Revisar recorrências"),
    insight("Destino da sobra", margin > 0 ? "Direcione a sobra para a dívida prioritária; depois, transfira o mesmo valor para sua reserva." : "Não há sobra segura para antecipações. Reduza saídas antes de acelerar dívidas.", signedMoney(margin), margin > 0 ? "positive" : "warning", "/dividas", "Simular quitação"),
  ]
}

function buildDebtPlan({ openDebts, highestInterest, payoff, margin }: { openDebts: IntelligenceDebt[]; highestInterest?: IntelligenceDebt; payoff: ReturnType<typeof calculateDebtPlan>; margin: number }): FinancialInsight[] {
  if (!openDebts.length) return [insight("Sem dívidas abertas", "Você concluiu esta etapa. Preserve a reserva e direcione o antigo valor das parcelas para suas metas.", "Tudo quitado", "positive", "/metas", "Ver metas")]
  const offers = openDebts.filter((debt) => debt.settlementOffer !== null && debt.settlementOffer < debt.balance).sort((a, b) => (b.balance - (b.settlementOffer ?? b.balance)) - (a.balance - (a.settlementOffer ?? a.balance)))
  return [
    insight("Ataque primeiro", highestInterest ? `${highestInterest.name}, de ${highestInterest.creditor}, possui a maior taxa conhecida. Mantenha os mínimos das demais.` : "Informe as taxas para o app identificar a dívida mais cara.", highestInterest?.monthlyInterest !== null && highestInterest ? `${highestInterest.monthlyInterest?.toFixed(2).replace(".", ",")}% a.m.` : "Taxa ausente", highestInterest?.monthlyInterest ? "warning" : "neutral", "/dividas", "Abrir plano"),
    insight("Previsão com a sobra atual", payoff.feasible && payoff.debtFreeDate ? `Aplicando ${money(Math.max(0, margin))} extras por mês pelo método avalanche.` : "Com os valores atuais ainda não há uma previsão segura de quitação.", payoff.debtFreeDate ? monthYear(payoff.debtFreeDate) : "Sem previsão", payoff.feasible ? "positive" : "warning", "/dividas", "Ajustar simulação"),
    insight("Oportunidade de acordo", offers.length ? `${offers[0].name} pode gerar economia de ${money(offers[0].balance - (offers[0].settlementOffer ?? offers[0].balance))} pela oferta cadastrada.` : "Nenhuma oferta de quitação com desconto foi cadastrada.", offers.length ? money(offers[0].settlementOffer ?? 0) : "Sem oferta", offers.length ? "positive" : "neutral", "/dividas", "Ver acordos"),
  ]
}

function findLeaks(current: Map<string, number>, previous: Map<string, number>, recurring: number): FinancialInsight[] {
  const candidates = [...current].map(([category, value]) => ({ category, value, old: previous.get(category) ?? 0 })).filter((item) => item.value > item.old * 1.2 && item.value - item.old >= 50).sort((a, b) => (b.value - b.old) - (a.value - a.old))
  const top = [...current].sort((a, b) => b[1] - a[1])[0]
  const result: FinancialInsight[] = []
  if (candidates[0]) result.push(insight("Categoria acelerando", `${candidates[0].category} está ${money(candidates[0].value - candidates[0].old)} acima da média mensal anterior.`, money(candidates[0].value), "warning", "/transacoes", "Ver despesas"))
  if (top) result.push(insight("Maior destino do dinheiro", `${top[0]} é a categoria com maior gasto neste mês.`, money(top[1]), "neutral", "/orcamento", "Definir limite"))
  result.push(insight("Peso das recorrências", recurring ? "Este é o custo anual projetado se todas as despesas recorrentes permanecerem iguais." : "Cadastre assinaturas e contas fixas como recorrentes para detectar vazamentos.", money(recurring * 12), recurring ? "neutral" : "warning", "/transacoes", "Revisar recorrências"))
  if (!candidates.length) result.push(insight("Nenhum salto relevante", "Não encontramos categoria mais de 20% e R$ 50 acima da média anterior.", "Estável", "positive"))
  return result
}

function chooseNextAction({ revenue, expenses, margin, overdue, highestInterest, debtBalance }: { revenue: number; expenses: number; margin: number; overdue: IntelligenceDebt[]; highestInterest?: IntelligenceDebt; debtBalance: number }): FinancialInsight {
  if (!revenue) return insight("Cadastre sua renda", "Essa é a informação mais importante para o diagnóstico e o plano mensal.", undefined, "warning", "/transacoes", "Adicionar receita")
  if (expenses > revenue) return insight("Feche o déficit do mês", `Encontre pelo menos ${money(expenses - revenue)} em cortes ou renda adicional.`, undefined, "warning", "/orcamento", "Revisar orçamento")
  if (overdue.length) return insight("Regularize a dívida mais urgente", `${overdue[0].name} está marcada como atrasada ou negativada. Confira a oferta antes do vencimento.`, undefined, "warning", "/dividas", "Ver dívida")
  if (debtBalance && highestInterest) return insight("Acelere a dívida mais cara", `Direcione até ${money(Math.max(0, margin))} extras para ${highestInterest.name}, sem deixar as demais parcelas vencerem.`, undefined, "neutral", "/dividas", "Abrir estratégia")
  return insight("Fortaleça sua reserva", "Sem dívida urgente, transforme a sobra mensal em segurança financeira.", undefined, "positive", "/metas", "Ver metas")
}

function categoryTotals(items: IntelligenceTransaction[]) { const map = new Map<string, number>(); for (const item of items) if (item.type === "despesa") map.set(item.category, (map.get(item.category) ?? 0) + item.value); return map }
function categoryAverage(items: IntelligenceTransaction[]) { const months = new Set(items.map((item) => item.date.slice(0, 7))).size || 1; const totals = categoryTotals(items); return new Map([...totals].map(([name, value]) => [name, value / months])) }
function sum(items: IntelligenceTransaction[], type: string) { return items.reduce((total, item) => item.type === type ? total + item.value : total, 0) }
function insight(title: string, description: string, value: string | undefined, tone: FinancialInsight["tone"], href?: string, action?: string): FinancialInsight { return { title, description, value, tone, href, action } }
function money(value: number) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value) }
function signedMoney(value: number) { return `${value >= 0 ? "+" : "−"} ${money(Math.abs(value))}` }
function percentage(value: number) { return new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 0 }).format(value) }
function monthYear(value: string) { return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)) }
function summaryFor({ revenue, expenses, margin, debtBalance, score }: { revenue: number; expenses: number; margin: number; debtBalance: number; score: number }) { if (!revenue && !expenses && !debtBalance) return "Cadastre seus dados para receber uma leitura financeira completa."; if (margin < 0) return `Sua prioridade é recuperar ${money(Math.abs(margin))} de margem mensal antes de acelerar pagamentos.`; if (debtBalance) return `Há ${money(Math.max(0, margin))} de margem estimada para atacar ${money(debtBalance)} em dívidas.`; return score >= 80 ? "Sua base está equilibrada; o próximo passo é transformar a sobra em patrimônio." : "Seu fluxo está positivo, mas ainda há pontos que merecem atenção." }
