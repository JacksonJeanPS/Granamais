"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { parseBrazilianMoney } from "@/lib/formatters";
import { createClient } from "@/lib/supabase/server";

export type OnboardingState = { error?: string };
const money = z.string().transform(parseBrazilianMoney).pipe(z.number().finite().nonnegative());
const schema = z.object({
  accountName: z.string().trim().min(2), bankName: z.string().trim().min(2),
  accountType: z.enum(["corrente", "poupanca", "investimento", "dinheiro", "carteira_digital"]),
  initialBalance: money, accountColor: z.string().regex(/^#[0-9a-f]{6}$/i),
  cardName: z.string().trim().min(2), cardIssuer: z.string().trim().min(2), cardBrand: z.string().trim().min(2),
  creditLimit: money, closingDay: z.coerce.number().int().min(1).max(31), dueDay: z.coerce.number().int().min(1).max(31),
  cardColor: z.string().regex(/^#[0-9a-f]{6}$/i),
});

export async function completeOnboarding(_: OnboardingState, form: FormData): Promise<OnboardingState> {
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Revise os campos destacados e tente novamente." };
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return { error: "Sua sessão expirou. Entre novamente para continuar." };
  const { error } = await supabase.rpc("complete_onboarding", {
    p_account_name: parsed.data.accountName, p_bank_name: parsed.data.bankName,
    p_account_type: parsed.data.accountType, p_initial_balance: parsed.data.initialBalance,
    p_account_color: parsed.data.accountColor, p_card_name: parsed.data.cardName,
    p_card_issuer: parsed.data.cardIssuer, p_card_brand: parsed.data.cardBrand,
    p_credit_limit: parsed.data.creditLimit, p_closing_day: parsed.data.closingDay,
    p_due_day: parsed.data.dueDay, p_card_color: parsed.data.cardColor,
  });
  if (error) return { error: "Não foi possível salvar seus dados. Tente novamente." };
  redirect("/dashboard");
}
