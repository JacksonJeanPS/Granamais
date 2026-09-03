"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { formatCurrency } from "@/lib/formatters";

export function CashFlowChart({ data }: { data: { mes: string; receitas: number; despesas: number }[] }) {
  return <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} barGap={6}><CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" /><XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} /><Tooltip cursor={{ fill: "var(--subtle)", opacity: .6 }} content={({ active, payload, label }) => active && payload?.length ? <div className="rounded-xl border border-border bg-card p-3 text-xs shadow-lg"><p className="mb-2 font-bold">{label}</p>{payload.map((item) => <p key={String(item.dataKey)} className="mt-1" style={{ color: item.color }}>{item.name}: {formatCurrency(Number(item.value))}</p>)}</div> : null} /><Bar name="Receitas" dataKey="receitas" fill="var(--positive)" radius={[5,5,0,0]} maxBarSize={24} /><Bar name="Despesas" dataKey="despesas" fill="var(--negative)" radius={[5,5,0,0]} maxBarSize={24} /></BarChart></ResponsiveContainer></div>;
}
