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
  days_in_target_month integer;
  i integer;
begin
  select * into strict card_row
  from public.cards
  where id = new.card_id and user_id = new.user_id and ativo = true;

  if new.data_primeira_parcela is not null then
    first_due_month := date_trunc('month', new.data_primeira_parcela)::date;
  else
    days_in_target_month := extract(day from (date_trunc('month', new.data_compra) + interval '1 month - 1 day'))::integer;
    close_date := make_date(
      extract(year from new.data_compra)::integer,
      extract(month from new.data_compra)::integer,
      least(card_row.dia_fechamento, days_in_target_month)
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
    days_in_target_month := extract(day from (date_trunc('month', due_month) + interval '1 month - 1 day'))::integer;
    due_date := make_date(
      extract(year from due_month)::integer,
      extract(month from due_month)::integer,
      least(card_row.dia_vencimento, days_in_target_month)
    );
    closing_month := case
      when card_row.dia_vencimento > card_row.dia_fechamento then due_month
      else (due_month - interval '1 month')::date
    end;
    days_in_target_month := extract(day from (date_trunc('month', closing_month) + interval '1 month - 1 day'))::integer;
    close_date := make_date(
      extract(year from closing_month)::integer,
      extract(month from closing_month)::integer,
      least(card_row.dia_fechamento, days_in_target_month)
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
