import { AuthForm } from "@/components/auth/auth-form";
import { resetPassword } from "../actions";
export default function Page() { return <><h2 className="font-display text-3xl font-bold">Crie uma nova senha</h2><p className="mb-8 mt-2 text-muted-foreground">Escolha uma senha segura com pelo menos 8 caracteres.</p><AuthForm mode="redefinir" action={resetPassword} /></>; }
