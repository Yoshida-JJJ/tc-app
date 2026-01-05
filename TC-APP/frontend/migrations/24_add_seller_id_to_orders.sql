-- Add seller_id to orders table to maintain transaction history
-- This is necessary for the Ownership Transfer model where the card moves to the buyer.
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS seller_id uuid REFERENCES public.profiles(id);
-- Optional: Populate existing orders with listing.seller_id to prevent data loss in history
UPDATE public.orders o
SET seller_id = l.seller_id
FROM public.listing_items l
WHERE o.listing_id = l.id
    AND o.seller_id IS NULL;