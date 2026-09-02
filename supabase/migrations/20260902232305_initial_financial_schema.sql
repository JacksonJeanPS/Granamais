create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.account_type as enum ('corrente', 'poupanca', 'investimento', 'dinheiro', 'carteira_digital');
create type public.category_type as enum ('receita', 'despesa');
create type public.invoice_status as enum ('aberta', 'fechada', 'paga', 'atrasada', 'parcial');
create type public.installment_status as enum ('pendente', 'paga', 'atrasada', 'cancelada');
create type public.transaction_type as enum ('receita', 'despesa', 'transferencia');
create type public.transaction_status as enum ('prevista', 'efetivada', 'cancelada');
create type public.payment_method as enum ('pix', 'boleto', 'debito', 'credito', 'dinheiro', 'transferencia', 'outro');
create type public.recurrence_frequency as enum ('semanal', 'quinzenal', 'mensal', 'bimestral', 'trimestral', 'semestral', 'anual');
create type public.goal_status as enum ('ativa', 'concluida', 'pausada', 'cancelada');
create type public.goal_movement_type as enum ('aporte', 'resgate', 'ajuste');
create type public.investment_class as enum ('renda_fixa', 'renda_variavel');
create type public.financial_event_type as enum ('decimo_terceiro', 'ferias', 'ir', 'inss', 'ipva', 'iptu', 'outro');

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nome text check (nome is null or char_length(trim(nome)) between 2 and 80),
  avatar_url text,
  timezone text not null default 'America/Sao_Paulo',
  tema text not null default 'sistema' check (tema in ('claro', 'escuro', 'sistema')),
  onboarding_concluido boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null check (char_length(trim(nome)) between 1 and 80),
  instituicao text not null check (char_length(trim(instituicao)) between 1 and 100),
  tipo public.account_type not null,
  saldo_inicial numeric(15,2) not null default 0,
  saldo_atual numeric(15,2) not null default 0,
  cor text not null default '#145C43' check (cor ~ '^#[0-9A-Fa-f]{6}$'),
  icone text not null default 'landmark',
  inclui_no_patrimonio boolean not null default true,
  ativa boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (id, user_id)
);

create table public.account_balance_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null,
  saldo numeric(15,2) not null,
  origem text not null check (origem in ('inicial', 'transacao', 'ajuste', 'snapshot')),
  data_registro timestamptz not null default now(),
  observacao text check (observacao is null or char_length(observacao) <= 500),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  foreign key (account_id, user_id) references public.accounts(id, user_id) on delete cascade,
  unique (id, user_id)
);

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid,
  nome text not null check (char_length(trim(nome)) between 1 and 80),
  instituicao text not null check (char_length(trim(instituicao)) between 1 and 100),
  bandeira text not null check (char_length(trim(bandeira)) between 1 and 40),
  ultimos_quatro_digitos text check (ultimos_quatro_digitos is null or ultimos_quatro_digitos ~ '^[0-9]{4}$'),
  limite_total numeric(15,2) not null check (limite_total >= 0),
  dia_fechamento smallint not null check (dia_fechamento between 1 and 31),
  dia_vencimento smallint not null check (dia_vencimento between 1 and 31),
  cor text not null default '#145C43' check (cor ~ '^#[0-9A-Fa-f]{6}$'),
  icone text not null default 'credit-card',
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  foreign key (account_id, user_id) references public.accounts(id, user_id) on delete set null,
  unique (id, user_id)
);

create table public.card_invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id uuid not null,
  mes_referencia date not null check (mes_referencia = date_trunc('month', mes_referencia)::date),
  data_fechamento date not null,
  data_vencimento date not null,
  valor_total numeric(15,2) not null default 0 check (valor_total >= 0),
  status public.invoice_status not null default 'aberta',
  valor_pago numeric(15,2) not null default 0 check (valor_pago >= 0 and valor_pago <= valor_total),
  paga_em timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  foreign key (card_id, user_id) references public.cards(id, user_id) on delete cascade,
  unique (card_id, mes_referencia),
  unique (id, user_id)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null check (char_length(trim(nome)) between 1 and 60),
  tipo public.category_type not null,
  cor text not null check (cor ~ '^#[0-9A-Fa-f]{6}$'),
  icone text not null,
  categoria_pai_id uuid,
  padrao_sistema boolean not null default false,
  ativa boolean not null default true,
  ordem smallint not null default 0,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  foreign key (categoria_pai_id, user_id) references public.categories(id, user_id) on delete set null,
  unique (user_id, nome, tipo),
  unique (id, user_id)
);

create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id uuid not null,
  category_id uuid not null,
  descricao text not null check (char_length(trim(descricao)) between 1 and 160),
  valor_total numeric(15,2) not null check (valor_total > 0),
  numero_parcelas smallint not null default 1 check (numero_parcelas between 1 and 360),
  data_compra date not null default current_date,
  data_primeira_parcela date,
  observacao text check (observacao is null or char_length(observacao) <= 500),
  cancelada_em timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  foreign key (card_id, user_id) references public.cards(id, user_id) on delete restrict,
  foreign key (category_id, user_id) references public.categories(id, user_id) on delete restrict,
  unique (id, user_id)
);

create table public.installments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  purchase_id uuid not null,
  card_invoice_id uuid not null,
  numero_parcela smallint not null check (numero_parcela > 0),
  valor numeric(15,2) not null check (valor > 0),
  data_vencimento date not null,
  status public.installment_status not null default 'pendente',
  paga_em timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  foreign key (purchase_id, user_id) references public.purchases(id, user_id) on delete cascade,
  foreign key (card_invoice_id, user_id) references public.card_invoices(id, user_id) on delete restrict,
  unique (purchase_id, numero_parcela),
  unique (id, user_id)
);

create table public.recurrence_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null,
  category_id uuid not null,
  tipo public.transaction_type not null check (tipo <> 'transferencia'),
  descricao text not null check (char_length(trim(descricao)) between 1 and 160),
  valor numeric(15,2) not null check (valor > 0),
  frequencia public.recurrence_frequency not null,
  intervalo smallint not null default 1 check (intervalo between 1 and 24),
  dia_do_mes smallint check (dia_do_mes between 1 and 31),
  data_inicio date not null,
  data_fim date check (data_fim is null or data_fim >= data_inicio),
  proxima_execucao date not null,
  ativa boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  foreign key (account_id, user_id) references public.accounts(id, user_id) on delete restrict,
  foreign key (category_id, user_id) references public.categories(id, user_id) on delete restrict,
  unique (id, user_id)
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null,
  category_id uuid,
  installment_id uuid,
  recurrence_rule_id uuid,
  tipo public.transaction_type not null,
  valor numeric(15,2) not null check (valor > 0),
  descricao text not null check (char_length(trim(descricao)) between 1 and 160),
  data_competencia date not null,
  data_efetivacao date,
  status public.transaction_status not null default 'prevista',
  forma_pagamento public.payment_method not null default 'outro',
  transfer_account_id uuid,
  observacao text check (observacao is null or char_length(observacao) <= 500),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  foreign key (account_id, user_id) references public.accounts(id, user_id) on delete restrict,
  foreign key (category_id, user_id) references public.categories(id, user_id) on delete restrict,
  foreign key (installment_id, user_id) references public.installments(id, user_id) on delete set null,
  foreign key (recurrence_rule_id, user_id) references public.recurrence_rules(id, user_id) on delete set null,
  foreign key (transfer_account_id, user_id) references public.accounts(id, user_id) on delete restrict,
  check ((tipo = 'transferencia' and transfer_account_id is not null and category_id is null and transfer_account_id <> account_id) or
         (tipo <> 'transferencia' and transfer_account_id is null and category_id is not null)),
  check ((status = 'efetivada' and data_efetivacao is not null) or status <> 'efetivada'),
  unique (id, user_id)
);

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null,
  mes_referencia date not null check (mes_referencia = date_trunc('month', mes_referencia)::date),
  valor_planejado numeric(15,2) not null check (valor_planejado >= 0),
  observacao text check (observacao is null or char_length(observacao) <= 500),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  foreign key (category_id, user_id) references public.categories(id, user_id) on delete cascade,
  unique (user_id, category_id, mes_referencia),
  unique (id, user_id)
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null check (char_length(trim(nome)) between 1 and 100),
  descricao text check (descricao is null or char_length(descricao) <= 500),
  valor_alvo numeric(15,2) not null check (valor_alvo > 0),
  valor_inicial numeric(15,2) not null default 0 check (valor_inicial >= 0),
  valor_atual numeric(15,2) not null default 0 check (valor_atual >= 0),
  data_inicio date not null default current_date,
  data_alvo date not null,
  cor text not null default '#145C43' check (cor ~ '^#[0-9A-Fa-f]{6}$'),
  icone text not null default 'target',
  status public.goal_status not null default 'ativa',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  check (data_alvo >= data_inicio),
  unique (id, user_id)
);

create table public.goal_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null,
  account_id uuid,
  valor numeric(15,2) not null check (valor > 0),
  tipo public.goal_movement_type not null,
  data date not null default current_date,
  observacao text check (observacao is null or char_length(observacao) <= 500),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  foreign key (goal_id, user_id) references public.goals(id, user_id) on delete cascade,
  foreign key (account_id, user_id) references public.accounts(id, user_id) on delete set null,
  unique (id, user_id)
);

create table public.investment_simulations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null check (char_length(trim(nome)) between 1 and 100),
  classe public.investment_class not null,
  ativo_referencia text not null check (ativo_referencia in ('Selic', 'CDI', 'Poupança', 'Tesouro Selic', 'Tesouro Prefixado', 'Tesouro IPCA+', 'Ibovespa', 'Ação B3')),
  valor_inicial numeric(15,2) not null check (valor_inicial >= 0),
  aporte_mensal numeric(15,2) not null default 0 check (aporte_mensal >= 0),
  data_inicio date not null default current_date,
  prazo_meses integer not null check (prazo_meses between 1 and 1200),
  percentual_referencia numeric(8,4) check (percentual_referencia is null or percentual_referencia >= 0),
  taxa_manual numeric(8,4) check (taxa_manual is null or taxa_manual >= 0),
  considerar_ir boolean not null default true,
  resultado_estimado numeric(15,2) check (resultado_estimado is null or resultado_estimado >= 0),
  parametros jsonb not null default '{}'::jsonb check (jsonb_typeof(parametros) = 'object'),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (id, user_id)
);

create table public.financial_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tipo public.financial_event_type not null,
  nome text not null check (char_length(trim(nome)) between 1 and 100),
  data_prevista date not null,
  valor_estimado numeric(15,2) not null check (valor_estimado >= 0),
  recorrencia_anual boolean not null default false,
  observacao text check (observacao is null or char_length(observacao) <= 500),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (id, user_id)
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entidade text not null check (char_length(trim(entidade)) between 1 and 80),
  entidade_id uuid,
  acao text not null check (char_length(trim(acao)) between 1 and 80),
  metadados jsonb not null default '{}'::jsonb check (jsonb_typeof(metadados) = 'object'),
  criado_em timestamptz not null default now(),
  unique (id, user_id)
);

create index accounts_user_active_idx on public.accounts (user_id, ativa);
create index balance_history_account_date_idx on public.account_balance_history (account_id, data_registro desc);
create index cards_user_active_idx on public.cards (user_id, ativo);
create index invoices_user_due_idx on public.card_invoices (user_id, data_vencimento desc);
create index invoices_open_idx on public.card_invoices (user_id, data_vencimento) where status in ('aberta', 'fechada', 'parcial', 'atrasada');
create index categories_user_type_idx on public.categories (user_id, tipo, ativa);
create index purchases_user_date_idx on public.purchases (user_id, data_compra desc);
create index installments_user_due_idx on public.installments (user_id, data_vencimento);
create index installments_pending_idx on public.installments (user_id, data_vencimento) where status in ('pendente', 'atrasada');
create index recurrence_next_idx on public.recurrence_rules (user_id, proxima_execucao) where ativa;
create index transactions_user_date_idx on public.transactions (user_id, data_competencia desc);
create index transactions_account_date_idx on public.transactions (account_id, data_competencia desc);
create index transactions_month_category_idx on public.transactions (user_id, category_id, data_competencia) where status <> 'cancelada';
create index budgets_user_month_idx on public.budgets (user_id, mes_referencia);
create index goals_user_status_idx on public.goals (user_id, status);
create index goal_contributions_goal_date_idx on public.goal_contributions (goal_id, data desc);
create index simulations_user_date_idx on public.investment_simulations (user_id, criado_em desc);
create index events_user_date_idx on public.financial_events (user_id, data_prevista);
create index audit_user_date_idx on public.audit_events (user_id, criado_em desc);

create or replace function private.set_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin new.atualizado_em = now(); return new; end;
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array['profiles','accounts','account_balance_history','cards','card_invoices','categories','purchases','installments','recurrence_rules','transactions','budgets','goals','goal_contributions','investment_simulations','financial_events']
  loop
    execute format('create trigger set_updated_at before update on public.%I for each row execute function private.set_updated_at()', table_name);
  end loop;
end $$;

create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (user_id, nome)
  values (new.id, nullif(trim(coalesce(new.raw_user_meta_data ->> 'nome', new.raw_user_meta_data ->> 'full_name', '')), ''));

  insert into public.categories (user_id, nome, tipo, cor, icone, padrao_sistema, ordem) values
    (new.id, 'Salário', 'receita', '#16865A', 'wallet-cards', true, 10),
    (new.id, '13º salário', 'receita', '#16865A', 'gift', true, 20),
    (new.id, 'Benefícios', 'receita', '#3267A8', 'badge-dollar-sign', true, 30),
    (new.id, 'Restituição de IR', 'receita', '#3267A8', 'landmark', true, 40),
    (new.id, 'Outras receitas', 'receita', '#16865A', 'circle-plus', true, 50),
    (new.id, 'Moradia', 'despesa', '#7C5C45', 'house', true, 110),
    (new.id, 'Mercado', 'despesa', '#D89216', 'shopping-basket', true, 120),
    (new.id, 'Transporte', 'despesa', '#3267A8', 'bus', true, 130),
    (new.id, 'Saúde', 'despesa', '#C94C4C', 'heart-pulse', true, 140),
    (new.id, 'Educação', 'despesa', '#665AA7', 'graduation-cap', true, 150),
    (new.id, 'Lazer', 'despesa', '#A75478', 'ticket', true, 160),
    (new.id, 'Assinaturas', 'despesa', '#52606D', 'repeat-2', true, 170),
    (new.id, 'Impostos e taxas', 'despesa', '#8A4B3A', 'receipt-text', true, 180),
    (new.id, 'Outras despesas', 'despesa', '#5E6964', 'circle-minus', true, 190);
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_user();

create or replace function private.days_in_month(p_month date)
returns integer language sql immutable security invoker set search_path = '' as $$
  select extract(day from (date_trunc('month', p_month) + interval '1 month - 1 day'))::integer;
$$;

create or replace function private.generate_purchase_installments()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare
  card_row public.cards%rowtype;
  first_due_month date;
  due_month date;
  due_date date;
  close_date date;
  invoice_id uuid;
  installment_value numeric(15,2);
  last_value numeric(15,2);
  i integer;
begin
  select * into strict card_row from public.cards where id = new.card_id and user_id = new.user_id;
  if new.data_primeira_parcela is not null then
    first_due_month := date_trunc('month', new.data_primeira_parcela)::date;
  else
    close_date := make_date(extract(year from new.data_compra)::integer, extract(month from new.data_compra)::integer,
      least(card_row.dia_fechamento, private.days_in_month(new.data_compra)));
    first_due_month := date_trunc('month', new.data_compra)::date;
    if new.data_compra > close_date then first_due_month := (first_due_month + interval '1 month')::date; end if;
    if card_row.dia_vencimento <= card_row.dia_fechamento then first_due_month := (first_due_month + interval '1 month')::date; end if;
  end if;

  installment_value := trunc((new.valor_total / new.numero_parcelas)::numeric, 2);
  last_value := new.valor_total - (installment_value * (new.numero_parcelas - 1));

  for i in 1..new.numero_parcelas loop
    due_month := (first_due_month + make_interval(months => i - 1))::date;
    due_date := make_date(extract(year from due_month)::integer, extract(month from due_month)::integer,
      least(card_row.dia_vencimento, private.days_in_month(due_month)));
    close_date := make_date(extract(year from (due_month - interval '1 month'))::integer,
      extract(month from (due_month - interval '1 month'))::integer,
      least(card_row.dia_fechamento, private.days_in_month((due_month - interval '1 month')::date)));

    insert into public.card_invoices (user_id, card_id, mes_referencia, data_fechamento, data_vencimento)
    values (new.user_id, new.card_id, due_month, close_date, due_date)
    on conflict (card_id, mes_referencia) do update set atualizado_em = now()
    returning id into invoice_id;

    insert into public.installments (user_id, purchase_id, card_invoice_id, numero_parcela, valor, data_vencimento)
    values (new.user_id, new.id, invoice_id, i, case when i = new.numero_parcelas then last_value else installment_value end, due_date);
  end loop;
  return new;
end;
$$;

create trigger generate_installments after insert on public.purchases for each row execute function private.generate_purchase_installments();

create or replace function private.refresh_invoice_total()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare target_invoice uuid; target_user uuid;
begin
  target_invoice := coalesce(new.card_invoice_id, old.card_invoice_id);
  target_user := coalesce(new.user_id, old.user_id);
  update public.card_invoices
  set valor_total = coalesce((select sum(valor) from public.installments where card_invoice_id = target_invoice and status <> 'cancelada'), 0)
  where id = target_invoice and user_id = target_user;
  return coalesce(new, old);
end;
$$;

create trigger refresh_invoice_total after insert or update of valor, status or delete on public.installments for each row execute function private.refresh_invoice_total();

create or replace function private.refresh_goal_total()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare target_goal uuid; target_user uuid; initial_value numeric(15,2);
begin
  target_goal := coalesce(new.goal_id, old.goal_id);
  target_user := coalesce(new.user_id, old.user_id);
  select valor_inicial into initial_value from public.goals where id = target_goal and user_id = target_user;
  update public.goals set valor_atual = greatest(0, initial_value + coalesce((
    select sum(case when tipo = 'aporte' then valor when tipo = 'resgate' then -valor else valor end)
    from public.goal_contributions where goal_id = target_goal
  ), 0)) where id = target_goal and user_id = target_user;
  return coalesce(new, old);
end;
$$;

create trigger refresh_goal_total after insert or update or delete on public.goal_contributions for each row execute function private.refresh_goal_total();

create or replace function private.initialize_account_balance()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin new.saldo_atual := new.saldo_inicial; return new; end;
$$;
create trigger initialize_account_balance before insert on public.accounts for each row execute function private.initialize_account_balance();

create or replace function private.record_initial_balance()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  insert into public.account_balance_history (user_id, account_id, saldo, origem, observacao)
  values (new.user_id, new.id, new.saldo_atual, 'inicial', 'Saldo inicial da conta');
  return new;
end;
$$;
create trigger record_initial_balance after insert on public.accounts for each row execute function private.record_initial_balance();

do $$
declare table_name text;
begin
  foreach table_name in array array['profiles','accounts','account_balance_history','cards','card_invoices','categories','purchases','installments','recurrence_rules','transactions','budgets','goals','goal_contributions','investment_simulations','financial_events','audit_events']
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('alter table public.%I force row level security', table_name);
    execute format('revoke all on table public.%I from anon, authenticated', table_name);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', table_name);
    execute format('create policy %I on public.%I for select to authenticated using ((select auth.uid()) = user_id)', table_name || '_select_own', table_name);
    execute format('create policy %I on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)', table_name || '_insert_own', table_name);
    execute format('create policy %I on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', table_name || '_update_own', table_name);
    execute format('create policy %I on public.%I for delete to authenticated using ((select auth.uid()) = user_id)', table_name || '_delete_own', table_name);
  end loop;
end $$;

revoke insert, delete on table public.profiles from authenticated;
revoke insert, update, delete on table public.audit_events from authenticated;
grant usage on schema public to anon, authenticated;
grant usage on all sequences in schema public to authenticated;
