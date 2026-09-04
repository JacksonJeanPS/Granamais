"use client"

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { formatCurrency } from "@/lib/formatters"

export function DebtBalanceChart({ data }: { data: { month: string; balance: number }[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
          <YAxis hide domain={[0, "auto"]} />
          <Tooltip cursor={{ stroke: "var(--border)" }} content={({ active, payload, label }) => active && payload?.length ? <div className="rounded-xl border border-border bg-card p-3 text-xs shadow-lg"><p className="font-bold">{label}</p><p className="mt-1 text-negative">Saldo: {formatCurrency(Number(payload[0].value))}</p></div> : null} />
          <Line type="monotone" dataKey="balance" stroke="var(--negative)" strokeWidth={3} dot={{ r: 3, fill: "var(--card)", strokeWidth: 2 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
