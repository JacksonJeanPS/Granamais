create or replace function public.create_recurring_transaction(
  p_account_id uuid, p_category_id uuid, p_type public.transaction_type,
  p_description text, p_amount numeric, p_frequency public.recurrence_frequency,
  p_interval smallint, p_start_date date, p_end_date date default null,
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
      when 'semanal' then p_start_date + (7 * p_interval * occurrence_count)
      when 'quinzenal' then p_start_date + (15 * p_interval * occurrence_count)
      when 'mensal' then (p_start_date + make_interval(months => p_interval * occurrence_count))::date
      when 'bimestral' then (p_start_date + make_interval(months => 2 * p_interval * occurrence_count))::date
      when 'trimestral' then (p_start_date + make_interval(months => 3 * p_interval * occurrence_count))::date
      when 'semestral' then (p_start_date + make_interval(months => 6 * p_interval * occurrence_count))::date
      when 'anual' then (p_start_date + make_interval(years => p_interval * occurrence_count))::date
    end;
  end loop;

  update public.recurrence_rules set proxima_execucao = occurrence_date where id = rule_id;
  return rule_id;
end;
$$;
