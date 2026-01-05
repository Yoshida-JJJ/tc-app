-- Add origin_order_id to track which order created this cloned item
ALTER TABLE public.listing_items
ADD COLUMN IF NOT EXISTS origin_order_id uuid REFERENCES public.orders(id);
-- Create index for faster lookup
CREATE INDEX IF NOT EXISTS idx_listing_items_origin_order_id ON public.listing_items(origin_order_id);
-- Comment on column
COMMENT ON COLUMN public.listing_items.origin_order_id IS 'Reference to the order that created this cloned/buyer copy';