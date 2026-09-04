drop index if exists public.debt_payments_debt_date_idx;

create index debt_payments_debt_owner_date_idx
  on public.debt_payments(debt_id, user_id, data_pagamento desc);

create index debt_payments_user_idx
  on public.debt_payments(user_id);
