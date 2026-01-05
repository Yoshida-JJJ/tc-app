-- Migration: Self-Healing complete_order RPC & Backfill
-- 2025-12-23: Ensure ownership transfer occurs even if webhook fails.
-- This RPC is triggered by markAsReceived (Buyer Action).
CREATE OR REPLACE FUNCTION public.complete_order(p_listing_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_buyer_id uuid;
BEGIN -- 1. Find the buyer ID from the most recent order for this listing.
SELECT buyer_id INTO v_buyer_id
FROM orders
WHERE listing_id = p_listing_id
ORDER BY created_at DESC
LIMIT 1;
-- 2. Update listing status and FORCE ownership transfer to the buyer.
UPDATE listing_items
SET status = 'Draft',
    seller_id = COALESCE(v_buyer_id, seller_id),
    updated_at = NOW()
WHERE id = p_listing_id;
-- 3. Mark the order as completed.
UPDATE orders
SET status = 'completed',
    completed_at = NOW()
WHERE listing_id = p_listing_id
    AND status != 'completed';
END;
$$;
-- 4. Backfill existing 'Draft' or 'Completed' items that SHOULD be owned by the buyer
-- Fixes items that stuck in 'zombie' state (owned by seller but transaction finished)
UPDATE listing_items li
SET seller_id = o.buyer_id
FROM orders o
WHERE li.id = o.listing_id
    AND o.status = 'completed'
    AND li.seller_id = o.seller_id;
-- Only if owner is still the original seller