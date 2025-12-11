-- Make catalog_id nullable to allow manual listings without catalog entry
ALTER TABLE public.listing_items ALTER COLUMN catalog_id DROP NOT NULL;

-- Add columns for manual entry (Basic Info)
ALTER TABLE public.listing_items ADD COLUMN IF NOT EXISTS player_name text;
ALTER TABLE public.listing_items ADD COLUMN IF NOT EXISTS team text;
ALTER TABLE public.listing_items ADD COLUMN IF NOT EXISTS year integer;
ALTER TABLE public.listing_items ADD COLUMN IF NOT EXISTS manufacturer text;

-- Comment: These fields will be populated if catalog_id is null (or as overrides)
