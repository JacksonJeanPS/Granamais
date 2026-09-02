import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/entrar");
  const { data: profile } = await supabase.from("profiles").select("onboarding_concluido").eq("user_id", userId).single();
  if (profile?.onboarding_concluido) redirect("/dashboard");
  return <main className="min-h-screen px-5 py-10 sm:py-16"><div className="mx-auto max-w-2xl"><header className="mb-10 flex items-center justify-between"><span className="font-display text-2xl font-extrabold">Grana<span className="text-primary">+</span></span><ThemeToggle /></header><div className="mb-8"><p className="font-bold text-primary">Vamos deixar tudo no jeito</p><h1 className="mt-2 font-display text-4xl font-bold">Seu ponto de partida financeiro</h1><p className="mt-3 text-muted-foreground">Cadastre uma conta e um cartão. Você poderá editar tudo depois.</p></div><div className="rounded-3xl border border-border bg-card p-5 shadow-premium sm:p-8"><OnboardingForm /></div></div></main>;
}
