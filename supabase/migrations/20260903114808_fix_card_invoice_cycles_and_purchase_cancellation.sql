create or replace function private.generate_purchase_installments()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare
  card_row public.cards%rowtype;
  first_due_month date;
  due_month date;
  closing_month date;
  due_date date;
  close_date date;
  invoice_id uuid;
  installment_value numeric(15,2);
  last_value numeric(15,2);
  i integer;
begin
  select * into strict card_row
  from public.cards
  where id = new.card_id and user_id = new.user_id and ativo = true;

  if new.data_primeira_parcela is not null then
    first_due_month := date_trunc('month', new.data_primeira_parcela)::date;
  else
    close_date := make_date(
      extract(year from new.data_compra)::integer,
      extract(month from new.data_compra)::integer,
      least(card_row.dia_fechamento, private.days_in_month(new.data_compra))
    );
    first_due_month := date_trunc('month', new.data_compra)::date;
    if new.data_compra > close_date then
      first_due_month := (first_due_month + interval '1 month')::date;
    end if;
    if card_row.dia_vencimento <= card_row.dia_fechamento then
      first_due_month := (first_due_month + interval '1 month')::date;
    end if;
  end if;

  installment_value := trunc((new.valor_total / new.numero_parcelas)::numeric, 2);
  last_value := new.valor_total - (installment_value * (new.numero_parcelas - 1));

  for i in 1..new.numero_parcelas loop
    due_month := (first_due_month + make_interval(months => i - 1))::date;
    due_date := make_date(
      extract(year from due_month)::integer,
      extract(month from due_month)::integer,
      least(card_row.dia_vencimento, private.days_in_month(due_month))
    );
    closing_month := case
      when card_row.dia_vencimento > card_row.dia_fechamento then due_month
      else (due_month - interval '1 month')::date
    end;
    close_date := make_date(
      extract(year from closing_month)::integer,
      extract(month from closing_month)::integer,
      least(card_row.dia_fechamento, private.days_in_month(closing_month))
    );

    insert into public.card_invoices (
      user_id, card_id, mes_referencia, data_fechamento, data_vencimento
    ) values (
      new.user_id, new.card_id, due_month, close_date, due_date
    )
    on conflict (card_id, mes_referencia)
    do update set atualizado_em = now()
    returning id into invoice_id;

    insert into public.installments (
      user_id, purchase_id, card_invoice_id, numero_parcela, valor, data_vencimento
    ) values (
      new.user_id, new.id, invoice_id, i,
      case when i = new.numero_parcelas then last_value else installment_value end,
      due_date
    );
  end loop;
  return new;
end;
$$;

create or replace function public.cancel_purchase(p_purchase_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  update public.purchases
  set cancelada_em = now()
  where id = p_purchase_id
    and user_id = current_user_id
    and cancelada_em is null;

  if not found then
    raise exception 'purchase not found or already cancelled';
  end if;

  update public.installments
  set status = 'cancelada', paga_em = null
  where purchase_id = p_purchase_id
    and user_id = current_user_id
    and status <> 'cancelada';
end;
$$;

revoke all on function public.cancel_purchase(uuid) from public, anon;
grant execute on function public.cancel_purchase(uuid) to authenticated;
