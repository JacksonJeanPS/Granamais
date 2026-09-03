create or replace function private.record_account_balance_change()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  history_origin text := coalesce(nullif(current_setting('granamais.balance_origin', true), ''), 'ajuste');
  history_note text := coalesce(nullif(current_setting('granamais.balance_note', true), ''), 'Saldo ajustado manualmente');
begin
  if new.saldo_atual is distinct from old.saldo_atual then
    insert into public.account_balance_history (user_id, account_id, saldo, origem, observacao)
    values (new.user_id, new.id, new.saldo_atual, history_origin, history_note);
  end if;
  return new;
end;
$$;

create or replace function private.apply_transaction_balance()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  old_row public.transactions%rowtype;
  new_row public.transactions%rowtype;
begin
  if tg_op <> 'INSERT' then old_row := old; end if;
  if tg_op <> 'DELETE' then new_row := new; end if;

  perform 1
  from public.accounts
  where user_id = coalesce(new_row.user_id, old_row.user_id)
    and id in (old_row.account_id, old_row.transfer_account_id, new_row.account_id, new_row.transfer_account_id)
  order by id
  for update;

  perform set_config('granamais.balance_origin', 'transacao', true);
  perform set_config('granamais.balance_note', 'Saldo atualizado por transação', true);

  if tg_op <> 'INSERT' and old_row.status = 'efetivada' then
    update public.accounts set saldo_atual = saldo_atual +
      case when old_row.tipo = 'receita' then -old_row.valor else old_row.valor end
    where id = old_row.account_id and user_id = old_row.user_id;
    if old_row.tipo = 'transferencia' then
      update public.accounts set saldo_atual = saldo_atual - old_row.valor
      where id = old_row.transfer_account_id and user_id = old_row.user_id;
    end if;
  end if;

  if tg_op <> 'DELETE' and new_row.status = 'efetivada' then
    update public.accounts set saldo_atual = saldo_atual +
      case when new_row.tipo = 'receita' then new_row.valor else -new_row.valor end
    where id = new_row.account_id and user_id = new_row.user_id;
    if new_row.tipo = 'transferencia' then
      update public.accounts set saldo_atual = saldo_atual + new_row.valor
      where id = new_row.transfer_account_id and user_id = new_row.user_id;
    end if;
  end if;

  perform set_config('granamais.balance_origin', '', true);
  perform set_config('granamais.balance_note', '', true);
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists apply_transaction_balance on public.transactions;
create trigger apply_transaction_balance
after insert or delete or update of account_id, transfer_account_id, tipo, valor, status
on public.transactions
for each row execute function private.apply_transaction_balance();

create or replace function public.create_recurring_transaction(
  p_account_id uuid,
  p_category_id uuid,
  p_type public.transaction_type,
  p_description text,
  p_amount numeric,
  p_frequency public.recurrence_frequency,
  p_interval smallint,
  p_start_date date,
  p_end_date date default null,
  p_payment_method public.payment_method default 'outro'
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  rule_id uuid;
  occurrence_date date := p_start_date;
  horizon date := least(coalesce(p_end_date, p_start_date + interval '1 year'), (p_start_date + interval '1 year'))::date;
  occurrence_count integer := 0;
begin
  if current_user_id is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if p_type not in ('receita', 'despesa') then raise exception 'invalid recurring transaction type'; end if;
  if p_amount <= 0 or p_interval not between 1 and 24 then raise exception 'invalid recurring transaction values'; end if;
  if p_end_date is not null and p_end_date < p_start_date then raise exception 'end date must be after start date'; end if;

  insert into public.recurrence_rules (
    user_id, account_id, category_id, tipo, descricao, valor, frequencia,
    intervalo, dia_do_mes, data_inicio, data_fim, proxima_execucao
  ) values (
    current_user_id, p_account_id, p_category_id, p_type, trim(p_description), p_amount, p_frequency,
    p_interval, extract(day from p_start_date)::smallint, p_start_date, p_end_date, p_start_date
  ) returning id into rule_id;

  while occurrence_date <= horizon and occurrence_count < 60 loop
    insert into public.transactions (
      user_id, account_id, category_id, recurrence_rule_id, tipo, valor,
      descricao, data_competencia, status, forma_pagamento
    ) values (
      current_user_id, p_account_id, p_category_id, rule_id, p_type, p_amount,
      trim(p_description), occurrence_date, 'prevista', p_payment_method
    );
    occurrence_count := occurrence_count + 1;
    occurrence_date := case p_frequency
      when 'semanal' then occurrence_date + (7 * p_interval)
      when 'quinzenal' then occurrence_date + (15 * p_interval)
      when 'mensal' then (occurrence_date + make_interval(months => p_interval))::date
      when 'bimestral' then (occurrence_date + make_interval(months => 2 * p_interval))::date
      when 'trimestral' then (occurrence_date + make_interval(months => 3 * p_interval))::date
      when 'semestral' then (occurrence_date + make_interval(months => 6 * p_interval))::date
      when 'anual' then (occurrence_date + make_interval(years => p_interval))::date
    end;
  end loop;

  update public.recurrence_rules set proxima_execucao = occurrence_date where id = rule_id;
  return rule_id;
end;
$$;

create or replace function public.deactivate_recurrence(p_recurrence_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null then raise exception 'authentication required' using errcode = '42501'; end if;
  update public.recurrence_rules set ativa = false
  where id = p_recurrence_id and user_id = current_user_id and ativa;
  if not found then raise exception 'recurrence not found or inactive'; end if;
  update public.transactions set status = 'cancelada'
  where recurrence_rule_id = p_recurrence_id and user_id = current_user_id and status = 'prevista';
end;
$$;

revoke all on function public.create_recurring_transaction(uuid, uuid, public.transaction_type, text, numeric, public.recurrence_frequency, smallint, date, date, public.payment_method) from public, anon;
grant execute on function public.create_recurring_transaction(uuid, uuid, public.transaction_type, text, numeric, public.recurrence_frequency, smallint, date, date, public.payment_method) to authenticated;
revoke all on function public.deactivate_recurrence(uuid) from public, anon;
grant execute on function public.deactivate_recurrence(uuid) to authenticated;
