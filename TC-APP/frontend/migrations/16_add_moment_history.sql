-- Migration: Add Moment History to Listing Items
-- Created at: 2025-12-16
ALTER TABLE public.listing_items
ADD COLUMN IF NOT EXISTS moment_history jsonb DEFAULT '[]'::jsonb;
COMMENT ON COLUMN public.listing_items.moment_history IS 'Array of Live Moments this card has experienced during transactions.';