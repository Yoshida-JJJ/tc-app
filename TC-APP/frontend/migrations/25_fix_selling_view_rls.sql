-- Migration: Fix RLS for Persistent ID Model (Ownership Transfer)
-- This ensures sellers can see items they've sold even after the card's seller_id changes to the buyer.
-- 1. Update Orders RLS
-- Previous policy relied on joining listing_items.seller_id, which now points to the buyer.
-- Use the new orders.seller_id column instead.
DROP POLICY IF EXISTS "Sellers can view their orders" ON public.orders;
CREATE POLICY "Sellers can view their orders" ON public.orders FOR
SELECT USING (auth.uid() = seller_id);
-- 2. Update Listing Items RLS
-- Allow former sellers to view the physical card details if they are the seller_id on an associated order.
-- This is necessary for the "History" tab and "Manage Order" page.
DROP POLICY IF EXISTS "Sellers can view sold items" ON public.listing_items;
CREATE POLICY "Sellers can view sold items" ON public.listing_items FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.orders
            WHERE orders.listing_id = listing_items.id
                AND orders.seller_id = auth.uid()
        )
    );
-- Ensure current owners can always see their items (existing policy)
-- DROP POLICY IF EXISTS "Users can view own items" ON public.listing_items;
-- (Keep existing "Users can view own items" as it covers the current owner)
-- 3. Data Integrity Fix
-- Ensure any orders created during the transition have the correct seller_id 
-- if they were missed by the webhook logic during the update.
UPDATE public.orders o
SET seller_id = l.seller_id
FROM public.listing_items l
WHERE o.listing_id = l.id
    AND o.seller_id IS NULL
    AND l.seller_id != o.buyer_id;
-- Only fill if the card hasn't been transferred yet or we can deduce it.
-- Note: If the card WAS already transferred, l.seller_id is the buyer. 
-- In that case, we might need manual recovery or rely on timestamps, but for most immediate cases this is safe.