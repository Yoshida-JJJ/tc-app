-- Migration: Add Payout System Tables and Columns
-- Created at: 2025-12-12

-- 1. Add real_name_kana to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS real_name_kana text;

-- 2. Create bank_accounts table
CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    bank_name text NOT NULL,
    branch_name text NOT NULL,
    account_type text NOT NULL, -- 'ordinary' (普通) or 'current' (当座)
    account_number text NOT NULL,
    account_holder_name text NOT NULL, -- Kana Only
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT bank_accounts_user_id_key UNIQUE (user_id) -- One active account per user for simplicity initially
);

-- 3. Create payouts table
CREATE TABLE IF NOT EXISTS public.payouts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount integer NOT NULL,
    status text NOT NULL DEFAULT 'pending', -- pending, paid, rejected
    created_at timestamptz DEFAULT now(),
    processed_at timestamptz
);

-- Enable RLS
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Policies for bank_accounts
CREATE POLICY "Users can view own bank account" 
    ON public.bank_accounts FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bank account" 
    ON public.bank_accounts FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bank account" 
    ON public.bank_accounts FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bank account" 
    ON public.bank_accounts FOR DELETE 
    USING (auth.uid() = user_id);

-- Policies for payouts
CREATE POLICY "Users can view own payouts" 
    ON public.payouts FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payouts" 
    ON public.payouts FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Only admins/service role can update payouts (e.g. to 'paid'), users cannot.
