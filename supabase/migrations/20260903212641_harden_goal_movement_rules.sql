create or replace function private.validate_goal_contribution()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare available numeric(15,2);
begin
  if new.tipo = 'ajuste' and new.account_id is not null then raise exception 'adjustments cannot be linked to an account'; end if;
  if new.tipo = 'resgate' then
    select valor_atual into available from public.goals where id = new.goal_id and user_id = new.user_id for update;
    if tg_op = 'UPDATE' then available := available - case old.tipo when 'aporte' then old.valor when 'resgate' then -old.valor else old.valor end; end if;
    if new.valor > greatest(0, available) then raise exception 'withdrawal exceeds goal balance'; end if;
  end if;
  return new;
end;
$$;
drop trigger if exists validate_goal_contribution on public.goal_contributions;
create trigger validate_goal_contribution before insert or update of goal_id, account_id, tipo, valor on public.goal_contributions for each row execute function private.validate_goal_contribution();

create or replace function private.recalculate_goal_after_edit()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare total_value numeric(15,2);
begin
  total_value := greatest(0, new.valor_inicial + coalesce((select sum(case when tipo = 'aporte' then valor when tipo = 'resgate' then -valor else valor end) from public.goal_contributions where goal_id = new.id and user_id = new.user_id), 0));
  update public.goals set valor_atual = total_value, status = case when total_value >= new.valor_alvo then 'concluida'::public.goal_status when status = 'concluida' then 'ativa'::public.goal_status else status end where id = new.id and user_id = new.user_id;
  return new;
end;
$$;
drop trigger if exists recalculate_goal_after_edit on public.goals;
create trigger recalculate_goal_after_edit after update of valor_inicial, valor_alvo on public.goals for each row when (old.valor_inicial is distinct from new.valor_inicial or old.valor_alvo is distinct from new.valor_alvo) execute function private.recalculate_goal_after_edit();
