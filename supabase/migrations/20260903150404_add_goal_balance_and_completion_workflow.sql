create or replace function private.refresh_goal_total()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare target_goal uuid; target_user uuid; initial_value numeric(15,2); total_value numeric(15,2);
begin
  target_goal := case when tg_op = 'DELETE' then old.goal_id else new.goal_id end;
  target_user := case when tg_op = 'DELETE' then old.user_id else new.user_id end;
  select valor_inicial into initial_value from public.goals where id = target_goal and user_id = target_user;
  total_value := greatest(0, initial_value + coalesce((
    select sum(case when tipo = 'aporte' then valor when tipo = 'resgate' then -valor else valor end)
    from public.goal_contributions where goal_id = target_goal and user_id = target_user
  ), 0));
  update public.goals
  set valor_atual = total_value,
      status = case
        when total_value >= valor_alvo then 'concluida'::public.goal_status
        when status = 'concluida' then 'ativa'::public.goal_status
        else status
      end
  where id = target_goal and user_id = target_user;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

create or replace function private.apply_goal_contribution_balance()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare old_row public.goal_contributions%rowtype; new_row public.goal_contributions%rowtype;
begin
  if tg_op <> 'INSERT' then old_row := old; end if;
  if tg_op <> 'DELETE' then new_row := new; end if;
  perform 1 from public.accounts
  where user_id = coalesce(new_row.user_id, old_row.user_id)
    and id in (old_row.account_id, new_row.account_id)
  order by id for update;
  perform set_config('granamais.balance_origin', 'transacao', true);
  perform set_config('granamais.balance_note', 'Saldo atualizado por movimentação de meta', true);
  if tg_op <> 'INSERT' and old_row.account_id is not null and old_row.tipo in ('aporte','resgate') then
    update public.accounts set saldo_atual = saldo_atual + case when old_row.tipo = 'aporte' then old_row.valor else -old_row.valor end
    where id = old_row.account_id and user_id = old_row.user_id;
  end if;
  if tg_op <> 'DELETE' and new_row.account_id is not null and new_row.tipo in ('aporte','resgate') then
    update public.accounts set saldo_atual = saldo_atual + case when new_row.tipo = 'aporte' then -new_row.valor else new_row.valor end
    where id = new_row.account_id and user_id = new_row.user_id;
  end if;
  perform set_config('granamais.balance_origin', '', true);
  perform set_config('granamais.balance_note', '', true);
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists apply_goal_contribution_balance on public.goal_contributions;
create trigger apply_goal_contribution_balance
after insert or delete or update of account_id, tipo, valor
on public.goal_contributions
for each row execute function private.apply_goal_contribution_balance();
