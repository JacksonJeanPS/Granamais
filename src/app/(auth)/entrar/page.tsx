import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { signIn } from "../actions";
export default function Page() { return <><h2 className="font-display text-3xl font-bold">Que bom ter você de volta</h2><p className="mb-8 mt-2 text-muted-foreground">Entre para continuar cuidando da sua grana.</p><AuthForm mode="entrar" action={signIn} /><p className="mt-7 text-center text-sm text-muted-foreground">Ainda não usa o Grana+? <Link className="font-bold text-primary hover:underline" href="/cadastrar">Crie sua conta</Link></p></>; }
