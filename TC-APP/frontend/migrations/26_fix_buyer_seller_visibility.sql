-- Migration: Fix Buyer/Seller Visibility in Persistent ID Model
-- Ensures Buyers can see items they are purchasing and Sellers see all sold items.
-- 1. Listing Items RLS for Buyers
-- Allow buyers of an active order to view the physical card details.
-- This is necessary because the card's seller_id hasn't updated to them yet in transit.
DROP POLICY IF EXISTS "Buyers can view items in transit" ON public.listing_items;
CREATE POLICY "Buyers can view items in transit" ON public.listing_items FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.orders
            WHERE orders.listing_id = listing_items.id
                AND orders.buyer_id = auth.uid()
        )
    );
-- 2. Ensure Sellers can view items they ever sold (via associated order)
-- (Already in 25, but re-affirming or ensuring it works with any order status)
DROP POLICY IF EXISTS "Sellers can view sold history" ON public.listing_items;
CREATE POLICY "Sellers can view sold history" ON public.listing_items FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.orders
            WHERE orders.listing_id = listing_items.id
                AND orders.seller_id = auth.uid()
        )
    );
-- 3. Comprehensive Data Backfill
-- Ensure every order has a seller_id populated from the listing's perspective at that time.
-- This is critical for RLS 'auth.uid() = seller_id' to work safely.
DO $$ BEGIN
UPDATE public.orders o
SET seller_id = l.seller_id
FROM public.listing_items l
WHERE o.listing_id = l.id
    AND o.seller_id IS NULL;
END $$;