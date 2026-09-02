"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { status: "idle" | "error" | "success"; message?: string };
const email = z.email("Informe um e-mail válido.");
const password = z.string().min(8, "Use pelo menos 8 caracteres.");
const origin = async () => (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const message = (error: unknown): AuthState => ({ status: "error", message: error instanceof Error ? error.message : "Não foi possível concluir. Tente novamente." });

export async function signIn(_: AuthState, form: FormData): Promise<AuthState> {
  const parsed = z.object({ email, password }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return message(new Error(parsed.error.issues[0]?.message));
  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.signInWithPassword(parsed.data);
  if (authError) return message(new Error("E-mail ou senha incorretos."));
  const { data: profile } = await supabase.from("profiles").select("onboarding_concluido").eq("user_id", data.user.id).single();
  redirect(profile?.onboarding_concluido ? "/dashboard" : "/onboarding");
}

export async function signUp(_: AuthState, form: FormData): Promise<AuthState> {
  const parsed = z.object({ nome: z.string().trim().min(2, "Informe seu nome."), email, password }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return message(new Error(parsed.error.issues[0]?.message));
  const supabase = await createClient();
  const { error: authError } = await supabase.auth.signUp({ email: parsed.data.email, password: parsed.data.password, options: { data: { nome: parsed.data.nome }, emailRedirectTo: `${await origin()}/auth/callback?next=/onboarding` } });
  if (authError) return message(new Error(authError.message));
  return { status: "success", message: "Cadastro recebido. Confira seu e-mail para confirmar a conta." };
}

export async function recoverPassword(_: AuthState, form: FormData): Promise<AuthState> {
  const parsed = z.object({ email }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return message(new Error(parsed.error.issues[0]?.message));
  const { error } = await (await createClient()).auth.resetPasswordForEmail(parsed.data.email, { redirectTo: `${await origin()}/auth/callback?next=/redefinir-senha` });
  if (error) return message(error);
  return { status: "success", message: "Se o e-mail estiver cadastrado, você receberá o link de recuperação." };
}

export async function resetPassword(_: AuthState, form: FormData): Promise<AuthState> {
  const parsed = z.object({ password, confirmation: z.string() }).refine((v) => v.password === v.confirmation, { message: "As senhas não coincidem." }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return message(new Error(parsed.error.issues[0]?.message));
  const { error } = await (await createClient()).auth.updateUser({ password: parsed.data.password });
  if (error) return message(error);
  redirect("/dashboard");
}

export async function signOut() { await (await createClient()).auth.signOut(); redirect("/entrar"); }
