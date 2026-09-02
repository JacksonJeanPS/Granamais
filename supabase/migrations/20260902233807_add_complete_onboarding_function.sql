create or replace function public.complete_onboarding(
  p_account_name text,
  p_bank_name text,
  p_account_type public.account_type,
  p_initial_balance numeric,
  p_account_color text,
  p_card_name text,
  p_card_issuer text,
  p_card_brand text,
  p_credit_limit numeric,
  p_closing_day smallint,
  p_due_day smallint,
  p_card_color text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  new_account_id uuid;
begin
  if current_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  insert into public.accounts (
    user_id, nome, instituicao, tipo, saldo_inicial, cor
  ) values (
    current_user_id, trim(p_account_name), trim(p_bank_name), p_account_type,
    p_initial_balance, p_account_color
  ) returning id into new_account_id;

  insert into public.cards (
    user_id, account_id, nome, instituicao, bandeira, limite_total,
    dia_fechamento, dia_vencimento, cor
  ) values (
    current_user_id, new_account_id, trim(p_card_name), trim(p_card_issuer),
    trim(p_card_brand), p_credit_limit, p_closing_day, p_due_day, p_card_color
  );

  update public.profiles
  set onboarding_concluido = true
  where user_id = current_user_id;

  if not found then
    raise exception 'profile not found';
  end if;
end;
$$;

revoke all on function public.complete_onboarding(text,text,public.account_type,numeric,text,text,text,text,numeric,smallint,smallint,text) from public, anon;
grant execute on function public.complete_onboarding(text,text,public.account_type,numeric,text,text,text,text,numeric,smallint,smallint,text) to authenticated;
