create type public.debt_type as enum ('cartao', 'emprestimo', 'consignado', 'financiamento', 'boleto', 'negativada', 'outra');
create type public.debt_status as enum ('aberta', 'negociada', 'quitada', 'contestada', 'cancelada');
create type public.debt_priority as enum ('baixa', 'media', 'alta', 'urgente');
create type public.debt_payment_type as enum ('parcela', 'extra', 'quitacao', 'desconto', 'ajuste');

create table public.debts (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null check (char_length(trim(nome)) between 2 and 120), credor text not null check (char_length(trim(credor)) between 2 and 120),
  tipo public.debt_type not null, valor_original numeric(15,2) not null check (valor_original > 0), saldo_devedor numeric(15,2) not null check (saldo_devedor >= 0),
  taxa_juros_mensal numeric(8,4) check (taxa_juros_mensal is null or taxa_juros_mensal >= 0), data_contratacao date, data_vencimento date,
  negativada boolean not null default false, em_atraso boolean not null default false,
  numero_parcelas smallint check (numero_parcelas is null or numero_parcelas > 0), parcelas_pagas smallint not null default 0 check (parcelas_pagas >= 0),
  valor_parcela numeric(15,2) check (valor_parcela is null or valor_parcela > 0), oferta_quitacao numeric(15,2) check (oferta_quitacao is null or oferta_quitacao >= 0), validade_oferta date,
  status public.debt_status not null default 'aberta', prioridade public.debt_priority not null default 'media', observacao text check (observacao is null or char_length(observacao) <= 1000),
  criado_em timestamptz not null default now(), atualizado_em timestamptz not null default now(),
  check (saldo_devedor <= valor_original), check (parcelas_pagas <= coalesce(numero_parcelas, parcelas_pagas)),
  check (oferta_quitacao is null or oferta_quitacao <= saldo_devedor), unique(id,user_id)
);

create table public.debt_payments (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, debt_id uuid not null, account_id uuid,
  valor numeric(15,2) not null check (valor > 0), data_pagamento date not null default current_date, tipo public.debt_payment_type not null,
  observacao text check (observacao is null or char_length(observacao) <= 500), criado_em timestamptz not null default now(), atualizado_em timestamptz not null default now(),
  foreign key(debt_id,user_id) references public.debts(id,user_id) on delete cascade,
  foreign key(account_id,user_id) references public.accounts(id,user_id) on delete restrict,
  check ((tipo in ('desconto','ajuste') and account_id is null) or tipo not in ('desconto','ajuste')), unique(id,user_id)
);

create index debts_user_status_idx on public.debts(user_id,status,prioridade);
create index debts_due_idx on public.debts(user_id,data_vencimento) where status in ('aberta','negociada');
create index debt_payments_debt_date_idx on public.debt_payments(debt_id,data_pagamento desc);
create index debt_payments_account_owner_idx on public.debt_payments(account_id,user_id) where account_id is not null;

create trigger set_updated_at before update on public.debts for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.debt_payments for each row execute function private.set_updated_at();

alter table public.debts enable row level security; alter table public.debts force row level security;
alter table public.debt_payments enable row level security; alter table public.debt_payments force row level security;
revoke all on public.debts, public.debt_payments from anon, authenticated;
grant select,insert,update,delete on public.debts, public.debt_payments to authenticated;
create policy debts_select_own on public.debts for select to authenticated using ((select auth.uid())=user_id);
create policy debts_insert_own on public.debts for insert to authenticated with check ((select auth.uid())=user_id);
create policy debts_update_own on public.debts for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy debts_delete_own on public.debts for delete to authenticated using ((select auth.uid())=user_id);
create policy debt_payments_select_own on public.debt_payments for select to authenticated using ((select auth.uid())=user_id);
create policy debt_payments_insert_own on public.debt_payments for insert to authenticated with check ((select auth.uid())=user_id);
create policy debt_payments_update_own on public.debt_payments for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy debt_payments_delete_own on public.debt_payments for delete to authenticated using ((select auth.uid())=user_id);

create or replace function private.apply_debt_payment()
returns trigger language plpgsql security invoker set search_path='' as $$
declare old_row public.debt_payments%rowtype; new_row public.debt_payments%rowtype; available numeric(15,2);
begin
 if tg_op<>'INSERT' then old_row:=old; end if; if tg_op<>'DELETE' then new_row:=new; end if;
 perform 1 from public.debts where user_id=coalesce(new_row.user_id,old_row.user_id) and id in(old_row.debt_id,new_row.debt_id) order by id for update;
 perform 1 from public.accounts where user_id=coalesce(new_row.user_id,old_row.user_id) and id in(old_row.account_id,new_row.account_id) order by id for update;
 perform set_config('granamais.balance_origin','transacao',true); perform set_config('granamais.balance_note','Saldo atualizado por pagamento de dívida',true);
 if tg_op<>'INSERT' then
  update public.debts set saldo_devedor=saldo_devedor+old_row.valor, parcelas_pagas=greatest(0,parcelas_pagas-case when old_row.tipo='parcela' then 1 else 0 end), status=case when status='quitada' then 'aberta'::public.debt_status else status end where id=old_row.debt_id and user_id=old_row.user_id;
  if old_row.account_id is not null then update public.accounts set saldo_atual=saldo_atual+old_row.valor where id=old_row.account_id and user_id=old_row.user_id; end if;
 end if;
 if tg_op<>'DELETE' then
  select saldo_devedor into available from public.debts where id=new_row.debt_id and user_id=new_row.user_id;
  if new_row.valor>available then raise exception 'payment exceeds debt balance'; end if;
  update public.debts set saldo_devedor=saldo_devedor-new_row.valor, parcelas_pagas=parcelas_pagas+case when new_row.tipo='parcela' then 1 else 0 end, oferta_quitacao=case when saldo_devedor-new_row.valor=0 then null when oferta_quitacao is not null then least(oferta_quitacao,saldo_devedor-new_row.valor) else null end, status=case when saldo_devedor-new_row.valor=0 then 'quitada'::public.debt_status else status end where id=new_row.debt_id and user_id=new_row.user_id;
  if new_row.account_id is not null then update public.accounts set saldo_atual=saldo_atual-new_row.valor where id=new_row.account_id and user_id=new_row.user_id; end if;
 end if;
 perform set_config('granamais.balance_origin','',true); perform set_config('granamais.balance_note','',true);
 if tg_op='DELETE' then return old; end if; return new;
end; $$;
create trigger apply_debt_payment after insert or delete or update of debt_id,account_id,valor,tipo on public.debt_payments for each row execute function private.apply_debt_payment();
