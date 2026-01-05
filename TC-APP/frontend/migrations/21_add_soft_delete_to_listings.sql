-- Migration: Add Soft Delete to listing_items
-- Created: 2025-12-19
-- 1. Add deleted_at column
ALTER TABLE public.listing_items
ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
-- 2. Update RLS Policies to Respect deleted_at
-- Standard read policy usually filters by status='Active'.
-- We need to ensure that deleted items are NOT visible even if status is Active (unexpected but possible).
-- Note: We have "Enable read access for all users" policy likely for Active items.
-- Let's check existing policies and update the one that exposes Active items.
-- 3. Policy: Public can only view ACTIVE and NOT DELETED items
-- (Replacing or Refining existing public read policy)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.listing_items;
CREATE POLICY "Public can view active non-deleted items" ON public.listing_items FOR
SELECT USING (
        status = 'Active'
        AND deleted_at IS NULL
    );
-- 4. Policy: Users can view their OWN items (Including Deleted/Draft/etc)
-- This allows the "Archive" tab to work for the owner.
DROP POLICY IF EXISTS "Users can view own items" ON public.listing_items;
CREATE POLICY "Users can view own items" ON public.listing_items FOR
SELECT USING (auth.uid() = seller_id);
-- 5. Update Update/Delete policies (Owners only, non-deleted items)
DROP POLICY IF EXISTS "Users can update own items" ON public.listing_items;
CREATE POLICY "Users can update own items" ON public.listing_items FOR
UPDATE USING (auth.uid() = seller_id);
-- Owners can update even if deleted (to restore)
DROP POLICY IF EXISTS "Users can delete own items" ON public.listing_items;
CREATE POLICY "Users can delete own items" ON public.listing_items FOR DELETE USING (auth.uid() = seller_id);
-- Keep physical delete for now but actions will use soft delete