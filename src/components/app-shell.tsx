"use client";

import { BarChart3, CreditCard, Landmark, Menu, PiggyBank, ReceiptText, Target, TrendingUp, WalletCards, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Visão geral", icon: BarChart3 },
  { href: "/contas", label: "Contas", icon: Landmark },
  { href: "/cartoes", label: "Cartões", icon: CreditCard },
  { href: "/transacoes", label: "Transações", icon: ReceiptText, soon: true },
  { href: "/orcamento", label: "Orçamento", icon: WalletCards, soon: true },
  { href: "/metas", label: "Metas", icon: Target, soon: true },
  { href: "/mercado", label: "Mercado", icon: TrendingUp, soon: true },
  { href: "/simulador", label: "Simulador", icon: PiggyBank, soon: true },
];

export function AppShell({ children, header }: { children: React.ReactNode; header: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <div className="min-h-screen bg-background lg:grid lg:grid-cols-[248px_1fr]">
    <aside className={cn("fixed inset-y-0 start-0 z-50 w-[280px] border-e border-border bg-card p-5 transition-transform lg:sticky lg:top-0 lg:h-screen lg:w-auto lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}><div className="mb-9 flex items-center justify-between px-2"><Link href="/dashboard" className="font-display text-2xl font-extrabold">Grana<span className="text-primary">+</span></Link><Button className="lg:hidden" variant="ghost" size="icon" aria-label="Fechar menu" onClick={() => setOpen(false)}><X /></Button></div><Navigation onNavigate={() => setOpen(false)} /></aside>
    {open ? <button className="fixed inset-0 z-40 bg-ink/40 lg:hidden" aria-label="Fechar menu" onClick={() => setOpen(false)} /> : null}
    <div className="min-w-0"><header className="sticky top-0 z-30 flex h-17 items-center justify-between border-b border-border bg-background/92 px-4 backdrop-blur-md sm:px-7 lg:px-10"><Button className="lg:hidden" variant="ghost" size="icon" aria-label="Abrir menu" onClick={() => setOpen(true)}><Menu /></Button>{header}</header><main className="px-4 py-7 sm:px-7 lg:px-10 lg:py-9">{children}</main></div>
  </div>;
}
function Navigation({ onNavigate }: { onNavigate: () => void }) { const pathname = usePathname(); return <nav aria-label="Navegação principal" className="space-y-1">{navigation.map(({ href, label, icon: Icon, soon }) => { const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href)); if (soon) return <span key={href} aria-disabled="true" className="flex h-11 cursor-not-allowed items-center gap-3 rounded-xl px-3 text-sm font-semibold text-muted-foreground/60"><Icon className="size-4.5" />{label}<span className="ms-auto text-[10px] font-bold uppercase tracking-wide">em breve</span></span>; return <Link key={href} href={href} onClick={onNavigate} className={cn("flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors", active ? "bg-brand-soft text-primary" : "text-muted-foreground hover:bg-subtle hover:text-foreground")}><Icon className="size-4.5" />{label}</Link>; })}</nav>; }
