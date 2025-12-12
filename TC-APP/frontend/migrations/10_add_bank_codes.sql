-- Add bank_code and branch_code to bank_accounts
ALTER TABLE public.bank_accounts 
ADD COLUMN IF NOT EXISTS bank_code text,
ADD COLUMN IF NOT EXISTS branch_code text;

-- Ideally make them NOT NULL after backfill, but for now allow null or rely on app logic
