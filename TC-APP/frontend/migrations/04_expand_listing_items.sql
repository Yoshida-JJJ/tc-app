-- Add columns to listing_items to support detailed card information
ALTER TABLE public.listing_items
ADD COLUMN IF NOT EXISTS variation text,
ADD COLUMN IF NOT EXISTS serial_number text,
ADD COLUMN IF NOT EXISTS is_rookie boolean default false,
ADD COLUMN IF NOT EXISTS is_autograph boolean default false,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS condition_rating text; -- For raw card condition (e.g. Near Mint)

-- Comment on columns
COMMENT ON COLUMN public.listing_items.variation IS 'Variant of the card (e.g. Refractor, Gold)';
COMMENT ON COLUMN public.listing_items.serial_number IS 'Serial number printed on card (e.g. 10/50)';
COMMENT ON COLUMN public.listing_items.condition_rating IS 'Condition string for raw cards, separate from graded info in condition_grading jsonb';
