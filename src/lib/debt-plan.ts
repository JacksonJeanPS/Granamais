export type PayoffMethod = "avalanche" | "snowball"

export type PlanningDebt = {
  id: string
  name: string
  balance: number
  monthlyInterest: number | null
  minimumPayment: number | null
}

export type PayoffItem = {
  id: string
  name: string
  position: number
  payoffMonth: number | null
  payoffDate: string | null
  totalInterest: number
  totalPaid: number
}

export type PayoffPlan = {
  method: PayoffMethod
  monthlyBudget: number
  months: number | null
  debtFreeDate: string | null
  totalInterest: number
  totalPaid: number
  feasible: boolean
  items: PayoffItem[]
}

const MAX_MONTHS = 600

function addMonths(reference: Date, months: number) {
  return new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() + months, 1))
    .toISOString()
    .slice(0, 10)
}

export function calculateDebtPlan(
  debts: PlanningDebt[],
  extraPayment: number,
  method: PayoffMethod,
  referenceDate = new Date(),
): PayoffPlan {
  const eligible = debts.filter((debt) => debt.balance > 0)
  const order = [...eligible].sort((a, b) => {
    if (method === "snowball") return a.balance - b.balance || a.name.localeCompare(b.name)
    return (b.monthlyInterest ?? 0) - (a.monthlyInterest ?? 0) || a.balance - b.balance
  })
  const monthlyBudget = order.reduce((sum, debt) => sum + Math.max(0, debt.minimumPayment ?? 0), 0) + Math.max(0, extraPayment)
  const state = new Map(order.map((debt) => [debt.id, {
    balance: debt.balance,
    interest: 0,
    paid: 0,
    payoffMonth: null as number | null,
  }]))

  let month = 0
  let feasible = order.length === 0 || monthlyBudget > 0

  while (feasible && month < MAX_MONTHS && [...state.values()].some((item) => item.balance > 0.005)) {
    month += 1
    let available = monthlyBudget

    for (const debt of order) {
      const item = state.get(debt.id)!
      if (item.balance <= 0.005) continue
      const interest = item.balance * Math.max(0, debt.monthlyInterest ?? 0) / 100
      item.balance += interest
      item.interest += interest
    }

    for (const debt of order) {
      const item = state.get(debt.id)!
      if (item.balance <= 0.005 || available <= 0) continue
      const payment = Math.min(item.balance, Math.max(0, debt.minimumPayment ?? 0), available)
      item.balance -= payment
      item.paid += payment
      available -= payment
      if (item.balance <= 0.005) item.payoffMonth = month
    }

    for (const debt of order) {
      const item = state.get(debt.id)!
      if (item.balance <= 0.005 || available <= 0) continue
      const payment = Math.min(item.balance, available)
      item.balance -= payment
      item.paid += payment
      available -= payment
      if (item.balance <= 0.005) item.payoffMonth = month
    }

    const remaining = [...state.values()].reduce((sum, item) => sum + item.balance, 0)
    const previousRemaining = [...state.values()].reduce((sum, item) => sum + item.paid, 0)
    if (!Number.isFinite(remaining) || !Number.isFinite(previousRemaining)) feasible = false
  }

  if ([...state.values()].some((item) => item.balance > 0.005)) feasible = false

  const items = order.map((debt, index) => {
    const item = state.get(debt.id)!
    return {
      id: debt.id,
      name: debt.name,
      position: index + 1,
      payoffMonth: feasible ? item.payoffMonth : null,
      payoffDate: feasible && item.payoffMonth ? addMonths(referenceDate, item.payoffMonth - 1) : null,
      totalInterest: item.interest,
      totalPaid: item.paid,
    }
  })
  const months = feasible ? Math.max(0, ...items.map((item) => item.payoffMonth ?? 0)) : null

  return {
    method,
    monthlyBudget,
    months,
    debtFreeDate: months ? addMonths(referenceDate, months - 1) : null,
    totalInterest: items.reduce((sum, item) => sum + item.totalInterest, 0),
    totalPaid: items.reduce((sum, item) => sum + item.totalPaid, 0),
    feasible,
    items,
  }
}
