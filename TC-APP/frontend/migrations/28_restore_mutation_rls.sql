-- Migration: Restore Insert/Update RLS Policies
-- Migration 27 purged everything to break recursion. Now we restore necessary mutation access.
-- 1. Orders Mutation Policies
-- Allow buyers to create their own orders
DROP POLICY IF EXISTS "Orders_Buyer_Insert" ON public.orders;
CREATE POLICY "Orders_Buyer_Insert" ON public.orders FOR
INSERT WITH CHECK (auth.uid() = buyer_id);
-- Allow buyers to update their own pending orders (e.g. shipping info, snapshot refresh)
DROP POLICY IF EXISTS "Orders_Buyer_Update" ON public.orders;
CREATE POLICY "Orders_Buyer_Update" ON public.orders FOR
UPDATE USING (auth.uid() = buyer_id) WITH CHECK (auth.uid() = buyer_id);
-- 2. Listing Items Mutation Policies
-- Allow users to create new listings
DROP POLICY IF EXISTS "Listings_Owner_Insert" ON public.listing_items;
CREATE POLICY "Listings_Owner_Insert" ON public.listing_items FOR
INSERT WITH CHECK (auth.uid() = seller_id);
-- Allow owners to update/delete their own items
DROP POLICY IF EXISTS "Listings_Owner_Update" ON public.listing_items;
CREATE POLICY "Listings_Owner_Update" ON public.listing_items FOR
UPDATE USING (auth.uid() = seller_id);
DROP POLICY IF EXISTS "Listings_Owner_Delete" ON public.listing_items;
CREATE POLICY "Listings_Owner_Delete" ON public.listing_items FOR DELETE USING (auth.uid() = seller_id);