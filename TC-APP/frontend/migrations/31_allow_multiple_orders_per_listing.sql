-- Migration: Allow Multiple Orders per Listing (Persistent ID Support)
-- 2025-12-23: Remove absolute unique constraint and replace with partial unique index.
-- 1. Identify and Drop the existing unique constraint if it exists.
-- The name might be orders_listing_id_key (standard Postgres naming).
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_listing_id_key;
-- 2. Create a Partial Unique Index.
-- This allows multiple COMPLETED or CANCELLED orders for the same item (buy/sell history),
-- but ensures only ONE active/pending transaction can exist at any given time.
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_order_per_listing ON public.orders (listing_id)
WHERE (status NOT IN ('completed', 'cancelled'));
-- 3. Comment for clarity
COMMENT ON INDEX unique_active_order_per_listing IS 'Ensures only one active transaction per item, while allowing historical orders to coexist.';