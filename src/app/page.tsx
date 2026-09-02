const highlights = [
  { value: "R$ 8.420", label: "Patrimônio", tone: "text-positive" },
  { value: "R$ 2.780", label: "Receitas", tone: "text-positive" },
  { value: "R$ 1.936", label: "Despesas", tone: "text-negative" },
];

const features = [
  ["Contas e cartões", "Saldos, limites, faturas e parcelas no mesmo lugar."],
  ["Orçamento do mês", "Planeje cada categoria e acompanhe o realizado."],
  ["Metas que avançam", "Veja o progresso e a projeção de cada objetivo."],
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <header className="flex h-20 items-center justify-between border-b border-border/70">
          <a className="font-display text-2xl font-extrabold tracking-[-0.04em]" href="#inicio">
            Grana<span className="text-brand">+</span>
          </a>
          <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-muted">Em construção</span>
        </header>

        <section id="inicio" className="grid items-center gap-14 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
          <div className="max-w-2xl">
            <p className="mb-5 text-sm font-bold uppercase tracking-[0.16em] text-primary">Feito para a vida financeira brasileira</p>
            <h1 className="font-display text-5xl font-extrabold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Sua grana, com mais clareza e menos aperto.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted sm:text-xl">
              Organize contas, cartões, parcelas, orçamento e metas em um só lugar — tudo em Real e do seu jeito.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a className="button-primary" href="#recursos">Conhecer o Grana+</a>
              <span className="flex items-center px-2 text-sm font-medium text-muted">Controle manual. Decisões conscientes.</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl" aria-label="Prévia do painel financeiro">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand/20 blur-3xl" />
            <div className="relative rounded-[2rem] border border-border bg-surface p-5 shadow-premium sm:p-7">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted">Visão de setembro</p><p className="mt-1 font-display text-2xl font-bold">Bom dia, Jackson</p></div>
                <div className="grid size-10 place-items-center rounded-full bg-brand text-lg font-black text-ink">+</div>
              </div>
              <div className="mt-7 grid grid-cols-3 gap-2 sm:gap-3">
                {highlights.map((item) => (
                  <div className="rounded-2xl bg-subtle p-3 sm:p-4" key={item.label}>
                    <p className="text-xs text-muted">{item.label}</p>
                    <p className={`mt-2 text-sm font-bold tabular-nums sm:text-lg ${item.tone}`}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl bg-[#145c43] p-5 text-white">
                <div className="flex items-end justify-between gap-4">
                  <div><p className="text-sm text-white/70">Seu mês está no caminho certo</p><p className="mt-2 font-display text-2xl font-bold">R$ 844 livres</p></div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">+12%</span>
                </div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full w-[68%] rounded-full bg-brand" /></div>
              </div>
            </div>
          </div>
        </section>

        <section id="recursos" className="border-t border-border py-14 sm:py-20">
          <div className="grid gap-4 md:grid-cols-3">
            {features.map(([title, description], index) => (
              <article className="rounded-3xl border border-border bg-surface p-6" key={title}>
                <span className="grid size-9 place-items-center rounded-xl bg-brand-soft text-sm font-extrabold text-primary">0{index + 1}</span>
                <h2 className="mt-8 font-display text-xl font-bold">{title}</h2>
                <p className="mt-2 leading-7 text-muted">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="flex flex-col gap-2 border-t border-border py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>Grana+ — organização financeira para brasileiros.</p><p>Informação para decidir melhor, sem promessas de rendimento.</p>
        </footer>
      </div>
    </main>
  );
}
