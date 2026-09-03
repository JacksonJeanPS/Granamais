create or replace function private.record_account_balance_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.saldo_atual is distinct from old.saldo_atual then
    insert into public.account_balance_history (
      user_id, account_id, saldo, origem, observacao
    ) values (
      new.user_id, new.id, new.saldo_atual, 'ajuste', 'Saldo ajustado manualmente'
    );
  end if;
  return new;
end;
$$;

create trigger record_account_balance_change
after update of saldo_atual on public.accounts
for each row execute function private.record_account_balance_change();
