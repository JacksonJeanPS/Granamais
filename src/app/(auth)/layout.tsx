import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="relative grid min-h-screen lg:grid-cols-[1.05fr_.95fr]">
    <section className="hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between"><Link href="/" className="font-display text-2xl font-extrabold">Grana<span className="text-brand">+</span></Link><div className="max-w-xl"><p className="mb-5 text-sm font-bold uppercase tracking-[.2em] text-brand">Dinheiro com direção</p><h1 className="font-display text-5xl font-bold leading-tight">Clareza para cuidar do hoje e construir o amanhã.</h1><p className="mt-6 text-lg opacity-80">Contas, cartões, orçamento e metas em um lugar feito para a vida financeira brasileira.</p></div><p className="text-sm opacity-60">Seus dados protegidos por autenticação e regras de acesso no banco.</p></section>
    <section className="flex items-center justify-center px-5 py-16"><div className="absolute right-5 top-5"><ThemeToggle /></div><div className="w-full max-w-md"><Link href="/" className="mb-10 block font-display text-2xl font-extrabold lg:hidden">Grana<span className="text-primary">+</span></Link>{children}</div></section>
  </main>;
}
