-- Migration: Mandatory RLS Purge & Recursion Break
-- This migration dynamically finds and drops EVERY policy on orders and listing_items
-- before setting up clean, non-recursive rules. This is the guaranteed fix.
DO $$
DECLARE pol RECORD;
BEGIN -- 1. Dynamically drop all existing policies on relevant tables
FOR pol IN (
    SELECT policyname,
        tablename
    FROM pg_policies
    WHERE schemaname = 'public'
        AND tablename IN ('listing_items', 'orders')
) LOOP EXECUTE format(
    'DROP POLICY IF EXISTS %I ON %I',
    pol.policyname,
    pol.tablename
);
END LOOP;
END $$;
-- 2. Orders Re-definition (Non-Recursive)
-- Use ONLY direct column checks. NO JOINS.
CREATE POLICY "Orders_Buyer_Access" ON public.orders FOR
SELECT USING (buyer_id = auth.uid());
CREATE POLICY "Orders_Seller_Access" ON public.orders FOR
SELECT USING (seller_id = auth.uid());
-- 3. Listing Items Re-definition
-- A. Public (No Join)
CREATE POLICY "Listings_Public_Access" ON public.listing_items FOR
SELECT USING (status = 'Active');
-- B. Owner (No Join)
CREATE POLICY "Listings_Owner_Access" ON public.listing_items FOR
SELECT USING (seller_id = auth.uid());
CREATE POLICY "Listings_Owner_Update" ON public.listing_items FOR
UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Listings_Owner_Delete" ON public.listing_items FOR DELETE USING (auth.uid() = seller_id);
-- C. Historical Seller & Transit Buyer (Checks orders)
-- This is now SAFE because orders policies have zero dependencies.
CREATE POLICY "Listings_SoldHistory_Access" ON public.listing_items FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.orders
            WHERE orders.listing_id = listing_items.id
                AND orders.seller_id = auth.uid()
        )
    );
CREATE POLICY "Listings_InTransit_Access" ON public.listing_items FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.orders
            WHERE orders.listing_id = listing_items.id
                AND orders.buyer_id = auth.uid()
        )
    );