import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { recoverPassword } from "../actions";
export default function Page() { return <><h2 className="font-display text-3xl font-bold">Recupere seu acesso</h2><p className="mb-8 mt-2 text-muted-foreground">Enviaremos um link seguro para o seu e-mail.</p><AuthForm mode="recuperar" action={recoverPassword} /><p className="mt-7 text-center text-sm"><Link className="font-bold text-primary hover:underline" href="/entrar">Voltar para entrar</Link></p></>; }
