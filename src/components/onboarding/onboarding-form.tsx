"use client";

import { ArrowLeft, ArrowRight, Landmark, CreditCard } from "lucide-react";
import { useActionState, useState } from "react";
import { completeOnboarding } from "@/app/onboarding/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

export function OnboardingForm() {
  const [step, setStep] = useState(1);
  const [state, action, pending] = useActionState(completeOnboarding, {});
  return <form action={action} className="space-y-7">
    <div><div className="mb-3 flex justify-between text-sm font-semibold"><span>Etapa {step} de 2</span><span className="text-muted-foreground">{step === 1 ? "Sua conta" : "Seu cartão"}</span></div><Progress value={step * 50} /></div>
    <section className={step === 1 ? "space-y-5" : "hidden"} aria-hidden={step !== 1}>
      <div className="flex items-center gap-3"><span className="rounded-xl bg-brand-soft p-3 text-primary"><Landmark /></span><div><h2 className="font-display text-2xl font-bold">Primeira conta</h2><p className="text-sm text-muted-foreground">Comece pelo dinheiro que você já tem.</p></div></div>
      <div className="grid gap-5 sm:grid-cols-2"><Field name="accountName" label="Nome da conta" placeholder="Conta principal" /><Field name="bankName" label="Banco ou instituição" placeholder="Ex.: Nubank" /><Select name="accountType" label="Tipo de conta"><option value="corrente">Conta corrente</option><option value="poupanca">Poupança</option><option value="investimento">Investimentos</option><option value="carteira_digital">Carteira digital</option><option value="dinheiro">Dinheiro</option></Select><Field name="initialBalance" label="Saldo atual (R$)" inputMode="decimal" placeholder="0,00" defaultValue="0,00" /></div>
      <input type="hidden" name="accountColor" value="#145c43" />
      <Button type="button" className="w-full" size="lg" onClick={(event) => {
        const form = event.currentTarget.form;
        const fields = form ? Array.from(form.elements).filter((item): item is HTMLInputElement | HTMLSelectElement => item instanceof HTMLInputElement || item instanceof HTMLSelectElement).filter((item) => item.name.startsWith("account") || item.name === "bankName" || item.name === "initialBalance") : [];
        const invalid = fields.find((field) => !field.checkValidity());
        if (invalid) return invalid.reportValidity();
        setStep(2);
      }}>Continuar <ArrowRight /></Button>
    </section>
    <section className={step === 2 ? "space-y-5" : "hidden"} aria-hidden={step !== 2}>
      <div className="flex items-center gap-3"><span className="rounded-xl bg-brand-soft p-3 text-primary"><CreditCard /></span><div><h2 className="font-display text-2xl font-bold">Primeiro cartão</h2><p className="text-sm text-muted-foreground">Para acompanhar limite, fatura e parcelas.</p></div></div>
      <div className="grid gap-5 sm:grid-cols-2"><Field name="cardName" label="Apelido do cartão" placeholder="Cartão do dia a dia" /><Field name="cardIssuer" label="Banco emissor" placeholder="Ex.: Itaú" /><Select name="cardBrand" label="Bandeira"><option>Visa</option><option>Mastercard</option><option>Elo</option><option>American Express</option><option>Hipercard</option><option>Outra</option></Select><Field name="creditLimit" label="Limite total (R$)" inputMode="decimal" placeholder="5.000,00" /><Field name="closingDay" label="Dia de fechamento" type="number" min="1" max="31" /><Field name="dueDay" label="Dia de vencimento" type="number" min="1" max="31" /></div>
      <input type="hidden" name="cardColor" value="#7c3aed" />
      {state.error && <Alert><AlertDescription>{state.error}</AlertDescription></Alert>}
      <div className="flex gap-3"><Button type="button" variant="outline" size="lg" onClick={() => setStep(1)}><ArrowLeft /> Voltar</Button><Button className="flex-1" size="lg" disabled={pending}>{pending ? "Organizando…" : "Concluir configuração"}</Button></div>
    </section>
  </form>;
}
function Field({ name, label, ...props }: React.ComponentProps<typeof Input> & { name: string; label: string }) { return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} required {...props} /></div>; }
function Select({ name, label, children }: { name: string; label: string; children: React.ReactNode }) { return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><select id={name} name={name} required className="h-11 w-full rounded-xl border border-input bg-surface px-3 text-sm outline-none focus:ring-3 focus:ring-ring/30">{children}</select></div>; }
