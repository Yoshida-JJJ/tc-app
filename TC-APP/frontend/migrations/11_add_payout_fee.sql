-- Migration: Add fee and payout_amount to payouts table
alter table public.payouts
add column if not exists fee integer not null default 0,
add column if not exists payout_amount integer;

-- Backfill payout_amount for existing records (assume fee was 0)
update public.payouts
set payout_amount = amount
where payout_amount is null;

-- Now make payout_amount NOT NULL
alter table public.payouts
alter column payout_amount set not null;
