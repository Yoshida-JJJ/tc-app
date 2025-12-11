-- Comprehensive Fix: Add ALL potentially missing columns from Migration 04 AND 05

-- 1. Migration 04 Columns (Features & Condition)
ALTER TABLE public.listing_items
ADD COLUMN IF NOT EXISTS variation text,
ADD COLUMN IF NOT EXISTS serial_number text,
ADD COLUMN IF NOT EXISTS is_rookie boolean default false,
ADD COLUMN IF NOT EXISTS is_autograph boolean default false,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS condition_rating text;

-- 2. Migration 05 Columns (Basic Info & Decoupling)
ALTER TABLE public.listing_items ALTER COLUMN catalog_id DROP NOT NULL;

ALTER TABLE public.listing_items
ADD COLUMN IF NOT EXISTS player_name text,
ADD COLUMN IF NOT EXISTS team text,
ADD COLUMN IF NOT EXISTS year integer,
ADD COLUMN IF NOT EXISTS manufacturer text; -- This was the missing one reported

-- 3. Comments
COMMENT ON COLUMN public.listing_items.condition_rating IS 'Condition string for raw cards';
COMMENT ON COLUMN public.listing_items.manufacturer IS 'Brand/Manufacturer of the card';

-- 4. Force a schema cache reload
NOTIFY pgrst, 'reload schema';
