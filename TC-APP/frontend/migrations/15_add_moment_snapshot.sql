-- Migration: Add Moment Snapshot to Orders
-- Created at: 2025-12-16
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS moment_snapshot jsonb;
COMMENT ON COLUMN public.orders.moment_snapshot IS 'Snapshot of the active Live Moment at the time of purchase (if any).';