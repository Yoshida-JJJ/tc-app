-- Migration: Fix Workspace Visibility for Purchased Items
-- Status 'Completed' (old) or 'Draft' (new) should allow entry into Workspace.
-- Also updates complete_order RPC to set status to 'Draft' for new owner.
-- 1. Update the RPC to use 'Draft' (Owner Default) instead of 'Completed' (Transaction End)
CREATE OR REPLACE FUNCTION public.complete_order(p_listing_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN -- Update listing status to Draft (makes it ownable/visible in Workspace but not listed)
UPDATE listing_items
SET status = 'Draft'
WHERE id = p_listing_id;
-- Update order status to completed
UPDATE orders
SET status = 'completed'
WHERE listing_id = p_listing_id;
END;
$$;
-- 2. Backfill existing 'Completed' items to 'Draft' to fix visibility for previous tests
UPDATE public.listing_items
SET status = 'Draft'
WHERE status = 'Completed';