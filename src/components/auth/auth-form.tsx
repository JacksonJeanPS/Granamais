"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthState } from "@/app/(auth)/actions";

type Mode = "entrar" | "cadastrar" | "recuperar" | "redefinir";
export function AuthForm({ mode, action }: { mode: Mode; action: (state: AuthState, form: FormData) => Promise<AuthState> }) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" });
  const signup = mode === "cadastrar";
  return <form action={formAction} className="space-y-5">
    {signup && <Field id="nome" label="Como podemos chamar você?" autoComplete="name" />}
    {(mode === "entrar" || signup || mode === "recuperar") && <Field id="email" label="E-mail" type="email" autoComplete="email" />}
    {(mode === "entrar" || signup || mode === "redefinir") && <Field id="password" label={mode === "redefinir" ? "Nova senha" : "Senha"} type="password" autoComplete={signup ? "new-password" : "current-password"} />}
    {mode === "redefinir" && <Field id="confirmation" label="Confirme a nova senha" type="password" autoComplete="new-password" />}
    {mode === "entrar" && <div className="text-right"><Link href="/recuperar-senha" className="text-sm font-semibold text-primary hover:underline">Esqueci minha senha</Link></div>}
    {state.message && <Alert className={state.status === "error" ? "border-destructive/40 bg-destructive/5" : "border-primary/30 bg-brand-soft"}><AlertDescription>{state.message}</AlertDescription></Alert>}
    <Button className="w-full" size="lg" disabled={pending}>{pending ? "Só um instante…" : ({ entrar: "Entrar", cadastrar: "Criar minha conta", recuperar: "Enviar link", redefinir: "Salvar nova senha" }[mode])}</Button>
  </form>;
}
function Field({ id, label, ...props }: React.ComponentProps<typeof Input> & { id: string; label: string }) { return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><Input id={id} name={id} required {...props} /></div>; }
