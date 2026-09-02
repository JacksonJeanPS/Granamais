import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { signUp } from "../actions";
export default function Page() { return <><h2 className="font-display text-3xl font-bold">Comece com clareza</h2><p className="mb-8 mt-2 text-muted-foreground">Seu controle financeiro começa em poucos passos.</p><AuthForm mode="cadastrar" action={signUp} /><p className="mt-7 text-center text-sm text-muted-foreground">Já tem uma conta? <Link className="font-bold text-primary hover:underline" href="/entrar">Entrar</Link></p></>; }
