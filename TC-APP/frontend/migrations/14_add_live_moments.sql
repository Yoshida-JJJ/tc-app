-- Migration: Add Live Moments Table
-- Created for Admin Dashboard Feature

create table if not exists public.live_moments (
    id uuid default gen_random_uuid() primary key,
    player_name text not null,
    title text not null,
    description text,
    intensity integer not null default 1, check (intensity >= 1 and intensity <= 5),
    created_at timestamptz default now()
);

-- RLS
alter table public.live_moments enable row level security;

-- Policy: Everyone can view
create policy "Live moments are viewable by everyone" 
    on public.live_moments for select 
    using (true);

-- Policy: Only Admins can insert/update (Enforced by App Logic using Service Role, so we deny here for standard users)
-- No INSERT/UPDATE policy for public/authenticated users means default deny.
